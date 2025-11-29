'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'
import ConversationsList from '@/components/ConversationsList'
import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/signin')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Messages
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Chat with buyers and sellers about your listings
                </p>
            </div>

            {/* Conversations List */}
            <ConversationsList userId={user.id} />
        </div>
    )
}
