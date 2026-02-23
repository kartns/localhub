import { useState, useEffect } from 'react'
import { useFavoritesContext } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'

import { useNavigate, Link } from 'react-router-dom'
import { haptic } from '../hooks/useHaptic'
import config from '../config'
import { getImageUrl } from '../utils/imageUtils'

/**
 * FeaturedFarmer - A storytelling section showcasing a featured producer
 * Polaroid-style design matching "Meet the Producer of the Week" from mockup
 */
export default function FeaturedFarmer({ storage, onView }) {
  const [products, setProducts] = useState([])
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isLiked = isFavorite(storage?.id)

  // Fetch products for this storage
  useEffect(() => {
    if (!storage?.id) {
      console.warn('FeaturedFarmer: missing storage ID', storage)
      return
    }
    console.log('FeaturedFarmer: rendering for storage', storage.id)

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/items/storage/${storage.id}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        // Silent fail
      }
    }
    fetchProducts()
  }, [storage?.id])

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    haptic(isLiked ? 'light' : 'medium')
    toggleFavorite(storage.id)
  }





  // Use the database bio_certified field
  const isBioCertified = !!storage?.bio_certified

  // Parse raw materials into tags
  const rawMaterialTags = storage?.rawMaterial
    ? storage.rawMaterial.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3)
    : []

  if (!storage) return null

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Meet the Producer of the Week</h2>
      </div>

      {/* Featured Content */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">

        {/* Polaroid Frame */}
        <div className="relative group">
          <div
            className="bg-white dark:bg-gray-700 p-3 pb-12 rounded-sm shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div className="aspect-square rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-600">
              {getImageUrl(storage?.featured_farmer_image || storage?.image) ? (
                <img
                  src={getImageUrl(storage?.featured_farmer_image || storage?.image)}
                  alt={storage.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                  <span className="text-8xl">🌾</span>
                </div>
              )}
            </div>
            <p className="text-center font-serif italic text-gray-500 dark:text-gray-400 mt-4 text-sm">
              {storage.producer_name
                ? `"Let's get to know ${storage.producer_name}"`
                : `"Discover the story behind ${storage.name}"`
              }
            </p>
          </div>

          {/* Bio Certified Badge */}
          {isBioCertified && (
            <div className="absolute -top-3 -right-3 bg-green-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Bio Certified
            </div>
          )}
        </div>

        {/* Story Content */}
        <div className="flex flex-col gap-5">
          {/* Name & Location */}
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{storage.name}</h3>
            {storage.address && (
              <p className="text-amber-600 dark:text-amber-500 font-semibold text-sm">{storage.address}</p>
            )}
          </div>

          {/* Story Quote */}
          <p className="text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-300 italic text-justify">
            "{storage.description || 'Discover the story behind our local produce and artisanal goods.'}"
          </p>

          {/* Tags */}
          {rawMaterialTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rawMaterialTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Product Thumbnails */}
          {products.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Products:</span>
              <div className="flex -space-x-2">
                {products.slice(0, 4).map((product, index) => (
                  <div
                    key={product.id}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 overflow-hidden"
                    style={{ zIndex: 4 - index }}
                  >
                    {getImageUrl(product.image) ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                    )}
                  </div>
                ))}
                {products.length > 4 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    +{products.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              to={`/story/${storage.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-800 hover:bg-red-900 text-[#e8e0d0] text-sm font-medium rounded-full transition-colors shadow-lg shadow-red-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Read Full Story
            </Link>

            <button
              onClick={() => onView(storage)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8e0d0] dark:bg-gray-600 hover:bg-[#d8cbb5] dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-full transition-colors"
            >
              View Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`p-3 rounded-xl border transition-all ${isLiked
                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-500'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-200 hover:text-red-500'
                }`}
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="w-6 h-6"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
