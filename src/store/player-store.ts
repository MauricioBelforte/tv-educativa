'use client'

import { create } from 'zustand'
import { Channel, ImportedList } from '@/lib/types'
import { batchedPersist } from '@/lib/storage/storage-batcher'

export type ChannelStatus = 'unknown' | 'checking' | 'online' | 'offline'

interface PlayerStore {
  currentChannel: Channel | null
  isPlaying: boolean
  favorites: string[]
  importedLists: ImportedList[]
  activeListId: string | null
  activeSources: string[]
  isRefreshing: Record<string, boolean>
  channelStatus: Record<string, ChannelStatus>
  isAuthenticated: boolean
  authPassword: string
  _initialized: boolean
  detectedStreams: Record<string, string>
  isFastScanning: boolean
  isSlowScanning: boolean
  fastScanCompleted: boolean
  slowScanCompleted: boolean
  slowScanProgress: Record<string, boolean>
  slowScanCompletedLists: Record<string, boolean>
  fastScanProgress: number

  setChannel: (channel: Channel) => void
  setDetectedStream: (channelId: string, streamUrl: string) => void
  clearDetectedStream: (channelId: string) => void
  togglePlay: () => void
  toggleFavorite: (channelId: string) => void
  setFavorites: (ids: string[]) => void
  isFavorite: (channelId: string) => boolean
  initFromStorage: () => void
  login: (password: string) => Promise<boolean>
  logout: () => void
  
  // Gestión de listas importadas
  addImportedList: (channels: Channel[], sourceUrl?: string, isPrivate?: boolean, name?: string) => string
  renameList: (listId: string, newName: string) => void
  setListDescription: (listId: string, description: string) => void
  removeList: (listId: string) => void
  removeChannelFromList: (listId: string, channelId: string) => void
  addChannelsToList: (listId: string, channels: Channel[]) => void
  setActiveList: (listId: string | null) => void
  getListById: (listId: string) => ImportedList | undefined
  reorderLists: (fromIndex: number, toIndex: number) => void
  replacePrivateLists: (lists: { name: string; channels: Channel[] }[]) => void
  replaceActiveSourcesByName: (names: string[]) => void
  
  // Mover canales entre listas y cambiar categoría
  moveChannelToList: (fromListId: string, channelId: string, toListId: string) => void
  changeChannelCategory: (listId: string, channelId: string, newCategory: string) => void
  renameChannel: (listId: string, channelId: string, newName: string) => void
  reorderChannels: (listId: string, channelId: string, targetChannelId: string) => void
  
  // Obtener canales favoritos de todas las listas
  getFavoriteChannels: () => Channel[]
  
  // Fase 3: Múltiples fuentes
  toggleSource: (sourceId: string) => void
  setAllSources: (active: boolean) => void
  
  // Escaneo por lista
  recheckAllChannels: (channels: { id: string; url: string }[], listId?: string) => Promise<void>
  
  // Fase 3: Refresco de listas
  refreshList: (listId: string) => Promise<void>
  refreshAllLists: () => Promise<void>
  
  // Verificación de estado de canales
  checkChannelStatus: (channelId: string, url: string) => Promise<void>
  setChannelStatus: (channelId: string, status: ChannelStatus) => void
  checkAllChannels: (channels: { id: string; url: string }[]) => Promise<void>
  fastRecheckAllChannels: (channels: { id: string; url: string }[]) => Promise<void>
}

