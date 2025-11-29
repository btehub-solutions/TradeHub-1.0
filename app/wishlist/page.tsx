'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Package, MapPin, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { toast } from 'react-hot-toast'
import * as Icons from 'lucide-react'
import { CATEGORY_ICONS } from '@/lib/supabase'

interface FavoriteListing {
    favoriteId: string
    favoritedAt: string
    id: string
    title: string
    description: string
    price: number
    location: string
    image_url: string | null
    images?: string[]
    category: string
    status: string
}

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [favorites, setFavorites] = useState<FavoriteListing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to view your wishlist')
            router.replace('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchFavorites()
        }
    }, [user])

    const fetchFavorites = async () => {
        if (!user) return

        try {
            const response = await fetch(`/api/favorites?userId=${user.id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch favorites')
            }

            const data = await response.json()
            setFavorites(data)
        } catch (error) {
            console.error('Error fetching favorites:', error)
            toast.error('Failed to load favorites')
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (listingId: string) => {
        if (!user) return

        try {
            const response = await fetch(
                `/api/favorites?userId=${user.id}&listingId=${listingId}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                throw new Error('Failed to remove favorite')
            }

            setFavorites(prev => prev.filter(f => f.id !== listingId))
            toast.success('Removed from wishlist')
        } catch (error) {
            console.error('Error removing favorite:', error)
            toast.error('Failed to remove from wishlist')
        }
    }

    const getIcon = (iconName: string) => {
        const IconComponent = Icons[iconName as keyof typeof Icons] as any
        return IconComponent || Icons.Package
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to listings
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                            <Heart className="w-8 h-8 text-red-600 dark:text-red-400 fill-current" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Your wishlist is empty
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start adding items you love to your wishlist
                        </p>
                        <Link href="/">
                            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                                Browse Items
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((favorite) => {
                            const IconComponent = getIcon(CATEGORY_ICONS[favorite.category])
                            const displayImage = favorite.images && favorite.images.length > 0
                                ? favorite.images[0]
                                : favorite.image_url

                            return (
                                <div
                                    key={favorite.id}
                                    className="group bg-white dark:bg-slate-800/70 rounded-2xl shadow-soft hover:shadow-medium transition-all overflow-hidden"
                                >
                                    <Link href={`/listings/${favorite.id}`}>
                                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                                            {displayImage ? (
                                                <img
                                                    src={displayImage}
                                                    alt={favorite.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <IconComponent className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                                                </div>
                                            )}

                                            {/* Remove button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleRemove(favorite.id)
                                                }}
                                                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            {/* Category Badge */}
                                            <div className="mb-3 inline-flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg space-x-1.5 border border-blue-100 dark:border-blue-800/50">
                                                <IconComponent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                    {favorite.category}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {favorite.title}
                                            </h3>

                                            <div className="flex items-baseline mb-3">
                                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                                    ₦{favorite.price.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                                                <span className="line-clamp-1">{favorite.location}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
