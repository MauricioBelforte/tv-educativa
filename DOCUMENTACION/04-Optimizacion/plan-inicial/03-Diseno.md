# Diseño - Módulo 04: Optimización de Rendimiento

## 1. Arquitectura propuesta

Las optimizaciones se aplican en dos capas: **cliente** (React/Zustand/parser) y **servidor** (API / I/O). No se cambia la arquitectura general del sistema ni el flujo de datos; solo se optimizan los puntos calientes.

```
CLIENTE:
┌─────────────────────────────────────────────────────────────┐
│ page.tsx (memoización de filtros, debounce búsqueda)        │
│   │                                                         │
│   ├─ Header (debounce búsqueda 250ms)                       │
│   ├─ ChannelList (virtualización windowed)                  │
│   │    └─ ChannelCard (memoizada, selector granular)        │
│   │          · channelStatus[propioId] (primitivo)          │
│   │          · detectedStreams[propioId] (primitivo)        │
│   │          · listaId (prop desde padre, no buscarlo)      │
│   └─ Player (selector granular detectedStreams[canalActual])│
│                                                             │
│ store/player-store.ts                                       │
│   · saveToStorage → batch (debounce/throttle 500ms)         │
│   · channelStatus ops → sin persistir en cada update        │
│   · getFavoriteChannels → Sets (O(n))                       │
│   · checkAllChannels → concurrency control + flush final    │
└─────────────────────────────────────────────────────────────┘

SERVIDOR:
┌─────────────────────────────────────────────────────────────┐
│ /api/channels → getChannels() async (fs.promises)           │
│   · local-loader.ts → async readdir/readFile                │
│   · channels.ts → elimina dedup redundante                  │
│   · m3u-parser.ts → un solo regex por línea, IDs estables   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Diseño detallado por área

### 2.1 Selectores granulares de Zustand

**Objetivo:** que una actualización de `channelStatus[canalX]` solo re-renderice la tarjeta del canal X.

**Estrategia:**
- En `ChannelCard`, sustituir `channelStatus` (objeto) por `status = usePlayerStore((s) => s.channelStatus[channel.id])`. Al devolver un **primitivo** (`'online' | 'offline' | ...`), Zustand compara por `Object.is` y solo re-renderiza cuando cambia **ese** canal.
- Idem para `detectedStreams[channel.id]`.
- Evitar en `ChannelCard` la suscripción a `importedLists` para hallar `ownerList`: en su lugar, **memorizar** la búsqueda del dueño con `useMemo` dependiente solo del `channel.id` (y de `importedLists`), o mejor, **pasar `listId` como prop** desde `ChannelList` (que ya conoce la lista padre). Esto evita O(listas×canales) por render.

**Herramientas:** `useMemo`, selectores primitivos, `React.memo` en `ChannelCard`.

### 2.2 Batching de persistencia a `localStorage`

**Objetivo:** no serializar el objeto `channelStatus` completo en cada actualización.

**Estrategia:**
- Crear un módulo utilitario `src/lib/storage-batcher.ts` con:
  - `schedulePersist(key, getData)` → acumula cambios y agenda un `setTimeout` (~500ms). Al vencer, serializa y escribe UNA vez.
  - `flushAll()` → escribe pendientes inmediatamente (se llama en `pagehide`/`visibilitychange` oculto y antes de navegar).
- En el store, las funciones que actualizan `channelStatus` **no** llaman a `saveToStorage` directo; en su lugar usan `schedulePersist('iptv-channel-status', () => get().channelStatus)`.
- Mantener el `set()` de Zustand igual para que la UI reaccione al instante (solo se aplaza la persistencia).

**Beneficio:** de N serializaciones por escaneo a **1-3** como máximo.

### 2.3 Parser M3U optimizado

**Objetivo:** una sola pasada regex por línea, IDs estables.

**Estrategia:**
- Definir **un regex global**:
  ```ts
  const ATTR_REGEX = /([\w-]+)="([^"]*)"/g
  ```
  y recorrer con `while (m = ATTR_REGEX.exec(extInf))`, guardando `m[1] → m[2]` en un `Map`. Luego leer `tvg-id`, `tvg-name`, `tvg-logo`, `group-title` del Map.
- Para IDs sin `tvg-id`: usar un **hash determinista** (p.ej. `hashString(name + url)`) en lugar de `Math.random()`. Así el ID es estable entre parses y se preserva la deduplicación por `seenIds` sin forzar re-renders por cambio de `key`.
- Eliminar la generación de IDs aleatorios en la línea 40 (`inline-...`).

### 2.4 I/O asíncrono en servidor

**Objetivo:** no bloquear el event loop.

**Estrategia:**
- En `local-loader.ts`, convertir `loadLocalM3UFiles` a `async` usando `fs.promises.readdir` y `fs.promises.readFile`.
- En `channels.ts`, convertir `getChannels` para `await loadLocalM3UFiles()`.
- El route `/api/channels` ya es async y usa `await getChannels(...)`; no requiere cambios.

### 2.5 Optimización de filtros en `page.tsx`

**Objetivo:** evitar O(n²) y recálculos por tecla.

**Estrategia:**
- `allAvailableChannels`: reemplazar el `some` por un `Map<string, Channel>` (o `Set` de ids) para el merge en O(n).
- `filteredChannels`: introducir `useMemo` que dependa de `debouncedSearchQuery` (estado nuevo con debounce de 250ms en el Header) en lugar de `searchQuery` directo.
- `getFavoriteChannels` (store): usar `Set` de favoritos y `Set` de ids agregados → O(n).

### 2.6 Virtualización de la lista de canales

**Objetivo:** renderizar solo el subconjunto visible (windowed).

**Estrategia:**
- En `ChannelList.tsx`, implementar un virtualizador liviano:
  - Contenedor con `overflow-y-auto` y una altura fija medible.
  - Estado `[scrollTop, clientHeight]` vía `onScroll`.
  - Calcular `startIndex = floor(scrollTop / ROW_HEIGHT) - OVERSCAN` y `endIndex`; renderizar solo `channels.slice(start, end)`.
  - Mantener un `spacer` con altura total (`channels.length * ROW_HEIGHT`) para conservar el scroll.
- **Cuidado con el `scrollIntoView`** del canal actual: ajustarlo para calcular el índice y hacer `scrollTo` al offset correcto.
- `reorderMode` (drag & drop) con virtualización: dado que el drag opera sobre índices, funciona siempre que el virtualizador remapee correctamente. Si resulta conflictivo, en `reorderMode` se puede desactivar la virtualización (listas en reordenamiento suelen ser más chicas).

### 2.7 Selector granular en `Player`

**Objetivo:** no re-renderizar el reproductor por streams ajenos.

**Estrategia:** sustituir `detectedStreams` (objeto) por:
```ts
const currentChannelId = usePlayerStore((s) => s.currentChannel?.id)
const detectedUrl = usePlayerStore((s) => (currentChannelId ? s.detectedStreams[currentChannelId] : null))
```
Con `currentChannelId` primitivo y `detectedUrl` primitivo, el reproductor solo re-renderiza cuando cambia el canal o su stream detectado.

## 3. Diagrama de flujo de un escaneo de canales (optimizado)

```
checkAllChannels(channels)
   ↓
