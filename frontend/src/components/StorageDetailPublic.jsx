import { useState, useEffect, useRef } from 'react'
import { useFocusTrap, useEscapeKey } from '../hooks/useAccessibility'

export default function StorageDetailPublic({ storage, onClose }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [products, setProducts] = useState([])
  
  // Focus trap for modal accessibility
  const dialogRef = useFocusTrap(true)
  
  // Close on Escape key
  useEscapeKey(onClose, true)

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

  // Fetch products for this storage
  useEffect(() => {
    fetchProducts()
  }, [storage.id])

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

  useEffect(() => {
    // Initialize map if coordinates exist
    if (storage.latitude && storage.longitude && window.google?.maps && mapRef.current) {
      const timer = setTimeout(() => {
        const location = { lat: parseFloat(storage.latitude), lng: parseFloat(storage.longitude) }
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 14,
        })
        new window.google.maps.Marker({
          position: location,
          map: googleMap,
          title: storage.name
        })
        setMap(googleMap)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [storage])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-public-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Image */}
        <div className={`${storage.image ? '' : `bg-gradient-to-br ${getCategoryColor(storage.category)}`} relative h-48`}>
          {storage.image ? (
            <img 
              src={storage.image} 
              alt={`${storage.name} brand image`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(storage.category)} flex items-center justify-center`} aria-hidden="true">
              <div className="text-7xl">{getCategoryEmoji(storage.category)}</div>
            </div>
          )}
          
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition focus-ring"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Overlay with info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-white text-fluid-sm font-semibold opacity-80">Brand</p>
            <h2 id="storage-public-title" className="text-fluid-3xl font-bold text-white">{storage.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white bg-opacity-20 text-white text-fluid-sm px-3 py-1 rounded-full capitalize">
                {storage.category}
              </span>
              {storage.address && (
                <span className="text-white text-fluid-sm opacity-80">📍 {storage.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {storage.description && (
            <p className="text-gray-600 dark:text-gray-300 text-fluid-base leading-relaxed">{storage.description}</p>
          )}

          {/* Products Section */}
          <div>
            <h3 className="text-fluid-xl font-bold text-gray-800 dark:text-gray-100 mb-4">📦 Products ({products.length})</h3>

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-4xl mb-2">📦</p>
                <p>No products available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-3 flex gap-3 items-center">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {getCategoryEmoji(product.category)}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
                      {product.category && (
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          {storage.latitude && storage.longitude && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🗺️ Location</h3>
              <div 
                ref={mapRef} 
                className="w-full h-48 rounded-lg border border-gray-200 shadow-inner"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
