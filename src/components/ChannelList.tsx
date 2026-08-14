'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Channel } from '@/lib/types'
import ChannelCard from './ChannelCard'

interface ChannelListProps {
  channels: Channel[]
  isLoading: boolean
  reorderMode?: boolean
  listId?: string | null
  onReorder?: (listId: string, channelId: string, targetChannelId: string) => void
  currentChannelId?: string | null
  scrollChannelIntoView?: React.Dispatch<React.SetStateAction<((channelId: string) => void) | null>>
}

export default function ChannelList({ channels, isLoading, reorderMode, listId, onReorder, currentChannelId, scrollChannelIntoView }: ChannelListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragNode = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  
  // Estado para virtualización
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(600) // Altura inicial por defecto
  
  const ROW_HEIGHT = 68 // altura aproximada de cada card
  const OVERSCAN = 5 // canales extra arriba/abajo para scroll suave

  // Medir altura del viewport
  useEffect(() => {
    const current = listRef.current
    if (!current) return
    
    const updateHeight = () => {
      setViewportHeight(current.clientHeight)
    }
    
    updateHeight()
    
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(current)
    
    return () => resizeObserver.disconnect()
  }, [])
  
  // ScrollIntoView del canal actual (con virtualización)
  useEffect(() => {
    if (!currentChannelId || reorderMode) return
    const idx = channels.findIndex(c => c.id === currentChannelId)
    if (idx === -1) return
    
    // Esperar un poco para que el DOM se actualice
    setTimeout(() => {
      const targetElement = document.querySelector(`[data-channel-id="${currentChannelId}"]`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }, [currentChannelId, channels, reorderMode])

  // Función expuesta para scroll a un canal específico
  const scrollToChannel = useCallback((channelId: string) => {
    setTimeout(() => {
      const targetElement = document.querySelector(`[data-channel-id="${channelId}"]`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }, [])

  // Exponer la función al padre cuando se proporciona
  useEffect(() => {
    if (scrollChannelIntoView) {
      scrollChannelIntoView(scrollToChannel)
    }
  }, [scrollChannelIntoView, scrollToChannel])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 animate-pulse"
          >
            <div className="w-12 h-12 rounded-lg bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-gray-400">No se encontraron canales</p>
        <p className="text-gray-600 text-sm mt-1">Intenta con otra búsqueda o categoría</p>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!reorderMode) return
    setDragIndex(index)
    dragNode.current = e.currentTarget as HTMLElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = ''
    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (!reorderMode || dragIndex === null) return
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (!reorderMode || dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    if (listId && onReorder) {
      const fromChannel = channels[dragIndex]
      const toChannel = channels[index]
      if (fromChannel && toChannel) {
        onReorder(listId, fromChannel.id, toChannel.id)
      }
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }
  
  // Calcular rango visible para virtualización
  const shouldVirtualize = !reorderMode && channels.length > 50
  const startIndex = shouldVirtualize ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN) : 0
  const endIndex = shouldVirtualize ? Math.min(channels.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN) : channels.length
  const visibleChannels = shouldVirtualize ? channels.slice(startIndex, endIndex) : channels

  return (
    <div 
      ref={listRef}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="space-y-1 select-none overflow-y-auto scrollbar-hide"
      style={{ height: '100%' }}
    >
      {shouldVirtualize ? (
        <div className="space-y-1" style={{ paddingTop: startIndex * ROW_HEIGHT, paddingBottom: (channels.length - endIndex) * ROW_HEIGHT }}>
          {visibleChannels.map((channel, i) => {
            const index = startIndex + i
            const isDragging = dragIndex === index
            const isOver = dragOverIndex === index && dragIndex !== index
            return (
              <div
                key={channel.id}
                data-channel-id={channel.id}
                draggable={reorderMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
                className={`transition-all duration-150 ${isDragging ? 'opacity-50' : ''} ${isOver ? 'translate-y-1 border-t-2 border-blue-500' : ''} ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <ChannelCard channel={channel} listId={listId || undefined} />
              </div>
            )
          })}
        </div>
      ) : (
        channels.map((channel, index) => {
          const isDragging = dragIndex === index
          const isOver = dragOverIndex === index && dragIndex !== index
          return (
            <div
              key={channel.id}
              data-channel-id={channel.id}
              draggable={reorderMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragLeave={handleDragLeave}
              className={`transition-all duration-150 ${isDragging ? 'opacity-50' : ''} ${isOver ? 'translate-y-1 border-t-2 border-blue-500' : ''} ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              <ChannelCard channel={channel} listId={listId || undefined} />
            </div>
          )
        })
      )}
    </div>
  )
}