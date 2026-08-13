'use client'

import { useState } from 'react'
import { usePlayerStore } from '@/store/player-store'
import SearchBar from '@/components/SearchBar'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onLoginClick?: () => void
}

export default function Header({ searchQuery, onSearchChange, onLoginClick }: HeaderProps) {
  const isDarkMode = usePlayerStore((state) => state.isDarkMode)
  const colorMode = usePlayerStore((state) => state.colorMode)
  const setColorMode = usePlayerStore((state) => state.setColorMode)
  const currentChannel = usePlayerStore((state) => state.currentChannel)
  const isAuthenticated = usePlayerStore((state) => state.isAuthenticated)
  const logout = usePlayerStore((state) => state.logout)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  return (
    <header className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center">
          {/* Logo - izquierda */}
          <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-gray-900 dark:text-white">TV Libre</h1>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                  {currentChannel
                    ? `Reproduciendo: ${currentChannel.name}`
                    : 'Canales gratuitos en vivo'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Buscador - medio */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md">
              <SearchBar value={searchQuery} onChange={onSearchChange} />
            </div>
          </div>

          {/* Acciones - derecha */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {currentChannel && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 dark:text-green-400">EN VIVO</span>
              </div>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                Salir
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Acceso Privado"
              >
                Acceso Privado
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title={colorMode === 'auto' ? 'Tema automático' : colorMode === 'dark' ? 'Modo oscuro' : 'Modo claro'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12 a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => { setColorMode('light'); setShowThemeMenu(false) }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    ☀️ Claro
                  </button>
                  <button
                    onClick={() => { setColorMode('dark'); setShowThemeMenu(false) }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    🌙 Oscuro
                  </button>
                  <button
                    onClick={() => { setColorMode('auto'); setShowThemeMenu(false) }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    🔄 Automático
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
