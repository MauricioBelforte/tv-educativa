# Plan de Testings

**Fecha:** 2026-08-14
**Componente:** 06 - Protección contra Popups

## Pruebas Funcionales

### Pruebas de Whitelist
- [ ] **Prueba 1:** Cargar canal de YouTube y verificar que no aparece overlay
- [ ] **Prueba 2:** Cargar canal de Vimeo y verificar que no aparece overlay
- [ ] **Prueba 3:** Cargar canal de Dailymotion y verificar que no aparece overlay
- [ ] **Prueba 4:** Cargar canal de dominio no verificado y verificar que aparece overlay
- [ ] **Prueba 5:** Verificar que el indicador "🔒 Protección popups activa" es visible

### Pruebas de Protección
- [ ] **Prueba 6:** Hacer clic en iframe con overlay activo y verificar que no abre nueva pestaña
- [ ] **Prueba 7:** Hacer doble clic en overlay y verificar que se desactiva
- [ ] **Prueba 8:** Después de desactivar, hacer clic y verificar que interactúa con el reproductor
- [ ] **Prueba 9:** Cambiar a otro canal y verificar que la protección se reinicia según el dominio
- [ ] **Prueba 10:** Verificar que el estado de protección es por canal (no global)

### Pruebas de Compatibilidad
- [ ] **Prueba 11:** Verificar que la reproducción de video funciona normalmente
- [ ] **Prueba 12:** Verificar que los controles del reproductor funcionan
- [ ] **Prueba 13:** Verificar que el fullscreen funciona en dominios permitidos
- [ ] **Prueba 14:** Verificar que no hay errores de consola
- [ ] **Prueba 15:** Verificar que no hay errores de "Protección Anti-Sandbox"

### Pruebas de UX
- [ ] **Prueba 16:** Verificar que el overlay es transparente (no bloquea la visión)
- [ ] **Prueba 17:** Verificar que el indicador visual es legible
- [ ] **Prueba 18:** Verificar que el tooltip explica la funcionalidad
- [ ] **Prueba 19:** Verificar que la desactivación con doble clic es intuitiva
- [ ] **Prueba 20:** Verificar que el sistema no afecta el rendimiento

## Pruebas Técnicas

### Pruebas de Build
- [ ] **Prueba 21:** Verificar que `npm run build` compila sin errores
- [ ] **Prueba 22:** Verificar que no hay errores de TypeScript
- [ ] **Prueba 23:** Verificar que el bundle size no aumenta significativamente
- [ ] **Prueba 24:** Verificar que los warnings de ESLint son solo preexistentes

### Pruebas de Cross-Browser
- [ ] **Prueba 25:** Verificar en Chrome (última versión)
- [ ] **Prueba 26:** Verificar en Firefox (última versión)
- [ ] **Prueba 27:** Verificar en Safari (última versión)
- [ ] **Prueba 28:** Verificar en Edge (última versión)

### Pruebas de Edge Cases
- [ ] **Prueba 29:** Verificar comportamiento con URL sin http/https
- [ ] **Prueba 30:** Verificar comportamiento con URL inválida
- [ ] **Prueba 31:** Verificar comportamiento cuando currentChannel es null
- [ ] **Prueba 32:** Verificar comportamiento con múltiples cambios rápidos de canal
- [ ] **Prueba 33:** Verificar comportamiento con very long URLs

## Criterios de Aceptación

### Funcionalidad
- ✅ Overlay bloquea popups en dominios no verificados
- ✅ Whitelist funciona correctamente para dominios de confianza
- ✅ Doble clic desactiva protección temporalmente
- ✅ Indicador visual muestra estado de protección

### Compatibilidad
- ✅ No hay errores de "Protección Anti-Sandbox"
- ✅ Reproducción de video funciona normalmente
- ✅ Cross-browser compatibility mantenido
- ✅ Build compila sin errores

### UX
- ✅ Overlay es transparente y no obstructivo
- ✅ Sistema es intuitivo para el usuario
- ✅ No degrada performance
- ✅ Funciona correctamente en todos los escenarios