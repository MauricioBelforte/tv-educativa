import { Channel } from './types'

/**
 * Parsea el contenido de un archivo M3U (formato IPTV) y devuelve un array de canales.
 *
 * Optimizaciones aplicadas en el módulo 04:
 *  - Regex precompiladas a nivel de módulo (evita realloc por línea).
 *  - Split + indexado manual en lugar de trim() por cada iteración.
 *  - Plantilla de logo placeholder cacheada (un solo encodeURIComponent por nombre).
 *  - Detección de HLS por el último fragmento de la URL (sin includes() inúiles).
 *  - Una sola pasada de líneas para el caso EXTINF (antes: dos pasadas si !hasExtInf).
 */

// Regex precompiladas (módulo-level: se crean UNA vez por carga del módulo)
const RE_TVG_ID = /tvg-id="([^"]*)"/
const RE_TVG_NAME = /tvg-name="([^"]*)"/
const RE_TVG_LOGO = /tvg-logo="([^"]*)"/
const RE_GROUP_TITLE = /group-title="([^"]*)"/
const RE_HLS_SUFFIX = /\.m3u8(\?|$)/

// Plantilla base del placeholder (sin nombre)
const PLACEHOLDER_BASE = 'https://via.placeholder.com/80x80/3b82f6/ffffff?text='

// Generador de IDs sin Math.random costoso
let idCounter = 0
const randomId = () => `channel-${(++idCounter).toString(36)}-${Date.now().toString(36)}`

/** Construye un placeholder con la inicial del nombre */
function placeholderFor(name: string): string {
  const initial = (name.charAt(0) || '?').toUpperCase()
  return PLACEHOLDER_BASE + encodeURIComponent(initial)
}

function parseChannel(extInf: string, url: string): Channel | null {
  // matchAll-equivalente manual para no pagar el costo del motor de allMatches
  // (en perfiles con miles de canales la diferencia es significativa).
  const idMatch = extInf.match(RE_TVG_ID)
  const id = idMatch?.[1] || randomId()

  const nameMatch = extInf.match(RE_TVG_NAME)
  let name = nameMatch?.[1]
  if (!name) {
    const commaIndex = extInf.lastIndexOf(',')
    name = commaIndex !== -1 ? extInf.substring(commaIndex + 1).trim() : 'Unknown'
  }

  const logoMatch = extInf.match(RE_TVG_LOGO)
  const logo = logoMatch?.[1] || placeholderFor(name)

  const categoryMatch = extInf.match(RE_GROUP_TITLE)
  const category = categoryMatch?.[1] || 'General'

  // Determinar tipo de player una sola vez
  const playerType: 'hls' | 'iframe' = RE_HLS_SUFFIX.test(url) ? 'hls' : 'iframe'

  return {
    id,
    name,
    logo,
    url: url.trim(),
    category,
    isLive: true,
    playerType,
  }
}

/** Parsea contenido M3U estándar con #EXTINF */
function parseExtInf(content: string): Channel[] {
  const channels: Channel[] = []
  // Búsqueda manual: evitamos split('\n') que aloca un array gigante
  // y permite procesar archivos de cientos de MB sin pressure de GC.
  let pos = 0
  const len = content.length
  let currentExtInf: string | null = null

  while (pos < len) {
    let nl = content.indexOf('\n', pos)
    if (nl === -1) nl = len
    // Trim inline sin allocs (sólo si hay \r de Windows M3U)
    let lineEnd = nl
    if (lineEnd > pos && content.charCodeAt(lineEnd - 1) === 13) lineEnd--
    const line = content.slice(pos, lineEnd)

    if (line.length > 0) {
      if (line.charCodeAt(0) === 35 /* '#' */ && line.startsWith('#EXTINF:')) {
        currentExtInf = line
      } else if (currentExtInf !== null && line.charCodeAt(0) !== 35) {
        const ch = parseChannel(currentExtInf, line)
        if (ch !== null) channels.push(ch)
        currentExtInf = null
      }
    }

    pos = nl + 1
  }

  return channels
}

/** Fallback para listas "inline" sin EXTINF: cada línea es una URL */
function parseInline(content: string): Channel[] {
  const channels: Channel[] = []
  let pos = 0
  const len = content.length

  while (pos < len) {
    let nl = content.indexOf('\n', pos)
    if (nl === -1) nl = len
    let lineEnd = nl
    if (lineEnd > pos && content.charCodeAt(lineEnd - 1) === 13) lineEnd--
    const line = content.slice(pos, lineEnd)

    if (line.length > 0 && line.charCodeAt(0) !== 35 /* '#' */) {
      // Saltar comentarios "URL" del estilo //example.com
      if (line.charCodeAt(0) === 47 /* '/' */ && line.charCodeAt(1) === 47) {
        pos = nl + 1
        continue
      }
      try {
        const parsed = new URL(line)
        const name =
          parsed.searchParams.get('stream') ||
          parsed.searchParams.get('channel') ||
          parsed.pathname.split('/').pop()?.split('.')[0] ||
          parsed.hostname

        channels.push({
          id: `inline-${randomId()}`,
          name,
          logo: placeholderFor(name),
          url: line,
          category: 'General',
          isLive: true,
          playerType: RE_HLS_SUFFIX.test(line) ? 'hls' : 'iframe',
        })
      } catch {
        // URL inválida: la descartamos silenciosamente
      }
    }

    pos = nl + 1
  }

  return channels
}

export function parseM3U(content: string): Channel[] {
  if (!content) return []

  // Detección rápida: si aparece "#EXTINF" en algún lugar del archivo,
  // usamos el parser EXTINF (más rápido por canal). Si no, parseamos como inline.
  // Antes se hacía un loop completo ANTES de decidir; ahora es O(n) con indexOf.
  const hasExtInf = content.indexOf('#EXTINF') !== -1
  return hasExtInf ? parseExtInf(content) : parseInline(content)
}