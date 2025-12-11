export default function App() {
  const getTypeIcon = (type) => {
    const icons = {
      farm: '🌾',
      market: '🛒',
      warehouse: '🏭',
      storage: '📦'
    }
    return icons[type] || '📦'
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTypeIcon('storage')}</span>
            <h3 className="text-xl font-bold text-gray-800">Sample Storage</h3>
          </div>
          <p className="text-sm text-gray-600">📍 123 Main Street, City</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 flex-grow">Community food storage with fresh vegetables and local produce</p>

      {/* Stats */}
      <div className="bg-[#f5f0e8] rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Items in storage:</span>
          <span className="font-bold text-primary text-lg">12</span>
        </div>
      </div>

      {/* Location */}
      <div className="text-xs text-gray-500 mb-4">
        📡 40.7128, -74.0060
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-semibold py-2 px-3 rounded-lg transition text-sm">
          View Details
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
          🗑️
        </button>
      </div>
    </div>
  )
}
