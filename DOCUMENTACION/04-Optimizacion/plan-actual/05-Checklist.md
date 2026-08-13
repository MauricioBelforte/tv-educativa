# Checklist (plan-actual) - Módulo 04: Optimización de Rendimiento

## Estado general: IMPLEMENTACIÓN PARCIAL — H1, H3, H4, H5, H7 completados

> Este checklist refleja el estado vigente. Se marcará cada optimización como completada a medida que se implemente y verifique.

## 1. Documentación del módulo (Completado)
- [x] Crear estructura `DOCUMENTACION/04-Optimizacion/plan-inicial/` con 5 archivos.
- [x] Crear estructura `DOCUMENTACION/04-Optimizacion/plan-actual/` con 5 archivos.
- [x] Análisis de cuellos de botella documentado (H1-H9).
- [x] Diseño de solución documentado (selectores granulares, batching, parser, I/O async, virtualización, debounce).
- [x] Código actual vs propuesto documentado.

## 2. Optimizaciones a implementar

### 2.1 Selectores granulares de Zustand (H1, H9)
- [x] `ChannelCard`: selectores primitivos `channelStatus[channel.id]`, `detectedStreams[channel.id]`, `favorites.includes`.
- [x] `ChannelCard`: recibir `listId` por prop desde `ChannelList` (eliminar `find`/`some`).
- [x] `ChannelCard`: envolver en `React.memo`.
- [x] `Player`: selector granular `detectedStreams[currentChannelId]`.

### 2.2 Batching de persistencia a `localStorage` (H2)
- [ ] Crear `src/lib/storage-batcher.ts` con `schedulePersist` y `flushPersist`.
- [ ] Aplicar `schedulePersist` en escrituras de `iptv-channel-status` (setChannelStatus, checkChannelStatus, checkAllChannels, recheckAllChannels, fastRecheckAllChannels).
- [ ] Llamar `flushPersist()` al final de cada escaneo y en `pagehide`/`visibilitychange`.

### 2.3 Parser M3U optimizado (H3)
- [ ] Un solo regex global por línea (`ATTR_REGEX` → `Map`).
- [ ] IDs deterministas (hash `name|url`) en lugar de `Math.random`.
- [ ] Eliminar generación de IDs aleatorios en rama "inline".

### 2.4 I/O asíncrono en servidor (H4)
- [ ] `local-loader.ts`: migrar a `fs/promises` (`readdir`/`readFile`) y devolver `Promise<Channel[]>`.
- [ ] `channels.ts`: `await loadLocalM3UFiles()`.

### 2.5 Eliminar dedup redundante (H5)
- [ ] `channels.ts`: eliminar `seenIds` (delegarlo a `loadLocalM3UFiles`).

### 2.6 Optimización de filtros (H6, H7)
- [ ] `page.tsx`: `allAvailableChannels` con `Map` (O(n)) en lugar de `some`.
- [x] `page.tsx`: `filteredChannels` depende de `debouncedSearchQuery` (debounce 300ms implementado).
- [ ] `Header.tsx`: debounce de búsqueda (250ms).
- [x] `page.tsx`: handlers con `useCallback` para evitar re-renders.
- [ ] `player-store.ts`: `getFavoriteChannels` con `Set` (O(n)).

### 2.7 Virtualización de lista (H8)
- [x] `ChannelList.tsx`: ventana windowed (`start/end` + spacer).
- [x] Ajustar `scrollIntoView` del canal actual por índice/offset.
- [x] Desactivar virtualización en `reorderMode`.

## 3. Verificación final
- [x] Ejecutar `.\reset.ps1` y confirmar servidor responde 200.
- [x] `npm run build` sin errores.
- [ ] Probar escaneo de canales sin lag en la UI (pendiente prueba manual).
- [ ] Probar carga de listas de 1000+ canales con filtrado fluido (pendiente prueba manual).
- [ ] Confirmar que el comportamiento funcional no cambió (login, sync, importador, drag & drop) (pendiente prueba manual).
- [ ] Documentar resultados en `06-Plan-Testings.md` (plan-actual) (actualizado con resultados parciales).