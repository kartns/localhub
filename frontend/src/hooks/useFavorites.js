import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'localhub_favorites'

/**
 * Hook for managing favorite brands with localStorage persistence
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [favorites])

  const addFavorite = useCallback((storageId) => {
    setFavorites(prev => {
      if (prev.includes(storageId)) return prev
      return [...prev, storageId]
    })
  }, [])

  const removeFavorite = useCallback((storageId) => {
    setFavorites(prev => prev.filter(id => id !== storageId))
  }, [])

  const toggleFavorite = useCallback((storageId) => {
    setFavorites(prev => {
      if (prev.includes(storageId)) {
        return prev.filter(id => id !== storageId)
      }
      return [...prev, storageId]
    })
  }, [])

  const isFavorite = useCallback((storageId) => {
    return favorites.includes(storageId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }
}

export default useFavorites
