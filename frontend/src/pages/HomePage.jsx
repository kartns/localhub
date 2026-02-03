import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StorageCard from '../components/StorageCard'
import StorageDetailPublic from '../components/StorageDetailPublic'
import SkeletonCard from '../components/SkeletonCard'
import CategoryDropdown from '../components/CategoryDropdown'
import { useTheme } from '../contexts/ThemeContext'
import { useFavoritesContext } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { haptic } from '../hooks/useHaptic'
import { useAnnounce, useEscapeKey } from '../hooks/useAccessibility'
import config from '../config'

export default function HomePage() {
  const [storages, setStorages] = useState([])
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // GPS and proximity filtering
  const [userLocation, setUserLocation] = useState(null)
  const [proximityFilter, setProximityFilter] = useState(true)
  const [proximityDistance, setProximityDistance] = useState(10) // Default 10km
  const [locationPermission, setLocationPermission] = useState('prompt') // prompt, granted, denied
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showProximityDropdown, setShowProximityDropdown] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const { favorites, favoritesCount } = useFavoritesContext()
  const { user, isAuthenticated } = useAuth()
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
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
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
      }
    } catch (error) {
      console.error('Error fetching storages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-gradient-bg transition-colors flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 text-gray-800 dark:text-gray-100 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-4 cursor-pointer">
              <img src="/logo.png" alt="The Local Hub logo" className="h-12 md:h-20 object-contain" />
              <div>
                <h1 className="text-fluid-2xl md:text-fluid-4xl font-bold text-gray-800 dark:text-gray-100">The Local Hub</h1>
                <p className="text-gray-500 dark:text-gray-400 text-fluid-xs md:text-fluid-base hidden sm:block">Discover the local treasures</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                About
              </Link>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  haptic('light')
                  toggleDarkMode()
                }}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press icon-bounce"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <Link 
                to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login'} 
                className="bg-[#e8e0d0] dark:bg-gray-700 hover:bg-[#ddd4c4] dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition btn-press"
              >
                {isAuthenticated && user?.role === 'admin' ? 'Dashboard' : 'Login'}
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e8e0d0] dark:bg-gray-700 flex items-center justify-center text-sm font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                haptic('light')
                setMobileMenuOpen(!mobileMenuOpen)
              }}
              className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
              <nav className="flex flex-col gap-3">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  About
                </Link>
                <Link 
                  to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login'} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  {isAuthenticated && user?.role === 'admin' ? 'Dashboard' : 'Login'}
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#e8e0d0] dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    Profile
                  </Link>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  {darkMode ? (
                    <>
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full" tabIndex="-1" aria-label="Local brands directory">
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
                  placeholder="Search brands or raw materials..."
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

            {/* Category Filter */}
            <div className="md:w-64">
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
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all btn-press ${
                showFavoritesOnly
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
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  showFavoritesOnly 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Proximity Filter Dropdown */}
            <div className="relative proximity-dropdown" style={{ isolation: 'isolate', zIndex: 100 }}>
              <button
                onClick={() => setShowProximityDropdown(!showProximityDropdown)}
                disabled={gettingLocation}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all btn-press relative ${
                  proximityFilter
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
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {gettingLocation ? 'Locating...' : (proximityFilter ? `Within ${proximityDistance}km` : 'Nearby')}
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
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        !proximityFilter ? 'bg-[#e8e0d0] dark:bg-[#c9c0b0] text-gray-700 dark:text-gray-800' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      All Shops
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
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          proximityFilter && proximityDistance === km 
                            ? 'bg-[#e8e0d0] dark:bg-[#c9c0b0] text-gray-700 dark:text-gray-800' 
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        Within {km}km
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
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          {!loading && (
            <div 
              id="search-results-count" 
              className="mt-3 text-sm text-gray-600 dark:text-gray-400"
              aria-live="polite"
              aria-atomic="true"
            >
            {(() => {
              const filtered = storages.filter(storage => {
                const matchesSearch = storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  storage.rawMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  storage.description?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesCategory = filterCategory === 'all' || storage.category === filterCategory
                const matchesFavorites = !showFavoritesOnly || favorites.includes(storage.id)
                
                // Proximity filtering
                let withinProximity = true
                if (proximityFilter) {
                  if (!userLocation) {
                    // If proximity filter is on but location not available yet, don't show any brands
                    withinProximity = false
                  } else if (storage.latitude && storage.longitude) {
                    const distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      parseFloat(storage.latitude),
                      parseFloat(storage.longitude)
                    )
                    withinProximity = distance <= proximityDistance
                  } else {
                    // No coordinates for this storage, exclude it from proximity results
                    withinProximity = false
                  }
                }
                
                return matchesSearch && matchesCategory && matchesFavorites && withinProximity
              })
              
              const totalNearby = proximityFilter && userLocation 
                ? storages.filter(storage => {
                    if (!storage.latitude || !storage.longitude) return false
                    const distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      parseFloat(storage.latitude),
                      parseFloat(storage.longitude)
                    )
                    return distance <= proximityDistance
                  }).length
                : storages.length
              
              return `${filtered.length} brand${filtered.length !== 1 ? 's' : ''} found${showFavoritesOnly ? ' in favorites' : ''}${proximityFilter ? ` within ${proximityDistance}km (${totalNearby} total nearby)` : ''}`
            })()}
            </div>
          )}
        </div>

        {/* Storage List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : storages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No brands available yet.</p>
          </div>
        ) : (() => {
            const filteredStorages = storages.filter(storage => {
              const matchesSearch = storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                storage.rawMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                storage.description?.toLowerCase().includes(searchTerm.toLowerCase())
              const matchesCategory = filterCategory === 'all' || storage.category === filterCategory
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

            if (filteredStorages.length === 0) {
              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
                  <div className="text-5xl mb-4">{showFavoritesOnly ? '💔' : '🔍'}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {showFavoritesOnly 
                      ? "You haven't added any favorites yet." 
                      : "No brands match your search."}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    {showFavoritesOnly 
                      ? "Click the heart icon on any brand to add it to your favorites." 
                      : "Try adjusting your filters or search term."}
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
                    Clear filters
                  </button>
                </div>
              )
            }

            return (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Local brands"
              >
                {filteredStorages.map((storage, index) => {
                  // Calculate distance if user location is available
                  let distance = null
                  if (userLocation && storage.latitude && storage.longitude) {
                    distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      parseFloat(storage.latitude),
                      parseFloat(storage.longitude)
                    )
                  }
                  
                  return (
                    <StorageCard
                      key={storage.id}
                      storage={storage}
                      onView={(storage) => {
                        setSelectedStorage(storage)
                      }}
                      isPublic={true}
                      animationDelay={index * 100}
                      userLocation={userLocation}
                      distance={distance}
                    />
                  )
                })}
              </div>
            )
          })()}
      </main>

      {/* Storage Detail Modal (Public - no delete) */}
      {selectedStorage && (
        <StorageDetailPublic 
          storage={selectedStorage} 
          onClose={() => setSelectedStorage(null)}
        />
      )}

      {/* Footer */}
      <footer className="glass mt-24 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="The Local Hub" className="h-10 object-contain" />
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100">The Local Hub</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Discover the local treasures. Connecting communities with local producers and artisans.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    Partner Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Get in Touch</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>hello@thelocalhub.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Supporting local communities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Icon Credits */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center mb-2">Icon Credits:</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
              <a href="https://www.flaticon.com/free-icons/fruits" title="fruits icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                Fruits icons by Freepik - Flaticon
              </a>
              <a href="https://www.flaticon.com/free-icons/meat" title="meat icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                Meat icons by Iconjam - Flaticon
              </a>
              <a href="https://www.flaticon.com/free-icons/honey" title="honey icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                Honey icons by mikan933 - Flaticon
              </a>
              <a href="https://www.flaticon.com/free-icons/herbs" title="herbs icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                Herbs icons by iconixarPro - Flaticon
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} The Local Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
