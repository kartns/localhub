import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { haptic } from '../hooks/useHaptic'

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen mesh-gradient-bg transition-colors">
      {/* Header */}
      <header className="glass sticky top-0 z-50 text-gray-800 dark:text-gray-100 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-4 cursor-pointer">
              <img src="/logo.png" alt="The Local Hub logo" className="h-12 md:h-20 object-contain" />
              <div>
                <h1 className="text-fluid-2xl md:text-fluid-4xl font-bold text-gray-800 dark:text-gray-100">The Local Hub</h1>
                <p className="text-gray-500 dark:text-gray-400 text-fluid-xs md:text-fluid-base hidden sm:block">Discover the local treasures</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                About
              </Link>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  haptic('light')
                  toggleDarkMode()
                }}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press icon-bounce"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <Link
                to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login'}
                className="bg-[#e8e0d0] dark:bg-gray-700 hover:bg-[#ddd4c4] dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition btn-press"
              >
                {isAuthenticated && user?.role === 'admin' ? 'Dashboard' : 'Login'}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e8e0d0] dark:bg-gray-700 flex items-center justify-center text-sm font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                haptic('light')
                setMobileMenuOpen(!mobileMenuOpen)
              }}
              className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
              <nav className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  About
                </Link>
                <Link
                  to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  {isAuthenticated && user?.role === 'admin' ? 'Dashboard' : 'Login'}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#e8e0d0] dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    Profile
                  </Link>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                >
                  {darkMode ? (
                    <>
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-12" tabIndex="-1" aria-label="About The Local Hub">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">About The Local Hub</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connecting communities with local producers. Discover the stories, people, and passion behind your favorite local products.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Our Mission */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Our Mission</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              The Local Hub helps you discover local producers, artisans, and their unique products. We aim to empower communities, support sustainability, and create meaningful connections between consumers and the people behind their food.
            </p>
          </section>

          {/* How It Works */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">How It Works</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              Search for brands or raw materials, filter results by proximity and category, and explore detailed profiles of local producers. Our platform is designed for accessibility and mobile-friendly use, making it easy to find exactly what you need.
            </p>
          </section>

          {/* Community & Impact */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Community & Impact</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              By using The Local Hub, you support local businesses and contribute to a more sustainable future. Every purchase from a local producer strengthens communities and reduces the environmental impact of long-distance food transport.
            </p>
          </section>

          {/* Contact & Feedback */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contact & Feedback</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              We value your feedback! Reach out with suggestions or questions at <a href="mailto:hello@thelocalhub.com" className="text-amber-600 dark:text-amber-400 hover:underline">hello@thelocalhub.com</a>. Your input helps us improve and better serve the community.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="glass mt-24 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="The Local Hub" className="h-10 object-contain" />
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100">The Local Hub</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Discover the local treasures. Connecting communities with local producers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition text-sm">
                    Partner Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Get in Touch</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>hello@thelocalhub.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Supporting local communities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} The Local Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
