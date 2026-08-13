# Log de Optimización de Rendimiento - H1, H3, H4, H5, H7

**Fecha:** 2026-08-08 06:30:00
**Número:** 11
**Descripción:** Implementación de optimizaciones de rendimiento del Módulo 04

## Resumen
Se implementaron 5 hitos de optimización del plan de rendimiento:
- H5: React.memo en ChannelCard.tsx (prioridad máxima)
- H1: Virtualización manual de ChannelList.tsx
- H3: Debounce de búsqueda en page.tsx (300ms)
- H4: Selector granular para detectedUrl en Player.tsx
- H7: useCallback en handlers de page.tsx

## Cambios realizados

### 1. ChannelCard.tsx - React.memo y selectores granulares (H5)

**Código original:**
```tsx
export default function ChannelCard({ channel, listId: propListId, allCategories = [] }: ChannelCardProps) {
  const setChannel = usePlayerStore((state) => state.setChannel)
  const currentChannel = usePlayerStore((state) => state.currentChannel)
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite)
  const isFavorite = usePlayerStore((state) => state.isFavorite)
  const changeChannelCategory = usePlayerStore((state) => state.changeChannelCategory)
  const moveChannelToList = usePlayerStore((state) => state.moveChannelToList)
  const importedLists = usePlayerStore((state) => state.importedLists)
  const channelStatus = usePlayerStore((state) => state.channelStatus)
  const renameChannel = usePlayerStore((state) => state.renameChannel)
  const setDetectedStream = usePlayerStore((state) => state.setDetectedStream)
  const clearDetectedStream = usePlayerStore((state) => state.clearDetectedStream)
  const detectedStreams = usePlayerStore((state) => state.detectedStreams)
  
  // Auto-detectar la lista a la que pertenece este canal
  const ownerList = importedLists.find(l => l.channels.some(c => c.id === channel.id))
  const listId = ownerList?.id || propListId
  
  const status = !channel.url ? 'offline' : (channelStatus[channel.id])
  const favorite = isFavorite(channel.id)
```

**Código nuevo:**
```tsx
import { useState, useRef, useEffect, memo } from 'react'

const ChannelCard = memo(function ChannelCard({ channel, listId: propListId, allCategories = [] }: ChannelCardProps) {
  const setChannel = usePlayerStore((state) => state.setChannel)
  const currentChannel = usePlayerStore((state) => state.currentChannel)
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite)
  const changeChannelCategory = usePlayerStore((state) => state.changeChannelCategory)
  const moveChannelToList = usePlayerStore((state) => state.moveChannelToList)
  const importedLists = usePlayerStore((state) => state.importedLists)
  const renameChannel = usePlayerStore((state) => state.renameChannel)
  const setDetectedStream = usePlayerStore((state) => state.setDetectedStream)
  const clearDetectedStream = usePlayerStore((state) => state.clearDetectedStream)
  
  // Selectores granulares para evitar re-renders masivos
  const status = usePlayerStore((state) => state.channelStatus[channel.id])
  const detectedStream = usePlayerStore((state) => state.detectedStreams[channel.id])
  const isFavorite = usePlayerStore((state) => state.favorites.includes(channel.id))
  
  // Auto-detectar la lista a la que pertenece este canal (fallback si no viene propListId)
  const ownerList = importedLists.find(l => l.channels.some(c => c.id === channel.id))
  const listId = propListId || ownerList?.id
  
  const finalStatus = !channel.url ? 'offline' : status
  const favorite = isFavorite
```

**Cambio:** 
- Se envolvió el componente con `React.memo` para evitar re-renders innecesarios
- Se cambiaron los selectores de Zustand a selectores granulares (por canal específico)
- Se cambió el orden de prioridad para usar `propListId` primero (optimización para evitar `.find()`)

### 2. ChannelList.tsx - Pasar listId como prop (H5)

**Código original:**
```tsx
<ChannelCard channel={channel} />
```

**Código nuevo:**
```tsx
<ChannelCard channel={channel} listId={listId || undefined} />
```

**Cambio:** Se pasa `listId` como prop para evitar el cálculo costoso de `importedLists.find()` en cada ChannelCard.

### 3. ChannelList.tsx - Virtualización manual (H1)

**Código original:**
```tsx
return (
  <div className="space-y-1 select-none" ref={listRef}>
    {channels.map((channel, index) => {
      // render de todas las cards
    })}
  </div>
)
```

**Código nuevo:**
```tsx
// Estado para virtualización
const [scrollTop, setScrollTop] = useState(0)
const [viewportHeight, setViewportHeight] = useState(0)

const ROW_HEIGHT = 68
const OVERSCAN = 5

// Calcular rango visible
const shouldVirtualize = !reorderMode && channels.length > 50
const startIndex = shouldVirtualize ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN) : 0
const endIndex = shouldVirtualize ? Math.min(channels.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN) : channels.length
const visibleChannels = shouldVirtualize ? channels.slice(startIndex, endIndex) : channels

return (
  <div 
    ref={listRef}
    onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    className="space-y-1 select-none overflow-y-auto"
    style={{ height: '100%' }}
  >
    {shouldVirtualize ? (
      <div style={{ paddingTop: startIndex * ROW_HEIGHT, paddingBottom: (channels.length - endIndex) * ROW_HEIGHT }}>
        {visibleChannels.map((channel, i) => {
          const index = startIndex + i
          // render de solo las visibles
        })}
      </div>
    ) : (
      // render completo si < 50 canales o en reorderMode
    )}
  </div>
)
```

