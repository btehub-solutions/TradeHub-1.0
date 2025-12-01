import { Shield, CheckCircle, Users, Lock, TrendingUp, Award } from 'lucide-react'

const trustBadges = [
    {
        icon: Shield,
        title: "Secure Platform",
        description: "Your data and transactions are protected",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        icon: CheckCircle,
        title: "Verified Sellers",
        description: "Connect with trusted community members",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
        icon: Users,
        title: "Community Driven",
        description: "Built for local traders, by local traders",
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
        icon: Lock,
        title: "Safe Transactions",
        description: "Meet locally for secure exchanges",
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
        icon: TrendingUp,
        title: "Growing Fast",
        description: "Join thousands of active traders",
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
        icon: Award,
        title: "Quality Guaranteed",
        description: "Real items, honest descriptions",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
]

export default function TrustBadges() {
    return (
        <div className="py-12 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Why Choose TradeHub?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        We&apos;re committed to providing a safe, transparent, and trustworthy marketplace
                    </p>
                </div>

                {/* Trust Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trustBadges.map((badge, index) => {
                        const Icon = badge.icon
                        return (
                            <div
                                key={index}
                                className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-default animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${badge.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-6 h-6 ${badge.color}`} />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {badge.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {badge.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
