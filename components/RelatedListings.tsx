'use client'

import { useEffect, useState } from 'react'
import { Listing, supabase } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'

interface RelatedListingsProps {
    categoryId: string
    currentListingId: string
}

export default function RelatedListings({ categoryId, currentListingId }: RelatedListingsProps) {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('category', categoryId)
                    .eq('status', 'available')
                    .neq('id', currentListingId)
                    .limit(4)

                if (error) throw error

                // Shuffle array to show random related items if we got more than 4 (though limit is 4 here, 
                // in a real app we might fetch more and pick random, but for now simple limit is fine)
                setListings(data || [])
            } catch (error) {
                console.error('Error fetching related listings:', error)
            } finally {
                setLoading(false)
            }
        }

        if (categoryId) {
            fetchRelated()
        }
    }, [categoryId, currentListingId])

    if (loading || listings.length === 0) return null

    return (
        <div className="mt-12 border-t dark:border-slate-700 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                    <div key={listing.id} className="h-full">
                        <ListingCard listing={listing} />
                    </div>
                ))}
            </div>
        </div>
    )
}
