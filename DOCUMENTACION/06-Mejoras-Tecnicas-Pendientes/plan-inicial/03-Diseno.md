# Diseno

**Fecha:** 2026-08-14
**Componente:** 06 - Mejoras Técnicas Pendientes

## Arquitectura

### Componentes a Modificar
```
├── src/app/page.tsx (corregir useEffect dependencies)
├── src/components/ChannelCard.tsx (reemplazar <img> por <Image />)
├── src/components/Player.tsx (reemplazar <img> por <Image />)
├── next.config.js (configurar Image optimization)
├── package.json (actualizar dependencias)
├── jest.config.js (configurar Jest para unit tests)
├── playwright.config.ts (extender tests E2E)
└── public/ (optimizar assets estáticos)
```

### Nuevos Componentes
```
├── src/components/LoadingSkeletons.tsx (skeletons elaborados)
├── src/components/ToastNotification.tsx (sistema de notificaciones)
├── src/lib/cacheService.ts (servicio de caché con IndexedDB)
├── src/lib/imageOptimizer.ts (utilidades de optimización)
├── src/lib/webWorker.ts (Web Workers para procesamiento)
├── tests/unit/ (tests unitarios con Jest)
├── tests/integration/ (tests de integración)
└── tests/e2e/ (tests E2E extendidos con Playwright)
```

### Flujo de Optimización de Imágenes
```
1. Identificar todos los <img> tags en el código
2. Reemplazar por <Image /> de Next.js
3. Configurar next.config.js con domains permitidos
4. Agregar fallback para imágenes externas
5. Implementar loading skeletons mientras cargan
6. Verificar optimización en build
```

### Flujo de Testing
```
1. Configurar Jest con configuración Next.js
2. Crear tests unitarios para funciones core
3. Crear tests de integración para componentes
4. Extender tests E2E con Playwright
5. Configurar CI/CD para ejecutar tests
6. Integrar en pipeline de desarrollo
```

### Flujo de Caché Avanzado
```
1. Implementar IndexedDB wrapper
2. Migrar datos críticos de localStorage a IndexedDB
3. Implementar TTL para datos cacheados
4. Agregar invalidación inteligente
5. Mantener localStorage para settings simples
6. Monitorear performance de caché
```

## Diagramas

### Sistema de Testing
```
┌─────────────────────────────────────┐
│         CI/CD Pipeline              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Pre-commit Hooks               │
│  (Linting, Type checking)          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Unit Tests (Jest)              │
│  - Funciones core                   │
│  - Hooks personalizados             │
│  - Utilidades                       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Integration Tests (Jest)          │
│  - Componentes UI                   │
│  - Flujos principales               │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      E2E Tests (Playwright)         │
│  - Flujos de usuario completos      │
│  - Cross-browser testing            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Deployment (Vercel)            │
└─────────────────────────────────────┘
```

### Sistema de Caché
```
┌─────────────────────────────────────┐
│       Aplicación                    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Cache Service Layer                │
│  (localStorage + IndexedDB)         │
└─────────────┬───────────────────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌───────────┐   ┌───────────┐
│  Local    │   │ IndexedDB │
│ Storage   │   │ (Large)   │
│ (Settings)│   │ (Data)    │
└───────────┘   └───────────┘
```

## Integración con Sistema Existente
- No modifica funcionalidad core de IPTV
- Agrega capas de mejora gradualmente
- Compatible con todas las features existentes
- No requiere cambios drásticos en arquitectura
- Backward compatible con localStorage existente