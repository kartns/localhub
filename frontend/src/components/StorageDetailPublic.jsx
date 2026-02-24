import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap, useEscapeKey } from '../hooks/useAccessibility'
import { useLanguage } from '../contexts/LanguageContext'
import config from '../config'
import { getImageUrl } from '../utils/imageUtils'

export default function StorageDetailPublic({ storage, onClose }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [products, setProducts] = useState([])
  const { t } = useLanguage()

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
      vegetables: null,
      dairy: null,
      meat: null,
      bakery: null,
      beverages: null,
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
      vegetables: '🥕',
      dairy: '🧀',
      meat: '🥩',
      bakery: '🥖',
      beverages: '🥤',
      proteins: '🍗',
      herbs: '🌿',
      other: '🥫'
    }
    return emojis[category] || '🥫'
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
      const initMap = async () => {
        try {
          const { Map } = await window.google.maps.importLibrary("maps")
          const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker")

          const location = { lat: parseFloat(storage.latitude), lng: parseFloat(storage.longitude) }

          const googleMap = new Map(mapRef.current, {
            center: location,
            zoom: 14,
            mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
            styles: [
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#4fd1c5" }] },
              { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#fef3e2" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8dcc8" }] }
            ]
          })

          new AdvancedMarkerElement({
            map: googleMap,
            position: location,
            title: storage.name
          })

          setMap(googleMap)
        } catch (error) {
          console.error("Error initializing map:", error)
        }
      }

      initMap()
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
              src={getImageUrl(storage.image)}
              alt={`${storage.name} brand image`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center`} aria-hidden="true">
              <div className="text-7xl">{getCategoryEmoji(storage.category?.split(',')[0].trim())}</div>
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
            <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">{t('Premium Brand', 'Πρώτης Γραμμής Βράντο')}</p>
            <h2 id="storage-public-title" className="text-3xl font-bold text-white mb-3">{storage.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {storage.category?.split(',').map(cat => cat.trim()).filter(Boolean).map((cat, idx) => (
                <span key={idx} className={`backdrop-blur-md bg-white/20 border border-white/30 text-white text-sm px-3 py-1 rounded-full capitalize flex items-center gap-1.5 shadow-lg`}>
                  {getCategoryIcon(cat) ? (
                    <img src={getCategoryIcon(cat)} alt="" className="w-4 h-4 object-contain" />
                  ) : (
                    <span>{getCategoryEmoji(cat)}</span>
                  )}
                  {cat}
                </span>
              ))}
              {storage.address && (
                <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {storage.address}
                </span>
              )}
              {storage.bio_certified ? (
                <div className="absolute -top-3 -right-3 bg-green-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 text-sm z-20">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  {t('Bio Certified', 'Βιολογικά Πιστοποιημένο')}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description + Action Buttons Row */}
        <div className="bg-white dark:bg-gray-800 mx-4 -mt-2 rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4 relative z-10">
          {/* Description - takes 2/3 */}
          <div className="col-span-2">
            <p className="text-gray-600 dark:text-gray-300 text-sm text-justify">
              {storage.description || 'Premium local products from trusted producers.'}
            </p>
          </div>
          {/* Buttons - takes 1/3 */}
          <div className="col-span-1 flex flex-col gap-2">
            {/* Row 1: Call & Visit */}
            <div className="flex gap-2 justify-end">
              {storage.phone && (
                <a
                  href={`tel:${storage.phone}`}
                  className="bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-medium py-2 px-4 rounded-full transition flex items-center gap-2 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('Call', 'Κλήση')}
                </a>
              )}
              {storage.website && (
                <a
                  href={storage.website.startsWith('http') ? storage.website : `https://${storage.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-full transition flex items-center gap-2 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {t('Website', 'Ιστοσελίδα')}
                </a>
              )}
            </div>
            {/* Row 2: Socials */}
            {(storage.instagram || storage.facebook || storage.twitter || storage.tiktok) && (
              <div className="flex gap-2 justify-end">
                {storage.instagram && (
                  <a
                    href={storage.instagram.startsWith('http') ? storage.instagram : `https://${storage.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {storage.facebook && (
                  <a
                    href={storage.facebook.startsWith('http') ? storage.facebook : `https://${storage.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {storage.twitter && (
                  <a
                    href={storage.twitter.startsWith('http') ? storage.twitter : `https://${storage.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter/X"
                    className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {storage.tiktok && (
                  <a
                    href={storage.tiktok.startsWith('http') ? storage.tiktok : `https://${storage.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Featured Products Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              {t('Featured Products', 'Προβεβλημένα Προϊόντα')}
            </h3>

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl">
                <p>{t('No products available.', 'Δεν υπάρχουν διαθέσιμα προϊόντα.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden flex gap-4 shadow-sm">
                    {/* Product Image */}
                    <div className="w-24 h-full flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
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

            {/* Product Count */}
            <div className="text-center mt-6">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{products.length} {t('product', 'προϊόν')}{products.length !== 1 ? (t('s', 'α')) : ''} {t('available', 'διαθέσιμα')}</span>
            </div>
          </div>

          {/* Full Story Button */}
          <div className="flex justify-center">
            <a
              href={`/story/${storage.id}`}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2 shadow-lg transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t('Discover Full Story', 'Ανακαλύψτε την Ιστορία')}
            </a>
          </div>

          {/* Map Section */}
          {storage.latitude && storage.longitude && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {t('Location', 'Τοποθεσία')}
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
              {t('Close Profile', 'Κλείσιμο Προφίλ')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
