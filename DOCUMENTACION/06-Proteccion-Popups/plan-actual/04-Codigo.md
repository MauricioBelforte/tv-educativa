# Codigo

**Fecha:** 2026-08-14
**Componente:** 06 - Protección contra Popups

## Archivos Involucrados

### Archivos Modificados
- `src/components/Player.tsx` - Implementación del sistema de protección contra popups

## Código Implementado

### Estado Local en Player.tsx
```typescript
const [blockPopups, setBlockPopups] = useState(false)
const iframeRef = useRef<HTMLIFrameElement>(null)
```

### Whitelist de Dominios
```typescript
const allowedDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com']
```

### Lógica de Detección
```typescript
useEffect(() => {
  if (currentChannel && currentChannel.url.startsWith('http')) {
    const currentDomain = new URL(currentChannel.url).hostname
    const isDomainAllowed = allowedDomains.some(domain => currentDomain.includes(domain))
    setBlockPopups(!isDomainAllowed)
  }
}, [currentChannel?.url])
```

### Overlay de Protección
```typescript
{blockPopups && (
  <div className="absolute inset-0 bg-transparent z-10" onClick={(e) => {
    e.stopPropagation()
    e.preventDefault()
    // No hacer nada, solo bloquear el click
  }} title="Protección contra popups activada - Haz doble clic para desactivar temporalmente" onDoubleClick={() => setBlockPopups(false)}>
    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500/20 backdrop-blur-sm rounded border border-blue-500/50">
      <p className="text-blue-500 text-xs font-medium">🔒 Protección popups activa</p>
    </div>
  </div>
)}
```

## Funciones Clave

### 1. Detección de Dominio
- Extrae el hostname de la URL del canal
- Compara contra la whitelist de dominios permitidos
- Actualiza el estado de protección automáticamente

### 2. Interceptación de Clicks
- El overlay transparente captura todos los clicks
- `stopPropagation()` y `preventDefault()` bloquean el evento
- Evita que el iframe reciba el click y abra popups

### 3. Desactivación Temporal
- `onDoubleClick` permite al usuario desactivar la protección
- Útil cuando el usuario necesita interactuar con el reproductor
- El estado se mantiene mientras el componente esté montado

## Configuración de Iframe
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

**Nota:** No se usa `sandbox` para evitar errores de "Protección Anti-Sandbox"

## Logs Relacionados
- `Logs/21-CREACION-MODULO-06-MEJORAS-TECNICAS-PENDIENTES_2026-08-14_03-45-00.md` - Log de la implementación original (requiere actualización)
- Se recomienda crear un log específico para este módulo