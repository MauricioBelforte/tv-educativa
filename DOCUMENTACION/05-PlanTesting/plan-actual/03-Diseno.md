# Diseño (plan-inicial) - Módulo 05: Plan de Testing Profesional

## 1. Arquitectura del plan de testing

```
PLAN DE TESTING
├── 1. Preparación del ambiente
│   ├── Levantar servidor dev
│   ├── Abrir browser con DevTools
│   └── Cargar datos de prueba
├── 2. Pruebas funcionales
│   ├── Click en canal
│   ├── Toggle favorito
│   ├── Búsqueda
│   ├── Drag & drop
│   ├── ScrollIntoView
│   └── Cambio de canal
├── 3. Pruebas de rendimiento
│   ├── Re-renders (Profiler)
│   ├── Nodos DOM (Elements)
│   ├── Tiempo de búsqueda (Performance)
│   └── Scroll smoothness
├── 4. Pruebas de casos límite
│   ├── Lista vacía
│   ├── Lista de 5000+ canales
│   ├── Canales sin logos
│   └── Búsqueda con caracteres especiales
└── 5. Documentación de resultados
    ├── Registro de pruebas pasadas/falladas
    ├── Métricas recolectadas
    └── Correcciones aplicadas
```

## 2. Flujos de prueba

### 2.1 Flujo de prueba funcional: Toggle favorito

```
1. Abrir DevTools → Profiler
2. Click en "Start profiling"
3. Click en botón favorito de un canal
4. Click en "Stop profiling"
5. Analizar gráfico de re-renders
6. CRITERIO: Solo 1 componente ChannelCard re-renderizado
```

### 2.2 Flujo de prueba funcional: Virtualización

```
1. Abrir DevTools → Elements
2. Seleccionar lista de canales
3. Scroll a la mitad de la lista
4. Contar nodos DOM de channel-card
5. CRITERIO: <50 nodos con 500+ canales en total
```

### 2.3 Flujo de prueba funcional: Búsqueda con debounce

```
1. Abrir DevTools → Performance
2. Click en "Record"
3. Escribir en búsqueda: "cnn"
4. Esperar 300ms
5. Verificar que UI no se congela
6. Click en "Stop"
7. Analizar timeline
8. CRITERIO: Filtrado ocurre después de 300ms, UI responsiva
```

### 2.4 Flujo de prueba funcional: Drag & drop

```
1. Activar modo reorder (botón arriba de lista)
2. Drag un canal hacia abajo
3. Drop en posición objetivo
4. Verificar que el canal se movió
5. CRITERIO: Canal reordenado correctamente
```

### 2.5 Flujo de prueba funcional: ScrollIntoView

```
1. Scroll al fondo de la lista
2. Click en un canal del fondo
3. Verificar que Player reproduce el canal
4. CRITERIO: Lista scrollea automáticamente para centrar el canal activo
```

## 3. Matriz de pruebas

| ID | Prueba | Tipo | Herramienta | Criterio de éxito |
|----|--------|------|-------------|-------------------|
| F1 | Click en canal reproduce | Funcional | Browser manual | Video empieza a reproducir |
| F2 | Toggle favorito actualiza | Funcional | Browser manual | Icono de estrella cambia |
| F3 | Búsqueda filtra correctamente | Funcional | Browser manual | Solo canales que coinciden |
| F4 | Drag & drop reordena | Funcional | Browser manual | Canal cambia posición |
| F5 | ScrollIntoView centra canal | Funcional | Browser manual | Canal activo visible |
| F6 | Cambio de canal actualiza Player | Funcional | Browser manual | Player muestra nuevo canal |
| R1 | Re-renders por toggle favorito | Rendimiento | React DevTools Profiler | Solo 1 ChannelCard re-renderiza |
| R2 | Nodos DOM con 500 canales | Rendimiento | DevTools Elements | <50 nodos renderizados |
| R3 | Tiempo de búsqueda | Rendimiento | Performance Tab | Filtrado en 300ms |
| R4 | Scroll smoothness | Rendimiento | Visual | Sin saltos visuales |
| E1 | Lista vacía muestra mensaje | Caso límite | Browser manual | "No se encontraron canales" |
| E2 | Lista de 5000 canales | Caso límite | Browser manual | Scroll suave, sin crash |
| E3 | Canales sin logos | Caso límite | Browser manual | Fallback SVG aparece |
| E4 | Búsqueda con caracteres especiales | Caso límite | Browser manual | Filtrado funciona |
| ER1 | Error en URL de canal | Manejo de errores | Browser manual | Marca offline sin crash |
| ER2 | LocalStorage lleno | Manejo de errores | Browser manual | No crash, mensaje de error |

## 4. Herramientas

### 4.1 React DevTools Profiler
- **Uso:** Medir re-renders, identificar componentes costosos
- **Instalación:** Extensión de Chrome/Firefox
- **Métricas:** Render time, why did it render

### 4.2 Performance Tab
- **Uso:** Medir tiempo de ejecución, frame rate
- **Instalación:** Nativo en Chrome DevTools
- **Métricas:** Main thread work, FPS

### 4.3 Elements Tab
- **Uso:** Contar nodos DOM, inspeccionar estructura
- **Instalación:** Nativo en Chrome DevTools
- **Métricas:** Número de elementos, DOM size

### 4.4 Console
- **Uso:** Detectar errores, warnings
- **Instalación:** Nativo en Chrome DevTools
- **Métricas:** Número de errores, warnings

## 5. Procedimiento de ejecución

### 5.1 Preparación
1. Ejecutar `.\reset.ps1` para limpiar cache
2. Verificar que servidor responde HTTP 200
3. Abrir Chrome en http://localhost:3000
4. Abrir DevTools (F12)
5. Navegar a pestañas: Profiler, Performance, Elements, Console

### 5.2 Ejecución de pruebas
1. Seguir flujos de prueba definidos
2. Registrar resultados en checklist
3. Capturar screenshots/métricas cuando aplique
4. Si falla, documentar el error

### 5.3 Criterios de éxito globales
- Todas las pruebas F1-F6 pasan
- Todas las métricas R1-R4 cumplen umbrales
- Todos los casos límite E1-E4 funcionan
- No hay errores en Console
- El comportamiento funcional es idéntico al previo

## 6. Reporte de resultados

El reporte se documentará en `07-Resultados-Testings.md` con:
- Tabla de resultados (PASÓ/FALLÓ)
- Métricas recolectadas
- Errores encontrados
- Correcciones aplicadas
- Recomendaciones
