# Requerimientos (plan-inicial) - Módulo 05: Plan de Testing Profesional

## 1. Propósito

Este módulo tiene como finalidad crear y ejecutar un **plan de testing profesional** para validar que las optimizaciones de rendimiento implementadas en el Módulo 04 funcionen correctamente y no rompan el comportamiento funcional de la plataforma IPTV "TV Libre".

## 2. Problema

Las optimizaciones de rendimiento (H1, H3, H4, H5, H7) implementadas modifican componentes críticos de la aplicación:
- ChannelCard.tsx - React.memo + selectores granulares
- ChannelList.tsx - Virtualización manual
- page.tsx - Debounce de búsqueda + useCallback
- Player.tsx - Selector granular

Sin un plan de testing profesional, existe el riesgo de:
- Romper funcionalidades existentes (drag & drop, scrollIntoView, búsqueda)
- Introducir bugs sutiles en el comportamiento de la UI
- No validar que las optimizaciones realmente mejoren el rendimiento

## 3. Objetivos

| # | Objetivo | Métrica de éxito |
|---|-----------|-------------------|
| O1 | Validar que NO se rompieron funcionalidades existentes | Todas las pruebas funcionales pasan |
| O2 | Validar mejoras de rendimiento en listas grandes | Scroll suave con 500+ canales |
| O3 | Validar que la búsqueda no congela la UI | Búsqueda responde sin freezes |
| O4 | Validar que toggle favorito solo re-renderiza la card afectada | Verificable con React DevTools Profiler |
| O5 | Validar que drag & drop funciona con virtualización | Drag & drop funciona en modo reorder |
| O6 | Validar que scrollIntoView funciona con virtualización | Canal activo se centra al cambiar |

## 4. Alcance

### Incluye:
- Pruebas funcionales de componentes modificados
- Pruebas de rendimiento (memoria, re-renders, scroll)
- Pruebas de casos límite (listas vacías, 5000+ canales)
- Pruebas de manejo de errores
- Documentación de resultados

### Excluye:
- Pruebas unitarias automatizadas (requiere setup de Jest/Playwright)
- Pruebas E2E automatizadas (requiere setup de Cypress/Playwright)
- Pruebas de carga (requiere herramientas especializadas)

## 5. Restricciones

- No agregar dependencias nuevas para testing (Jest, Playwright, etc.)
- Usar pruebas manuales + herramientas de browser (React DevTools Profiler)
- Ejecutar pruebas en el entorno local (localhost:3000)
- Documentar todos los resultados
- No romper el servidor de desarrollo durante pruebas

## 6. Criterios de aceptación

- Todas las pruebas funcionales pasan
- Las métricas de rendimiento cumplen los umbrales definidos
- El comportamiento funcional es idéntico al estado previo
- La documentación de resultados está completa
- No hay errores en consola del browser

## 7. Stakeholders

- Usuario final: UI fluida y funcional
- Desarrollador: Código optimizado y mantenible
- Sistema: Rendimiento mejorado sin bugs
