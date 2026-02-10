import { useState, useEffect, useRef } from 'react'
import config from '../config'

export default function StorageForm({ onSubmit, onCancel, editingStorage, onSave, onClose }) {
  const isEditing = !!editingStorage
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    rawMaterial: '',
    phone: '',
    website: '',
    category: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    story_points: {
      point1: { title: '', content: '', date: '', image: '' },
      point2: { title: '', content: '' },
      point3: { title: '', content: '' },
      point4: { title: '', content: '', date: '', image: '' },
      point5: { title: '', content: '' }
    }
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFarmerFile, setSelectedFarmerFile] = useState(null)
  const [farmerImagePreview, setFarmerImagePreview] = useState(null)
  const [selectedStoryPoint1File, setSelectedStoryPoint1File] = useState(null)
  const [storyPoint1ImagePreview, setStoryPoint1ImagePreview] = useState(null)
  const [selectedStoryPoint4File, setSelectedStoryPoint4File] = useState(null)
  const [storyPoint4ImagePreview, setStoryPoint4ImagePreview] = useState(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mapRef = useRef(null)
  const advancedMarkerClassRef = useRef(null)

  // Pre-populate form when editing
  useEffect(() => {
    if (editingStorage) {
      setFormData({
        name: editingStorage.name || '',
        description: editingStorage.description || '',
        address: editingStorage.address || '',
        latitude: editingStorage.latitude || '',
        longitude: editingStorage.longitude || '',
        rawMaterial: editingStorage.rawMaterial || '',
        phone: editingStorage.phone || '',
        website: editingStorage.website || '',
        category: editingStorage.category || '',
        producerName: editingStorage.producer_name || '',
        instagram: editingStorage.instagram || '',
        facebook: editingStorage.facebook || '',
        twitter: editingStorage.twitter || '',
        tiktok: editingStorage.tiktok || '',
        story_points: editingStorage.story_points
          ? (typeof editingStorage.story_points === 'string'
            ? JSON.parse(editingStorage.story_points)
            : editingStorage.story_points)
          : {
            point1: { title: '', content: '', date: '', image: '' },
            point2: { title: '', content: '' },
            point3: { title: '', content: '' },
            point4: { title: '', content: '', date: '', image: '' },
            point5: { title: '', content: '' }
          }
      })

      // Also set previews if images exist in story points history
      if (editingStorage.story_points) {
        try {
          const sp = typeof editingStorage.story_points === 'string'
            ? JSON.parse(editingStorage.story_points)
            : editingStorage.story_points;

          if (sp.point1?.image && !sp.point1.image.startsWith('data:')) {
            setStoryPoint1ImagePreview(`${config.API_BASE_URL}/api/uploads/${sp.point1.image}`);
          }
          if (sp.point4?.image && !sp.point4.image.startsWith('data:')) {
            setStoryPoint4ImagePreview(`${config.API_BASE_URL}/api/uploads/${sp.point4.image}`);
          }
        } catch (e) {
          console.error("Error parsing story points for preview", e);
        }
      }

      // Parse story_points if exist
      if (editingStorage.story_points) {
        try {
          const parsed = typeof editingStorage.story_points === 'string'
            ? JSON.parse(editingStorage.story_points)
            : editingStorage.story_points
          setFormData(prev => ({ ...prev, story_points: parsed }))
        } catch (e) {
          console.error('Error parsing story_points:', e)
        }
      }
      // Set existing image preview if available
      if (editingStorage.image) {
        const imageUrl = editingStorage.image.startsWith('data:')
          ? editingStorage.image
          : `${config.API_BASE_URL}/api/uploads/${editingStorage.image}`
        setImagePreview(imageUrl)
      }
      // Set existing featured farmer image preview if available
      if (editingStorage.featured_farmer_image) {
        const farmerImageUrl = editingStorage.featured_farmer_image.startsWith('data:')
          ? editingStorage.featured_farmer_image
          : `${config.API_BASE_URL}/api/uploads/${editingStorage.featured_farmer_image}`
        setFarmerImagePreview(farmerImageUrl)
      }
    }
  }, [editingStorage])

  useEffect(() => {
    // This effect will run after component mounts and DOM is ready
    const initializeMap = async () => {
      // Check if everything is ready
      if (!mapRef.current) {
        return
      }

      if (!window.google?.maps) {
        return
      }

      try {
        const { Map } = await window.google.maps.importLibrary("maps")
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker")
        advancedMarkerClassRef.current = AdvancedMarkerElement

        // If editing and has coordinates, center on those
        const centerLat = editingStorage?.latitude ? parseFloat(editingStorage.latitude) : 38.8
        const centerLng = editingStorage?.longitude ? parseFloat(editingStorage.longitude) : 23.8
        const zoomLevel = editingStorage?.latitude ? 15 : 10

        const googleMap = new Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: zoomLevel,
          mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
        })
        setMap(googleMap)
        setMapsLoaded(true)

        // If editing, place existing marker
        if (editingStorage?.latitude && editingStorage?.longitude) {
          placeMarker(googleMap, centerLat, centerLng, AdvancedMarkerElement)
        }

        googleMap.addListener('click', (event) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          placeMarker(googleMap, lat, lng, AdvancedMarkerElement)
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          }))
        })
      } catch (error) {
        console.error('❌ Error initializing map:', error)
      }
    }

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 200)
    return () => clearTimeout(timer)
  }, [editingStorage])

  const placeMarker = (googleMap, lat, lng, AdvancedMarkerElementClass) => {
    if (marker) {
      marker.map = null // AdvancedMarkerElement removal
    }

    const MarkerClass = AdvancedMarkerElementClass || advancedMarkerClassRef.current || window.google.maps.marker?.AdvancedMarkerElement;

    if (!MarkerClass) {
      console.error("AdvancedMarkerElement not loaded yet");
      return;
    }

    const newMarker = new MarkerClass({
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

    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'story_points') {
          // Stringify story_points object before sending
          formDataToSend.append(key, JSON.stringify(formData[key]))
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append image file if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }

      // Append featured farmer image file if selected
      if (selectedFarmerFile) {
        formDataToSend.append('featured_farmer_image', selectedFarmerFile)
      }

      // Append story point image files if selected
      if (selectedStoryPoint1File) {
        formDataToSend.append('story_point1_image', selectedStoryPoint1File)
      }

      if (selectedStoryPoint4File) {
        formDataToSend.append('story_point4_image', selectedStoryPoint4File)
      }


      if (isEditing) {
        // PUT request for updating
        const response = await fetch(`${config.API_BASE_URL}/api/storages/${editingStorage.id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formDataToSend
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Update error:', errorText)
          alert('Error updating storage: ' + errorText)
          return
        }

        // Call onSave callback for editing
        if (onSave) onSave()
      } else {
        // POST request for creating
        await onSubmit(formDataToSend)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      rawMaterial: '',
      phone: '',
      website: '',
      category: '',
      instagram: '',
      facebook: '',
      twitter: '',
      tiktok: '',
      story_points: {
        point1: { title: '', content: '', date: '', image: '' },
        point2: { title: '', content: '' },
        point3: { title: '', content: '' },
        point4: { title: '', content: '', date: '', image: '' },
        point5: { title: '', content: '' }
      }
    })
    setSelectedFile(null)
    setImagePreview(null)
    setSelectedFarmerFile(null)
    setFarmerImagePreview(null)
  }

  const handleFarmerImageChange = (e) => {
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

      setSelectedFarmerFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFarmerImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedFarmerFile(null)
      setFarmerImagePreview(null)
    }
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

  const handleStoryPoint1ImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedStoryPoint1File(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setStoryPoint1ImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedStoryPoint1File(null)
      setStoryPoint1ImagePreview(null)
    }
  }

  const handleStoryPoint4ImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedStoryPoint4File(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setStoryPoint4ImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedStoryPoint4File(null)
      setStoryPoint4ImagePreview(null)
    }
  }


  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload */}
        <div className="md:col-span-2">
          <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand Card Image
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                id="product-image"
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

        {/* Featured Farmer Image Upload */}
        <div className="md:col-span-2">
          <label htmlFor="farmer-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🌟 Featured Farmer Photo <span className="text-sm text-gray-500">(for "Meet the Farmer of the Week")</span>
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                id="farmer-image"
                type="file"
                accept="image/*"
                onChange={handleFarmerImageChange}
                className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-200 file:text-amber-800 file:font-semibold hover:file:bg-amber-300 file:cursor-pointer transition-all"
              />
            </div>
            {farmerImagePreview && (
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-amber-300 dark:border-amber-600 flex-shrink-0 shadow-lg">
                <img src={farmerImagePreview} alt="Farmer Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand *
          </label>
          <input
            id="brand-name"
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
          <label htmlFor="producer-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Producer Name
          </label>
          <input
            id="producer-name"
            type="text"
            name="producerName"
            value={formData.producerName || ''}
            onChange={handleChange}
            placeholder="e.g., John Smith, Smith Family Farm"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          />
        </div>



        <div>
          <label htmlFor="raw-material" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What is the raw material?
          </label>
          <input
            id="raw-material"
            type="text"
            name="rawMaterial"
            value={formData.rawMaterial}
            onChange={handleChange}
            placeholder="e.g., Organic cotton, Recycled plastic, Local wood..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          >
            <option value="">Select category...</option>
            <option value="honey">Honey</option>
            <option value="fruits">Fruits</option>
            <option value="vegetables">Vegetables</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="bakery">Bakery</option>
            <option value="beverages">Beverages</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., +30 123 456 7890"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            id="website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="e.g., https://example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          />
        </div>

        {/* Social Media Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            Social Media Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                id="instagram"
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="e.g., https://instagram.com/yourfarm"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook
              </label>
              <input
                id="facebook"
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="e.g., https://facebook.com/yourfarm"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter/X
              </label>
              <input
                id="twitter"
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="e.g., https://twitter.com/yourfarm"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TikTok
              </label>
              <input
                id="tiktok"
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                placeholder="e.g., https://tiktok.com/@yourfarm"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details about this storage..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Search
          </label>
          <div className="flex gap-2">
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address to search"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-colors"
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
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {mapsLoaded ? 'Click on the map to place a pin' : 'Loading map...'}
          </p>
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

      {/* Story Points Section */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-amber-200 dark:border-gray-600">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Farmer Story Board Content
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Customize the 5 story points that appear on the farmer story page.</p>

        <div className="space-y-6">
          {/* Point 1: The Beginning (Polar oid) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Photo Point - The Beginning
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title (e.g., The Beginning)"
                value={formData.story_points?.point1?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point1: { ...prev.story_points?.point1, title: e.target.value }
                  }
                }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Date (e.g., Est. 2012)"
                value={formData.story_points?.point1?.date || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point1: { ...prev.story_points?.point1, date: e.target.value }
                  }
                }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image Upload
                </label>
                {storyPoint1ImagePreview && (
                  <div className="mb-3">
                    <img src={storyPoint1ImagePreview} alt="Point 1 preview" className="h-32 w-auto rounded-lg object-cover border-2 border-amber-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoryPoint1ImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uses brand image by default if not uploaded</p>
              </div>
            </div>
          </div>

          {/* Point 2: Our Mission (Note) */}
          <div className="bg-yellow-50 dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Sticky Note - Our Mission
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g., Our Mission)"
                value={formData.story_points?.point2?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point2: { ...prev.story_points?.point2, title: e.target.value }
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <textarea
                placeholder="Content (uses description by default)"
                value={formData.story_points?.point2?.content || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point2: { ...prev.story_points?.point2, content: e.target.value }
                  }
                }))}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Point 3: Production Stats (Paper) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Paper - Production Stats
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g., Production Stats)"
                value={formData.story_points?.point3?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point3: { ...prev.story_points.point3, title: e.target.value }
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <textarea
                placeholder="Stats (one per line, e.g., '100% Organic\nNo Pesticides\nSolar Powered')"
                value={formData.story_points?.point3?.content || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point3: { ...prev.story_points.point3, content: e.target.value }
                  }
                }))}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Point 4: Current Harvest (Polaroid) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              Photo Point - Current Harvest
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title (e.g., Current Harvest)"
                value={formData.story_points?.point4?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point4: { ...prev.story_points.point4, title: e.target.value }
                  }
                }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Date (e.g., Season 2024)"
                value={formData.story_points?.point4?.date || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point4: { ...prev.story_points.point4, date: e.target.value }
                  }
                }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image Upload
                </label>
                {storyPoint4ImagePreview && (
                  <div className="mb-3">
                    <img src={storyPoint4ImagePreview} alt="Point 4 preview" className="h-32 w-auto rounded-lg object-cover border-2 border-amber-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoryPoint4ImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uses featured farmer image by default if not uploaded</p>
              </div>
            </div>
          </div>

          {/* Point 5: Future Plans (Note) */}
          <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">5</span>
              Sticky Note - Future Plans
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g., Future Plans)"
                value={formData.story_points?.point5?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point5: { ...prev.story_points.point5, title: e.target.value }
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <textarea
                placeholder="Content (e.g., Expanding greenhouse capacity)"
                value={formData.story_points?.point5?.content || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  story_points: {
                    ...prev.story_points,
                    point5: { ...prev.story_points.point5, content: e.target.value }
                  }
                }))}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Brand' : 'Create Brand')}
        </button>
        <button
          type="button"
          onClick={isEditing ? (onClose || onCancel) : onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
