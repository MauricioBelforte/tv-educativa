# Checklist - Modulo de Login y Autenticacion

## Completado
- [x] Componente LoginModal con campo de contrasena
- [x] API /api/check-password para validacion server-side
- [x] Estado isAuthenticated en store de Zustand
- [x] persistencia de auth en localStorage
- [x] Boton "Acceso Privado" / "Salir" en barra superior del sidebar
- [x] APIs private-lists y sync-lists protegidas con parametro password
- [x] Usuarios no autenticados ven solo canales por defecto
- [x] APP_PASSWORD configurable en .env.local
- [x] FIX (2026-08-31): restaurada validacion server-side en `login()` — el commit 99170f1 la habia reemplazado por `process.env.APP_PASSWORD` en el cliente (siempre `''` en el navegador), rompiendo el login en modo incognito
- [x] FIX (2026-08-31): eliminados los 2 usos residuales de `process.env.APP_PASSWORD` en `recheckAllChannels` y `checkChannelStatus` (check-stream no requiere password)
- [x] Testing E2E (2026-08-31): login probado exitosamente con storage limpio (simulando incognito) via Playwright — peticion 200, sesion persistida, modal cerrado, header muestra "Salir"

## Pendiente
- [ ] (opcional) Forzar logout al cambiar la contrasena en el servidor
