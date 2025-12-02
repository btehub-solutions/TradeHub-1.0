'use client'

import Link from 'next/link'
import { Plus, BarChart2, User, Settings, ExternalLink } from 'lucide-react'

export default function QuickActions() {
    const actions = [
        {
            label: 'Post New Item',
            icon: Plus,
            href: '/listings/new',
            color: 'bg-blue-500',
            description: 'Create a new listing'
        },
        {
            label: 'View Analytics',
            icon: BarChart2,
            href: '/dashboard/analytics',
            color: 'bg-purple-500',
            description: 'Check your performance'
        },
        {
            label: 'Edit Profile',
            icon: User,
            href: '/dashboard/profile',
            color: 'bg-green-500',
            description: 'Update your details'
        },
        {
            label: 'Seller Guide',
            icon: ExternalLink,
            href: '/seller-guide',
            color: 'bg-orange-500',
            description: 'Tips for selling'
        }
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group flex items-start p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                    >
                        <div className={`p-3 rounded-lg ${action.color} bg-opacity-10 text-white mr-4 group-hover:scale-110 transition-transform`}>
                            <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {action.label}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {action.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
