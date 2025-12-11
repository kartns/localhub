import { useState } from 'react'
import { haptic } from '../hooks/useHaptic'

/**
 * Interactive star rating component
 * @param {number} rating - Current rating (1-5)
 * @param {function} onRate - Callback when rating changes
 * @param {boolean} readonly - If true, stars are not clickable
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 */
export default function StarRating({ 
  rating = 0, 
  onRate, 
  readonly = false, 
  size = 'md',
  showLabel = false 
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (star) => {
    if (readonly) return
    haptic('light')
    onRate?.(star)
  }

  const handleMouseEnter = (star) => {
    if (readonly) return
    setHoverRating(star)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      <div 
        className="flex gap-0.5"
        role="group"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all duration-150 ${
              !readonly && 'hover:scale-125 active:scale-95'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded`}
          >
            <svg
              className={`${sizes[size]} transition-colors duration-150 ${
                star <= displayRating
                  ? 'text-yellow-400 drop-shadow-sm'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              fill={star <= displayRating ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </div>
      {showLabel && rating > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          ({rating}/5)
        </span>
      )}
    </div>
  )
}
