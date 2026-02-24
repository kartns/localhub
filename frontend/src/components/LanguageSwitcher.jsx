import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { haptic } from '../hooks/useHaptic'

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧', isGreek: false },
    { code: 'el', label: 'Ελληνικά', flag: '🇬🇷', isGreek: true },
]

export default function LanguageSwitcher({ mobile = false }) {
    const [open, setOpen] = useState(false)
    const [dropdownStyle, setDropdownStyle] = useState({})
    const { isGreek, toggleLanguage } = useLanguage()
    const btnRef = useRef(null)

    // Position the portal dropdown relative to the trigger button
    const updatePosition = () => {
        if (!btnRef.current) return
        const rect = btnRef.current.getBoundingClientRect()
        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 6,
            // For mobile (left-align), for desktop (right-align)
            left: mobile ? rect.left : undefined,
            right: mobile ? undefined : window.innerWidth - rect.right,
            width: 176, // w-44
            zIndex: 9999,
        })
    }

    // Open/close
    const toggleOpen = () => {
        if (!open) updatePosition()
        haptic('light')
        setOpen((v) => !v)
    }

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (btnRef.current && !btnRef.current.contains(e.target)) {
                // Check it's not inside the portal dropdown
                const dropdown = document.getElementById('lang-dropdown-portal')
                if (!dropdown || !dropdown.contains(e.target)) {
                    setOpen(false)
                }
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // Reposition on scroll/resize
    useEffect(() => {
        if (!open) return
        const reposition = () => updatePosition()
        window.addEventListener('scroll', reposition, true)
        window.addEventListener('resize', reposition)
        return () => {
            window.removeEventListener('scroll', reposition, true)
            window.removeEventListener('resize', reposition)
        }
    }, [open])

    const handleSelect = (lang) => {
        haptic('light')
        if (lang.isGreek !== isGreek) toggleLanguage()
        setOpen(false)
    }

    const dropdown = open ? createPortal(
        <div
            id="lang-dropdown-portal"
            role="listbox"
            style={dropdownStyle}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in"
        >
            {LANGUAGES.map((lang, i) => {
                const selected = lang.isGreek === isGreek
                return (
                    <button
                        key={lang.code}
                        role="option"
                        aria-selected={selected}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => handleSelect(lang)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left cursor-pointer
                          ${i === 0 ? '' : 'border-t border-gray-100 dark:border-gray-700'}
                          ${selected
                                ? 'bg-[#f5f0e8] dark:bg-gray-700/60 font-semibold text-gray-800 dark:text-gray-100'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                            }`}
                    >
                        <span className="text-xl leading-none pointer-events-none">{lang.flag}</span>
                        <span className="flex-1 pointer-events-none">{lang.label}</span>
                        {selected && (
                            <svg className="w-4 h-4 text-[#b8a990] dark:text-[#d4c9b8] flex-shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                )
            })}
        </div>,
        document.body
    ) : null

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={toggleOpen}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press icon-bounce cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Select language"
            >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            </button>
            {dropdown}
        </div>
    )
}
