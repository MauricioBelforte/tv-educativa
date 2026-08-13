# Plan de Testings (plan-actual) - Módulo 05: Plan de Testing Profesional

## 1. Propósito

Este documento define el plan detallado de testing para validar las optimizaciones de rendimiento implementadas en el Módulo 04 del proyecto "TV Libre", incorporando best practices de la skill webapp-testing (Reconnaissance-Then-Action pattern, selectores descriptivos, captura de evidencia).

## 2. Estrategia de testing (mejorada con skills)

### 2.1 Enfoque: Reconnaissance-Then-Action Pattern (de webapp-testing skill)

Basado en la skill webapp-testing, usaremos el patrón:
1. **Reconnaissance:** Inspeccionar DOM renderizado para identificar selectores
2. **Discovery:** Encontrar elementos usando selectores descriptivos (text=, role=, CSS)
3. **Action:** Ejecutar acciones con selectores descubiertos
4. **Evidence:** Capturar screenshots/console logs como evidencia

### 2.2 Mejoras incorporadas de skills

**De webapp-testing skill:**
- Pattern "Reconnaissance-Then-Action" para inspección DOM
- Selectores descriptivos (text=, role=, CSS, IDs)
- Captura de screenshots como evidencia
- Verificación de console logs
- Esperas apropiadas (wait_for_selector, wait_for_timeout)

**De javascript-testing-patterns skill:**
- Patrones de testing JavaScript (hooks, mocks, assertions)
- Testing de componentes React
- Testing de hooks personalizados
- Testing de state management (Zustand)

### 2.3 Tipos de pruebas
### 2.3 Tipos de pruebas (mejoradas)
- **Pruebas funcionales:** Verificar que NO se rompió funcionalidad existente (con selectores descriptivos)
- **Pruebas de rendimiento:** Validar mejoras de velocidad y memoria (con React DevTools Profiler)
- **Pruebas de casos límite:** Listas vacías, 5000+ canales, caracteres especiales
- **Pruebas de manejo de errores:** Respuesta a errores inesperados
- **Captura de evidencia:** Screenshots, console logs, métricas (de webapp-testing skill)

## 3. Escenarios de prueba

### 3.1 Pruebas funcionales (F) - con selectores descriptivos

| ID | Escenario | Selectores (de webapp-testing) | Pasos | Resultado esperado | Herramienta |
|----|-----------|-------------------------------|-------|--------------------|-------------|
| F1 | Click en canal reproduce | `[data-channel-id]`, `.bg-blue-600` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: encontrar primer `[data-channel-id]`<br>3. Action: click<br>4. Evidence: screenshot | Video empieza a reproducir | Browser manual + DevTools |
| F2 | Toggle favorito actualiza | `button[title*="favorito"]`, `.text-yellow-400` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: encontrar botón favorito<br>3. Action: click<br>4. Evidence: screenshot | Icono cambia (amarillo/gris) | Browser manual + DevTools |
| F3 | Búsqueda filtra correctamente | `input[placeholder*="Buscar"]`, `[data-channel-id]` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: encontrar input<br>3. Action: fill "cnn"<br>4. Wait: 300ms (debounce)<br>5. Evidence: screenshot | Solo canales con "cnn" | Browser manual + DevTools |
| F4 | Drag & drop reordena | `button[title*="ordenar"]`, `[draggable="true"]` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: activar reorder<br>3. Action: drag channel<br>4. Action: drop<br>5. Evidence: screenshot | Canal cambia posición | Browser manual + DevTools |
| F5 | ScrollIntoView centra canal | `[data-channel-id]`, `page.scrollTo` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: scroll al fondo<br>3. Action: click último canal<br>4. Evidence: screenshot | Canal activo centrado | Browser manual + DevTools |
| F6 | Cambio de canal actualiza Player | `[data-channel-id]`, `.bg-blue-600` | 1. Reconnaissance: inspeccionar DOM<br>2. Discovery: encontrar canal activo<br>3. Action: click otro canal<br>4. Evidence: screenshot | Player muestra nuevo canal | Browser manual + DevTools |

### 3.2 Pruebas de rendimiento (R)

| ID | Escenario | Pasos | Métrica | Umbral | Herramienta |
|----|-----------|-------|---------|--------|-------------|
| R1 | Re-renders por toggle favorito | 1. Profiler Start<br>2. Click favorito<br>3. Profiler Stop<br>4. Analizar ranked | Nº ChannelCard re-renderizadas | **1** | React DevTools Profiler |
| R2 | Nodos DOM con 500 canales | 1. Abrir Elements<br>2. Buscar channel-card<br>3. Contar elementos | Nº nodos DOM | **<50** | DevTools Elements |
| R3 | Tiempo de búsqueda | 1. Performance Record<br>2. Escribir búsqueda<br>3. Stop<br>4. Analizar timeline | Tiempo hasta filtrado | **300ms** | Performance Tab |
| R4 | Scroll smoothness | 1. Scroll rápido<br>2. Observar visualmente | Saltos visuales | **0** | Visual |

