import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap, useEscapeKey } from '../hooks/useAccessibility'
import config from '../config'

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
      fruits: 'bg-rose-600',
      honey: 'bg-amber-500',
      proteins: 'bg-orange-500',
      herbs: 'bg-green-600',
      other: 'bg-purple-600'
    }
    return colors[category] || 'bg-purple-600'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      fruits: '/fruits.png',
      honey: '/honey.png',
      proteins: '/proteins.png',
      herbs: '/herbs.png',
      other: null
    }
    return icons[category] || null
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      fruits: '🍎',
      honey: '🍯',
      proteins: '🍗',
      herbs: '🌿',
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
      const response = await fetch(`${config.API_BASE_URL}/api/items/storage/${storage.id}`)
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
          styles: [
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#4fd1c5" }] },
            { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#fef3e2" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8dcc8" }] }
          ]
        })
        new window.google.maps.Marker({
          position: location,
          map: googleMap,
          title: storage.name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#000000',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24)
          }
        })
        setMap(googleMap)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [storage])

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-sm"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-public-title"
        className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal-in"
      >
        {/* Header with Image */}
        <div className="relative h-56 rounded-t-3xl overflow-hidden">
          {storage.image ? (
            <img 
              src={storage.image} 
              alt={`${storage.name} brand image`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center`} aria-hidden="true">
              <div className="text-7xl">{getCategoryEmoji(storage.category)}</div>
            </div>
          )}
          
          {/* Close X button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Overlay with brand info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-16">
            <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">Premium Brand</p>
            <h2 id="storage-public-title" className="text-3xl font-bold text-white mb-3">{storage.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`backdrop-blur-md bg-white/20 border border-white/30 text-white text-sm px-3 py-1 rounded-full capitalize flex items-center gap-1.5 shadow-lg`}>
                {getCategoryIcon(storage.category) ? (
                  <img src={getCategoryIcon(storage.category)} alt="" className="w-4 h-4 object-contain" />
                ) : (
                  <span>{getCategoryEmoji(storage.category)}</span>
                )}
                {storage.category}
              </span>
              {storage.address && (
                <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {storage.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description + Action Buttons Row */}
        <div className="bg-white dark:bg-gray-800 mx-4 -mt-2 rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <p className="text-gray-600 dark:text-gray-300 text-sm flex-1 text-center sm:text-left">
            {storage.description || 'Premium local products from trusted producers.'}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            {storage.phone && (
              <a
                href={`tel:${storage.phone}`}
                className="bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-medium py-2.5 px-5 rounded-full transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Producer
              </a>
            )}
            {storage.website && (
              <a
                href={storage.website.startsWith('http') ? storage.website : `https://${storage.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-5 rounded-full transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Featured Products Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <img src="/i-want-a-n-icon-of-a-minimal-fruit-basket--in-the-.png" alt="" className="w-6 h-6" /> Featured Products 
              <span className="text-gray-400 font-normal">({products.length})</span>
            </h3>

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl">
                <p className="text-4xl mb-2">📦</p>
                <p>No products available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden flex gap-4 shadow-sm">
                    {/* Product Image */}
                    <div className="w-24 h-full flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      {product.image ? (
                        <img 
                          src={product.image.startsWith('data:') ? product.image : `${config.API_BASE_URL}/api/uploads/${product.image}`} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                          {getCategoryEmoji(product.category)}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0 py-4 pr-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{product.name}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {product.description || `Fresh ${product.category || 'product'} from local producer.`}
                      </p>
                      {product.price && (
                        <p className="text-rose-600 font-semibold text-sm">
                          €{product.price} {product.unit && `/ ${product.unit}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Section */}
          {storage.latitude && storage.longitude && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#000000" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg> Location
              </h3>
              <div 
                ref={mapRef} 
                className="w-full h-52 rounded-2xl overflow-hidden shadow-sm"
              />
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 px-8 rounded-full transition flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
