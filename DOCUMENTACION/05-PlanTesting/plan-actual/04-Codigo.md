# Código (plan-inicial) - Módulo 05: Plan de Testing Profesional

## 1. Archivos involucrados

Este módulo de testing NO modifica código del proyecto. Se enfoca en:

| Archivo | Rol en testing | Estado |
|---------|----------------|--------|
| `src/components/ChannelCard.tsx` | Componente a probar | Modificado en Módulo 04 |
| `src/components/ChannelList.tsx` | Componente a probar | Modificado en Módulo 04 |
| `src/app/page.tsx` | Componente a probar | Modificado en Módulo 04 |
| `src/components/Player.tsx` | Componente a probar | Modificado en Módulo 04 |
| `DOCUMENTACION/05-PlanTesting/plan-actual/07-Resultados-Testings.md` | Registro de resultados | Por crear |

## 2. Componentes a probar

### 2.1 ChannelCard.tsx
**Optimizaciones aplicadas:**
- React.memo wrapper
- Selectores granulares de Zustand
- Prioridad de propListId

**Puntos críticos a verificar:**
- Re-render solo cuando cambian props relevantes
- Actualización de estado de favorito
- Actualización de estado de canal (online/offline)
- Actualización de detected stream

### 2.2 ChannelList.tsx
**Optimizaciones aplicadas:**
- Virtualización manual (windowed)
- ScrollIntoView recalculado
- Desactivación en reorderMode

**Puntos críticos a verificar:**
- Render solo de canales visibles
- Scroll suave sin saltos
- Drag & drop funciona en modo reorder
- ScrollIntoView centra canal activo

### 2.3 page.tsx
**Optimizaciones aplicadas:**
- Debounce de búsqueda (300ms)
- useCallback en handlers

**Puntos críticos a verificar:**
- Búsqueda responde sin congelar UI
- Filtrado ocurre después de 300ms
- Handlers no causan re-renders innecesarios

### 2.4 Player.tsx
**Optimizaciones aplicadas:**
- Selector granular para detectedUrl

**Puntos críticos a verificar:**
- Player actualiza cuando cambia detectedUrl
- No hay stale closures

## 3. Herramientas de testing

### 3.1 React DevTools Profiler
**Uso:**
```javascript
// En browser console
// Abre Profiler → Start profiling → Realiza acción → Stop profiling
// Analiza gráfico de re-renders
```

**Métricas:**
- Render time por componente
- Why did it render
- Ranked: componentes más costosos

### 3.2 Performance Tab
**Uso:**
```javascript
// En DevTools → Performance
// Click Record → Realiza acción → Stop
// Analiza timeline
```

**Métricas:**
- Main thread work
- FPS
- Long tasks (>50ms)

### 3.3 Elements Tab
**Uso:**
```javascript
// En DevTools → Elements
// Inspect DOM → Contar elementos
```

**Métricas:**
- Número de nodos DOM
- DOM size
- Profundidad del árbol

## 4. Procedimiento de prueba

### 4.1 Prueba de re-renders (R1)
```javascript
// 1. Abrir Profiler
// 2. Click "Start profiling"
// 3. Click en botón favorito de un canal
// 4. Click "Stop profiling"
// 5. Analizar gráfico
// EXPECTED: Solo 1 ChannelCard en ranked
```

### 4.2 Prueba de virtualización (R2)
```javascript
// 1. Abrir Elements
// 2. Buscar class="channel-card"
// 3. Contar elementos
// EXPECTED: <50 con 500+ canales totales
```

### 4.3 Prueba de debounce (R3)
```javascript
// 1. Abrir Performance
// 2. Click "Record"
// 3. Escribir "cnn" en búsqueda
// 4. Esperar 300ms
// 5. Click "Stop"
// 6. Analizar timeline
// EXPECTED: Filtrado ocurre a los 300ms
```

## 5. Logs relacionados

- `Logs/11-OPTIMIZACION-RENDIMIENTO-H1-H3-H4-H5-H7_2026-08-08_06-30-00.md` - Log de optimizaciones implementadas

## 6. Checklist de ejecución

- [ ] Servidor levantado y respondiendo
- [ ] Browser abierto con DevTools
- [ ] React DevTools Profiler disponible
- [ ] Datos de prueba cargados (500+ canales)
- [ ] Console sin errores al inicio
- [ ] Pruebas funcionales ejecutadas
- [ ] Pruebas de rendimiento ejecutadas
- [ ] Pruebas de casos límite ejecutadas
- [ ] Resultados documentados
- [ ] Errores corregidos (si aplica)
