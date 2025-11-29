'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
    id: string
    listing_id: string
    buyer_id: string
    seller_id: string
    created_at: string
    updated_at: string
    listing: {
        id: string
        title: string
        price: number
        images?: string[]
        image_url?: string
        status: string
    }
    lastMessage: {
        content: string
        created_at: string
        sender_id: string
        read: boolean
    } | null
    unreadCount: number
    otherUserId: string
    otherUserName: string
}

interface ConversationsListProps {
    userId: string
}

export default function ConversationsList({ userId }: ConversationsListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConversations()
    }, [userId])

    const fetchConversations = async () => {
        try {
            const response = await fetch(`/api/messages?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                setConversations(data)
            }
        } catch (error) {
            console.error('Error fetching conversations:', error)
        } finally {
            setLoading(false)
        }
    }

    const getListingImage = (listing: Conversation['listing']) => {
        if (listing.images && listing.images.length > 0) {
            return listing.images[0]
        }
        return listing.image_url || '/placeholder-image.png'
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No messages yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Start a conversation by messaging a seller on a listing
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {conversations.map((conv) => (
                <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex gap-4">
                        {/* Listing Image */}
                        <div className="flex-shrink-0">
                            <img
                                src={getListingImage(conv.listing)}
                                alt={conv.listing.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        </div>

                        {/* Conversation Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {conv.otherUserName}
                                </h3>
                                {conv.lastMessage && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <Package className="w-4 h-4" />
                                <span className="truncate">{conv.listing.title}</span>
                            </div>

                            {conv.lastMessage && (
                                <p className={`text-sm truncate ${conv.unreadCount > 0 && conv.lastMessage.sender_id !== userId
                                        ? 'font-semibold text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {conv.lastMessage.sender_id === userId ? 'You: ' : ''}
                                    {conv.lastMessage.content}
                                </p>
                            )}

                            {conv.unreadCount > 0 && (
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {conv.unreadCount} new
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
