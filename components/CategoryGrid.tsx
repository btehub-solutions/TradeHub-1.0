'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as Icons from 'lucide-react'
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'

export default function CategoryGrid() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get('category') || 'All'

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (category === 'All') {
            params.delete('category')
        } else {
            params.set('category', category)
        }
        router.push(`/?${params.toString()}`)
    }

    const getIcon = (iconName: string) => {
        const IconComponent = Icons[iconName as keyof typeof Icons] as any
        return IconComponent || Icons.Package
    }

    // Filter out 'All' for the grid view
    const displayCategories = CATEGORIES.filter(c => c !== 'All')

    return (
        <div className="mb-16 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Category</h2>
                <p className="text-gray-600 dark:text-gray-400">Find exactly what you&apos;re looking for</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
                {displayCategories.map((category, index) => {
                    const IconComponent = getIcon(CATEGORY_ICONS[category])
                    const isActive = currentCategory === category

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 animate-fade-in-up ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900'
                                : 'bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
                                }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`p-3.5 rounded-xl mb-3 transition-all duration-300 ${isActive
                                ? 'bg-white/20'
                                : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 group-hover:scale-110'
                                }`}>
                                <IconComponent className={`w-7 h-7 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <span className="font-semibold text-sm sm:text-base tracking-wide">{category}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
