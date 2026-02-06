import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '../config'

export default function FarmerStoryBoard({ storage }) {
    const containerRef = useRef(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (!storage) return null

    // Parse custom story points from database
    let customPoints = {}
    try {
        if (storage.story_points) {
            customPoints = typeof storage.story_points === 'string'
                ? JSON.parse(storage.story_points)
                : storage.story_points
        }
    } catch (e) {
        console.error('Error parsing story_points:', e)
    }

    // DEBUG: Log the actual data
    console.log('=== FarmerStoryBoard Debug ===')
    console.log('storage.story_points raw:', storage.story_points)
    console.log('customPoints parsed:', customPoints)
    console.log('customPoints.point1:', customPoints.point1)
    console.log('customPoints.point4:', customPoints.point4)
    console.log('storage.image:', storage.image)

    // Placeholder image as data URL
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" fill="%239ca3af" font-size="14" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

    // Helper to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath || imagePath.trim() === '') return null
        if (imagePath.startsWith('data:') || imagePath.startsWith('http')) return imagePath
        return `${config.API_BASE_URL}/api/uploads/${imagePath.trim()}`
    }

    // Default story points structure with custom content merged in
    const storyPoints = [
        {
            id: 'origin',
            type: 'polaroid',
            title: customPoints.point1?.title || 'The Beginning',
            content: getImageUrl(customPoints.point1?.image) || getImageUrl(storage.image) || PLACEHOLDER_IMAGE,
            rotation: -3,
            date: customPoints.point1?.date || 'Est. 2012',
            x: 10,
            y: 10
        },
        {
            id: 'note-mission',
            type: 'note',
            color: 'bg-yellow-100',
            title: customPoints.point2?.title || 'Our Mission',
            content: customPoints.point2?.content || (storage.description ? storage.description.slice(0, 120) + '...' : 'Cultivating connections between earth and table, one harvest at a time.'),
            rotation: 2,
            x: 35,
            y: 25
        },
        {
            id: 'stats',
            type: 'paper',
            title: customPoints.point3?.title || 'Production Stats',
            content: customPoints.point3?.content || '100% Organic\nNo Pesticides\nSolar Powered',
            rotation: -1,
            x: 65,
            y: 15
        },
        {
            id: 'products',
            type: 'polaroid',
            title: customPoints.point4?.title || 'Current Harvest',
            content: getImageUrl(customPoints.point4?.image) || getImageUrl(storage.featured_farmer_image) || getImageUrl(storage.image) || PLACEHOLDER_IMAGE,
            rotation: 4,
            date: customPoints.point4?.date || 'Season 2024',
            x: 25,
            y: 55
        },
        {
            id: 'future',
            type: 'note',
            color: 'bg-green-50',
            title: customPoints.point5?.title || 'Future Plans',
            content: customPoints.point5?.content || 'Expanding our year-round greenhouse capacity by 200%.',
            rotation: -2,
            x: 75,
            y: 50
        }
    ]

    return (
        <section className="w-full relative overflow-visible p-4 md:p-8 pb-32 flex items-start justify-center min-h-[100vh]">
            {/* Immersive Background Texture */}
            <div className="absolute inset-0 opacity-30 mix-blend-multiply dark:mix-blend-soft-light pointer-events-none"
                style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/cork-board.png")`, // Subtle cork texture
                    backgroundSize: '400px'
                }}>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)] pointer-events-none"></div>

            <div className="w-full max-w-[1600px] h-full md:h-[80vh] relative" ref={containerRef}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100/90 text-center mb-12 relative z-10 font-serif tracking-tight drop-shadow-sm"
                >
                    Investigating <span className="text-red-800 dark:text-red-400">{storage.name}</span>
                </motion.h2>

                {/* Red String SVG Layer - animated path (Desktop Only) - z-0 keeps it behind pins */}
                <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                        d="M 15 25 Q 35 35, 38 30 T 65 25 T 30 65 T 75 60"
                        stroke="#d41111"
                        strokeWidth="0.5"
                        fill="none"
                        strokeLinecap="round"
                        className="drop-shadow-md opacity-80"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                    />
                </svg>

                {/* Elements Layer */}
                <div className="relative w-full h-full flex flex-col items-center gap-16 pb-24 md:block md:gap-0 md:pb-0">
                    {storyPoints.map((point, i) => (
                        <motion.div
                            key={point.id}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.2,
                                type: "spring",
                                stiffness: 100
                            }}
                            whileHover={{ scale: 1.1, zIndex: 50, rotate: 0 }}
                            drag={!isMobile}
                            dragConstraints={isMobile ? undefined : containerRef}
                            dragElastic={0.1}
                            className={`relative md:absolute md:cursor-grab md:active:cursor-grabbing shadow-2xl origin-center z-10 ${point.posClass || ''}`}
                            style={{
                                rotate: point.rotation,
                                ...(isMobile ? {} : {
                                    top: `${point.y}%`,
                                    left: `${point.x}%`
                                })
                            }}
                        >
                            {/* Realistic Pin */}
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 z-30 drop-shadow-md">
                                <div className="w-4 h-4 rounded-full bg-red-600 border-[3px] border-red-800 shadow-inner relative top-1 left-1">
                                    <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-red-400 rounded-full opacity-60"></div>
                                </div>
                                <div className="w-0.5 h-3 bg-gray-400 mx-auto -mt-1 shadow-sm"></div>
                            </div>

                            {point.type === 'polaroid' && (
                                <div className="bg-white p-4 pb-12 w-64 md:w-72 transform transition-transform shadow-xl rotate-1 group-hover:rotate-0">
                                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-3 relative shadow-inner">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-blue-500/10 mix-blend-overlay pointer-events-none z-10"></div> {/* Filter */}
                                        <img
                                            src={point.content}
                                            alt={point.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="%23f3f4f6" width="200" height="150"/><text x="50%" y="50%" fill="%239ca3af" font-size="14" text-anchor="middle" dy=".3em">No Image</text></svg>';
                                            }}
                                        />
                                    </div>
                                    <div className="font-serif text-center text-gray-800 text-xl font-bold tracking-wide" style={{ fontFamily: '"Courier New", serif' }}>{point.title}</div>
                                    {point.date && <div className="text-sm text-center text-gray-500 font-serif mt-1 italic">{point.date}</div>}
                                </div>
                            )}

                            {point.type === 'note' && (
                                <div className={`${point.color} p-6 w-64 h-64 md:w-72 md:h-72 shadow-lg flex flex-col justify-between transform rotate-1 text-gray-900 border border-black/5`}>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-800 border-b-2 border-gray-800/20 pb-2 mb-3 uppercase text-sm tracking-widest">{point.title}</h4>
                                        <p className="text-gray-800 font-serif text-lg leading-relaxed" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' }}>
                                            "{point.content}"
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500/60 uppercase tracking-widest mt-2">CASE FILE #{Math.floor(Math.random() * 9000) + 1000}</div>
                                </div>
                            )}

                            {point.type === 'paper' && (
                                <div className="bg-white p-6 w-60 shadow-lg border border-gray-200" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}>
                                    <h4 className="font-bold text-red-800 text-xl border-b-2 border-red-800 mb-4 font-serif">{point.title}</h4>
                                    <ul className="space-y-2 font-mono text-sm text-gray-700">
                                        {point.content.split('\n').map((line, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="text-red-600">✓</span> {line}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="hidden md:block absolute bottom-4 right-4 text-gray-400 text-xs font-mono opacity-60">
                    DRAG ITEMS TO INVESTIGATE
                </div>
            </div>
        </section>
    )
}
