# Eliminación de Protección contra Popups

**Fecha:** 2026-08-14 06:30:00
**Componente:** 06 - Protección contra Popups
**Tipo:** Eliminación de funcionalidad por limitaciones técnicas

## Motivo de la Eliminación

Después de extensas pruebas, se determinó que no es técnicamente posible bloquear completamente los popups que se generan desde iframes de terceros debido a las políticas de seguridad del navegador (cross-origin restrictions) y a que los iframes tienen sus propios contextos de JavaScript.

## Métodos Probados y Resultados

### 1. Overlay Transparente
**Código original:**
```typescript
{blockPopups && (
  <div className="absolute inset-0 bg-transparent z-10" onClick={(e) => {
    e.stopPropagation()
    e.preventDefault()
  }} onDoubleClick={() => setBlockPopups(false)}>
    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500/20 backdrop-blur-sm rounded border border-blue-500/50">
      <p className="text-blue-500 text-xs font-medium">🔒 Protección popups activa</p>
    </div>
  </div>
)}
```

**Resultado:** ❌ No bloquea popups generados internamente por el iframe.

### 2. Intercepción de window.open
**Código original:**
```typescript
window.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
  console.log('Intento de abrir nueva ventana bloqueado:', url, target, features)
  return null
}
```

**Resultado:** ❌ No bloquea popups del iframe porque usa su propio window.

### 3. Intercepción de window.parent.open y window.top.open
**Código original:**
```typescript
if (window.parent && window.parent !== window) {
  window.parent.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
    console.log('Intento de abrir nueva ventana bloqueado (window.parent.open):', url, target, features)
    return null
  }
}

if (window.top && window.top !== window) {
  window.top.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
    console.log('Intento de abrir nueva ventana bloqueado (window.top.open):', url, target, features)
    return null
  }
}
```

**Resultado:** ❌ No bloquea popups del iframe porque usa `window.open()` en su propio contexto.

### 4. Sandbox con restricciones
**Código probado:**
```typescript
sandbox="allow-scripts allow-same-origin allow-presentation"
```

**Resultado:** ❌ Causa error "Protección Anti-Sandbox" en varios servicios.

## Código Eliminado

### Estado Local Eliminado
```typescript
// ELIMINADO
const [blockPopups, setBlockPopups] = useState(false)
const originalWindowOpenRef = useRef<((url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) => Window | null) | null>(null)
```

### Whitelist Eliminada
```typescript
// ELIMINADO
const allowedDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com']
```

### Lógica de Detección Eliminada
```typescript
// ELIMINADO
useEffect(() => {
  if (currentChannel && currentChannel.url.startsWith('http')) {
    const currentDomain = new URL(currentChannel.url).hostname
    const isDomainAllowed = allowedDomains.some(domain => currentDomain.includes(domain))
    setBlockPopups(!isDomainAllowed)
  } else {
    setBlockPopups(false)
  }
}, [currentChannel?.url])
```

### Intercepción de window.open Eliminada
```typescript
// ELIMINADO
useEffect(() => {
  if (blockPopups) {
    const originalWindowOpen = window.open
    const originalParentOpen = window.parent?.open
    const originalTopOpen = window.top?.open
    
    window.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
      console.log('Intento de abrir nueva ventana bloqueado (window.open):', url, target, features)
      return null
    }
    
    if (window.parent && window.parent !== window) {
      window.parent.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
        console.log('Intento de abrir nueva ventana bloqueado (window.parent.open):', url, target, features)
        return null
      }
    }
    
    if (window.top && window.top !== window) {
      window.top.open = function(url?: string | URL | undefined, target?: string | undefined, features?: string | undefined) {
        console.log('Intento de abrir nueva ventana bloqueado (window.top.open):', url, target, features)
        return null
      }
    }
    
    return () => {
      window.open = originalWindowOpen
      if (window.parent && window.parent !== window && originalParentOpen) {
        window.parent.open = originalParentOpen
      }
      if (window.top && window.top !== window && originalTopOpen) {
        window.top.open = originalTopOpen
      }
    }
  }
}, [blockPopups])
```

### Overlay Eliminado
```typescript
// ELIMINADO
{showOverlay && (
  <div className="absolute inset-0 bg-transparent z-10" onClick={(e) => {
    e.stopPropagation()
    e.preventDefault()
  }} title="Protección contra popups activada - Haz doble clic para desactivar temporalmente" onDoubleClick={() => setBlockPopups(false)}>
    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500/20 backdrop-blur-sm rounded border border-blue-500/50">
      <p className="text-blue-500 text-xs font-medium">🔒 Protección popups activa</p>
    </div>
  </div>
)}
```

## Código Actual

### Player.tsx - Iframe Simple
```typescript
<iframe
  ref={iframeRef}
  src={iframeUrl}
  className="w-full aspect-video"
  allow="autoplay; encrypted-media; fullscreen"
  allowFullScreen
  referrerPolicy="no-referrer"
/>
```

## Archivos Modificados

- `src/components/Player.tsx` - Eliminado todo el código de protección contra popups
- `DOCUMENTACION/06-Proteccion-Popups/plan-actual/04-Codigo.md` - Actualizado con resultados de pruebas
- `DOCUMENTACION/06-Proteccion-Popups/plan-actual/05-Checklist.md` - Actualizado con estado final

## Conclusión

La implementación fue eliminada completamente porque después de pruebas exhaustivas se determinó que:

1. **Limitaciones técnicas fundamentales:** Los navegadores bloquean el control de iframes de terceros por seguridad
2. **Contextos de JavaScript separados:** El iframe tiene su propio window.open() que no podemos controlar
3. **Imposibilidad de bloqueo total:** No existe un método técnico para bloquear completamente popups desde iframes de terceros

## Alternativas No Implementadas

Las siguientes alternativas fueron evaluadas pero no implementadas:

1. **Proxy de contenido:** Riesgo de bloqueo de IP, complejidad técnica, costo
2. **Extensiones del navegador:** No es una solución universal
3. **Content Security Policy:** No controlamos la respuesta del sitio externo

## Recomendaciones Futuras

Si se requiere alguna funcionalidad relacionada, se sugiere:

1. Sistema de avisos educativos para usuarios
2. Sistema de reporte de canales problemáticos
3. Botón de confirmación antes de cargar canales no verificados
4. Documentación clara de limitaciones técnicas