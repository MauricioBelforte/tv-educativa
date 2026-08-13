# Análisis - Módulo 04: Optimización de Rendimiento

## 1. Dominio del análisis

Se analizó a fondo el código fuente actual del cliente y del servidor para identificar los puntos de mayor consumo de recursos. A continuación se documenta cada hallazgo, con referencias precisas al código.

## 2. Hallazgos y decisiones técnicas

### 2.1 [CRÍTICO] Re-renders masivos de `ChannelCard`

**Archivo:** `src/components/ChannelCard.tsx` (líneas 14-25)

Cada tarjeta se suscribe **individualmente** a:
- `channelStatus` (línea 21) → objeto `Record<string, ChannelStatus>` **completo**
- `importedLists` (línea 20) → array completo de listas
- `detectedStreams` (línea 25) → objeto completo

**Problema:** cuando el store actualiza `channelStatus` (una vez por canal verificado), Zustand re-evalúa el selector de **todas** las tarjetas. Como el selector devuelve el objeto completo (referencia nueva cada vez), **todas** las `ChannelCard` re-renderizan, incluso las que no tienen relación con el canal verificado.

Con N canales verificándose concurrentemente (hasta 20 workers en `fastRecheckAllChannels`), esto genera **O(N²) renderizados**.

Además, en la línea 29:
```ts
const ownerList = importedLists.find(l => l.channels.some(c => c.id === channel.id))
```
se hace una búsqueda **O(listas × canales)** en cada render de cada tarjeta. Con muchas listas grandes, esto es muy costoso.

**Decisión:** 
- Los selectores deben ser **granulares** (solo el status del canal propio) usando `useShallow` o selectores que devuelvan valores primitivos.
- `ownerList` se debe calcular **una sola vez** por tarjeta (memoizado) o pasarse como prop desde el padre.

### 2.2 [CRÍTICO] Serialización síncrona repetida a `localStorage`

**Archivo:** `src/store/player-store.ts` (función `saveToStorage`, líneas 77-81)

```ts
localStorage.setItem(key, JSON.stringify(data))
```

`JSON.stringify` del objeto `channelStatus` **completo** + `localStorage.setItem` se ejecutan **en el hilo principal** en **cada** actualización de estado de canal (líneas 503, 511, 518, 522, 536, 569, 601).

Con `checkAllChannels` (2 workers) o `fastRecheckAllChannels` (20 workers), se serializa el objeto completo **Millones de veces en el peor caso**.

**Decisión:**
- **Bachear (debounce/batching)** las escrituras a `localStorage`: acumular cambios en memoria y persistir **una sola vez** al final (o con un `setTimeout` de throttle ~500ms).
- No serializar el `channelStatus` completo en cada actualización individual.

### 2.3 [CRÍTICO] Parseo M3U con múltiples regex por línea

**Archivo:** `src/lib/m3u-parser.ts` (líneas 60, 64, 72, 76)

Se aplican **4 expresiones regulares independientes** sobre la misma línea `extInf`:
- `tvg-id`, `tvg-name`, `tvg-logo`, `group-title`

Esto cuadriplica el escaneo de cada línea. Para listas de miles de canales, el costo es alto. Adicionalmente, las líneas 40 y 61 usan `Math.random().toString(36).substr(2, 9)` para IDs, lo que genera **IDs no estables** que rompen la deduplicación por `seenIds` y fuerzan re-render por cambio de `key` de React.

**Decisión:**
- Usar **un solo regex global** que capture todos los atributos `tvg-*` y `group-title` en una pasada.
- Generar IDs **deterministas** a partir del nombre/URL (hash) cuando no exista `tvg-id`, para que sean estables entre parses.

### 2.4 [MEDIO] Lectura síncrona de archivos en el servidor

**Archivo:** `src/lib/local-loader.ts` (líneas 8-31)

`loadLocalM3UFiles()` usa `fs.readFileSync` y `fs.readdirSync` (líneas 10-17). Esto **bloquea el event loop** de Node en cada request a `/api/channels`.

**Decisión:**
- Migrar a `fs.promises` (async) y hacer `await` en `getChannels()`.
- La API route `/api/channels` ya usa `await getChannels()`, por lo que el cambio es transparente.

### 2.5 [MEDIO] Deduplicación redundante

**Archivo:** `src/lib/channels.ts` (líneas 31-36)

