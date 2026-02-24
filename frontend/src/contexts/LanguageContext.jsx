import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
    const [isGreek, setIsGreek] = useState(() => {
        return localStorage.getItem('localhub_lang') === 'el'
    })

    useEffect(() => {
        localStorage.setItem('localhub_lang', isGreek ? 'el' : 'en')
        document.documentElement.lang = isGreek ? 'el' : 'en'
    }, [isGreek])

    const toggleLanguage = () => setIsGreek(prev => !prev)

    // Simple inline-translation helper: t('English text', 'Ελληνικό κείμενο')
    const t = (en, el) => isGreek ? el : en

    return (
        <LanguageContext.Provider value={{ isGreek, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
    return ctx
}
