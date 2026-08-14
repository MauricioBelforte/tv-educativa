# Codigo

**Fecha:** 2026-08-14
**Componente:** 06 - Mejoras Técnicas Pendientes

## Archivos Involucrados

### Archivos Existentes a Modificar
- `src/app/page.tsx` - Corregir useEffect dependencies
- `src/components/ChannelCard.tsx` - Reemplazar <img> por <Image />
- `src/components/Player.tsx` - Reemplazar <img> por <Image />
- `next.config.js` - Configurar Image optimization
- `package.json` - Actualizar dependencias vulnerables
- `tailwind.config.ts` - Configuración actual
- `tsconfig.json` - Configuración TypeScript actual

### Nuevos Archivos a Crear
- `src/components/LoadingSkeletons.tsx` - Skeletons elaborados
- `src/components/ToastNotification.tsx` - Sistema de notificaciones
- `src/lib/cacheService.ts` - Servicio de caché con IndexedDB
- `src/lib/imageOptimizer.ts` - Utilidades de optimización
- `src/lib/webWorker.ts` - Web Workers para procesamiento
- `jest.config.js` - Configuración Jest
- `tests/unit/` - Tests unitarios
- `tests/integration/` - Tests de integración
- `tests/e2e/` - Tests E2E extendidos

## Mejoras Prioritarias a Implementar

### Prioridad Alta 🔴

#### 1. Reemplazar `<img>` por `<Image />` de Next.js
**Archivos:** `ChannelCard.tsx`, `Player.tsx`
**Estado:** Pendiente
**Impacto:** Optimización automática de imágenes, mejor performance

```typescript
// Antes:
<img src={channel.logo} alt={channel.name} className="w-12 h-12" />

// Después:
<Image 
  src={channel.logo} 
  alt={channel.name} 
  width={48} 
  height={48}
  className="w-12 h-12"
/>
```

#### 2. Resolver warnings de React Hook useEffect dependencies
**Archivo:** `src/app/page.tsx`
**Estado:** Pendiente
**Impacto:** Eliminar warnings de ESLint, mejor calidad de código

```typescript
// Agregar dependencias faltantes al useEffect
useEffect(() => {
  // ...
}, [dependencia1, dependencia2]) // Agregar todas las dependencias
```

#### 3. Actualizar dependencias con vulnerabilidades
**Archivo:** `package.json`
**Estado:** Pendiente
**Impacto:** Seguridad del proyecto
**Comando:** `npm audit fix` o actualización manual

### Prioridad Media 🟡

#### 4. Implementar sistema de caché más robusto
**Nuevo archivo:** `src/lib/cacheService.ts`
**Estado:** Pendiente
**Impacto:** Mejor performance y capacidad de almacenamiento

```typescript
// IndexedDB wrapper para datos grandes
// localStorage para settings simples
// TTL para invalidación automática
```

#### 5. Agregar configuración de redirección HTTPS
**Archivo:** `next.config.js`
**Estado:** Pendiente
**Impacto:** Seguridad, SEO

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

#### 6. Optimizar bundle size
**Estrategias:**
- Code splitting con dynamic imports
- Tree shaking agresivo
- Eliminación de código muerto
- Lazy loading de componentes

#### 7. Implementar loading skeletons más elaborados
**Nuevo archivo:** `src/components/LoadingSkeletons.tsx`
**Estado:** Pendiente
**Impacto:** Mejor UX durante carga

#### 8. Agregar sistema de toast/notifications
**Nuevo archivo:** `src/components/ToastNotification.tsx`
**Estado:** Pendiente
**Impacto:** Mejor feedback al usuario

### Prioridad Baja 🟢

#### 9. Agregar PWA capabilities
**Archivos:** `public/manifest.json`, `src/app/layout.tsx`
**Estado:** Pendiente
**Impacto:** Offline support, mejor experiencia móvil

#### 10. Implementar Web Workers
**Nuevo archivo:** `src/lib/webWorker.ts`
**Estado:** Pendiente
**Impacto:** Procesamiento pesado en background

#### 11. Agregar unit tests con Jest/Vitest
**Nueva carpeta:** `tests/unit/`
**Estado:** Pendiente
**Impacto:** Mejor calidad de código, regresión testing

#### 12. Implementar E2E tests con Playwright
**Nueva carpeta:** `tests/e2e/`
**Estado:** Parcialmente implementado (skills existentes)
**Impacto:** Testing de flujos completos

#### 13. Optimizar metadata SEO
**Archivo:** `src/app/layout.tsx`
**Estado:** Pendiente
**Impacto:** Mejor ranking en motores de búsqueda

#### 14. Agregar analytics y tracking
**Nuevo servicio:** Integración con analytics
**Estado:** Pendiente
**Impacto:** Datos de uso, métricas

## Configuraciones Requeridas

### Next.js Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-image-domains.com'],
    unoptimized: false,
  }
}
```

### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')
const createJestConfig = nextJest({
  dir: './',
})
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}
module.exports = createJestConfig(customJestConfig)
```

### Webpack Configuration (bundle optimization)
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
    return config
  }
}
```

## Logs Relacionados
Este módulo documenta mejoras técnicas pendientes aún no implementadas.