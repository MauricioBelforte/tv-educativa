/**
 * storage-batcher.ts
 *
 * Optimización Módulo 04 (H2):
 * Centraliza TODAS las escrituras a localStorage y las difiere (debounce)
 * para reducir drasticamente las llamadas síncronas a la API de disco del browser.
 *
 * Mejoras:
 *  - Reduce escrituras cuando se hacen muchos cambios seguidos (ej: reordenar canales).
 *  - Serializa en background para no bloquear el main thread.
 *  - API idempotente: si llegan muchos `set` con la misma key, solo el último valor persiste.
 *  - `flushAll()` permite forzar escritura antes de un cierre o logout.
 *  - Maneja errores silenciosamente (try/catch) para no romper UI.
 */

type Pending = { key: string; value: string }

const pending = new Map<string, Pending>()
let scheduled = false
let scheduledHandle: ReturnType<typeof setTimeout> | null = null

const DELAY_MS = 250

function schedule() {
  if (scheduled) return
  scheduled = true
  if (typeof window === 'undefined') return
  scheduledHandle = setTimeout(() => {
    flushAll()
  }, DELAY_MS)
}

/**
 * Persiste un valor en localStorage de forma diferida.
 * Si se llama muchas veces seguidas con la misma key, solo se persiste el último valor.
 */
export function batchedPersist(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  let serialized: string
  try {
    serialized = JSON.stringify(value)
  } catch {
    // Si no se puede serializar, persistimos el string crudo como fallback
    serialized = String(value)
  }
  pending.set(key, { key, value: serialized })
  schedule()
}

/**
 * Fuerza la escritura inmediata de todos los valores pendientes.
 * Llamar en eventos críticos: beforeunload, logout, navegación SPA.
 */
export function flushAll(): void {
  if (typeof window === 'undefined') return
  if (scheduledHandle) {
    clearTimeout(scheduledHandle)
    scheduledHandle = null
  }
  scheduled = false
  if (pending.size === 0) return

  // Tomamos un snapshot y limpiamos antes de escribir para no perder
  // nuevas escrituras que entren durante el flush.
  const items = Array.from(pending.values())
  pending.clear()

  for (const { key, value } of items) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Si falla (cuota llena, etc.) no rompemos la UI
    }
  }
}

/**
 * Suscribe flushAll al evento beforeunload para garantizar persistencia en cierres.
 * Llamar una sola vez en la inicialización del cliente.
 */
export function installFlushOnUnload(): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => flushAll()
  window.addEventListener('beforeunload', handler)
  window.addEventListener('pagehide', handler)
  return () => {
    window.removeEventListener('beforeunload', handler)
    window.removeEventListener('pagehide', handler)
  }
}