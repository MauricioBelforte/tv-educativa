# Log 24 — FIX: Login roto en modo incognito

**Fecha:** 2026-08-31 05:10:00
**Componente:** 03-Login-Auth
**Archivos:** `src/store/player-store.ts`, `DOCUMENTACION/03-Login-Auth/plan-actual/`

## Descripción del problema

El usuario reportó que la contraseña no funcionaba en ventana incógnito. Diagnóstico:

- La contraseña real vive en `.env.local` → `APP_PASSWORD=123` (y en Vercel como Environment Variable). Nunca se guarda en localStorage; ahí solo persiste la sesión ya validada (`iptv-auth-password`).
- En el navegador normal "funcionaba" porque la sesión vieja (previa al bug) seguía persistida en localStorage y `initFromStorage()` auto-logueaba.
- En incógnito el localStorage empieza vacío → pedía login → el login estaba roto → rechazaba cualquier contraseña.

## Causa raíz

El commit `99170f1` ("Se eliminó completamente el modo claro del sistema...") reescribió accidentalmente `login()` en el store:

```typescript
// CODIGO ROTO (nuevo, client-side):
login: async (password) => {
  const APP_PASSWORD = process.env.APP_PASSWORD || ''  // ← en el cliente SIEMPRE es ''
  if (password === APP_PASSWORD) { ... }
  return false
}
```

`process.env.APP_PASSWORD` NO está disponible en el navegador: Next.js solo expone al cliente variables con prefijo `NEXT_PUBLIC_`, y esta no lo tiene (a propósito, para no filtrar la contraseña). Por lo tanto `APP_PASSWORD` siempre era `''` y ninguna contraseña podía coincidir.

El mismo commit también inyectó `process.env.APP_PASSWORD` (vacío en cliente) en `recheckAllChannels` y `checkChannelStatus` al armar los fetch a `/api/check-stream` — código inútil porque ese endpoint no valida password.

## Código original (restaurado del commit `cd40497`)

```typescript
login: async (password) => {
  try {
    const res = await fetch(`/api/check-password?p=${encodeURIComponent(password)}`)
    const data = await res.json()
    if (data.ok) {
      saveToStorage('iptv-auth-password', password)
      set({ isAuthenticated: true, authPassword: password })
      return true
    }
    return false
  } catch {
    return false
  }
}
```

## Cambios realizados

1. `src/store/player-store.ts` → `login()`: restaurada la validación server-side contra `/api/check-password` (con comentario explicando por qué no se puede leer la variable en el cliente).
2. `src/store/player-store.ts` → `recheckAllChannels()`: eliminado el uso de `process.env.APP_PASSWORD` en el fetch a check-stream.
3. `src/store/player-store.ts` → `checkChannelStatus()`: ídem anterior.
4. Respaldo previo: `Obsoletos/2026-08-31_05-05-00_player-store-pre-fix-login.bak`
5. Documentación actualizada: `DOCUMENTACION/03-Login-Auth/plan-actual/04-Codigo.md` y `05-Checklist.md`.

## Verificación (Plan de Testing)

1. **API directa**: `GET /api/check-password?p=123` → `{"ok":true}` (200) · `GET /api/check-password?p=999` → `{"ok":false}` (200). ✅
2. **E2E con Playwright** (`tmp/test_login_incognito.py`, contexto limpio = incognito): storage vacío → botón "Acceso Privado" → contraseña `123` → petición 200 → sesión `"123"` guardada en localStorage → modal cerrado → header muestra "Salir". ✅
3. **Búsqueda residual**: sin usos restantes de `process.env.APP_PASSWORD` en código de cliente (solo en comentario explicativo y en las API Routes server-side, donde corresponde). ✅
4. Servidor reiniciado con `.\reset.ps1` tras las ediciones (regla de cache residual). ✅

## Nota para el usuario

Si probás en producción (Vercel): verificá que la variable `APP_PASSWORD` exista en Vercel → Settings → Environment Variables (y que sea la misma que usás localmente). En incógnito ahora podés iniciar sesión normalmente con tu contraseña.
