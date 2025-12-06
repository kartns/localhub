import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StorageCard from '../components/StorageCard'
import StorageDetailPublic from '../components/StorageDetailPublic'

export default function HomePage() {
  const [storages, setStorages] = useState([])
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-[#f5f0e6] text-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 cursor-pointer">
            <img src="/logo.png" alt="Logo" className="h-20 object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">The Local Hub</h1>
              <p className="text-gray-500 text-lg">Discover local products in your area</p>
            </div>
          </Link>
            
          {/* Center Navigation */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition font-medium">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600 transition font-medium">
              About
            </Link>
          </nav>

          {/* Login */}
          <Link 
            to="/admin" 
            className="bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Browse Food Brands</h2>
          <p className="text-gray-500">Explore local products and brands near you</p>
        </div>

        {/* Storage List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-2">Loading storages...</p>
          </div>
        ) : storages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No brands available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storages.map(storage => (
              <StorageCard
                key={storage.id}
                storage={storage}
                onView={setSelectedStorage}
                isPublic={true}
              />
            ))}
          </div>
        )}
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
