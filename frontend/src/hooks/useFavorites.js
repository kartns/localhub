import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'localhub_favorites'
const RATINGS_KEY = 'localhub_ratings'

/**
 * Hook for managing favorite brands and ratings with localStorage persistence
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [ratings, setRatings] = useState(() => {
    try {
      const stored = localStorage.getItem(RATINGS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [favorites])

  // Sync ratings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings))
    } catch (error) {
      console.error('Failed to save ratings:', error)
    }
  }, [ratings])

  const addFavorite = useCallback((storageId) => {
    setFavorites(prev => {
      if (prev.includes(storageId)) return prev
      return [...prev, storageId]
    })
  }, [])

  const removeFavorite = useCallback((storageId) => {
    setFavorites(prev => prev.filter(id => id !== storageId))
    // Keep ratings even when unfavorited - ratings are independent
  }, [])

  const toggleFavorite = useCallback((storageId) => {
    setFavorites(prev => {
      if (prev.includes(storageId)) {
        // Keep rating when unfavoriting - ratings are independent
        return prev.filter(id => id !== storageId)
      }
      return [...prev, storageId]
    })
  }, [])

  const isFavorite = useCallback((storageId) => {
    return favorites.includes(storageId)
  }, [favorites])

  const setRating = useCallback((storageId, rating) => {
    setRatings(prev => ({
      ...prev,
      [storageId]: rating
    }))
  }, [])

  const getRating = useCallback((storageId) => {
    return ratings[storageId] || 0
  }, [ratings])

  const clearFavorites = useCallback(() => {
    setFavorites([])
    setRatings({})
  }, [])

  return {
    favorites,
    ratings,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    setRating,
    getRating,
    clearFavorites,
    favoritesCount: favorites.length
  }
}

export default useFavorites
