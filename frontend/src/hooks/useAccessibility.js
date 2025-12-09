import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for screen reader live announcements
 * Announces messages to screen readers using ARIA live regions
 */
export function useAnnounce() {
  const announceRef = useRef(null)

  useEffect(() => {
    // Create live region element if it doesn't exist
    if (!document.getElementById('live-announcer')) {
      const liveRegion = document.createElement('div')
      liveRegion.id = 'live-announcer'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'live-region'
      document.body.appendChild(liveRegion)
      announceRef.current = liveRegion
    } else {
      announceRef.current = document.getElementById('live-announcer')
    }

    return () => {
      // Cleanup on unmount (optional - keep for SPA navigation)
    }
  }, [])

  const announce = useCallback((message, priority = 'polite') => {
    if (!announceRef.current) return

    // Set priority
    announceRef.current.setAttribute('aria-live', priority)
    
    // Clear and set message (forces re-announcement)
    announceRef.current.textContent = ''
    
    // Use setTimeout to ensure the DOM update triggers announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message
      }
    }, 100)
  }, [])

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive')
  }, [announce])

  return { announce, announceAssertive }
}

/**
 * Hook for focus trapping within a container (modals, dialogs)
 * Traps focus within the container when active
 */
export function useFocusTrap(isActive = false) {
  const containerRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store currently focused element
    previousFocusRef.current = document.activeElement

    // Get all focusable elements
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return containerRef.current?.querySelectorAll(focusableSelectors) || []
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Focus first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      setTimeout(() => focusableElements[0].focus(), 0)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previous element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook to handle Escape key press (for closing modals, menus)
 */
export function useEscapeKey(callback, isActive = true) {
  useEffect(() => {
    if (!isActive) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [callback, isActive])
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion() {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e) => {
      prefersReducedMotion.current = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion.current
}

/**
 * Hook to manage focus on route changes for SPA
 */
export function useRouteFocus(pageTitle) {
  const headingRef = useRef(null)
  const { announce } = useAnnounce()

  useEffect(() => {
    // Update document title
    if (pageTitle) {
      document.title = `${pageTitle} | The Local Hub`
    }

    // Focus on main heading for screen readers
    if (headingRef.current) {
      headingRef.current.focus()
    }

    // Announce page change
    if (pageTitle) {
      announce(`Navigated to ${pageTitle}`)
    }
  }, [pageTitle, announce])

  return headingRef
}

export default {
  useAnnounce,
  useFocusTrap,
  useEscapeKey,
  useReducedMotion,
  useRouteFocus
}