### 3.3 Pruebas de casos límite (E)

| ID | Escenario | Pasos | Resultado esperado | Herramienta |
|----|-----------|-------|--------------------|-------------|
| E1 | Lista vacía | 1. Cargar lista vacía<br>2. Verificar UI | "No se encontraron canales" | Browser manual |
| E2 | Lista de 5000 canales | 1. Importar lista grande<br>2. Scroll<br>3. Verificar | Scroll suave, sin crash | Browser manual |
| E3 | Canales sin logos | 1. Verificar canales sin logo<br>2. Observar | Fallback SVG aparece | Browser manual |
| E4 | Búsqueda con caracteres especiales | 1. Escribir "@#$%<br>2. Verificar | Filtrado funciona o mensaje de error | Browser manual |

### 3.4 Pruebas de manejo de errores (ER)

| ID | Escenario | Pasos | Resultado esperado | Herramienta |
|----|-----------|-------|--------------------|-------------|
| ER1 | Error en URL de canal | 1. Canal con URL inválida<br>2. Intentar reproducir | Marca offline sin crash | Browser manual |
| ER2 | LocalStorage lleno | 1. Llenar localStorage<br>2. Intentar guardar favorito | No crash, mensaje de error | Browser manual |

## 4. Procedimiento de ejecución

### 4.1 Preparación
1. Ejecutar `.\reset.ps1` para limpiar cache
2. Verificar HTTP 200 en localhost:3000
3. Abrir Chrome en http://localhost:3000
4. Abrir DevTools (F12)
5. Configurar pestañas: Profiler, Performance, Elements, Console
6. Cargar datos de prueba (500+ canales)

### 4.2 Ejecución de pruebas funcionales
1. Seguir pasos de cada prueba F1-F6
2. Registrar resultado (PASÓ/FALLÓ)
3. Si falla, documentar el error

### 4.3 Ejecución de pruebas de rendimiento
1. Seguir pasos de cada prueba R1-R4
2. Recolectar métricas
3. Comparar con umbrales
4. Si no cumple, documentar

### 4.4 Ejecución de casos límite
1. Seguir pasos de cada prueba E1-E4
2. Verificar resultado esperado
3. Documentar comportamiento

### 4.5 Ejecución de manejo de errores
1. Seguir pasos de cada prueba ER1-ER2
2. Verificar que no haya crash
3. Documentar respuesta

## 5. Criterios de aceptación globales

- ✅ Todas las pruebas F1-F6 pasan
- ✅ Todas las métricas R1-R4 cumplen umbrales
- ✅ Todos los casos límite E1-E4 funcionan
- ✅ No hay errores en Console
- ✅ El comportamiento funcional es idéntico al previo
- ✅ La documentación de resultados está completa

## 6. Herramientas requeridas

- **Browser:** Chrome o Firefox
- **React DevTools:** Extensión para Profiler
- **DevTools nativo:** Elements, Performance, Console
- **Servidor:** localhost:3000 (levantado con `.\reset.ps1`)

## 7. Mejoras incorporadas de skills instaladas

### 7.1 De webapp-testing skill
- **Pattern:** Reconnaissance-Then-Action para inspección DOM
- **Selectores:** text=, role=, CSS, IDs (más robustos)
- **Evidencia:** Screenshots como prueba de ejecución
- **Console logs:** Captura de errores y warnings
- **Best practices:** Esperas apropiadas, descriptores claros

### 7.2 De javascript-testing-patterns skill
- **Patrones:** Testing de hooks, state management
- **Métodos:** Unit testing, integration testing
- **Assertions:** Verificaciones claras de resultados

### 7.3 Script de testing Playwright creado
- Ubicación: `.agents/skills/webapp-testing/scripts/test_optimizations.py`
- Funcionalidad: Tests automatizados de F1-F5, R4 con Playwright
- Evidencia: Screenshots automáticos en tmp/
- NOTA: No ejecutado por restricción de dependencias (Playwright no instalado)

## 8. Tiempo estimado

- Preparación: 5 minutos
- Pruebas funcionales: 15 minutos
- Pruebas de rendimiento: 20 minutos
- Casos límite: 10 minutos
- Manejo de errores: 5 minutos
- Documentación: 10 minutos
- **Total:** ~65 minutos

## 9. Registro de resultados

Los resultados se documentarán en `07-Resultados-Testings.md` con:
- Tabla de resultados (PASÓ/FALLÓ)
- Métricas recolectadas
- Errores encontrados
- Correcciones aplicadas
- Recomendaciones
- Screenshots como evidencia (de webapp-testing pattern)
- Recomendaciones
