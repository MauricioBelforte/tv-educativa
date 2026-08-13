# Diseño (plan-actual) - Módulo 04: Optimización de Rendimiento

> **Estado:** PLAN APROBADO. Arquitectura de solución vigente para implementar.

## 1. Arquitectura de solución

Se mantiene la arquitectura general del sistema. Las optimizaciones se concentran en los puntos calientes del cliente y del servidor, sin alterar flujos funcionales.

```
CLIENTE
  page.tsx            → memoización de filtros, debouncedSearchQuery, merge O(n) con Map
  Header.tsx          → debounce de búsqueda (250ms)
  ChannelList.tsx     → virtualización windowed + prop listId a ChannelCard
  ChannelCard.tsx     → selectores granulares + React.memo + listId por prop
  Player.tsx          → selector granular detectedStreams[currentChannelId]
  player-store.tsx    → batching de persistencia (storage-batcher), Sets O(n), flush al final

SERVIDOR
  /api/channels       → getChannels() async (await loadLocalM3UFiles)
  local-loader.ts     → fs/promises (readdir/readFile async)
  channels.ts         → elimina dedup redundante
  m3u-parser.ts       → un solo regex por línea + IDs deterministas (hash)
```

## 2. Diseño de componentes

### 2.1 `src/lib/storage-batcher.ts` (NUEVO)

```ts
type PersistMap = Map<string, () => unknown>
const pending: PersistMap = new Map()
let timer: ReturnType<typeof setTimeout> | null = null

export function schedulePersist(key: string, getData: () => unknown) {
  pending.set(key, getData)
  if (timer) clearTimeout(timer)
  timer = setTimeout(flushPersist, 500)
}

export function flushPersist() {
  if (timer) { clearTimeout(timer); timer = null }
  if (typeof window === 'undefined') return
  for (const [key, getData] of pending) {
    try { localStorage.setItem(key, JSON.stringify(getData())) } catch {}
  }
  pending.clear()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPersist)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPersist()
  })
}
```

### 2.2 `ChannelCard.tsx` — selectores granulares

```ts
const status = usePlayerStore((s) => s.channelStatus[channel.id])          // primitivo
const detected = usePlayerStore((s) => s.detectedStreams[channel.id])      // primitivo
const isFavorite = usePlayerStore((s) => s.favorites.includes(channel.id)) // primitivo
```
`listId` llega por prop desde `ChannelList`. Componente envuelto en `React.memo`.

### 2.3 `ChannelList.tsx` — virtualización windowed

```ts
const ROW_HEIGHT = 64
const OVERSCAN = 8
// estado: scrollTop, viewportHeight
// start = max(0, floor(scrollTop/ROW) - OVERSCAN)
// end   = min(len, ceil((scrollTop+viewport)/ROW) + OVERSCAN)
// <div onScroll> → actualizar scrollTop/viewport
// <div style={{height: totalHeight}}> como spacer
// renderizar channels.slice(start, end)
```
Desactivada en `reorderMode`.

### 2.4 `m3u-parser.ts` — un solo regex

```ts
const ATTR_REGEX = /([\w-]+)="([^"]*)"/g
// en parseChannel: recorrer extInf con exec() → Map<attr, value>
// id = attrs.get('tvg-id') || hashString(name + '|' + url)
```

## 3. Persistencia y estado

- Claves `localStorage` sin cambios: `iptv-channel-status`, `iptv-favorites`, `iptv-imported-lists`, `iptv-active-sources`, `iptv-dark-mode`, `iptv-auth-password`.
- `channelStatus` mantiene la misma forma `Record<string, ChannelStatus>`.
- Batching solo aplaza escritura; el `set()` de Zustand sigue actualizando la UI de inmediato.

## 4. Compatibilidad y flujos estables

- **No se modifica** el flujo de sincronización Supabase, login, listas privadas, importador M3U, drag & drop.
- `scrollIntoView` del canal activo se recalcula por índice/offset con la virtualización.

## 5. Archivos a modificar/crear (vigente)

| Archivo | Acción |
|---------|--------|
| `src/lib/storage-batcher.ts` | Crear |
| `src/components/ChannelCard.tsx` | Modificar |
| `src/components/ChannelList.tsx` | Modificar |
| `src/components/Player.tsx` | Modificar |
| `src/components/Header.tsx` | Modificar |
| `src/app/page.tsx` | Modificar |
| `src/store/player-store.ts` | Modificar |
| `src/lib/m3u-parser.ts` | Modificar |
| `src/lib/local-loader.ts` | Modificar |
| `src/lib/channels.ts` | Modificar |