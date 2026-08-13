# Plan de Testings (plan-inicial) - Módulo 05: Plan de Testing Profesional

## 1. Propósito

Este documento define el plan detallado de testing para validar las optimizaciones de rendimiento implementadas en el Módulo 04 del proyecto "TV Libre".

## 2. Estrategia de testing

### 2.1 Enfoque
Testing manual + herramientas de browser (React DevTools Profiler, Performance Tab, Elements Tab) sin agregar dependencias de testing automatizado.

### 2.2 Tipos de pruebas
- **Pruebas funcionales:** Verificar que NO se rompió funcionalidad existente
- **Pruebas de rendimiento:** Validar mejoras de velocidad y memoria
- **Pruebas de casos límite:** Listas vacías, 5000+ canales, caracteres especiales
- **Pruebas de manejo de errores:** Respuesta a errores inesperados

## 3. Escenarios de prueba

### 3.1 Pruebas funcionales (F)

| ID | Escenario | Pasos | Resultado esperado | Herramienta |
|----|-----------|-------|--------------------|-------------|
| F1 | Click en canal reproduce | 1. Click en canal<br>2. Verificar Player | Video empieza a reproducir | Browser manual |
| F2 | Toggle favorito actualiza | 1. Click en estrella<br>2. Verificar icono | Icono cambia (amarillo/gris) | Browser manual |
| F3 | Búsqueda filtra correctamente | 1. Escribir "cnn"<br>2. Verificar lista | Solo canales con "cnn" | Browser manual |
| F4 | Drag & drop reordena | 1. Activar reorder<br>2. Drag canal<br>3. Drop en posición | Canal cambia posición | Browser manual |
| F5 | ScrollIntoView centra canal | 1. Scroll al fondo<br>2. Click canal fondo<br>3. Verificar scroll | Canal activo centrado | Browser manual |
| F6 | Cambio de canal actualiza Player | 1. Click canal diferente<br>2. Verificar Player | Player muestra nuevo canal | Browser manual |

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

## 7. Tiempo estimado

- Preparación: 5 minutos
- Pruebas funcionales: 15 minutos
- Pruebas de rendimiento: 20 minutos
- Casos límite: 10 minutos
- Manejo de errores: 5 minutos
- Documentación: 10 minutos
- **Total:** ~65 minutos

## 8. Registro de resultados

Los resultados se documentarán en `07-Resultados-Testings.md` con:
- Tabla de resultados (PASÓ/FALLÓ)
- Métricas recolectadas
- Errores encontrados
- Correcciones aplicadas
- Recomendaciones
