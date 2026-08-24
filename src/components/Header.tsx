'use client'

import { usePlayerStore } from '@/store/player-store'
import SearchBar from '@/components/SearchBar'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onLoginClick?: () => void
}

export default function Header({ searchQuery, onSearchChange, onLoginClick }: HeaderProps) {
  const currentChannel = usePlayerStore((state) => state.currentChannel)
  const isAuthenticated = usePlayerStore((state) => state.isAuthenticated)
  const logout = usePlayerStore((state) => state.logout)

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
          </div>
        </div>
      </div>
    </header>
  )
}
