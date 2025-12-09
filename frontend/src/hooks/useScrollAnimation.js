import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Margin around root, default '0px'
 * @param {boolean} options.triggerOnce - Only trigger animation once, default true
 * @returns {[React.RefObject, boolean]} - [ref to attach to element, isVisible state]
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options

  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isVisible]
}

/**
 * Custom hook for staggered scroll animations on multiple items
 * @param {number} itemCount - Number of items to animate
 * @param {number} staggerDelay - Delay between each item in ms, default 100
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.RefObject, boolean[], number[]]} - [container ref, visibility array, delay array]
 */
export function useStaggeredScrollAnimation(itemCount, staggerDelay = 100, options = {}) {
  const [containerRef, isContainerVisible] = useScrollAnimation(options)
  const [visibleItems, setVisibleItems] = useState(Array(itemCount).fill(false))

  useEffect(() => {
    if (isContainerVisible) {
      // Stagger the visibility of each item
      const timeouts = []
      for (let i = 0; i < itemCount; i++) {
        const timeout = setTimeout(() => {
          setVisibleItems(prev => {
            const newState = [...prev]
            newState[i] = true
            return newState
          })
        }, i * staggerDelay)
        timeouts.push(timeout)
      }

      return () => {
        timeouts.forEach(clearTimeout)
      }
    }
  }, [isContainerVisible, itemCount, staggerDelay])

  // Reset when item count changes
  useEffect(() => {
    setVisibleItems(Array(itemCount).fill(false))
  }, [itemCount])

  const delays = Array.from({ length: itemCount }, (_, i) => i * staggerDelay)

  return [containerRef, visibleItems, delays]
}

export default useScrollAnimation
