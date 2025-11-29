'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/AuthProvider'

interface ReviewFormProps {
    listingId: string
    sellerId: string
    onSuccess?: () => void
}

export default function ReviewForm({ listingId, sellerId, onSuccess }: ReviewFormProps) {
    const { user } = useAuth()
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in to leave a review')
            return
        }

        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    sellerId,
                    reviewerId: user.id,
                    rating,
                    comment
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review')
            }

            toast.success('Review submitted successfully!')
            setRating(0)
            setComment('')
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate this seller</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment (Optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    'Submit Review'
                )}
            </button>
        </form>
    )
}
