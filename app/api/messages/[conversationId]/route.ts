import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch messages for a conversation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        const supabase = createClient()

        // Verify user is part of this conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('buyer_id, seller_id')
            .eq('id', conversationId)
            .single()

        if (convError || !conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            )
        }

        if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Fetch messages
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (msgError) {
            console.error('Error fetching messages:', msgError)
            return NextResponse.json(
                { error: msgError.message },
                { status: 500 }
            )
        }

        return NextResponse.json(messages || [])

    } catch (error: any) {
        console.error('Messages GET error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}

// PATCH - Mark messages as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Mark all unread messages in this conversation as read
        // (only messages sent by the other user)
        const { error } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .eq('read', false)
            .neq('sender_id', userId)

        if (error) {
            console.error('Error marking messages as read:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Messages PATCH error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to mark messages as read' },
            { status: 500 }
        )
    }
}
