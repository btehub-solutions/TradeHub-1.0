'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface MessageButtonProps {
    listingId: string
    sellerId: string
    sellerName: string
}

export default function MessageButton({ listingId, sellerId, sellerName }: MessageButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleMessageSeller = async () => {
        if (!user) {
            toast.error('Please sign in to message sellers')
            router.push('/auth/signin')
            return
        }

        if (user.id === sellerId) {
            toast.error('You cannot message yourself')
            return
        }

        setLoading(true)

        try {
            // Send initial message or get existing conversation
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    buyerId: user.id,
                    sellerId,
                    senderId: user.id,
                    content: `Hi, I'm interested in this item.`
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start conversation')
            }

            // Redirect to conversation
            router.push(`/messages/${data.conversationId}`)
            toast.success(`Opening chat with ${sellerName}`)

        } catch (error: any) {
            console.error('Error starting conversation:', error)
            toast.error(error.message || 'Failed to start conversation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleMessageSeller}
            disabled={loading}
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors"
        >
            <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="truncate">
                {loading ? 'Opening chat...' : `Message ${sellerName}`}
            </span>
        </button>
    )
}
