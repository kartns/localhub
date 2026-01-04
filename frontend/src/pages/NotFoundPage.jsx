import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

export default function NotFoundPage() {
  const { darkMode } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md mx-auto">
        {/* 404 Icon */}
        <div className="text-8xl mb-8">
          📦❓
        </div>
        
        {/* Error Message */}
        <h1 className={`text-4xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Page Not Found
        </h1>
        
        <p className={`text-lg mb-8 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          The storage location you're looking for doesn't exist. 
          It might have been moved or the URL is incorrect.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block w-full bg-[#e8e0d0] hover:bg-[#ddd4c4] text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            🏠 Return Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className={`w-full border-2 font-semibold py-3 px-6 rounded-lg transition duration-200 ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            ← Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className={`mt-12 p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Need Help?
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Browse all available brands and storage locations on our{' '}
            <Link 
              to="/" 
              className="text-[#8B7355] hover:underline font-medium"
            >
              homepage
            </Link>
            {' '}or learn more{' '}
            <Link 
              to="/about" 
              className="text-[#8B7355] hover:underline font-medium"
            >
              about LocalHub
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}