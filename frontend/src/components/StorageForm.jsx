import { useState, useEffect, useRef } from 'react'

export default function StorageForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    rawMaterial: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    // This effect will run after component mounts and DOM is ready
    const initializeMap = () => {
      // Check if everything is ready
      if (!mapRef.current) {
        console.log('mapRef not ready, retrying...')
        return
      }

      if (!window.google?.maps) {
        console.log('Google Maps not ready, retrying...')
        return
      }

      try {
        console.log('✅ Initializing Google Maps...')
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 38.8, lng: 23.8 }, // Evia (Euboea) Island, Greece
          zoom: 10,
        })
        setMap(googleMap)
        setMapsLoaded(true)
        console.log('✅ Google Maps loaded!')

        googleMap.addListener('click', (event) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          placeMarker(googleMap, lat, lng)
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          }))
        })
      } catch (error) {
        console.error('❌ Error:', error)
      }
    }

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 200)
    return () => clearTimeout(timer)
  }, [])

  const placeMarker = (googleMap, lat, lng) => {
    if (marker) {
      marker.setMap(null)
    }
    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      title: 'Storage Location'
    })
    setMarker(newMarker)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressSearch = () => {
    if (!formData.address.trim() || !window.google?.maps) {
      alert('Maps not loaded yet or address is empty')
      return
    }
    
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: formData.address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        
        map.setCenter(location)
        map.setZoom(15)
        placeMarker(map, lat, lng)
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }))
      } else {
        alert('Address not found. Please try another address or click on the map.')
      }
    })
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Storage name is required')
      return
    }
    
    // Create FormData for file upload
    const formDataToSend = new FormData()
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key])
      }
    })
    
    // Append image file if selected
    if (selectedFile) {
      formDataToSend.append('image', selectedFile)
    }
    
    await onSubmit(formDataToSend)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      rawMaterial: ''
    })
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedFile(null)
      setImagePreview(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Image
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#e8e0d0] file:text-gray-700 file:font-semibold hover:file:bg-[#ddd4c4] file:cursor-pointer transition-all"
              />
            </div>
            {imagePreview && (
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/30 dark:border-gray-600/50 flex-shrink-0 shadow-lg">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Local Farm Brand"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
            required
          />
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What is the raw material?
          </label>
          <input
            type="text"
            name="rawMaterial"
            value={formData.rawMaterial}
            onChange={handleChange}
            placeholder="e.g., Organic cotton, Recycled plastic, Local wood..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details about this storage..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Search
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address to search"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-bold py-2 px-4 rounded-lg transition"
            >
              Search
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📍 {mapsLoaded ? 'Click on the map to place a pin' : 'Loading map...'}
          </label>
          <div className="relative">
            {!mapsLoaded && (
              <div className="absolute top-0 left-0 w-full h-80 bg-gray-100 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Loading Google Maps...</p>
                  <p className="text-sm text-gray-500">
                    You can manually enter coordinates below
                  </p>
                </div>
              </div>
            )}
            <div
              ref={mapRef}
              className="w-full h-80 border border-gray-300 rounded-lg shadow-md bg-gray-50"
            />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Removed Latitude and Longitude fields */}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-bold py-2 px-4 rounded-lg transition"
        >
          Create Brand
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
