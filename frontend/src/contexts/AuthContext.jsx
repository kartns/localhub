import { createContext, useContext, useState, useEffect } from 'react'
import { useLoading } from './LoadingContext'
import config from '../config'

const AuthContext = createContext()

const API_URL = `${config.API_BASE_URL}/api/auth`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null) // No longer stored in localStorage
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()

  // Load user on mount by calling /me endpoint (will use httpOnly cookie)
  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        credentials: 'include', // Include httpOnly cookies
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // No valid auth, clear state
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    showLoading('Signing you in...')
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Don't store token in localStorage anymore - it's in httpOnly cookie
      setUser(data.user)

      return data
    } finally {
      hideLoading()
    }
  }

  const register = async (name, email, password) => {
    showLoading('Creating your account...')
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

    // Don't store token in localStorage anymore - it's in httpOnly cookie
    setUser(data.user)

    return data
    } finally {
      hideLoading()
    }
  }

  const logout = async () => {
    try {
      // Call backend logout to clear httpOnly cookie
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless
      setUser(null)
      setToken(null)
    }
  }

  const updateProfile = async (updates) => {
    showLoading('Updating profile...')
    
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use httpOnly cookies
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }

      setUser(data)
      return data
    } finally {
      hideLoading()
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    showLoading('Changing password...')
    
    try {
      const response = await fetch(`${API_URL}/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use httpOnly cookies
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed')
      }

      return data
    } finally {
      hideLoading()
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser: fetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
