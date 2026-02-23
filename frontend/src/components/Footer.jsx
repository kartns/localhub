import { Link } from 'react-router-dom'

export default function Footer() {
    return (
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

                {/* Icon Credits */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-400 dark:text-gray-500 text-xs text-center mb-2">Icon Credits:</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                        <a href="https://www.flaticon.com/free-icons/fruits" title="fruits icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                            Fruits icons by Freepik - Flaticon
                        </a>
                        <a href="https://www.flaticon.com/free-icons/meat" title="meat icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                            Meat icons by Iconjam - Flaticon
                        </a>
                        <a href="https://www.flaticon.com/free-icons/honey" title="honey icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                            Honey icons by mikan933 - Flaticon
                        </a>
                        <a href="https://www.flaticon.com/free-icons/herbs" title="herbs icons" className="hover:text-gray-600 dark:hover:text-gray-300 transition" target="_blank" rel="noopener noreferrer">
                            Herbs icons by iconixarPro - Flaticon
                        </a>
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
    )
}
