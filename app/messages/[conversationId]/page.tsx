'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'

interface Conversation {
    id: string
    listing_id: string
    buyer_id: string
    seller_id: string
    listing: {
        id: string
        title: string
    }
}

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [conversationId, setConversationId] = useState<string>('')
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)

    // Unwrap params
    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params
            setConversationId(resolvedParams.conversationId)
        }
        init()
    }, [params])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (conversationId && user) {
            fetchConversation()
        }
    }, [conversationId, user])

    const fetchConversation = async () => {
        try {
            const response = await fetch(`/api/messages?userId=${user?.id}`)
            if (response.ok) {
                const conversations = await response.json()
                const conv = conversations.find((c: Conversation) => c.id === conversationId)

                if (conv) {
                    setConversation(conv)
                } else {
                    // Conversation might be new and not in the list yet
                    // Fetch it directly from the database
                    const { createClient } = await import('@/lib/supabase')
                    const supabase = createClient()

                    const { data: convData } = await supabase
                        .from('conversations')
                        .select(`
                            id,
                            listing_id,
                            buyer_id,
                            seller_id,
                            listing:listings (
                                id,
                                title
                            )
                        `)
                        .eq('id', conversationId)
                        .single()

                    if (convData) {
                        setConversation(convData as any)
                    } else {
                        router.push('/messages')
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching conversation:', error)
            router.push('/messages')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (!user || !conversation) {
        return null
    }

    const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id
    const otherUserName = conversation.buyer_id === user.id ? 'Seller' : 'Buyer'

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ChatWindow
                conversationId={conversationId}
                otherUserName={otherUserName}
                otherUserId={otherUserId}
                listingTitle={conversation.listing.title}
                listingId={conversation.listing_id}
            />
        </div>
    )
}
