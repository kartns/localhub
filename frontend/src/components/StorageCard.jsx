import { useState, useEffect, useRef } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { haptic } from '../hooks/useHaptic'

export default function StorageCard({ storage, onDelete, onView, refreshKey, isPublic = false, animationDelay = 0 }) {
  const [products, setProducts] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef(null)
  const [scrollRef, isVisible] = useScrollAnimation({ threshold: 0.1 })

  // Fetch products for this storage
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/items/storage/${storage.id}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [storage.id, refreshKey]) // Re-fetch when refreshKey changes

  // Get all images (brand image + product images)
  const getAllImages = () => {
    const images = []
    if (storage.image) {
      images.push({ src: storage.image, label: storage.name })
    }
    products.forEach(product => {
      if (product.image) {
        images.push({ src: product.image, label: product.name })
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

  const getCategoryColor = (category) => {
    const colors = {
      vegetables: 'from-green-400 to-green-600',
      fruits: 'from-red-400 to-red-600',
      grains: 'from-yellow-400 to-yellow-600',
      dairy: 'from-blue-400 to-blue-600',
      proteins: 'from-orange-400 to-orange-600',
      other: 'from-purple-400 to-purple-600'
    }
    return colors[category] || 'from-purple-400 to-purple-600'
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      vegetables: '🥬',
      fruits: '🍎',
      grains: '🌾',
      dairy: '🥛',
      proteins: '🍗',
      other: '📦'
    }
    return emojis[category] || '📦'
  }

  const getCategoryTagColor = (category) => {
    const colors = {
      vegetables: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      fruits: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      grains: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      dairy: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      proteins: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      other: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    }
    return colors[category] || 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  }

  return (
    <article 
      ref={scrollRef}
      className={`group glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden aspect-square flex flex-col hover:-translate-y-2 hover:scale-[1.02] scroll-scale-fade ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`${storage.name} - ${storage.category} brand${storage.rawMaterial ? `, made with ${storage.rawMaterial}` : ''}`}
    >
      {/* Image/Hero Section */}
      <div className={`${allImages.length > 0 ? '' : `bg-gradient-to-br ${getCategoryColor(storage.category)}`} relative overflow-hidden h-52`}>
        {allImages.length > 0 ? (
          <>
            <img 
              src={allImages[currentImageIndex]?.src} 
              alt={`${storage.name} - ${allImages[currentImageIndex]?.label || 'product image'}`} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Image indicator dots */}
            {allImages.length > 1 && (
              <div className="absolute top-2 right-2 flex gap-1" aria-hidden="true">
                {allImages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            {/* Current image label on hover */}
            {isHovering && allImages.length > 1 && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {allImages[currentImageIndex]?.label}
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
              <div className="text-6xl drop-shadow-lg">{getCategoryEmoji(storage.category)}</div>
            </div>
          </>
        )}
        
        {/* Overlay with brand name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-xs text-white font-semibold opacity-90">Brand</div>
          <h3 className="text-lg font-bold text-white line-clamp-1">{storage.name}</h3>
        </div>
        
        {/* Product count badge */}
        {products.length > 0 && (
          <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow">
            📦 {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow p-4 flex flex-col overflow-hidden">
        {/* Raw Material Tag */}
        {storage.rawMaterial && (
          <div className="mb-2">
            <div className={`inline-block ${getCategoryTagColor(storage.category)} text-xs font-semibold px-3 py-1 rounded-full`}>
              <span>{storage.rawMaterial}</span>
            </div>
          </div>
        )}

        {/* Location */}
        {storage.address && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium line-clamp-1 mb-2">
            <span>📍</span>
            <span className="line-clamp-1">{storage.address}</span>
          </div>
        )}

        {/* Description */}
        {storage.description && (
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 flex-grow">
            {storage.description}
          </p>
        )}
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
