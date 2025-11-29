'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [conversationId, setConversationId] = useState<string>('')
    const [otherUserName, setOtherUserName] = useState<string>('User')
    const [otherUserId, setOtherUserId] = useState<string>('')
    const [listingTitle, setListingTitle] = useState<string>('Item')
    const [listingId, setListingId] = useState<string>('')

    // Unwrap params
    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params
            setConversationId(resolvedParams.conversationId)

            // Get data from URL params if available
            const seller = searchParams.get('seller')
            const listing = searchParams.get('listing')
            const listingIdParam = searchParams.get('listingId')

            if (seller) setOtherUserName(seller)
            if (listing) setListingTitle(listing)
            if (listingIdParam) setListingId(listingIdParam)
        }
        init()
    }, [params, searchParams])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (!user || !conversationId) {
        return null
    }

    // Determine other user ID from conversation (buyer or seller)
    const finalOtherUserId = otherUserId || user.id // Fallback

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ChatWindow
                conversationId={conversationId}
                otherUserName={otherUserName}
                otherUserId={finalOtherUserId}
                listingTitle={listingTitle}
                listingId={listingId}
            />
        </div>
    )
}
