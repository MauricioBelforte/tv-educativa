# Módulo 04 - Optimización de Rendimiento y Consumo de Recursos

## 1. Problema

La plataforma IPTV presenta lentitud y un alto consumo de recursos (CPU, memoria y ancho de banda del navegador y del servidor) en varios puntos críticos. El análisis de código fuente reveló cuellos de botella tanto en el **cliente** (re-renders masivos de React, serialización síncrona de localStorage, parseo pesado en el hilo principal) como en el **servidor** (lectura síncrona de archivos fs que bloquea el event loop de Node).

Estos problemas se agravan a medida que el usuario importa **listas M3U grandes** (cientos o miles de canales), porque el costo de cada actualización de estado crece de forma lineal o cuadrática con la cantidad de canales.

## 2. Objetivo General

Reducir **considerablemente** el consumo de recursos (CPU, memoria y tiempo de ejecución) y mejorar la fluidez de la interfaz (menor tiempo de respuesta, menos re-renders, menos bloqueos del hilo principal), **sin cambiar el comportamiento funcional** de la plataforma.

## 3. Objetivos Específicos

1. **Eliminar los re-renders masivos** de `ChannelCard` provocados por suscripciones no granulares al store de Zustand.
2. **Evitar la serialización síncrona y repetida de `localStorage`** en cada verificación de canal.
3. **Optimizar el chequeo de canales** (workers, times, armado de estado) para no re-renderizar toda la lista en cada canal verificado.
4. **Reducir el precio del parser M3U** (menos regex, una sola pasada por línea, IDs estables).
5. **Convertir la lectura de archivos locales del servidor a asíncrona** (`fs.promises`) para no bloquear el event loop.
6. **Aplicar debounce a la búsqueda** para no recalcular filtros en cada tecla.
7. **Virtualizar la lista de canales** para no montar miles de tarjetas reales en el DOM.
8. **Memoizar componentes y selectores** para evitar trabajo repetido en renderizados.

## 4. Alcance

### Incluye
- `src/store/player-store.ts` (estructura de estado, `saveToStorage`, chequeo de canales, `getFavoriteChannels`)
- `src/components/ChannelCard.tsx`, `ChannelList.tsx`, `Player.tsx` (suscripciones y memoización)
- `src/components/SearchBar.tsx` o `Header.tsx` (debounce de búsqueda)
- `src/lib/m3u-parser.ts` (parser optimizado)
- `src/lib/local-loader.ts` y `src/lib/channels.ts` (I/O asíncrono y dedup eliminado)
- `src/app/page.tsx` (cancelación de trabajos, memoización de filtros)

### Excluye (fuera de alcance en esta iteración)
- Cambios en APIs externas (Supabase, Vercel) o en el esquema de la base de datos.
- Rediseño visual de la interfaz.
- Cambios en el reproductor HLS.js (configuración ya razonable).
- Implementación de Service Workers / PWA.
- Migración incremental a Next.js RSC para datos estáticos.

## 5. Restricciones

- **No alterar el comportamiento funcional** observable por el usuario (funciona tal cual está, solo más rápido).
- **No romper los flujos estables** identificados (sincronización Supabase, login, listas privadas, importador M3U, reordenamiento drag & drop).
- Mantener compatibilidad con el estado persistido en `localStorage` existente (no cambiar claves).
- El código debe permanecer en TypeScript y con la misma convención de estilos del proyecto.
- Antes de cada cambio grande y tras cada iteración, ejecutar `.\reset.ps1` (regla de cache residual de Next.js) y verificar build.

## 6. Criterios de Éxito (Métricas)

| Métrica | Estado actual (estimado) | Meta |
|---------|--------------------------|------|
| Re-renders de `ChannelCard` al cambiar estado de 1 canal | Todas las tarjetas | Solo la tarjeta afectada |
| Serializaciones de `localStorage.channelStatus` por escaneo | N (una por canal) | 1-3 máximo (bacheado/globo al final) |
| Tiempo de parseo M3U de 1000 canales | O(n) con 4 regex por canal + regex `.substr` | O(n) con 1 regex por línea y sin regex extra |
| Bloqueo del event loop del servidor en `/api/channels` | `fs.readFileSync` | `fs.promises` (async) |
| Carga de lista de 2000 canales al DOM | 2000 nodos montados | Render virtualizado (solo visibles) |
| Búsqueda "en vivo" | Recalcular en cada tecla | Debounce de 200-300ms |

---