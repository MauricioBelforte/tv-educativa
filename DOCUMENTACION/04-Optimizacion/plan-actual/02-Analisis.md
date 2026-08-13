# Análisis (plan-actual) - Módulo 04: Optimización de Rendimiento

> **Estado:** PLAN APROBADO. Este documento refleja el análisis vigente sobre el estado actual del código. Cada hallazgo indica su **estado de implementación** (pendiente/en curso/listo).

## 1. Estado general

El análisis completo de cuellos de botella está documentado en `plan-inicial/02-Analisis.md`. A continuación, la **versión vigente** que se actualizará a medida que se implementen mejoras.

## 2. Hallazgos vigentes y estado

| # | Hallazgo | Archivo(s) | Impacto | Estado |
|---|----------|-----------|---------|--------|
| H1 | Suscripciones completas de `ChannelCard` a `channelStatus`, `importedLists`, `detectedStreams` → re-renders masivos O(N²) | `ChannelCard.tsx` | Crítico | Pendiente |
| H2 | Serialización síncrona repetida de `channelStatus` completo a `localStorage` en cada verificación | `player-store.ts` | Crítico | Pendiente |
| H3 | Parseo M3U con 4 regex por línea e IDs con `Math.random` (inestables) | `m3u-parser.ts` | Crítico | Pendiente |
| H4 | Lectura síncrona `fs` bloquea event loop del servidor | `local-loader.ts`, `channels.ts` | Medio | Pendiente |
| H5 | Deduplicación redundante de canales | `channels.ts` | Medio | Pendiente |
| H6 | `getFavoriteChannels` con bucles anidados O(n³) | `player-store.ts` | Medio | Pendiente |
| H7 | Búsqueda sin debounce y merge O(n²) en `allAvailableChannels` | `page.tsx` | Medio | Pendiente |
| H8 | Render de listas masivas sin virtualización | `ChannelList.tsx` | Medio | Pendiente |
| H9 | `Player` suscrito a `detectedStreams` completo | `Player.tsx` | Bajo | Pendiente |

## 3. Decisiones técnicas adoptadas (resumen)

1. **Selectores granulares de Zustand** (H1): selectores primitivos por canal + `React.memo` + prop `listId`.
2. **Batching de persistencia** (H2): nuevo `storage-batcher.ts` con `schedulePersist`/`flushPersist`.
3. **Parser M3U optimizado** (H3): un solo regex global por línea + IDs deterministas (hash).
4. **I/O asíncrono** (H4): `fs/promises`.
5. **Dedup único** (H5): delegar a `loadLocalM3UFiles`.
6. **Sets O(n)** (H6): favoritos e ids en `Set`.
7. **Debounce de búsqueda + Map O(n)** (H7): merge con `Map` y `debouncedSearchQuery`.
8. **Virtualización windowed** (H8): render solo visible; desactivada en `reorderMode`.
9. **Selector granular en Player** (H9): `detectedStreams[currentChannelId]`.

## 4. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Perder estado persistido al cambiar frecuencia de escritura | Conservar claves; `flushPersist` en `pagehide` |
| Cambio de `key` de React por IDs inestables | IDs deterministas (hash) |
| Virtualización rompe drag & drop | Desactivar virtualización en `reorderMode` |
| Rotura de `scrollIntoView` del canal activo | Calcular scroll por índice/offset |

## 5. Próximos pasos (implementación)

Implementar H1→H9 de manera incremental, verificar con `.\reset.ps1` y `npm run build` tras cada bloque, y actualizar este documento marcando cada hallazgo como "Listo" una vez verificado.