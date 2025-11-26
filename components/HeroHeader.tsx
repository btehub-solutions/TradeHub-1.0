'use client'
'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

export default function HeroHeader() {
    const { user } = useAuth()

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-900 dark:via-blue-950 dark:to-slate-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                <div className="text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        <span className="text-sm font-semibold text-white">Your Local Marketplace</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
                        Trade Smart,
                        <br />
                        <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                            Shop Local
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
                        Discover incredible deals on pre-loved items in your community.
                        Sell what you don't need, buy what you love, and connect with neighbors.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-scale-in">
                        {user ? (
                            <>
                                <Link href="/listings/new">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl">
                                        Start Selling Now
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link href="/dashboard">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200">
                                        View Dashboard
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signup">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl">
                                        Create Account
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link href="/auth/signin">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200">
                                        Browse Items
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">1000+</div>
                            <div className="text-sm sm:text-base text-white/80">Active Listings</div>
                        </div>
                        <div className="text-center border-l border-r border-white/30">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                            <div className="text-sm sm:text-base text-white/80">Happy Traders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
                            <div className="text-sm sm:text-base text-white/80">Secure Deals</div>
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
