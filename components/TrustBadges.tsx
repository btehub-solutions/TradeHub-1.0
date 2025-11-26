'use client'

import { Shield, Lock, CheckCircle, Users } from 'lucide-react'

export default function TrustBadges() {
    const badges = [
        {
            icon: Shield,
            title: 'Secure Platform',
            description: 'Your data is protected',
            color: 'blue'
        },
        {
            icon: CheckCircle,
            title: 'Verified Listings',
            description: 'Quality assured items',
            color: 'green'
        },
        {
            icon: Users,
            title: 'Active Community',
            description: '1000+ happy users',
            color: 'purple'
        },
        {
            icon: Lock,
            title: 'Safe Transactions',
            description: 'Direct seller contact',
            color: 'orange'
        },
    ]

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
    }

    return (
        <div className="py-12 md:py-16">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Why Choose TradeHub?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Join thousands of users buying and selling with confidence
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge, index) => {
                    const Icon = badge.icon
                    const gradientClass = colorClasses[badge.color as keyof typeof colorClasses]

                    return (
                        <div
                            key={index}
                            className="group relative bg-white dark:bg-slate-800/70 rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-slate-700/50 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                            {/* Icon */}
                            <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {badge.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {badge.description}
                            </p>

                            {/* Decorative Element */}
                            <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-br ${gradientClass} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                        </div>
                    )
                })}
            </div>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { value: '1000+', label: 'Active Users' },
                    { value: '500+', label: 'Listings' },
                    { value: '98%', label: 'Satisfaction' },
                    { value: '24/7', label: 'Support' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-700/30 border border-gray-100 dark:border-slate-700/50 animate-fade-in"
                        style={{ animationDelay: `${(index + 4) * 100}ms` }}
                    >
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
