# Código - Módulo 04: Optimización de Rendimiento

## 1. Archivos involucrados

| Archivo | Rol en el plan |
|---------|----------------|
| `src/lib/storage-batcher.ts` | **Nuevo.** Batching de persistencia a `localStorage` |
| `src/components/ChannelCard.tsx` | Selectores granulares, memo, prop `listId` |
| `src/components/ChannelList.tsx` | Virtualización windowed, pasar `listId` |
| `src/components/Player.tsx` | Selector granular `detectedStreams[currentChannelId]` |
| `src/components/Header.tsx` | Debounce de búsqueda (250ms) |
| `src/app/page.tsx` | Memoizar filtros, usar `debouncedSearchQuery`, `allAvailableChannels` O(n) |
| `src/store/player-store.ts` | Batching persistencia, Sets en `getFavoriteChannels`, flush al final de escaneo |
| `src/lib/m3u-parser.ts` | Un solo regex por línea, IDs estables (hash) |
| `src/lib/local-loader.ts` | `fs.promises` (async) |
| `src/lib/channels.ts` | Eliminar dedup redundante, `await loadLocalM3UFiles()` |

## 2. Funciones/fragmentos clave del estado actual → propuesto

### 2.1 `src/store/player-store.ts` — `saveToStorage` repetido

**Actual (función base, líneas 77-81):**
```ts
function saveToStorage(key: string, data: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}
```

**Problema:** se llama en cada `setChannelStatus`/check (líneas 503, 511, 518, 522, 536, 569, 601), serializando `channelStatus` completo.

**Propuesto:** reemplazar esos llamados por `schedulePersist('iptv-channel-status', () => get().channelStatus)` del nuevo `storage-batcher.ts`, y llamar `flushPersist()` al final de `checkAllChannels`/`recheckAllChannels`/`fastRecheckAllChannels`.

### 2.2 `src/components/ChannelCard.tsx` — suscripciones completas

**Actual (líneas 20-25, 29):**
```ts
const importedLists = usePlayerStore((state) => state.importedLists)
const channelStatus = usePlayerStore((state) => state.channelStatus)
const detectedStreams = usePlayerStore((state) => state.detectedStreams)
...
const ownerList = importedLists.find(l => l.channels.some(c => c.id === channel.id))
```

**Propuesto (selectores granulares + prop listId):**
```ts
const status = usePlayerStore((s) => s.channelStatus[channel.id])
const detected = usePlayerStore((s) => s.detectedStreams[channel.id])
// listId llega por prop desde ChannelList; ya no se busca con find/some
```
Envuelto en `React.memo` (`export default memo(ChannelCard)`).

### 2.3 `src/lib/m3u-parser.ts` — 4 regex por línea

**Actual (líneas 60, 64, 72, 76):**
```ts
const idMatch = extInf.match(/tvg-id="([^"]*)"/)
const nameMatch = extInf.match(/tvg-name="([^"]*)"/)
const logoMatch = extInf.match(/tvg-logo="([^"]*)"/)
const categoryMatch = extInf.match(/group-title="([^"]*)"/)
```

**Propuesto (un solo regex global → Map):**
```ts
const ATTR_REGEX = /([\w-]+)="([^"]*)"/g
const attrs = new Map<string, string>()
let m: RegExpExecArray | null
while ((m = ATTR_REGEX.exec(extInf)) !== null) attrs.set(m[1], m[2])
const id = attrs.get('tvg-id') || hashString(`${extInf}-${url}`)
```

### 2.4 `src/lib/local-loader.ts` — fs síncrono

**Actual (líneas 10-17):**
```ts
const files = fs.readdirSync(LOCAL_DIR).filter(f => f.endsWith('.m3u'))
...
const content = fs.readFileSync(path.join(LOCAL_DIR, file), 'utf-8')
```

**Propuesto:**
```ts
export async function loadLocalM3UFiles(): Promise<Channel[]> {
  const files = (await readdir(LOCAL_DIR)).filter(f => f.endsWith('.m3u'))
  for (const file of files) {
    const content = await readFile(path.join(LOCAL_DIR, file), 'utf-8')
    ...
  }
}
```
Con `import { readdir, readFile } from 'fs/promises'`.

### 2.5 `src/lib/channels.ts` — dedup redundante

**Actual (líneas 30-36):**
```ts
const localChannels = loadLocalM3UFiles()
const seenIds = new Set<string>()
channels = [...defaultChannels, ...localChannels].filter(ch => { ... })
```

**Propuesto:**
```ts
const localChannels = await loadLocalM3UFiles()   // ya deduplica internamente
channels = [...defaultChannels, ...localChannels]
```

## 3. Logs relacionados

- `Logs/1-CREACION-PLATAFORMA-IPTV_2026-07-26_00-30-00.md` — estado inicial de la plataforma.
- `Logs/2-ACTUALIZACION-CANALES-REALES-E-IMPORTADOR-M3U_2026-07-26_03-15-00.md` — origen del parser M3U y del importador.
- `Logs/3-SISTEMA-DE-LISTAS-INDEPENDIENTES_2026-07-26_03-44-00.md` — evolución del store y listas.
- `Logs/4-FASE3-FEATURES-AVANZADAS_2026-07-27_03-55-00.md` — features avanzadas (check-stream).
- `Logs/9-SINCRONIZACION-COMPLETA_2026-07-29_03-00-00.md` — sincronización Supabase.

## 4. Notas de implementación

- El `handler`/`route` de `/api/channels` no requiere cambios: ya hace `await getChannels(...)`, y `getChannels` ahora será async (se agregará `await loadLocalM3UFiles()`).
- La virtualización se aísla en `ChannelList.tsx`; se desactiva en `reorderMode` para no interferir con el drag & drop.
- El batching de persistencia debe respetar la clave `iptv-channel-status` para no perder datos guardados con la versión anterior.
- Tras cada cambio, ejecutar `.\reset.ps1` (rule de cache residual de Next.js) y verificar build/`npm run build`.