function generateId(): string {
  return `list-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

function saveToStorage(key: string, data: unknown) {
  // Optimización Módulo 04 (H2): escritura diferida para reducir I/O sincronico.
  batchedPersist(key, data)
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentChannel: null,
  isPlaying: false,
  favorites: [],
  importedLists: [],
  activeListId: null,
  activeSources: [],
  isRefreshing: {},
  channelStatus: {},
  isAuthenticated: false,
  authPassword: '',
  _initialized: false,
  detectedStreams: {},
  isFastScanning: false,
  isSlowScanning: false,
  fastScanCompleted: false,
  slowScanCompleted: false,
  slowScanProgress: {},
  slowScanCompletedLists: {},
  fastScanProgress: 0,

  setChannel: (channel) => set({ currentChannel: channel, isPlaying: true }),

  setDetectedStream: (channelId, streamUrl) => {
    set((state) => ({
      detectedStreams: { ...state.detectedStreams, [channelId]: streamUrl }
    }))
  },

  clearDetectedStream: (channelId) => {
    set((state) => {
      const newDetected = { ...state.detectedStreams }
      delete newDetected[channelId]
      return { detectedStreams: newDetected }
    })
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }))
  },

  toggleFavorite: (channelId) => {
    set((state) => {
      const newFavorites = state.favorites.includes(channelId)
        ? state.favorites.filter(id => id !== channelId)
        : [...state.favorites, channelId]
      saveToStorage('iptv-favorites', newFavorites)
      return { favorites: newFavorites }
    })
  },

  setFavorites: (ids) => {
    saveToStorage('iptv-favorites', ids)
    set({ favorites: ids })
  },

  isFavorite: (channelId) => {
    return get().favorites.includes(channelId)
  },

  initFromStorage: () => {
    if (typeof window !== 'undefined') {
      const favorites = loadFromStorage<string[]>('iptv-favorites', [])
      const importedLists = loadFromStorage<ImportedList[]>('iptv-imported-lists', [])
      const activeSources = loadFromStorage<string[]>('iptv-active-sources', [])
      const authPassword = loadFromStorage<string>('iptv-auth-password', '')
      const fastScanCompleted = loadFromStorage<boolean>('iptv-fast-scan-completed', false)
      const slowScanCompleted = loadFromStorage<boolean>('iptv-slow-scan-completed', false)
      const slowScanCompletedLists = loadFromStorage<Record<string, boolean>>('iptv-slow-scan-completed-lists', {})
      const slowScanProgress = loadFromStorage<Record<string, boolean>>('iptv-slow-scan-progress', {})
      
      // Aplicar dark mode por defecto siempre
      document.documentElement.classList.add('dark')

      const channelStatus = loadFromStorage<Record<string, ChannelStatus>>('iptv-channel-status', {})

      set({
        favorites,
        importedLists,
        activeSources,
        channelStatus,
        activeListId: importedLists.length > 0 ? importedLists[0].id : null,
        authPassword,
        isAuthenticated: !!authPassword,
        _initialized: true,
        isFastScanning: false,
        isSlowScanning: false,
        fastScanCompleted,
        slowScanCompleted,
        slowScanCompletedLists,
        slowScanProgress,
        fastScanProgress: 0
      })
    }
  },

  login: async (password) => {
    const APP_PASSWORD = process.env.APP_PASSWORD || ''
    if (password === APP_PASSWORD) {
      set({ isAuthenticated: true, authPassword: password })
      saveToStorage('iptv-auth-password', password)
      return true
    }
    return false
  },

  logout: () => {
    set({ isAuthenticated: false, authPassword: '' })
    saveToStorage('iptv-auth-password', '')
  },

  addImportedList: (channels, sourceUrl, isPrivate, name) => {
    const listId = generateId()
    const newList: ImportedList = {
      id: listId,
      name: name || (sourceUrl ? `Lista ${new Date().toLocaleDateString()}` : 'Importada'),
      channels,
      sourceUrl,
      isPrivate: isPrivate || false,
      description: '',
      createdAt: new Date().toISOString()
    }
    set((state) => {
      const newLists = [...state.importedLists, newList]
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists, activeListId: listId }
    })
    return listId
  },

  renameList: (listId, newName) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId ? { ...list, name: newName } : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  setListDescription: (listId, description) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId ? { ...list, description } : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  removeList: (listId) => {
    set((state) => {
      const newLists = state.importedLists.filter(list => list.id !== listId)
      const newActiveId = state.activeListId === listId 
        ? (newLists.length > 0 ? newLists[0].id : null)
        : state.activeListId
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists, activeListId: newActiveId }
    })
  },

  removeChannelFromList: (listId, channelId) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId
          ? { ...list, channels: list.channels.filter(c => c.id !== channelId) }
          : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  addChannelsToList: (listId, channels) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId
          ? { ...list, channels: [...list.channels, ...channels] }
          : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  setActiveList: (listId) => {
    set({ activeListId: listId })
  },

  getListById: (listId) => {
    return get().importedLists.find(list => list.id === listId)
  },

  reorderLists: (fromIndex, toIndex) => {
    set((state) => {
      const newLists = [...state.importedLists]
      const [removed] = newLists.splice(fromIndex, 1)
      newLists.splice(toIndex, 0, removed)
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  replacePrivateLists: (lists) => {
    set((state) => {
      const newLists = state.importedLists.filter(list => !list.isPrivate)
      const newPrivateLists = lists.map((list, index) => ({
        id: `private-${Date.now()}-${index}`,
        name: list.name,
        channels: list.channels,
        sourceUrl: undefined,
        isPrivate: true,
        description: '',
        createdAt: new Date().toISOString()
      }))
      const finalLists = [...newLists, ...newPrivateLists]
      saveToStorage('iptv-imported-lists', finalLists)
      return { importedLists: finalLists }
    })
  },

  replaceActiveSourcesByName: (names) => {
    set((state) => {
      const newActiveSources = state.importedLists
        .filter(list => names.includes(list.name))
        .map(list => list.id)
      saveToStorage('iptv-active-sources', newActiveSources)
      return { activeSources: newActiveSources }
    })
  },

  moveChannelToList: (fromListId, channelId, toListId) => {
    set((state) => {
      const fromList = state.importedLists.find(l => l.id === fromListId)
      const toList = state.importedLists.find(l => l.id === toListId)
      if (!fromList || !toList) return state

      const channel = fromList.channels.find(c => c.id === channelId)
      if (!channel) return state

      const newLists = state.importedLists.map(list => {
        if (list.id === fromListId) {
          return { ...list, channels: list.channels.filter(c => c.id !== channelId) }
        }
        if (list.id === toListId) {
          return { ...list, channels: [...list.channels, channel] }
        }
        return list
      })
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  changeChannelCategory: (listId, channelId, newCategory) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId
          ? {
              ...list,
              channels: list.channels.map(c =>
                c.id === channelId ? { ...c, category: newCategory } : c
              )
            }
          : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  renameChannel: (listId, channelId, newName) => {
    set((state) => {
      const newLists = state.importedLists.map(list =>
        list.id === listId
          ? {
              ...list,
              channels: list.channels.map(c =>
                c.id === channelId ? { ...c, name: newName } : c
              )
            }
          : list
      )
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  reorderChannels: (listId, channelId, targetChannelId) => {
    set((state) => {
      const newLists = state.importedLists.map(list => {
        if (list.id !== listId) return list
        
        const channels = [...list.channels]
        const sourceIndex = channels.findIndex(c => c.id === channelId)
        const targetIndex = channels.findIndex(c => c.id === targetChannelId)
        
        if (sourceIndex === -1 || targetIndex === -1) return list
        
        const [removed] = channels.splice(sourceIndex, 1)
        channels.splice(targetIndex, 0, removed)
        
        return { ...list, channels }
      })
      saveToStorage('iptv-imported-lists', newLists)
      return { importedLists: newLists }
    })
  },

  getFavoriteChannels: () => {
    const state = get()
    const allChannels = [
      ...state.importedLists.flatMap(list => list.channels),
    ]
    return allChannels.filter(channel => state.favorites.includes(channel.id))
  },

  toggleSource: (sourceId) => {
    set((state) => {
      const newActiveSources = state.activeSources.includes(sourceId)
        ? state.activeSources.filter(id => id !== sourceId)
        : [...state.activeSources, sourceId]
      saveToStorage('iptv-active-sources', newActiveSources)
      return { activeSources: newActiveSources }
    })
  },

  setAllSources: (active) => {
    set((state) => {
      const newActiveSources = active
        ? state.importedLists.map(list => list.id)
        : []
      saveToStorage('iptv-active-sources', newActiveSources)
      return { activeSources: newActiveSources }
    })
  },

  recheckAllChannels: async (channels, listId) => {
    set({ isRefreshing: { ...get().isRefreshing, [listId || 'default']: true } })
    
    try {
      const APP_PASSWORD = process.env.APP_PASSWORD || ''
      const checks = channels.map(channel =>
        fetch(`/api/check-stream?url=${encodeURIComponent(channel.url)}&password=${APP_PASSWORD}`)
          .then(res => res.json())
          .then(data => ({ id: channel.id, online: data.online }))
      )
      
      const results = await Promise.all(checks)
      
      set((state) => {
        const newStatus: Record<string, ChannelStatus> = { ...state.channelStatus }
        results.forEach(({ id, online }) => {
          newStatus[id] = online ? 'online' : 'offline'
        })
        saveToStorage('iptv-channel-status', newStatus)
        return { channelStatus: newStatus }
      })
    } finally {
      set((state) => {
        const newRefreshing = { ...state.isRefreshing }
        delete newRefreshing[listId || 'default']
        return { isRefreshing: newRefreshing }
      })
    }
  },

  refreshList: async (listId) => {
    const list = get().importedLists.find(l => l.id === listId)
    if (!list?.sourceUrl) return

    set((state) => ({ isRefreshing: { ...state.isRefreshing, [listId]: true } }))

    try {
      const response = await fetch(list.sourceUrl)
      const content = await response.text()
      
      // Re-parsear el contenido M3U
      const { parseM3U } = await import('@/lib/m3u-parser')
      const newChannels = parseM3U(content)
      
      set((state) => {
        const newLists = state.importedLists.map(l =>
          l.id === listId ? { ...l, channels: newChannels } : l
        )
        saveToStorage('iptv-imported-lists', newLists)
        return { importedLists: newLists }
      })
    } finally {
      set((state) => {
        const newRefreshing = { ...state.isRefreshing }
        delete newRefreshing[listId]
        return { isRefreshing: newRefreshing }
      })
    }
  },

  refreshAllLists: async () => {
    const lists = get().importedLists.filter(l => l.sourceUrl)
    await Promise.all(lists.map(list => get().refreshList(list.id)))
  },

  checkChannelStatus: async (channelId, url) => {
    set((state) => ({
      channelStatus: { ...state.channelStatus, [channelId]: 'checking' }
    }))

    try {
      const APP_PASSWORD = process.env.APP_PASSWORD || ''
      const response = await fetch(`/api/check-stream?url=${encodeURIComponent(url)}&password=${APP_PASSWORD}`)
      const data = await response.json()
      
      set((state) => {
        const newStatus: Record<string, ChannelStatus> = { ...state.channelStatus, [channelId]: data.online ? 'online' : 'offline' }
        saveToStorage('iptv-channel-status', newStatus)
        return { channelStatus: newStatus }
      })
    } catch {
      set((state) => {
        const newStatus: Record<string, ChannelStatus> = { ...state.channelStatus, [channelId]: 'offline' }
        saveToStorage('iptv-channel-status', newStatus)
        return { channelStatus: newStatus }
      })
    }
  },

  setChannelStatus: (channelId, status) => {
    set((state) => {
      const newStatus = { ...state.channelStatus, [channelId]: status }
      saveToStorage('iptv-channel-status', newStatus)
      return { channelStatus: newStatus }
    })
  },

  checkAllChannels: async (channels) => {
    const { checkChannelStatus } = get()
    await Promise.all(channels.map(c => checkChannelStatus(c.id, c.url)))
  },

  fastRecheckAllChannels: async (channels) => {
    set({ isFastScanning: true, fastScanProgress: 0 })
    
    const total = channels.length
    for (let i = 0; i < total; i++) {
      const channel = channels[i]
      await get().checkChannelStatus(channel.id, channel.url)
      set({ fastScanProgress: Math.round(((i + 1) / total) * 100) })
    }
    
    set({ isFastScanning: false, fastScanCompleted: true })
    saveToStorage('iptv-fast-scan-completed', true)
  }
}))
