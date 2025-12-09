/**
 * Custom hook for haptic feedback on mobile devices
 * Uses the Vibration API when available
 */

// Vibration patterns (in milliseconds)
export const HAPTIC_PATTERNS = {
  light: [10],           // Quick tap
  medium: [20],          // Standard press
  heavy: [30],           // Strong press
  success: [10, 50, 10], // Double tap for success
  error: [50, 30, 50],   // Error feedback
  warning: [30, 20, 30], // Warning feedback
}

/**
 * Trigger haptic feedback
 * @param {string|number[]} pattern - Pattern name or custom pattern array
 */
export function haptic(pattern = 'light') {
  // Check if Vibration API is supported
  if (!navigator.vibrate) return false
  
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  
  const vibrationPattern = typeof pattern === 'string' 
    ? HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.light
    : pattern
  
  try {
    navigator.vibrate(vibrationPattern)
    return true
  } catch (e) {
    return false
  }
}

/**
 * React hook for haptic feedback
 * Returns haptic trigger functions
 */
export function useHaptic() {
  const triggerHaptic = (pattern = 'light') => haptic(pattern)
  
  return {
    haptic: triggerHaptic,
    lightTap: () => triggerHaptic('light'),
    mediumTap: () => triggerHaptic('medium'),
    heavyTap: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    error: () => triggerHaptic('error'),
    warning: () => triggerHaptic('warning'),
  }
}

export default useHaptic
