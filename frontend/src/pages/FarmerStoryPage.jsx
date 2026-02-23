import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { haptic } from '../hooks/useHaptic'
import FarmerStoryBoard from '../components/FarmerStoryBoard'
import config from '../config'

export default function FarmerStoryPage() {
    const { id } = useParams()
    const [storage, setStorage] = useState(null)
    const [loading, setLoading] = useState(true)
    const { darkMode, toggleDarkMode } = useTheme()
    const { user, isAuthenticated } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Scroll direction logic from HomePage
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                if (currentScrollY < 10) {
                    setIsHeaderVisible(true);
                } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsHeaderVisible(false); // Scrolling down
                } else if (currentScrollY < lastScrollY) {
                    setIsHeaderVisible(true); // Scrolling up
                }
                setLastScrollY(currentScrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/storages/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setStorage(data)
                }
            } catch (error) {
                console.error('Error fetching storage:', error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchStorage()
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#e8e0d0] transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
        )
    }

    if (!storage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#e8e0d0] p-4 text-center transition-colors">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Farmer Not Found</h2>
                <Link to="/" className="text-red-700 hover:text-red-900 underline">Return Home</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen mesh-gradient-bg transition-colors flex flex-col">
            {/* Header - Smart Hide/Show */}
            <header
                className={`glass fixed top-0 w-full z-50 text-gray-800 dark:text-gray-100 shadow-lg transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
            >
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
                            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">Home</Link>
                            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition font-medium">About</Link>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => { haptic('light'); toggleDarkMode(); }}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press icon-bounce"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? (
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                                )}
                            </button>

                            <Link
                                to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login'}
                                className="bg-[#e8e0d0] dark:bg-gray-700 hover:bg-[#ddd4c4] dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition btn-press"
                            >
                                {isAuthenticated && user?.role === 'admin' ? 'Dashboard' : 'Login'}
                            </Link>
                            {isAuthenticated && (
                                <Link to="/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8a990] dark:hover:text-[#e8e0d0] transition">
                                    <div className="w-8 h-8 rounded-full bg-[#e8e0d0] dark:bg-gray-700 flex items-center justify-center text-sm font-bold overflow-hidden">
                                        {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : (user?.name?.charAt(0).toUpperCase() || 'U')}
                                    </div>
                                </Link>
                            )}
                        </nav>

                        {/* Mobile Menu Button - simplified for brevity, full logic same as home if needed */}
                        <button
                            onClick={() => { haptic('light'); setMobileMenuOpen(!mobileMenuOpen); }}
                            className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>

                    {/* Mobile Menu logic */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                            <nav className="flex flex-col gap-3">
                                <Link to="/" className="text-gray-700 dark:text-gray-300 py-2">Home</Link>
                                <Link to="/about" className="text-gray-700 dark:text-gray-300 py-2">About</Link>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow">
                <FarmerStoryBoard storage={storage} />
            </main>

            {/* Footer from HomePage */}
            <footer className="glass mt-0 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src="/logo.png" alt="The Local Hub" className="h-10 object-contain" />
                                <span className="text-lg font-bold text-gray-800 dark:text-gray-100">The Local Hub</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Discover the local treasures. Connecting communities with local producers.</p>
                        </div>
                        {/* ... simplified footer content ... */}
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/about">About Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Get in Touch</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>hello@thelocalhub.com</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
