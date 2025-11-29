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

    // Filter out 'All' for the grid view as it's usually implicit or handled by clearing filters
    const displayCategories = CATEGORIES.filter(c => c !== 'All')

    return (
        <div className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {displayCategories.map((category) => {
                    const IconComponent = getIcon(CATEGORY_ICONS[category])
                    const isActive = currentCategory === category

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-white dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-soft hover:shadow-medium hover:-translate-y-1'
                                }`}
                        >
                            <div className={`p-3 rounded-xl mb-3 transition-colors ${isActive
                                    ? 'bg-white/20'
                                    : 'bg-blue-100/50 dark:bg-blue-900/20 group-hover:bg-blue-200/50 dark:group-hover:bg-blue-800/30'
                                }`}>
                                <IconComponent className={`w-8 h-8 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <span className="font-semibold text-sm sm:text-base">{category}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
