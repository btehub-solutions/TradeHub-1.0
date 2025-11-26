'use client'

import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

export default function HeroHeader() {
    const { user } = useAuth()

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
                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight animate-slide-up">
                        Nigeria&apos;s Most
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                            Trusted Marketplace
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto mb-8 leading-relaxed font-light animate-fade-in">
                        Buy and sell with confidence. Connect with verified sellers, discover quality items, and trade securely in your community.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-scale-in">
                        {user ? (
                            <>
                                <Link href="/listings/new">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50">
                                        List Your Item
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link href="/dashboard">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/40 rounded-2xl hover:bg-white/20 hover:border-white/60 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
                                        My Dashboard
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signup">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50">
                                        Get Started Free
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link href="/auth/signin">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/40 rounded-2xl hover:bg-white/20 hover:border-white/60 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
                                        Explore Listings
                                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-6 sm:gap-10 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">1000+</div>
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Active Listings</div>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">500+</div>
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Happy Traders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">100%</div>
                            <div className="text-xs sm:text-sm text-blue-200/80 font-medium">Secure Deals</div>
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
