'use client'

import { Megaphone, Target, Users, TrendingUp, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdvertisePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Hero Section */}
            <div className="relative bg-blue-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/30 text-white text-sm font-medium mb-8 backdrop-blur-sm border border-blue-400/30">
                        <Megaphone className="w-4 h-4" />
                        <span>Grow Your Business with TradeHub</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Reach Local Customers <br className="hidden sm:block" />
                        <span className="text-blue-200">Where They Shop</span>
                    </h1>

                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
                        Connect with thousands of active buyers and sellers in your community.
                        Promote your products or services directly to a targeted local audience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:ads@tradehub.ng"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Contact Ad Team
                        </a>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Advertise on TradeHub?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We offer unique opportunities to showcase your brand to a highly engaged local audience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={Users}
                        title="Hyper-Local Reach"
                        description="Target customers specifically in your city or neighborhood. Don't waste budget on irrelevant audiences."
                    />
                    <BenefitCard
                        icon={Target}
                        title="High Intent Audience"
                        description="Reach users who are actively looking to buy and sell. Our users are in a transaction mindset."
                    />
                    <BenefitCard
                        icon={TrendingUp}
                        title="Measurable Results"
                        description="Get clear insights into how your ads are performing. Track views, clicks, and engagement."
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 dark:border-slate-700 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                    <div className="relative">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Ready to grow your business?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                            Send us an email with your requirements, and our advertising team will get back to you with a custom proposal.
                        </p>

                        <a
                            href="mailto:ads@tradehub.ng"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                        >
                            Email Us Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BenefitCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}
