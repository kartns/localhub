// Frontend Configuration
// Handles different environments (development vs production)

const config = {
  // API Base URL
  // Development: Uses Vite proxy (empty string = proxy /api to backend)
  // Production: Uses same origin (Nginx proxies /api to backend) or environment variable
  API_BASE_URL: import.meta.env.PROD 
    ? (import.meta.env.VITE_API_URL || '')
    : (import.meta.env.VITE_DEV_API_URL || ''),  // Empty string = use proxy
  
  // App Info
  APP_NAME: 'LocalHub',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_GPS: true,
  ENABLE_HAPTICS: true,
  
  // Default Settings
  DEFAULT_PROXIMITY_DISTANCE: 10, // km
  MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
};

export default config;
