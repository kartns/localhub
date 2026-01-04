import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

const allCategories = [
  { value: 'all', label: 'All Categories', icon: null, isAllOption: true },
  { value: 'fruits', label: 'Fruits', icon: '/fruits.png' },
  { value: 'honey', label: 'Honey', icon: '/honey.png' },
  { value: 'proteins', label: 'Proteins', icon: '/proteins.png' },
  { value: 'herbs', label: 'Herbs', icon: '/herbs.png' },
  { value: 'other', label: 'Other', icon: null, emoji: '📦' },
  { value: 'custom', label: 'Add Custom Category...', icon: null, emoji: '✨', isCustomOption: true }
]

export default function CategoryDropdown({ value, onChange, className = '', showAllOption = true, showCustomOption = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Filter categories based on props
  const categories = useMemo(() => {
    return allCategories.filter(cat => {
      if (cat.isAllOption && !showAllOption) return false
      if (cat.isCustomOption && !showCustomOption) return false
      return true
    })
  }, [showAllOption, showCustomOption])

  const selectedCategory = categories.find(cat => cat.value === value) || categories[0]

  // Update menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const isMobile = viewportWidth < 768 // md breakpoint
      
      if (isMobile) {
        // On mobile, center the dropdown and make it full width with margin
        setMenuPosition({
          top: rect.bottom + window.scrollY + 8,
          left: 16, // 16px margin from edges
          width: viewportWidth - 32 // Full width minus margins
        })
      } else {
        // Desktop behavior - position relative to button
        setMenuPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 300) // Minimum 300px on desktop
        })
      }
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  const handleSelect = (category) => {
    onChange({ target: { value: category.value } })
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter by category"
        className="w-full px-4 py-3 border border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#e8e0d0] focus:border-transparent transition-all cursor-pointer focus-ring flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          {selectedCategory.icon ? (
            <img src={selectedCategory.icon} alt="" className="w-5 h-5 object-contain" />
          ) : selectedCategory.emoji ? (
            <span>{selectedCategory.emoji}</span>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          )}
          <span>{selectedCategory.label}</span>
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - rendered via portal */}
      {isOpen && createPortal(
        <ul
          ref={dropdownRef}
          role="listbox"
          aria-label="Category options"
          style={{
            position: 'absolute',
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            zIndex: 9999,
            maxHeight: '60vh',
            overflowY: 'auto'
          }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {categories.map((category) => (
            <li
              key={category.value}
              role="option"
              aria-selected={value === category.value}
              onClick={() => handleSelect(category)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                value === category.value
                  ? 'bg-[#e8e0d0]/50 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              {category.icon ? (
                <img src={category.icon} alt="" className="w-5 h-5 object-contain" />
              ) : category.emoji ? (
                <span className="w-5 h-5 flex items-center justify-center">{category.emoji}</span>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
              <span className="text-gray-900 dark:text-gray-100">{category.label}</span>
              {value === category.value && (
                <svg className="w-5 h-5 text-[#b8a990] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  )
}
