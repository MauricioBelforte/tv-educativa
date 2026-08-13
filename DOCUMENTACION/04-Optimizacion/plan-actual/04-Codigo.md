# Código (plan-actual) - Módulo 04: Optimización de Rendimiento

> **Estado:** PLAN APROBADO. Registro vigente del código involucrado. Se actualizará al implementar cada optimización.

## 1. Archivos involucrados

| Archivo | Acción | Estado |
|---------|--------|--------|
| `src/lib/storage-batcher.ts` | Crear (NUEVO) | Pendiente |
| `src/components/ChannelCard.tsx` | Modificar | ✅ Completado |
| `src/components/ChannelList.tsx` | Modificar | ✅ Completado |
| `src/components/Player.tsx` | Modificar | ✅ Completado |
| `src/components/Header.tsx` | Modificar | Pendiente |
| `src/app/page.tsx` | Modificar | ✅ Completado |
| `src/store/player-store.ts` | Modificar | Pendiente |
| `src/lib/m3u-parser.ts` | Modificar | Pendiente |
| `src/lib/local-loader.ts` | Modificar | Pendiente |
| `src/lib/channels.ts` | Modificar | Pendiente |

## 2. Código actual (referencia) y cambio propuesto

### 2.1 `src/store/player-store.ts`

**Código actual (líneas 77-81, 501-505):**
```ts
function saveToStorage(key: string, data: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}
...
setChannelStatus: (channelId, status) => {
  const updated = { ...get().channelStatus, [channelId]: status }
  saveToStorage('iptv-channel-status', updated)
  set({ channelStatus: updated })
},
```

**Cambio propuesto:** usar `schedulePersist`:
```ts
setChannelStatus: (channelId, status) => {
  const updated = { ...get().channelStatus, [channelId]: status }
  schedulePersist('iptv-channel-status', () => get().channelStatus)
  set({ channelStatus: updated })
},
```
Y al final de `checkAllChannels`/`recheckAllChannels`/`fastRecheckAllChannels` llamar `flushPersist()`.

### 2.2 `src/components/ChannelCard.tsx`

**Código actual (líneas 14-25, 29):**
```ts
const importedLists = usePlayerStore((state) => state.importedLists)
...
const channelStatus = usePlayerStore((state) => state.channelStatus)
const detectedStreams = usePlayerStore((state) => state.detectedStreams)
...
const ownerList = importedLists.find(l => l.channels.some(c => c.id === channel.id))
```

**Cambio propuesto (selector granular + listId por prop + memo):**
```ts
const status = usePlayerStore((s) => s.channelStatus[channel.id])
const detected = usePlayerStore((s) => s.detectedStreams[channel.id])
const isFav = usePlayerStore((s) => s.favorites.includes(channel.id))
// listId llega por prop desde ChannelList
export default memo(ChannelCard)
```

### 2.3 `src/lib/m3u-parser.ts`

**Código actual (líneas 60, 64, 72, 76):**
```ts
const idMatch = extInf.match(/tvg-id="([^"]*)"/)
const nameMatch = extInf.match(/tvg-name="([^"]*)"/)
const logoMatch = extInf.match(/tvg-logo="([^"]*)"/)
const categoryMatch = extInf.match(/group-title="([^"]*)"/)
```

**Cambio propuesto (un solo regex global → Map + hash):**
```ts
const ATTR_REGEX = /([\w-]+)="([^"]*)"/g
const attrs = new Map<string, string>()
let m: RegExpExecArray | null
while ((m = ATTR_REGEX.exec(extInf)) !== null) attrs.set(m[1], m[2])
const id = attrs.get('tvg-id') || hashString(`${extInf}-${url}`)
```

### 2.4 `src/lib/local-loader.ts`

**Código actual (líneas 8-31):** usa `fs.readdirSync` y `fs.readFileSync`.

**Cambio propuesto:**
```ts
import { readdir, readFile } from 'fs/promises'
export async function loadLocalM3UFiles(): Promise<Channel[]> {
  ... (await readdir(LOCAL_DIR)) ... (await readFile(path, 'utf-8'))
}
```

### 2.5 `src/lib/channels.ts`

**Código actual (líneas 30-36):** dedup redundante con `seenIds`.

**Cambio propuesto:**
```ts
const localChannels = await loadLocalM3UFiles()
channels = [...defaultChannels, ...localChannels]
```

## 3. Logs relacionados

- `Logs/9-SINCRONIZACION-COMPLETA_2026-07-29_03-00-00.md`
- `Logs/4-FASE3-FEATURES-AVANZADAS_2026-07-27_03-55-00.md`

## 4. Notas de implementación

- Ejecutar `.\reset.ps1` y `npm run build` tras cada cambio.
- El route `/api/channels` no requiere cambios (ya es async y hace `await getChannels`).
- Respetar las claves actuales de `localStorage`.