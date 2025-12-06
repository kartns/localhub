import { useState, useEffect, useRef } from 'react'

export default function StorageDetail({ storage, onClose, onDelete }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [products, setProducts] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    image: ''
  })
  const [productImagePreview, setProductImagePreview] = useState(null)

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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this brand and all its products?')) {
      onDelete(storage.id)
      onClose()
    }
  }

  const handleProductImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImagePreview(reader.result)
        setNewProduct(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name.trim()) {
      alert('Product name is required')
      return
    }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_id: storage.id,
          ...newProduct
        })
      })

      if (response.ok) {
        await fetchProducts()
        setNewProduct({
          name: '',
          category: '',
          image: ''
        })
        setProductImagePreview(null)
        setShowAddProduct(false)
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('Delete this product?')) {
      try {
        const response = await fetch(`/api/items/${productId}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchProducts()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className={`${storage.image ? '' : `bg-gradient-to-br ${getCategoryColor(storage.category)}`} relative h-48`}>
          {storage.image ? (
            <img 
              src={storage.image} 
              alt={storage.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(storage.category)} flex items-center justify-center`}>
              <div className="text-7xl">{getCategoryEmoji(storage.category)}</div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Overlay with info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-white text-sm font-semibold opacity-80">Brand</p>
            <h2 className="text-3xl font-bold text-white">{storage.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full capitalize">
                {storage.category}
              </span>
              {storage.address && (
                <span className="text-white text-sm opacity-80">📍 {storage.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {storage.description && (
            <p className="text-gray-600 leading-relaxed">{storage.description}</p>
          )}

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📦 Products ({products.length})</h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                {showAddProduct ? '✕ Cancel' : '+ Add Product'}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="flex-1 text-sm"
                      />
                      {productImagePreview && (
                        <img src={productImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Organic Tomatoes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select category</option>
                      <option value="vegetables">🥬 Vegetables</option>
                      <option value="fruits">🍎 Fruits</option>
                      <option value="grains">🌾 Grains</option>
                      <option value="dairy">🥛 Dairy</option>
                      <option value="proteins">🍗 Proteins</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>


                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Product
                </button>
              </form>
            )}

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-4xl mb-2">📦</p>
                <p>No products yet. Add your first product!</p>
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

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      🗑️
                    </button>
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
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
            >
              <span>🗑️</span> Delete Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
