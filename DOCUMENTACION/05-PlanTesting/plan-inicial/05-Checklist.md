# Checklist (plan-inicial) - Módulo 05: Plan de Testing Profesional

## Estado general: PLAN DEFINIDO — Pendiente de ejecución

## 1. Documentación del módulo (Completado)
- [x] Crear estructura `DOCUMENTACION/05-PlanTesting/plan-inicial/` con 5 archivos.
- [x] Crear estructura `DOCUMENTACION/05-PlanTesting/plan-actual/` con 5 archivos.
- [x] Análisis de estado actual del testing documentado.
- [x] Diseño de plan de testing documentado (estrategia, flujos, herramientas).
- [x] Código y componentes a probar documentados.

## 2. Preparación del ambiente

- [ ] Levantar servidor de desarrollo (`.\reset.ps1`)
- [ ] Verificar HTTP 200 en localhost:3000
- [ ] Abrir browser Chrome/Firefox
- [ ] Abrir DevTools (F12)
- [ ] Configurar pestañas: Profiler, Performance, Elements, Console
- [ ] Cargar datos de prueba (500+ canales)
- [ ] Verificar Console sin errores al inicio

## 3. Pruebas funcionales

### 3.1 Funcionalidad básica
- [ ] F1: Click en canal reproduce video
- [ ] F2: Toggle favorito actualiza icono
- [ ] F3: Búsqueda filtra correctamente
- [ ] F4: Drag & drop reordena canales
- [ ] F5: ScrollIntoView centra canal activo
- [ ] F6: Cambio de canal actualiza Player

### 3.2 Funcionalidad con optimizaciones
- [ ] Virtualización no rompe scroll
- [ ] Debounce no hace búsqueda parecer lenta
- [ ] React.memo no previene re-renders necesarios
- [ ] Selectores granulares actualizan correctamente

## 4. Pruebas de rendimiento

### 4.1 Métricas de re-renders
- [ ] R1: Re-renders por toggle favorito = 1 (solo ChannelCard afectada)
- [ ] R2: Nodos DOM con 500 canales < 50
- [ ] R3: Tiempo de búsqueda = 300ms (debounce)
- [ ] R4: Scroll smoothness sin saltos visuales

### 4.2 Medición con herramientas
- [ ] React DevTools Profiler configurado
- [ ] Performance Tab configurado
- [ ] Elements Tab configurado
- [ ] Métricas recolectadas y documentadas

## 5. Pruebas de casos límite

- [ ] E1: Lista vacía muestra "No se encontraron canales"
- [ ] E2: Lista de 5000 canales funciona sin crash
- [ ] E3: Canales sin logos muestran fallback SVG
- [ ] E4: Búsqueda con caracteres especiales funciona

## 6. Pruebas de manejo de errores

- [ ] ER1: Error en URL de canal marca offline sin crash
- [ ] ER2: LocalStorage lleno no crash

## 7. Documentación de resultados

- [ ] Crear archivo `07-Resultados-Testings.md` en plan-actual
- [ ] Documentar resultados de cada prueba (PASÓ/FALLÓ)
- [ ] Registrar métricas recolectadas
- [ ] Documentar errores encontrados
- [ ] Documentar correcciones aplicadas
- [ ] Incluir recomendaciones

## 8. Verificación final

- [ ] Todas las pruebas funcionales pasan
- [ ] Todas las métricas de rendimiento cumplen umbrales
- [ ] Todos los casos límite funcionan
- [ ] No hay errores en Console
- [ ] Comportamiento funcional idéntico al previo
- [ ] Documentación completa
