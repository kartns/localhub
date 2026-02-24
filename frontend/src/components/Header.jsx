import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { haptic } from '../hooks/useHaptic'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * Shared site header.
 * @param {boolean} scrollHide - When true, the header auto-hides on scroll-down
 *                               and reappears on scroll-up (used on HomePage).
 *                               When false (default), it stays sticky at top.
 */
export default function Header({ scrollHide = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const { darkMode, toggleDarkMode } = useTheme()
    const { user, isAuthenticated } = useAuth()
    const { t } = useLanguage()

    // Smart scroll-hide behaviour (only active when scrollHide=true)
    useEffect(() => {
        if (!scrollHide) return
        const controlNavbar = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY < 10) {
                setIsHeaderVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHeaderVisible(false)
            } else if (currentScrollY < lastScrollY) {
                setIsHeaderVisible(true)
            }
            setLastScrollY(currentScrollY)
        }
        window.addEventListener('scroll', controlNavbar)
        return () => window.removeEventListener('scroll', controlNavbar)
    }, [scrollHide, lastScrollY])

    const headerClass = scrollHide
        ? `glass fixed top-0 w-full z-50 text-gray-800 dark:text-gray-100 shadow-lg transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`
        : 'glass sticky top-0 z-50 text-gray-800 dark:text-gray-100 shadow-lg'

    return (
        <header className={headerClass}>
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
                    <nav className="hidden lg:flex items-center flex-1 ml-8">
                        {/* Group 1 — Nav links, nudged toward center */}
                        <div className="flex items-center gap-6 mx-auto">
                            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                                {t('Home', 'Αρχική')}
                            </Link>
                            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">
                                {t('About', 'Σχετικά')}
                            </Link>
                        </div>

                        {/* Group 2 — Utility buttons, right-aligned, tight gap */}
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />

                            <button
                                onClick={() => { haptic('light'); toggleDarkMode() }}
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
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => { haptic('light'); setMobileMenuOpen(!mobileMenuOpen) }}
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
                                {t('Home', 'Αρχική')}
                            </Link>
                            <Link
                                to="/about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium py-2"
                            >
                                {t('About', 'Σχετικά')}
                            </Link>

                            <hr className="border-gray-200 dark:border-gray-700" />

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

                            {/* Icon buttons row — dark mode + language */}
                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {darkMode ? t('Light Mode', 'Φωτεινό') : t('Dark Mode', 'Σκοτεινό')}
                                </span>
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press icon-bounce"
                                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    {darkMode ? (
                                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                    {t('Language', 'Γλώσσα')}
                                </span>
                                <LanguageSwitcher mobile />
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
