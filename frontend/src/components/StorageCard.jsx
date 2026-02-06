import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { haptic } from '../hooks/useHaptic'
import { useFavoritesContext } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import StarRating from './StarRating'
import config from '../config.js'

export default function StorageCard({ storage, onDelete, onView, onEdit, refreshKey, isPublic = false, animationDelay = 0, userLocation, distance }) {
  const [products, setProducts] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const intervalRef = useRef(null)
  const [scrollRef, isVisible] = useScrollAnimation({ threshold: 0.1 })
  const { isFavorite, toggleFavorite, getRating, setRating } = useFavoritesContext()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isLiked = isFavorite(storage.id)
  const currentRating = getRating(storage.id)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    haptic(isLiked ? 'light' : 'medium')

    if (!isLiked) {
      // When adding to favorites, show rating prompt only if not already rated
      toggleFavorite(storage.id)
      if (!currentRating) {
        setShowRatingPrompt(true)
      }
    } else {
      // When removing from favorites
      toggleFavorite(storage.id)
      setShowRatingPrompt(false)
    }
  }

  const handleRating = (rating) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    haptic('light')
    setRating(storage.id, rating)
    // Hide prompt after rating
    setTimeout(() => setShowRatingPrompt(false), 500)
  }

  // Fetch products for this storage
  useEffect(() => {
    let isCancelled = false

    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/items/storage/${storage.id}`)
        if (response.ok && !isCancelled) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching products:', error)
        }
      }
    }

    fetchProducts()

    return () => {
      isCancelled = true
    }
  }, [storage.id, refreshKey]) // Re-fetch when refreshKey changes

  // Get all images (brand image + product images)
  const getAllImages = () => {
    const images = []
    if (storage.image) {
      // For file uploads, construct the proper URL
      const imageUrl = storage.image.startsWith('data:')
        ? storage.image
        : `${config.API_BASE_URL}/api/uploads/${storage.image}`
      images.push({ src: imageUrl, label: null }) // No label for brand image
    }
    products.forEach(product => {
      if (product.image) {
        // For file uploads, construct the proper URL
        const imageUrl = product.image.startsWith('data:')
          ? product.image
          : `${config.API_BASE_URL}/api/uploads/${product.image}`
        images.push({ src: imageUrl, label: product.name }) // Only product names
      }
    })
    return images
  }

  const allImages = getAllImages()

  // Carousel effect on hover
  useEffect(() => {
    if (isHovering && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
      }, 1000) // Change image every 1 second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setCurrentImageIndex(0) // Reset to first image when not hovering
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, allImages.length])



  return (
    <article
      ref={scrollRef}
      className={`group glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden aspect-square flex flex-col hover:-translate-y-2 hover:scale-[1.02] scroll-scale-fade ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`${storage.name} brand${storage.rawMaterial ? `, made with ${storage.rawMaterial}` : ''}`}
    >
      {/* Image/Hero Section */}
      <div className={`${allImages.length > 0 ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600'} relative overflow-hidden h-52`}>
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]?.src}
              alt={`${storage.name} - ${allImages[currentImageIndex]?.label || 'product image'}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Image indicator dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-16 right-2 flex gap-1" aria-hidden="true">
                {allImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            {/* Current image label on hover - only show for products */}
            {isHovering && allImages.length > 1 && allImages[currentImageIndex]?.label && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {allImages[currentImageIndex].label}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            {/* Icon when no image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl drop-shadow-lg">🏪</div>
            </div>
          </>
        )}

        {/* Overlay with brand name and product count */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-fluid-lg font-bold text-white line-clamp-1">{storage.name}</h3>
          {products.length > 0 && (
            <div className="text-xs text-white/80 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1-2H8l-1 2H5V5z" clipRule="evenodd" />
              </svg>
              <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={
            isAuthenticated && isLiked
              ? `Remove ${storage.name} from favorites`
              : `Add ${storage.name} to favorites`
          }
          aria-pressed={isAuthenticated && isLiked}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 focus-ring heart-favorite ${isAuthenticated && isLiked
            ? 'bg-red-500 text-white shadow-lg scale-110 liked'
            : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
            }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'scale-110' : ''}`}
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-grow p-4 flex flex-col overflow-hidden">
        {/* Top row: Raw Material Tag + Distance/Location */}
        <div className="flex items-start justify-between mb-2">
          {/* Raw Material Tag */}
          {storage.rawMaterial ? (
            <div className="inline-block backdrop-blur-md bg-[#e8e0d0]/80 border border-[#e8e0d0] text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              <span>{storage.rawMaterial}</span>
            </div>
          ) : <div />}

          {/* Distance or Location on right */}
          <div className="flex flex-col items-end gap-1">
            {storage.address && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                <svg className="w-3.5 h-3.5 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="line-clamp-1 max-w-[100px]">{storage.address}</span>
              </div>
            )}
            {distance !== null && distance !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                <span>
                  {distance < 1
                    ? `${Math.round(distance * 1000)}m`
                    : `${distance.toFixed(1)}km`
                  } away
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Star Rating - Always shown, prompt if favorited without rating */}
        <div className="mb-2">
          {/* Rating prompt - shows when authenticated, favorited but not yet rated */}
          {isAuthenticated && isLiked && showRatingPrompt && !currentRating ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1 font-medium">
                ⭐ Rate this favorite!
              </p>
              <StarRating
                rating={currentRating}
                onRate={handleRating}
                size="md"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <StarRating
                rating={currentRating}
                onRate={handleRating}
                size="sm"
              />
              {currentRating > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentRating}/5
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 mt-auto">
        <button
          onClick={() => {
            haptic('light')
            onView(storage)
          }}
          aria-label={`View details for ${storage.name}`}
          className="flex-1 bg-[#e8e0d0] dark:bg-gray-700 hover:bg-[#ddd4c4] dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm btn-press focus-ring"
        >
          View
        </button>
        {onEdit && !isPublic && (
          <button
            onClick={() => {
              haptic('light')
              onEdit(storage)
            }}
            aria-label={`Edit ${storage.name}`}
            className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 btn-press icon-bounce focus-ring"
          >
            <span aria-hidden="true">✏️</span>
            <span className="sr-only">Edit</span>
          </button>
        )}
        {!isPublic && (
          <button
            onClick={() => {
              haptic('medium')
              onDelete(storage.id)
            }}
            aria-label={`Delete ${storage.name}`}
            className="px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 btn-press icon-bounce focus-ring"
          >
            <span aria-hidden="true">🗑️</span>
            <span className="sr-only">Delete</span>
          </button>
        )}
      </div>
    </article>
  )
}
