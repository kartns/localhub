// Frontend Configuration
// Handles different environments (development vs production)

const config = {
  // API Base URL
  // In development: proxied through Vite (localhost:3000 -> localhost:3001)
  // In production: direct URL to your Render backend
  API_BASE_URL: import.meta.env.PROD 
    ? import.meta.env.VITE_API_URL || 'https://localhub-api.onrender.com'
    : '',  // Empty string = use Vite proxy in development
  
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
