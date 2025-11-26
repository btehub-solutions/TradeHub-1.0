'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

export default function MobileNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/#search', icon: Search, label: 'Search' },
        { href: '/listings/new', icon: PlusCircle, label: 'Post', highlight: true },
        { href: user ? '/dashboard' : '/auth/signin', icon: User, label: user ? 'Profile' : 'Sign In' },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-in-bottom">
            <div className="glass-strong border-t border-gray-200 dark:border-slate-700/50 shadow-large">
                <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all duration-200 ${item.highlight
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow scale-110 -mt-4'
                                        : isActive
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 mb-1 ${item.highlight ? 'animate-bounce-subtle' : ''}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
