'use client'

import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    iconBgColor: string
    iconColor: string
}

export default function FeatureCard({
    icon: Icon,
    title,
    description,
    iconBgColor,
    iconColor
}: FeatureCardProps) {
    return (
        <div className="group bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-100 hover:border-blue-100 dark:hover:border-blue-900/50">
            <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                {description}
            </p>
        </div>
    )
}
