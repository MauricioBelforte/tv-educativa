# Requerimientos (plan-actual) - Módulo 04: Optimización de Rendimiento

> **Estado:** PLAN APROBADO — Documentación creada. La implementación de cada optimización se realizará en las iteraciones siguientes, actualizando este documento y el `05-Checklist.md` del plan-actual.

## 1. Propósito

Este módulo tiene como finalidad **reducir considerablemente el consumo de recursos** (CPU, memoria, tiempo de ejecución) y mejorar la fluidez de la plataforma IPTV, eliminando los cuellos de botella identificados en el análisis del código actual.

## 2. Requerimientos funcionales (sin cambio de comportamiento)

| # | Requerimiento |
|---|---------------|
| R1 | El usuario puede seguir viendo canales, buscar, filtrar, reproducir, importar listas y sincronizar exactamente igual que antes. |
| R2 | La verificación de estado de canales (escaneo rápido/lento) sigue funcionando, pero sin degradar la UI. |
| R3 | Las listas M3U grandes se cargan y filtran más rápido. |
| R4 | La persistencia en `localStorage` conserva los mismos datos y claves. |

## 3. Requerimientos no funcionales (objetivo de optimización)

| # | Requerimiento | Meta |
|---|---------------|------|
| NF1 | Eliminar re-renders masivos en `ChannelCard` | Solo re-renderiza la tarjeta afectada |
| NF2 | Reducir escrituras a `localStorage.channelStatus` | De N a 1-3 por escaneo |
| NF3 | Optimizar parser M3U | Un solo regex por línea, IDs estables |
| NF4 | I/O de servidor asíncrono | `fs.promises` (no bloquear event loop) |
| NF5 | Virtualizar lista de canales | Montar solo el subconjunto visible |
| NF6 | Debounce de búsqueda | 250ms sin recálculo por tecla |

## 4. Criterios de aceptación

- `npm run build` compila sin errores.
- `.\reset.ps1` levanta el dev server y responde 200.
- Al escanear canales, la interfaz permanece fluida (sin freezes).
- Con listas de 1000+ canales, el filtrado/búsqueda responde de forma aceptable.
- El comportamiento funcional se mantiene idéntico al estado previo.

## 5. Restricciones

- No cambiar la forma del estado `channelStatus` ni las claves de `localStorage`.
- No alterar los flujos estables: login, sincronización Supabase, listas privadas, importador M3U, drag & drop.
- Mantener TypeScript y convenciones del proyecto.
- Ejecutar `.\reset.ps1` tras cada edición de archivos (regla de cache residual de Next.js).

## 6. Fuentes

- Análisis detallado en `plan-inicial/02-Analisis.md`.
- Diseño de solución en `plan-inicial/03-Diseno.md`.