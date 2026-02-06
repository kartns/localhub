import { useState, useEffect } from 'react'
import config from '../config'

export default function PlatformStats() {
    const [stats, setStats] = useState({
        producers: 0,
        products: 0,
        users: 0,
        dailyVisits: 0
    })

    // Animate the numbers on mount
    // Fetch stats from API on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/stats`)
                if (response.ok) {
                    const data = await response.json()
                    // Animate to these targets
                    animateStats(data)
                } else {
                    // Fallback to defaults or previous hardcoded if API fails
                    animateStats({
                        producers: 120,
                        products: 4200,
                        users: 15000,
                        dailyVisits: 890
                    })
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
                // Fallback
                animateStats({
                    producers: 120,
                    products: 4200,
                    users: 15000,
                    dailyVisits: 890
                })
            }
        }

        const animateStats = (targets) => {
            const duration = 2000 // 2 seconds
            const steps = 60
            const stepDuration = duration / steps
            let currentStep = 0

            const interval = setInterval(() => {
                currentStep++
                const progress = currentStep / steps

                setStats({
                    producers: Math.round(targets.producers * progress),
                    products: Math.round(targets.products * progress),
                    users: Math.round(targets.users * progress),
                    dailyVisits: Math.round(targets.dailyVisits * progress)
                })

                if (currentStep >= steps) {
                    clearInterval(interval)
                }
            }, stepDuration)

            return () => clearInterval(interval)
        }

        fetchStats()
    }, [])

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        }
        return num.toString()
    }

    const statsData = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            value: stats.producers,
            suffix: '+',
            label: 'Producers'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            value: stats.products,
            suffix: '',
            label: 'Products',
            format: true
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            value: stats.users,
            suffix: '+',
            label: 'Users',
            format: true
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            value: stats.dailyVisits,
            suffix: '',
            label: 'Daily visits'
        }
    ]

    return (
        <section className="w-full">
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 text-gray-800 dark:text-white relative overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                {/* Decorative blurs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#b8a990]/30 blur-[60px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#d4c9b8]/40 blur-[60px] rounded-full"></div>

                <h3 className="text-center text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                    Platform Impact
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
                    {statsData.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className="w-12 h-12 bg-white/60 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-700 dark:text-[#e8e0d0] group-hover:bg-white/80 dark:group-hover:bg-[#e8e0d0]/20 group-hover:scale-110 transition-all">
                                {stat.icon}
                            </div>
                            <div className="text-2xl md:text-3xl font-bold">
                                {stat.format ? formatNumber(stat.value) : stat.value}{stat.suffix}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium mt-1 tracking-widest">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
