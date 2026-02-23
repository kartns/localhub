import config from '../config'

/**
 * Helper to get image URL from path
 * Handles:
 * - null/undefined/empty string -> returns null
 * - data: URLs -> returns as is
 * - http/https URLs -> returns as is
 * - relative paths -> prepends API_BASE_URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) return imagePath
    return `${config.API_BASE_URL}/api/uploads/${imagePath.trim()}`
}
