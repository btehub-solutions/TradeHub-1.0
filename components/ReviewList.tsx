'use client'

import { useEffect, useState } from 'react'
import RatingDisplay from './RatingDisplay'
import { formatDistanceToNow } from 'date-fns'
import { User } from 'lucide-react'

interface Review {
    id: string
    rating: number
    comment: string
    createdAt: string
    reviewerName: string
    listingTitle?: string
}

interface ReviewListProps {
    sellerId?: string
    listingId?: string
}

export default function ReviewList({ sellerId, listingId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const params = new URLSearchParams()
                if (sellerId) params.append('sellerId', sellerId)
                if (listingId) params.append('listingId', listingId)

                const response = await fetch(`/api/reviews?${params.toString()}`)
                if (!response.ok) throw new Error('Failed to fetch reviews')

                const data = await response.json()
                setReviews(data)
            } catch (error) {
                console.error('Error loading reviews:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [sellerId, listingId])

    if (loading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl" />
            ))}
        </div>
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                No reviews yet
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {review.reviewerName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <RatingDisplay rating={review.rating} showCount={false} size="sm" />
                    </div>

                    {review.listingTitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Purchased: <span className="font-medium">{review.listingTitle}</span>
                        </p>
                    )}

                    {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}
