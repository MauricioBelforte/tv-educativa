# Checklist - Módulo 04: Optimización de Rendimiento

## Estado general: PLAN INICIAL CREADO (documentación en marcha)

> Este checklist del plan inicial refleja la **fase de análisis** y el **plan propuesto**. La implementación de cada optimización se reflejará en `plan-actual/05-Checklist.md`.

## 1. Análisis y diagnóstico (Completado)
- [x] Auditar el store Zustand (`player-store.ts`) y detectar re-renders masivos por suscripciones completas a `channelStatus`, `importedLists`, `detectedStreams`.
- [x] Identificar serialización síncrona repetida a `localStorage` en cada verificación de canal.
- [x] Detectar parseo M3U con 4 regex por línea e IDs con `Math.random` (inestables).
- [x] Detectar lectura síncrona de `fs` en `local-loader.ts` (bloquea el event loop).
- [x] Detectar deduplicación redundante de canales en `channels.ts`.
- [x] Detectar `getFavoriteChannels` con bucles anidados (O(n³)).
- [x] Detectar búsqueda "en vivo" sin debounce y merge O(n²) en `allAvailableChannels`.
- [x] Detectar render de listas masivas sin virtualización.
- [x] Detectar `Player` suscrito a `detectedStreams` completo.
- [x] Documentar hallazgos en `02-Analisis.md` y diseñar soluciones en `03-Diseno.md`.

## 2. Plan propuesto (En revisión — a implementar en plan-actual)

### 2.1 Selectores granulares de Zustand
- [ ] `ChannelCard`: sustituir `channelStatus`/`detectedStreams` (objetos) por selectores primitivos del canal propio.
- [ ] `ChannelCard`: recibir `listId` por prop desde `ChannelList` (evitar `find`/`some` por render).
- [ ] `ChannelCard`: envolver en `React.memo`.
- [ ] `Player`: selector granular `detectedStreams[currentChannelId]`.

### 2.2 Batching de persistencia a `localStorage`
- [ ] Crear `src/lib/storage-batcher.ts` con `schedulePersist` y `flushPersist`.
- [ ] Aplicar batching a las escrituras de `iptv-channel-status` en el store.
- [ ] Llamar `flushPersist()` al final de `checkAllChannels`/`recheckAllChannels`/`fastRecheckAllChannels`.

### 2.3 Parser M3U optimizado
- [ ] Un solo regex global por línea en `parseChannel` (Map de atributos).
- [ ] IDs deterministas (hash) en lugar de `Math.random` (estabilidad y dedup).

### 2.4 I/O asíncrono en servidor
- [ ] `local-loader.ts`: migrar a `fs/promises` y devolver `Promise<Channel[]>`.
- [ ] `channels.ts`: `await loadLocalM3UFiles()` y eliminar dedup redundante.

### 2.5 Optimización de filtros en `page.tsx`
- [ ] `allAvailableChannels` con `Map` (O(n)) en lugar de `some`.
- [ ] Debounce de búsqueda (250ms) en `Header`.
- [ ] `filteredChannels` dependiente de `debouncedSearchQuery`.
- [ ] `getFavoriteChannels` con `Set` (O(n)).

### 2.6 Virtualización de lista
- [ ] Implementar ventana windowed en `ChannelList`.
- [ ] Ajustar `scrollIntoView` del canal actual por índice/offset.
- [ ] Desactivar virtualización en `reorderMode` (drag & drop).

## 3. Verificación final (Pendiente)
- [ ] Ejecutar `.\reset.ps1` y verificar build (`npm run build`).
- [ ] Probar carga de listas grandes y escaneo de canales sin lag.
- [ ] Confirmar que el comportamiento funcional no cambió.
- [ ] Realizar pruebas según `06-Plan-Testings.md`.