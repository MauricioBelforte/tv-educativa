'use client'

import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/store/player-store'

/**
 * Componente que inicializa el store desde localStorage.
 * Se ejecuta en el cliente para cargar preferencias guardadas.
 */
export default function StoreInitializer() {
  const initFromStorage = usePlayerStore((state) => state.initFromStorage)
  const isDarkMode = usePlayerStore((state) => state.isDarkMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Forzar la aplicación del tema inmediatamente para evitar flash
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, mounted])

  useEffect(() => {
    if (!mounted) return
    initFromStorage()
  }, [initFromStorage, mounted])

  // Ocultar el contenido hasta que esté montado para evitar flash
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return null
}