```ts
const seenIds = new Set<string>()
channels = [...defaultChannels, ...localChannels].filter(ch => {
  if (seenIds.has(ch.id)) return false
  seenIds.add(ch.id)
  return true
})
```

`loadLocalM3UFiles()` **ya deduplica** internamente (local-loader.ts líneas 14-25). Se está haciendo trabajo doble al crear un array intermedio completo y volver a deduplicar.

**Decisión:** eliminar la deduplicación redundante y el array intermedio en `channels.ts`; delegar la dedup a `loadLocalM3UFiles`.

### 2.6 [MEDIO] `getFavoriteChannels` con bucle anidado

**Archivo:** `src/store/player-store.ts` (líneas 431-444)

```ts
state.importedLists.forEach(list => {
  list.channels.forEach(ch => {
    if (state.favorites.includes(ch.id) && !allChannels.find(c => c.id === ch.id)) {
```

Esto es **O(listas × canales × favoritos)** por el `find` con `includes` dentro de bucles anidados.

**Decisión:** usar un `Set` de favoritos y un `Map`/`Set` de ids ya agregados para bajar a O(n) total.

### 2.7 [MEDIO] Búsqueda "en vivo" sin debounce

**Archivo:** `src/app/page.tsx` (líneas 190-206)

`filteredChannels` se recalcula **en cada tecla** presionada (`searchQuery` cambia). El filtro hace `includes` sobre todos los canales, y además `allAvailableChannels` (líneas 74-85) hace un `some` por canal (O(n²) en el merge de listas).

**Decisión:**
- Aplicar **debounce de 250ms** al input de búsqueda en el Header.
- Optimizar `allAvailableChannels` usando un `Map`/`Set` en lugar de `some` (bajar de O(n²) a O(n)).

### 2.8 [MEDIO] Render de lista masiva sin virtualización

**Archivo:** `src/components/ChannelList.tsx` (línea 107)

```ts
{channels.map((channel, index) => { ... <ChannelCard channel={channel} /> ... })}
```

Con miles de canales se montan **miles de nodos DOM** + miles de tarjetas con sus propios effects. Esto degrada la memoria y el tiempo de pintado.

**Decisión:** implementar **renderizado virtualizado** (windowed) para montar solo el subconjunto visible. Se puede implementar un virtualizador liviano propio (scroll + índice) para no agregar dependencias pesadas, o instalar una librería ligera.

### 2.9 [BAJO] `Player` suscrito a `detectedStreams` completo

**Archivo:** `src/components/Player.tsx` (línea 23)

```ts
const detectedStreams = usePlayerStore((state) => state.detectedStreams)
```

`Player` re-renderiza cuando **cualquier** canal detecta un stream, aunque el stream detectado no sea del canal actual. El selector debería ser `state.detectedStreams[state.currentChannel?.id]`.

**Decisión:** selector granular que devuelva solo el stream del canal activo.

## 3. Alternativas consideradas

| Alternativa | Decisión |
|-------------|----------|
| Migrar toda la lógica a workers (Web Workers) | Descartado: complejidad alta, no necesario para el alcance. Se optimiza el hilo principal sin workers. |
| Usar `react-window` | Considerado; se preferirá una virtualización liviana propia para no agregar dependencias y mantener control. Si se requiere, se evalúa librería ligera. |
| Cachear `/api/channels` completo | Se evaluará cache en servidor como mejora adicional, pero no es el foco inicial. |
| Estado separado por lista para `channelStatus` | Se mantiene un solo `Record` pero con batching de persistencia y selectores granulares. |

## 4. Riesgos

- Cambiar la estructura de `channelStatus` podría afectar la persistencia existente → se conserva la misma forma.
- El batching de escritura podría perder el último estado si el usuario cierra la pestaña antes del flush → se usa `flush` en `pagehide`.
- La virtualización puede afectar el scroll-into-view del canal actual → se ajusta lógica de `scrollIntoView`.

## 5. Conclusión del análisis

Los mayores beneficios provienen de: **(1)** selectores granulares de Zustand (elimina re-renders masivos), **(2)** batching de `localStorage`, **(3)** parser M3U con un solo regex e IDs estables, **(4)** I/O asíncrono en el servidor. Estas cuatro mejoras atacan los cuellos de botella de mayor impacto sobre el consumo de CPU y memoria.