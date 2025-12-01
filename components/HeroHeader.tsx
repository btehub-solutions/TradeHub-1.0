'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Users, Package, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

type PlatformStats = {
    activeListings: number
    totalUsers: number
    successRate: number
    activeTraders: number
}

export default function HeroHeader() {
    const { user } = useAuth()
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [displayStats, setDisplayStats] = useState({ activeListings: 0, totalUsers: 0, successRate: 0 })
    const [hasAnimated, setHasAnimated] = useState(false)
    const statsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats', { cache: 'no-store' })
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    // Animated counter effect
    useEffect(() => {
        if (!stats || hasAnimated || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasAnimated(true)

                    const duration = 2000 // 2 seconds
                    const steps = 60
                    const stepDuration = duration / steps

                    let currentStep = 0
                    const interval = setInterval(() => {
                        currentStep++
                        const progress = currentStep / steps

                        setDisplayStats({
                            activeListings: Math.floor(stats.activeListings * progress),
                            totalUsers: Math.floor(stats.totalUsers * progress),
                            successRate: Math.floor(stats.successRate * progress)
                        })

                        if (currentStep >= steps) {
                            clearInterval(interval)
                            setDisplayStats({
                                activeListings: stats.activeListings,
                                totalUsers: stats.totalUsers,
                                successRate: stats.successRate
                            })
                        }
                    }, stepDuration)

                    return () => clearInterval(interval)
                }
            },
            { threshold: 0.3 }
        )

        if (statsRef.current) {
            observer.observe(statsRef.current)
        }

        return () => observer.disconnect()
    }, [stats, hasAnimated, loading])

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="text-center">
                    {/* Trust Badge with Float Animation */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold mb-6 animate-float backdrop-blur-sm">
                        <Shield className="w-4 h-4" />
                        Building Trust in Local Trading
                    </div>

                    {/* Main Heading with Shimmer Effect */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight animate-fade-in-up">
                        Your Community&apos;s
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa 0%, #67e8f9 25%, #818cf8 50%, #60a5fa 75%, #67e8f9 100%)' }}>
                            Trusted Marketplace
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-delayed">
                        Connect with real people in your community. Buy quality pre-owned items, sell what you don&apos;t need, and trade with transparency—all in one trusted platform.
                    </p>

                    {/* CTA Buttons with Enhanced Hover */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-scale-in-delayed">
                        {user ? (
                            <>
                                <Link href="/listings/new">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-blue-50 hover:scale-[1.05] active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:shadow-2xl">
                                        List Your Item
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                </Link>
                                <Link href="/dashboard">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white/20 hover:border-white/60 hover:scale-[1.05] active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl">
                                        My Dashboard
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-300" />
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signup">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-blue-50 hover:scale-[1.05] active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:shadow-2xl">
                                        Get Started Free
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                </Link>
                                <Link href="/auth/signin">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white/20 hover:border-white/60 hover:scale-[1.05] active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl">
                                        Explore Listings
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-300" />
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Real Stats with Animated Counters */}
                    <div ref={statsRef} className="mt-12 grid grid-cols-3 gap-6 sm:gap-10 max-w-3xl mx-auto">
                        <div className="text-center group hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-3 group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            {loading ? (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 animate-pulse">...</div>
                            ) : (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 transition-all duration-300">
                                    {displayStats.activeListings}+
                                </div>
                            )}
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Active Listings</div>
                        </div>
                        <div className="text-center border-l border-r border-white/20 group hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-3 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            {loading ? (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 animate-pulse">...</div>
                            ) : (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 transition-all duration-300">
                                    {displayStats.totalUsers}+
                                </div>
                            )}
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Community Members</div>
                        </div>
                        <div className="text-center group hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 group-hover:bg-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            {loading ? (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 animate-pulse">...</div>
                            ) : (
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 transition-all duration-300">
                                    {displayStats.successRate}%
                                </div>
                            )}
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Active Traders</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full h-12 sm:h-16 md:h-20 fill-current text-gray-50 dark:text-slate-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </div>
    )
}
