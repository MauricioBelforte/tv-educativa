# Análisis (plan-inicial) - Módulo 05: Plan de Testing Profesional

## 1. Estado actual del testing en el proyecto

El proyecto "TV Libre" actualmente **no tiene suite de tests automatizados**. Las validaciones se realizan manualmente:
- Ejecución de `npm run build` para verificar compilación
- Pruebas manuales de funcionalidad básica
- Verificación visual de la UI

## 2. Componentes modificados en Módulo 04

### 2.1 ChannelCard.tsx
**Cambios:**
- Envuelto en `React.memo`
- Selectores granulares de Zustand
- Prioridad de `propListId` sobre cálculo de `ownerList`

**Riesgos:**
- Memo podría prevenir re-renders necesarios
- Selectores granulares podrían tener bugs
- Cambio de prioridad podría romper detección de lista

### 2.2 ChannelList.tsx
**Cambios:**
- Virtualización manual (windowed)
- `scrollIntoView` recalculado por índice/offset
- Desactivación de virtualización en `reorderMode`

**Riesgos:**
- Virtualización podría romper scrollIntoView
- Drag & drop podría no funcionar con índices virtuales
- Padding/height podrían causar saltos visuales

### 2.3 page.tsx
**Cambios:**
- Debounce de búsqueda (300ms)
- `useCallback` en handlers

**Riesgos:**
- Debounce podría hacer la búsqueda parecer lenta
- `useCallback` podría causar stale closures

### 2.4 Player.tsx
**Cambios:**
- Selector granular para `detectedUrl`

**Riesgos:**
- Selector podría no actualizar correctamente
- Parámetro opcional podría causar bugs

## 3. Estrategia de testing

### 3.1 Enfoque: Testing manual + Profiler

Dado que no podemos agregar dependencias de testing automático, usaremos:
- **Pruebas manuales funcionales:** Click, scroll, drag & drop
- **React DevTools Profiler:** Medir re-renders
- **Browser Console:** Detectar errores
- **Performance Tab:** Medir tiempo de render

### 3.2 Categorías de pruebas

| Categoría | Objetivo | Herramientas |
|-----------|-----------|--------------|
| Funcionalidad | Verificar que NO se rompió nada | Browser manual |
| Rendimiento | Verificar mejoras de velocidad | React DevTools Profiler |
| Casos límite | Listas vacías, 5000+ canales | Browser manual |
| Manejo de errores | Respuesta a errores inesperados | Browser manual |

## 4. Métricas a medir

### 4.1 Métricas funcionales
- ✅ Click en canal: reproducción funciona
- ✅ Toggle favorito: se actualiza correctamente
- ✅ Búsqueda: filtra correctamente
- ✅ Drag & drop: reordena correctamente
- ✅ ScrollIntoView: canal activo se centra
- ✅ Cambio de canal: Player actualiza

### 4.2 Métricas de rendimiento
- **Re-renders por toggle favorito:** Debería ser 1 (solo la card afectada)
- **Nodos DOM con 500 canales:** Debería ser <50 (virtualización)
- **Tiempo de respuesta de búsqueda:** <300ms (debounce)
- **Scroll smoothness:** Sin saltos visuales

## 5. Ambiente de testing

### 5.1 Requisitos
- Servidor de desarrollo corriendo en localhost:3000
- Browser Chrome/Firefox con React DevTools
- Lista de prueba con 500+ canales
- Console del browser abierto para detectar errores

### 5.2 Datos de prueba
- Lista M3U con 500+ canales (si existe)
- Fallback: Lista default + importar lista grande
- Categorías variadas para filtrado
- Canales con y sin logos

## 6. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Virtualización rompe scrollIntoView | Media | Alto | Prueba específica de cambio de canal |
| Memo previene re-renders necesarios | Baja | Medio | Verificar actualización de estado |
| Debounce hace búsqueda parecer lenta | Alta | Bajo | Documentar que es esperado |
| Drag & drop no funciona con virtualización | Media | Alto | Prueba específica en modo reorder |

## 7. Plan de ejecución

1. **Preparación:** Levantar servidor, abrir browser con DevTools
2. **Pruebas funcionales:** Ejecutar checklist de funcionalidad
3. **Pruebas de rendimiento:** Usar Profiler para medir métricas
4. **Pruebas de casos límite:** Listas vacías, 5000+ canales
5. **Documentación:** Registrar resultados en 07-Resultados-Testings.md
6. **Correcciones:** Si falla alguna prueba, corregir y re-ejecutar
