# Plan de Testings - Módulo 04: Optimización de Rendimiento

## 1. Propósito

Este plan define los escenarios de prueba para validar que las optimizaciones de rendimiento **no rompen el comportamiento funcional** de la plataforma y que efectivamente **reducen el consumo de recursos**. Se ejecutará de forma automatizada (donde sea posible) y manual, antes de dar la tarea por terminada.

## 2. Escenarios de prueba

### 2.1 Pruebas unitarias (funciones puras)

| ID | Escenario | Entrada | Resultado esperado | Criterio de éxito |
|----|-----------|---------|--------------------|-------------------|
| U1 | `parseM3U` con lista grande | M3U de 1000+ canales con `tvg-*` | Parsing correcto sin duplicados | Corre en <100ms y produce IDs estables entre dos llamadas |
| U2 | `parseM3U` con lista sin `#EXTINF` (inline) | Listado de URLs | Canales creados con IDs deterministas | IDs iguales entre dos parses del mismo input |
| U3 | `storage-batcher.schedulePersist` | N=100 llamadas seguidas | Solo 1-3 escrituras reales a `localStorage` | Contador de escrituras <=3 con spy |
| U4 | `storage-batcher.flushPersist` | Cola con datos pendientes | Escribe todos los datos pendientes | `localStorage` contiene el último snapshot |
| U5 | `getFavoriteChannels` (store) | Listas + favoritos | Devuelve favoritos únicos | Resultado correcto en O(n), sin `find` anidado |
| U6 | Filtro `allAvailableChannels` | 2 listas con solapamiento | Merge sin duplicados | Usa `Map` (no `some`); complejidad O(n) |

### 2.2 Pruebas de integración (cliente + servidor)

| ID | Escenario | Resultado esperado | Criterio de éxito |
|----|-----------|--------------------|-------------------|
| I1 | `/api/channels` responde | 200 con `channels` y `categories` | No rompe con `local-loader` async |
| I2 | `loadLocalM3UFiles` con archivos locales | Devuelve canales deduplicados | `fs.promises` sin bloquear; misma data que antes |
| I3 | Escaneo `fastRecheckAllChannels` (20 workers) | UI fluida durante el escaneo | No se congela; re-renders limitados a tarjetas afectadas |
| I4 | Escaneo `checkAllChannels` (2 workers) | `channelStatus` se persiste batch | 1-3 escrituras a `localStorage` tras el escaneo completo |

### 2.3 Pruebas de casos límite (edge cases)

| ID | Escenario | Resultado esperado |
|----|-----------|--------------------|
| E1 | Lista con 0 canales | UI muestra "No se encontraron canales" sin errores |
| E2 | Lista de 5000 canales | Virtualización monta solo el subconjunto visible (< visibles+OVERSCAN) |
| E3 | Cambiar canal durante escaneo masivo | No hay race condition en `channelStatus`; UI estable |
| E4 | Cerrar pestaña con persistencia pendiente | `flushPersist` en `pagehide` guarda el último estado |
| E5 | `reorderMode` (drag & drop) con virtualización | Virtualización se desactiva; drag funciona sobre índices |

### 2.4 Pruebas de manejo de errores

| ID | Escenario | Resultado esperado |
|----|-----------|--------------------|
| ER1 | URL de canal inválido en `check-stream` | Se marca `offline` sin crashear |
| ER2 | `localStorage` lleno/indisponible | `schedulePersist` captura la excepción, no rompe la app |
| ER3 | `/api/channels` falla | `page.tsx` usa fallback de `channels.json` |

### 2.5 Pruebas de rendimiento (medición)

| ID | Escenario | Métrica | Umbral de éxito |
|----|-----------|---------|------------------|
| P1 | Re-renders al verificar 1 canal en lista de 500 | Nº de `ChannelCard` re-renderizadas | **1** (solo la afectada) vía React DevTools Profiler |
| P2 | Escrituras a `localStorage.channelStatus` en escaneo de 200 canales | Contador de `setItem` | **<=3** |
| P3 | Tiempo de parseo M3U de 1000 canales | `performance.now()` | **<100ms** |
| P4 | Nodos DOM montados con lista de 5000 | `document.querySelectorAll` | **<500** (windowed) |
| P5 | `npm run build` | Compilación | **Sin errores** |

## 3. Criterios de aceptación globales

1. `.\reset.ps1` levanta el servidor y responde **200**.
2. `npm run build` compila **sin errores** ni warnings de tipos.
3. Todas las pruebas U, I, E, ER pasan.
4. Todas las métricas P1-P5 cumplen el umbral.
5. El comportamiento funcional (login, sync, importador, drag & drop, reproducción) se mantiene **idéntico**.

## 4. Herramientas

- **Profiler**: React DevTools Profiler (re-renders).
- **Spy de escritura**: monkey-patch de `localStorage.setItem` en la consola / test.
- **Timing**: `performance.now()` para parseo.
- **Build**: `npm run build`.
- **Dev server**: `.\reset.ps1`.

## 5. Registro de resultados

Los resultados de ejecución se documentarán en `07-Resultados-Testings.md` (plan-actual). Cada prueba se marcará como **PASÓ / FALLÓ** con evidencia y, en caso de fallo, se detallará la corrección aplicada.