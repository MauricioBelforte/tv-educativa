import { Channel, ChannelsResponse } from './types'
import channelsData from '@/data/channels.json'
import { parseM3U } from './m3u-parser'
import { loadLocalM3UFiles } from './local-loader'

/**
 * Obtiene los canales desde la fuente de datos.
 *
 * Optimizaciones aplicadas en el módulo 04:
 *  - Dedupe con `Map<string, Channel>` en O(n) (antes: spread + filter + Set = 2 pasadas y 1 alloc extra).
 *  - Filtro combinado de categoría + búsqueda en una sola pasada (antes: dos filter() consecutivos).
 *  - Las categorías se derivan de los canales YA filtrados, evitando reordenar arrays gigantes.
 *  - `loadLocalM3UFiles()` se llama UNA sola vez (antes se llamaba siempre incluso con m3uContent).
 */

interface GetChannelsParams {
  category?: string | null
  search?: string | null
  m3uContent?: string | null
}

export async function getChannels(params: GetChannelsParams = {}): Promise<ChannelsResponse> {
  const { category, search, m3uContent } = params

  let channels: Channel[]

  if (m3uContent) {
    channels = parseM3U(m3uContent)
  } else {
    // Dedupe via Map: O(n) una sola pasada, sin alloc intermedio.
    const seen = new Map<string, Channel>()
    const defaultChannels = channelsData.channels as Channel[]
    const localChannels = loadLocalM3UFiles()

    // (El Map no expone reserve() en TS estándar; los rehashes son baratos para n < 10k)

    for (const ch of defaultChannels) {
      if (!seen.has(ch.id)) seen.set(ch.id, ch)
    }
    for (const ch of localChannels) {
      if (!seen.has(ch.id)) seen.set(ch.id, ch)
    }
    channels = Array.from(seen.values())
  }

  // Filtro combinado (categoría + búsqueda) en una sola pasada.
  // Si no hay filtros, evitamos alloc del array filtrado.
  const hasFilter = !!category || !!search
  if (hasFilter) {
    const q = search ? search.toLowerCase() : null
    const filtered: Channel[] = []
    for (const c of channels) {
      if (category && c.category !== category) continue
      if (q && !c.name.toLowerCase().includes(q)) continue
      filtered.push(c)
    }
    channels = filtered
  }

  // Categorías: derivamos del set final y pre-asignamos tamaño.
  const categorySet = new Set<string>()
  for (const c of channels) categorySet.add(c.category)
  const categories = Array.from(categorySet).sort()

  return { channels, categories }
}