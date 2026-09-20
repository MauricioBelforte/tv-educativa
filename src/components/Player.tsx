'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { usePlayerStore } from '@/store/player-store'
import { Channel } from '@/lib/types'

function getProxyUrl(url: string, referer?: string): string {
  if (!url.startsWith('http')) return url
  let path = `/api/stream-proxy?url=${encodeURIComponent(url)}`
  if (referer) path += `&referer=${encodeURIComponent(referer)}`
  return path
}

interface PlayerProps {
  channels?: Channel[]
  scrollChannelIntoView?: ((channelId: string) => void) | null
}

export default function Player({ channels = [], scrollChannelIntoView }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isControlsHovering, setIsControlsHovering] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentChannel = usePlayerStore((state) => state.currentChannel)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const setChannel = usePlayerStore((state) => state.setChannel)
  const detectedUrl = usePlayerStore((state) => state.detectedStreams[currentChannel?.id || ''])

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current || !currentChannel) return

    setIsLoading(true)
    setError(null)
    destroyHls()

    const streamUrl = detectedUrl || currentChannel.url
    const url = getProxyUrl(streamUrl, detectedUrl ? currentChannel.url : undefined)

    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url
      videoRef.current.addEventListener('loadedmetadata', () => setIsLoading(false))
      videoRef.current.addEventListener('error', () => {
        setError('Error al cargar el stream')
        setIsLoading(false)
      })
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(videoRef.current)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        if (isPlaying) videoRef.current?.play().catch(() => setError('Haz clic para reproducir'))
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'Error de red' : 'Error en el stream')
          setIsLoading(false)
        }
      })
    } else {
      setError('Tu navegador no soporta reproducción HLS')
      setIsLoading(false)
    }

    return () => { destroyHls() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, detectedUrl, destroyHls])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentChannel) return
    if (isPlaying) video.play().catch(() => {})
    else video.pause()
  }, [isPlaying, currentChannel])

  // Manejo de hover para mostrar/ocultar controles
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  const handleMouseMove = () => {
    setIsHovering(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    // Solo ocultar si no estamos sobre los controles
    if (!isControlsHovering) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsHovering(false)
      }, 2000) // Ocultar después de 2 segundos sin movimiento
    }
  }

  const handleControlsMouseEnter = () => {
    setIsControlsHovering(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleControlsMouseLeave = () => {
    setIsControlsHovering(false)
    // Reiniciar el timeout cuando salimos de los controles
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
    }, 2000)
  }

  // Funciones para cambiar de canal
  const goToPreviousChannel = () => {
    if (!currentChannel || channels.length === 0) return
    const idx = channels.findIndex(c => c.id === currentChannel.id)
    const prev = idx > 0 ? idx - 1 : channels.length - 1
    if (channels[prev]) {
      setChannel(channels[prev])
      if (scrollChannelIntoView) {
        scrollChannelIntoView(channels[prev].id)
      }
    }
  }

  const goToNextChannel = () => {
    if (!currentChannel || channels.length === 0) return
    const idx = channels.findIndex(c => c.id === currentChannel.id)
    const next = idx < channels.length - 1 ? idx + 1 : 0
    if (channels[next]) {
      setChannel(channels[next])
      if (scrollChannelIntoView) {
        scrollChannelIntoView(channels[next].id)
      }
    }
  }

  // Toggle fullscreen del contenedor del reproductor
  const toggleFullscreen = () => {
    const container = playerContainerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if ('webkitRequestFullscreen' in container) {
        (container as HTMLElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen()
      } else if ('mozRequestFullScreen' in container) {
        (container as HTMLElement & { mozRequestFullScreen: () => void }).mozRequestFullScreen()
      } else if ('msRequestFullscreen' in container) {
        (container as HTMLElement & { msRequestFullscreen: () => void }).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ('webkitExitFullscreen' in document) {
        (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen()
      } else if ('mozCancelFullScreen' in document) {
        (document as Document & { mozCancelFullScreen: () => void }).mozCancelFullScreen()
      } else if ('msExitFullscreen' in document) {
        (document as Document & { msExitFullscreen: () => void }).msExitFullscreen()
      }
    }
  }

  // Detectar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center text-gray-400 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg text-gray-900 dark:text-white">Selecciona un canal para comenzar</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Haz clic en cualquier canal de la lista</p>
        </div>
      </div>
    )
  }

  const isIframe = !detectedUrl && (currentChannel.playerType === 'iframe' || (!currentChannel.url.includes('.m3u8') && currentChannel.url.startsWith('http')))

  const iframeUrl = currentChannel.url + (currentChannel.url.includes('?') ? '&' : '?') + 'autoplay=2'

  return (
    <div 
      ref={playerContainerRef}
      className="relative bg-black rounded-lg overflow-hidden group" 
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {isIframe ? (
        <div className="relative w-full aspect-video">
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full aspect-video"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full aspect-video"
            playsInline
            onClick={togglePlay}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Cargando stream...</p>
              </div>
            </div>
          )}
        </>
      )}

      {error && !isIframe && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center px-4">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-white text-sm mb-2">{error}</p>
            <p className="text-gray-400 text-xs">{currentChannel.name}</p>
          </div>
        </div>
      )}

      {detectedUrl && currentChannel.playerType !== 'hls' && (
        <div className="absolute top-3 right-3 z-10 w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50" title="Stream directo detectado" />
      )}

      <div className={`absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity pointer-events-none ${isFullscreen ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-2">
          {currentChannel.logo && (
            <img src={currentChannel.logo} alt={currentChannel.name} className="w-8 h-8 rounded" />
          )}
          <div>
            <p className="text-white text-sm font-medium">{currentChannel.name}</p>
            <p className="text-gray-300 text-xs">{currentChannel.category}</p>
          </div>
        </div>
      </div>

      {/* Controles de cambio de canal flotantes - aparecen al hacer hover */}
      <div 
        className={`absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        onMouseEnter={handleControlsMouseEnter}
        onMouseLeave={handleControlsMouseLeave}
      >
        <button
          onClick={goToPreviousChannel}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          {isFullscreen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H3v-6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l6-6" />
            </svg>
          )}
        </button>
        <button
          onClick={goToNextChannel}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}