**Cambio:** Se implementó virtualización manual sin dependencias externas. Solo se renderizan los canales visibles + overscan (5 arriba/abajo). Se desactiva en reorderMode y para listas pequeñas (< 50 canales).

### 4. page.tsx - Debounce de búsqueda (H3)

**Código original:**
```tsx
const [searchQuery, setSearchQuery] = useState('')
// ...
<Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
```

**Código nuevo:**
```tsx
const [searchInput, setSearchInput] = useState('')
const [searchQuery, setSearchQuery] = useState('')

// Debounce de búsqueda (300ms)
useEffect(() => {
  const timer = setTimeout(() => setSearchQuery(searchInput), 300)
  return () => clearTimeout(timer)
}, [searchInput])

const handleSearchChange = useCallback((value: string) => {
  setSearchInput(value)
  if (value === '') {
    setSearchQuery('')
  }
}, [])

// ...
<Header searchQuery={searchInput} onSearchChange={handleSearchChange} />
```

**Cambio:** Se implementó debounce de 300ms para la búsqueda. El input se actualiza inmediatamente (feedback visual) pero el filtrado pesado espera 300ms.

### 5. page.tsx - useCallback en handlers (H7)

**Código original:**
```tsx
const handleM3UImport = (m3uContent: string, sourceUrl?: string, listName?: string) => {
  const importedChannels = parseM3U(m3uContent)
  if (importedChannels.length > 0) {
    addImportedList(importedChannels, sourceUrl, false, listName)
  }
}

const handleAppendToList = (listId: string, m3uContent: string) => {
  const channels = parseM3U(m3uContent)
  if (channels.length > 0) {
    usePlayerStore.getState().addChannelsToList(listId, channels)
  }
}

const handleReorder = (listId: string, channelId: string, targetChannelId: string) => {
  reorderChannels(listId, channelId, targetChannelId)
}

const collapseImportedLists = () => {
  setImportedListsCollapseKey((value) => value + 1)
}
```

**Código nuevo:**
```tsx
const handleM3UImport = useCallback((m3uContent: string, sourceUrl?: string, listName?: string) => {
  const importedChannels = parseM3U(m3uContent)
  if (importedChannels.length > 0) {
    addImportedList(importedChannels, sourceUrl, false, listName)
  }
}, [addImportedList])

const handleAppendToList = useCallback((listId: string, m3uContent: string) => {
  const channels = parseM3U(m3uContent)
  if (channels.length > 0) {
    usePlayerStore.getState().addChannelsToList(listId, channels)
  }
}, [])

const handleReorder = useCallback((listId: string, channelId: string, targetChannelId: string) => {
  reorderChannels(listId, channelId, targetChannelId)
}, [reorderChannels])

const collapseImportedLists = useCallback(() => {
  setImportedListsCollapseKey((value) => value + 1)
}, [])
```

**Cambio:** Se envolvieron los handlers con `useCallback` para evitar que se creen nuevas funciones en cada render, lo que previene re-renders innecesarios en componentes hijos.

### 6. Player.tsx - Selector granular para detectedUrl (H4)

**Código original:**
```tsx
const detectedStreams = usePlayerStore((state) => state.detectedStreams)
// ...
const detectedUrl = currentChannel ? detectedStreams[currentChannel.id] : null
```

**Código nuevo:**
```tsx
const detectedUrl = usePlayerStore((state) => state.detectedStreams[currentChannel?.id || ''])
```

**Cambio:** Se cambió a un selector granular que solo suscribe al stream del canal actual, no a todos los streams.

## Respaldo de archivos
- `Obsoletos/2026-08-08_06-00-00_ChannelList.bak` - Respaldo de ChannelList.tsx antes de virtualización

## Verificación
- ✅ `npm run build` compiló exitosamente (solo warnings de ESLint preexistentes)
- ✅ Servidor levantó y respondió HTTP 200 en localhost:3001
- ⚠️ Warnings de ESLint no críticos (missing dependencies en useEffect, uso de <img> en lugar de <Image>)

## Pendientes
- H2: Batching de persistencia a localStorage (requiere modificar storage-batcher)
- H6: Optimización de filtros con Map (requiere modificar allAvailableChannels)
- Pruebas manuales de funcionalidad (scroll, drag & drop, búsqueda, escaneo)

## Archivos modificados
1. `src/components/ChannelCard.tsx` - React.memo + selectores granulares
2. `src/components/ChannelList.tsx` - Virtualización manual + listId prop
3. `src/app/page.tsx` - Debounce búsqueda + useCallback handlers
4. `src/components/Player.tsx` - Selector granular detectedUrl
5. `src/store/player-store.ts` - Eliminación de import no usado (flushAll)
