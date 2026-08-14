# Diseno

**Fecha:** 2026-08-14
**Componente:** 06 - Protección contra Popups

## Arquitectura

### Componentes Modificados
```
├── src/components/Player.tsx (sistema de protección contra popups)
└── DOCUMENTACION/06-Proteccion-Popups/ (documentación del módulo)
```

### Flujo de Protección
```
1. Usuario selecciona un canal con iframe
2. Sistema detecta el dominio del canal
3. Verifica si el dominio está en la whitelist
4. Si NO está en whitelist:
   - Activa overlay transparente sobre el iframe
   - Muestra indicador visual "🔒 Protección popups activa"
   - Intercepta clicks que podrían abrir popups
5. Si está en whitelist:
   - Carga iframe sin restricciones
   - Sin overlay, funciona normalmente
6. Usuario puede desactivar temporalmente:
   - Doble clic en el overlay
   - Desactiva protección por sesión del canal
```

### Estructura del Componente
```
Player.tsx
├── Estado local
│   ├── blockPopups: boolean (estado de protección)
│   └── iframeRef: useRef<HTMLIFrameElement>
├── Configuración
│   └── allowedDomains: string[] (whitelist)
├── useEffect
│   └── Detecta cambios de canal y actualiza blockPopups
└── Render
    ├── <iframe> (reproductor)
    └── <div overlay> (protección cuando blockPopups = true)
```

## Diagramas

### Estados de Protección
```
Estado Inicial
├── blockPopups: false
└── Sin overlay activo

Carga de Canal
├── Detecta dominio
├── Verifica whitelist
└── Actualiza blockPopups

Dominio en Whitelist
├── blockPopups: false
├── Sin overlay
└── Funcionamiento normal

Dominio NO en Whitelist
├── blockPopups: true
├── Overlay activo
└── Indicador visual visible

Desactivación Temporal
├── Doble clic en overlay
├── blockPopups: false
└── Overlay desactivado
```

### Lógica de Whitelist
```
Dominio del Canal
├── youtube.com → ✅ Whitelist → Sin protección
├── youtu.be → ✅ Whitelist → Sin protección
├── vimeo.com → ✅ Whitelist → Sin protección
├── dailymotion.com → ✅ Whitelist → Sin protección
└── otros dominios → ❌ No whitelist → Con protección
```

## Integración con Sistema Existente
- No modifica funcionalidad core de IPTV
- Solo agrega capa de protección UI en Player.tsx
- Compatible con todos los canales existentes
- No requiere cambios en API routes o estado global
- Backward compatible con canales que no usan iframes