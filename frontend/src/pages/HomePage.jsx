import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StorageCard from '../components/StorageCard'
import StorageDetailPublic from '../components/StorageDetailPublic'
import SkeletonCard from '../components/SkeletonCard'
import { useTheme } from '../contexts/ThemeContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { haptic } from '../hooks/useHaptic'
import { useAnnounce, useEscapeKey } from '../hooks/useAccessibility'

export default function HomePage() {
  const [storages, setStorages] = useState([])
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const [searchBarRef, isSearchBarVisible] = useScrollAnimation({ threshold: 0.2 })
  const { announce } = useAnnounce()

  // Close modal on Escape key
  useEscapeKey(() => setSelectedStorage(null), !!selectedStorage)

  useEffect(() => {
    fetchStorages()
  }, [])

  const fetchStorages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/storages')
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="glass sticky top-0 z-50 text-gray-800 dark:text-gray-100 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-4 cursor-pointer">
              <img src="/logo.png" alt="Logo" className="h-12 md:h-20 object-contain" />
              <div>
                <h1 className="text-xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">The Local Hub</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-lg hidden sm:block">Discover local products in your area</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
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
                to="/admin" 
                className="bg-[#e8e0d0] dark:bg-gray-700 hover:bg-[#ddd4c4] dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition btn-press"
              >
                Login
              </Link>
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
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium py-2"
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium py-2"
                >
                  About
                </Link>
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium py-2"
                >
                  Admin Login
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium py-2"
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
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8" tabIndex="-1" aria-label="Local brands directory">
        <h2 className="sr-only">Browse Local Brands</h2>
        
        {/* Search and Filter Bar */}
        <div 
          ref={searchBarRef}
          className={`glass rounded-2xl shadow-lg p-4 mb-6 scroll-fade-up ${isSearchBarVisible ? 'visible' : ''}`}
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
                  className="w-full pl-10 pr-4 py-3 border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all focus-ring"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <label htmlFor="filter-category" className="sr-only">Filter by category</label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full px-4 py-3 border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer focus-ring"
              >
                <option value="all">All Categories</option>
                <option value="vegetables">🥬 Vegetables</option>
                <option value="fruits">🍎 Fruits</option>
                <option value="grains">🌾 Grains</option>
                <option value="dairy">🥛 Dairy</option>
                <option value="proteins">🍗 Proteins</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('all')
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
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
                  return matchesSearch && matchesCategory
                })
                return `${filtered.length} brand${filtered.length !== 1 ? 's' : ''} found`
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
              return matchesSearch && matchesCategory
            })

            if (filteredStorages.length === 0) {
              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No brands match your search.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterCategory('all')
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
                {filteredStorages.map((storage, index) => (
                  <StorageCard
                    key={storage.id}
                    storage={storage}
                    onView={setSelectedStorage}
                    isPublic={true}
                    animationDelay={index * 100}
                  />
                ))}
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
    </div>
  )
}
