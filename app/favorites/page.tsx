'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { supabase, Listing } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import { Heart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [favorites, setFavorites] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFavorites = useCallback(async () => {
        try {
            // Fetch favorites joined with listings
            const { data, error } = await supabase
                .from('favorites')
                .select(`
          listing:listings (
            id,
            title,
            description,
            price,
            location,
            seller_name,
            seller_phone,
            image_url,
            images,
            category,
            status,
            user_id,
            created_at
          )
        `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Transform data to get array of listings
            const listings = data?.map((item: any) => item.listing).filter(Boolean) || []
            setFavorites(listings)
        } catch (error) {
            console.error('Error fetching favorites:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
            return
        }

        if (user) {
            fetchFavorites()
        }
    }, [user, authLoading, router, fetchFavorites])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Heart className="w-6 h-6 text-red-600 dark:text-red-400 fill-current" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
                    <p className="text-gray-500 dark:text-gray-400">Items you&apos;ve saved for later</p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Start browsing to find items you love!</p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        Browse Listings
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    )
}