por cada canal (workers limitados)
   ↓ fetch /api/check-stream
   ↓ set({ channelStatus: { ...prev, [id]: status } })   ← Zustand set (UI reacciona)
   ↓ schedulePersist('iptv-channel-status', getSnapshot)  ← NO serializa todavía
   ↓
fin de todos los workers
   ↓ flushPersist()  ← 1 sola escritura a localStorage
```

## 4. Compatibilidad con estados/flujos existentes

- **Persistencia:** se conservan las mismas claves de `localStorage` (`iptv-channel-status`, etc.). Solo cambia la **frecuencia** de escritura (batching).
- **Sincronización Supabase / login / listas privadas:** no se alteran sus flujos.
- **Drag & drop de canales:** se mantiene; la virtualización se ajusta para respetar índices.
- **Scroll-into-view del canal activo:** se preserva con cálculo por índice y offset.

## 5. Estructura de archivos a modificar/crear

| Archivo | Acción | Tipo de cambio |
|---------|--------|----------------|
| `src/lib/storage-batcher.ts` | Crear | Nuevo utilitario de persistencia batch |
| `src/components/ChannelCard.tsx` | Modificar | Selectores granulares + memo + prop listId |
| `src/components/ChannelList.tsx` | Modificar | Virtualización windowed + pasar listId |
| `src/components/Player.tsx` | Modificar | Selector granular detectedStreams |
| `src/components/Header.tsx` | Modificar | Debounce de búsqueda (250ms) |
| `src/app/page.tsx` | Modificar | Memoizar filtros + usar debouncedSearch |
| `src/store/player-store.ts` | Modificar | Batching persistencia + Sets + flush |
| `src/lib/m3u-parser.ts` | Modificar | Un solo regex, IDs estables |
| `src/lib/local-loader.ts` | Modificar | fs.promises (async) |
| `src/lib/channels.ts` | Modificar | Eliminar dedup redundante + await |