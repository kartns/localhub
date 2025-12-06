import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StorageList from '../components/StorageList'
import StorageForm from '../components/StorageForm'
import StorageDetail from '../components/StorageDetail'

export default function AdminPage() {
  const [storages, setStorages] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const handleAddStorage = async (storageData) => {
    try {
      console.log('Sending storage data:', storageData)
      const response = await fetch('/api/storages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        alert('Error creating brand: ' + errorText)
        return
      }
      
      setShowForm(false)
      await fetchStorages()
    } catch (error) {
      console.error('Error adding storage:', error)
    }
  }

  const handleDeleteStorage = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch(`/api/storages/${id}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchStorages()
        }
      } catch (error) {
        console.error('Error deleting storage:', error)
      }
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
              <p className="text-gray-500 text-lg">Admin Dashboard</p>
            </div>
          </Link>
            
          {/* Center Navigation */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition font-medium">
              Home
            </Link>
            <Link to="/admin" className="text-green-600 font-semibold">
              Admin
            </Link>
          </nav>

          {/* Admin Badge */}
          <div className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg">
            👤 Admin
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Button */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105"
          >
            {showForm ? '✕ Cancel' : '+ Add Brand'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <StorageForm onSubmit={handleAddStorage} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Storage List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-2">Loading storages...</p>
          </div>
        ) : storages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No brands yet. Create one to get started!</p>
          </div>
        ) : (
          <StorageList storages={storages} onDelete={handleDeleteStorage} onView={setSelectedStorage} refreshKey={refreshKey} />
        )}
      </main>

      {/* Storage Detail Modal */}
      {selectedStorage && (
        <StorageDetail 
          storage={selectedStorage} 
          onClose={() => {
            setSelectedStorage(null)
            setRefreshKey(k => k + 1)
          }}
          onDelete={handleDeleteStorage}
        />
      )}
    </div>
  )
}
