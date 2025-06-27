// TMDB API utility functions
import { useRuntimeConfig } from 'nuxt/app'

/**
 * Fetches data from TMDB API
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Promise with the API response
 */
export const fetchFromTMDB = async (endpoint, params = {}) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.tmdbApiBaseUrl
  const apiToken = config.public.tmdbApiToken
  
  // Build URL with query parameters
  const url = new URL(`${baseURL}/${endpoint}`)
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching data from TMDB:', error)
    throw error
  }
}

/**
 * Get trending media (movies or TV shows)
 * @param {string} mediaType - Type of media ('movie' or 'tv')
 * @param {string} timeWindow - Time window for trending (day or week)
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} - Object containing results array and pagination info
 */
export const getTrending = async (mediaType = 'movie', timeWindow = 'week', page = 1) => {
  // Validate mediaType parameter
  if (!['movie', 'tv'].includes(mediaType)) {
    throw new Error('Invalid media type. Must be "movie" or "tv"');
  }
  
  try {
    const data = await fetchFromTMDB(`trending/${mediaType}/${timeWindow}`, { page })
    return {
      results: data.results || [],
      page: data.page || 1,
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0
    }
  } catch (error) {
    console.error(`Error fetching trending ${mediaType}:`, error)
    throw error
  }
}

/**
 * Get image URL with proper base path
 * @param {string} path - Image path from API
 * @param {string} size - Image size (w100, w300, w500, original, etc.)
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
