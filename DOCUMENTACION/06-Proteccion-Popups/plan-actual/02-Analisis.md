# Analisis

**Fecha:** 2026-08-14
**Componente:** 06 - Protección contra Popups

## Análisis del Dominio

### Estado Actual (antes de implementación)
- Los iframes de reproductores externos pueden abrir nuevas pestañas libremente
- No hay control sobre redirecciones no deseadas
- El usuario no tiene forma de prevenir popups
- Algunos servicios tienen protecciones anti-sandbox que bloquean iframes con sandbox

### Problemas Identificados
1. **Popups no deseados:** Reproductores que abren publicidad o redirecciones
2. **Sin control del usuario:** No hay forma de prevenir estas acciones
3. **Experiencia molesta:** Nuevas pestañas interrumpen la navegación
4. **Riesgo de seguridad:** Redirecciones a sitios potencialmente peligrosos

### Alternativas Consideradas

#### Para Bloqueo de Popups
- **Opción A:** Usar atributo sandbox → Descartado (causa errores anti-sandbox)
- **Opción B:** Overlay transparente → **Seleccionado** (funciona sin errores)
- **Opción C:** Content Security Policy → Descartado (más complejo, no aplica a iframes externos)

#### Para Identificación de Dominios
- **Opción A:** Bloquear todos los iframes → Descartado (rompe funcionalidad)
- **Opción B:** Whitelist de dominios de confianza → **Seleccionado** (balance correcto)
- **Opción C:** Detección automática de comportamiento → Descartado (muy complejo)

### Decisiones Técnicas

### Uso de Overlay Transparente
- **Razón:** Evita errores de sandbox mientras intercepta clicks
- **Implementación:** Div transparente sobre el iframe con z-index superior
- **Ventajas:** Compatible con todos los servicios, control total de interacción

### Whitelist de Dominios
- **Razón:** Algunos servicios de confianza no necesitan protección
- **Implementación:** Array de dominios que se consideran seguros
- **Ventajas:** Mejor UX para servicios conocidos (YouTube, Vimeo, Dailymotion)

### Control por Usuario
- **Razón:** El usuario puede necesitar interactuar con el reproductor
- **Implementación:** Doble clic para desactivar temporalmente la protección
- **Ventajas:** Flexibilidad sin comprometer seguridad

## Consideraciones de Performance
- El overlay no afecta el rendimiento de reproducción
- La detección de dominios es O(1) con array lookup
- El estado de protección se mantiene en componente local (no afecta estado global)