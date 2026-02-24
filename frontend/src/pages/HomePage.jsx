import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StorageCard from '../components/StorageCard'
import StorageDetailPublic from '../components/StorageDetailPublic'
import SkeletonCard from '../components/SkeletonCard'
import CategoryDropdown from '../components/CategoryDropdown'
import Footer from '../components/Footer'
import FeaturedFarmer from '../components/FeaturedFarmer'
import Header from '../components/Header'
import { useFavoritesContext } from '../contexts/FavoritesContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { haptic } from '../hooks/useHaptic'
import { useAnnounce, useEscapeKey } from '../hooks/useAccessibility'
import config from '../config'
import MapComponent from '../components/MapComponent'
import PlatformStats from '../components/PlatformStats'

export default function HomePage() {
  const [storages, setStorages] = useState([])
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [featuredFarmer, setFeaturedFarmer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  // GPS and proximity filtering
  const [userLocation, setUserLocation] = useState(null)
  const [proximityFilter, setProximityFilter] = useState(true)
  const [proximityDistance, setProximityDistance] = useState(10) // Default 10km
  const [locationPermission, setLocationPermission] = useState('prompt') // prompt, granted, denied
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showProximityDropdown, setShowProximityDropdown] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const { favorites, favoritesCount } = useFavoritesContext()
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()
  const [searchBarRef, isSearchBarVisible] = useScrollAnimation({ threshold: 0.2 })
  const { announce } = useAnnounce()

  // Close modal and dropdown on Escape key
  useEscapeKey(() => {
    if (selectedStorage) setSelectedStorage(null)
    else if (showProximityDropdown) setShowProximityDropdown(false)
  }, !!selectedStorage || showProximityDropdown)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProximityDropdown && !event.target.closest('.proximity-dropdown')) {
        setShowProximityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProximityDropdown])

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  // Get user's current location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      announce('Geolocation is not supported by this browser')
      return
    }

    setGettingLocation(true)

    try {
      // First try with high accuracy but longer timeout
      const position = await new Promise((resolve, reject) => {
        let timeoutId;
        let hasResolved = false;

        const success = (pos) => {
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            resolve(pos);
          }
        };

        const error = (err) => {
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            reject(err);
          }
        };

        // Try high accuracy first
        navigator.geolocation.getCurrentPosition(success, error, {
          enableHighAccuracy: true,
          timeout: 15000, // Increased to 15 seconds
          maximumAge: 300000 // Cache for 5 minutes
        });

        // Fallback: if high accuracy fails, try low accuracy
        timeoutId = setTimeout(() => {
          if (!hasResolved) {
            navigator.geolocation.getCurrentPosition(success, error, {
              enableHighAccuracy: false,
              timeout: 30000, // 30 seconds for fallback
              maximumAge: 600000 // 10 minutes cache for less accurate location
            });
          }
        }, 8000); // Start fallback after 8 seconds
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }

      setUserLocation(location)
      setLocationPermission('granted')
      announce(`Location found with ${Math.round(location.accuracy)}m accuracy`)
      haptic('medium')

    } catch (error) {
      console.error('Error getting location:', error)
      setLocationPermission('denied')

      switch (error.code) {
        case error.PERMISSION_DENIED:
          announce('Location access denied. Please enable location permissions.')
          break
        case error.POSITION_UNAVAILABLE:
          announce('Location information is unavailable.')
          break
        case error.TIMEOUT:
          announce('Location request timed out. Please try again.')
          break
        default:
          announce('An unknown error occurred while retrieving location.')
          break
      }
    } finally {
      setGettingLocation(false)
    }
  }

  // Toggle proximity filtering
  const toggleProximityFilter = () => {
    if (!proximityFilter && !userLocation) {
      // Need to get location first
      getUserLocation()
    }
    setProximityFilter(!proximityFilter)
    haptic('light')
    announce(proximityFilter ? 'Showing all shops' : 'Showing nearby shops only')
  }

  useEffect(() => {
    fetchStorages()
  }, [])

  // Automatically request location if proximity filter is enabled on page load
  useEffect(() => {
    if (proximityFilter && !userLocation && !gettingLocation) {
      getUserLocation()
    }
  }, [proximityFilter, userLocation, gettingLocation])

  const fetchStorages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.API_BASE_URL}/api/storages`)
      if (response.ok) {
        const data = await response.json()
        setStorages(data)

        // Fetch featured farmer from settings
        try {
          const settingsResponse = await fetch(`${config.API_BASE_URL}/api/settings/featuredFarmerId`)
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            if (settingsData.value) {
              const featured = data.find(s => s.id === settingsData.value)
              if (featured) {
                setFeaturedFarmer(featured)
              } else if (data.length > 0) {
                // Fallback to random if saved farmer not found
                setFeaturedFarmer(data[Math.floor(Math.random() * data.length)])
              }
            } else if (data.length > 0 && !featuredFarmer) {
              // No saved setting, use random
              setFeaturedFarmer(data[Math.floor(Math.random() * data.length)])
            }
          }
        } catch (error) {
          // Fallback to random on error
          if (data.length > 0 && !featuredFarmer) {
            setFeaturedFarmer(data[Math.floor(Math.random() * data.length)])
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter storages
  const filteredStorages = storages.filter(storage => {
    const matchesSearch = storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storage.rawMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storage.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' ||
      (storage.category && storage.category.split(',').map(s => s.trim()).includes(filterCategory))
    const matchesFavorites = !showFavoritesOnly || favorites.includes(storage.id)

    // Proximity filtering
    let withinProximity = true
    if (proximityFilter && userLocation && storage.latitude && storage.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(storage.latitude),
        parseFloat(storage.longitude)
      )
      withinProximity = distance <= proximityDistance
    }

    return matchesSearch && matchesCategory && matchesFavorites && withinProximity
  })

  // Calculate distances for display
  const storagesWithDistance = filteredStorages.map(storage => {
    let distance = null
    if (userLocation && storage.latitude && storage.longitude) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(storage.latitude),
        parseFloat(storage.longitude)
      )
    }
    return { ...storage, distance }
  })

  return (
    <div className="min-h-screen mesh-gradient-bg transition-colors flex flex-col">
      <Header scrollHide />

      {/* Main Content */}
      <main id="main-content" className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full mt-4 md:mt-6" tabIndex="-1" aria-label="Local brands directory">
        <h2 className="sr-only">Browse Local Brands</h2>

        {/* Search and Filter Bar */}
        <div
          ref={searchBarRef}
          className={`glass rounded-2xl shadow-lg p-4 mb-6 scroll-fade-up relative z-50 ${isSearchBarVisible ? 'visible' : ''}`}
          role="search"
          aria-label="Search and filter brands"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search-brands" className="sr-only">Search brands or raw materials</label>
              <div className="relative">
                <input
                  id="search-brands"
                  type="search"
                  placeholder={t('Search brands or raw materials...', 'Αναζήτηση brands ή πρώτων υλών...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-describedby="search-results-count"
                  className="w-full pl-10 pr-4 py-3 border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent focus:outline-none transition-all outline-none"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Mobile Helper Wrapper: Category + Favorites on same row */}
            <div className="flex gap-2 w-full md:contents">
              {/* Category Filter */}
              <div className="flex-1 md:w-64">
                <label htmlFor="filter-category" className="sr-only">Filter by category</label>
                <CategoryDropdown
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Favorites Toggle */}
              <button
                onClick={() => {
                  haptic('light')
                  setShowFavoritesOnly(!showFavoritesOnly)
                  announce(showFavoritesOnly ? 'Showing all brands' : 'Showing favorites only')
                }}
                aria-pressed={showFavoritesOnly}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all btn-press ${showFavoritesOnly
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-[#ddd4c4] dark:hover:bg-gray-600'
                  }`}
              >
                <svg
                  className={`w-5 h-5 ${showFavoritesOnly ? 'text-white' : 'text-red-500'}`}
                  fill={showFavoritesOnly ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {favoritesCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${showFavoritesOnly
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                    {favoritesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Proximity Filter Dropdown */}
            <div className="relative proximity-dropdown" style={{ isolation: 'isolate', zIndex: 100 }}>
              <button
                onClick={() => setShowProximityDropdown(!showProximityDropdown)}
                disabled={gettingLocation}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all btn-press relative ${proximityFilter
                  ? 'bg-[#e8e0d0] dark:bg-[#c9c0b0] text-gray-700 dark:text-gray-800 shadow-lg'
                  : 'border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-[#ddd4c4] dark:hover:bg-gray-600'
                  } ${gettingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {gettingLocation ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg
                    className={`w-5 h-5 ${proximityFilter ? 'text-gray-700 dark:text-gray-800' : 'text-black dark:text-white'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {gettingLocation ? t('Locating...', 'Εντοπισμός...') : (proximityFilter ? `${t('Within', 'Σε ακτίνα')} ${proximityDistance}km` : t('Nearby', 'Κοντά μου'))}
                </span>
                <span className="sm:hidden text-xs">
                  {gettingLocation ? t('...', '...') : (proximityFilter ? `${proximityDistance}km` : t('Near', 'Κοντά'))}
                </span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProximityDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 min-w-[140px]">

                  <div className="py-2">
                    <button
                      onClick={() => {
                        setProximityFilter(false)
                        setShowProximityDropdown(false)
                        haptic('light')
                        announce('Showing all shops')
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!proximityFilter ? 'bg-[#e8e0d0] dark:bg-[#c9c0b0] text-gray-700 dark:text-gray-800' : 'text-gray-700 dark:text-gray-200'
                        }`}
                    >
                      {t('All Shops', 'Όλα τα Καταστήματα')}
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    {[1, 2, 5, 10, 20, 50, 100, 200].map((km) => (
                      <button
                        key={km}
                        onClick={() => {
                          if (!userLocation) {
                            getUserLocation()
                          }
                          setProximityFilter(true)
                          setProximityDistance(km)
                          setShowProximityDropdown(false)
                          haptic('light')
                          announce(`Showing shops within ${km}km`)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${proximityFilter && proximityDistance === km
                          ? 'bg-[#e8e0d0] dark:bg-[#c9c0b0] text-gray-700 dark:text-gray-800'
                          : 'text-gray-700 dark:text-gray-200'
                          }`}
                      >
                        {t('Within', 'Σε ακτίνα')} {km}km
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterCategory !== 'all' || showFavoritesOnly || proximityFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('all')
                  setShowFavoritesOnly(false)
                  setProximityFilter(false)
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] font-medium transition-colors"
              >
                {t('Clear', 'Καθαρισμός')}
              </button>
            )}


          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredStorages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
            <div className="text-5xl mb-4">{showFavoritesOnly ? '💔' : '🔍'}</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {showFavoritesOnly
                ? t("You haven't added any favorites yet.", 'Δεν έχετε προσθέσει ακόμα αγαπημένα.')
                : t('No brands match your search.', 'Δεν βρέθηκαν αποτελέσματα.')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterCategory('all')
                setShowFavoritesOnly(false)
                setProximityFilter(false)
              }}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                {showFavoritesOnly
                  ? t('Click the heart icon on any brand to add it to your favorites.', 'Κάντε κλικ στην καρδιά για να προσθέσετε αγαπημένα.')
                  : t('Try adjusting your filters or search term.', 'Δοκιμάστε να αλλάξετε τα φίλτρα ή τον όρο αναζήτησης.')}
              </p>
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <MapComponent
            storages={storagesWithDistance}
            userLocation={userLocation}
            onStorageClick={(storage) => setSelectedStorage(storage)}
          />
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="Local brands"
          >
            {storagesWithDistance.map((storage, index) => (
              <StorageCard
                key={storage.id}
                storage={storage}
                onView={(storage) => setSelectedStorage(storage)}
                isPublic={true}
                animationDelay={index * 100}
                userLocation={userLocation}
                distance={storage.distance}
              />
            ))}
          </div>
        )}
      </main>

      {/* Featured Farmer Section - positioned after main content */}
      {
        !loading && featuredFarmer && (
          <div className="max-w-6xl mx-auto px-4 mt-16">
            <FeaturedFarmer
              storage={featuredFarmer}
              onView={(storage) => setSelectedStorage(storage)}
            />
          </div>
        )
      }

      {/* Platform Impact Stats - under the farmer card */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-12 mb-12">
        <PlatformStats />
      </div>

      {/* Storage Detail Modal (Public - no delete) */}
      {
        selectedStorage && (
          <StorageDetailPublic
            storage={selectedStorage}
            onClose={() => setSelectedStorage(null)}
          />
        )
      }



      {/* Footer */}
      <Footer />
    </div >
  )
}
