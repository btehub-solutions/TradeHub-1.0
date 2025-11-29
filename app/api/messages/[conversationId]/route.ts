import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch messages for a conversation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params
        const supabase = await createServerSupabaseClient()

        // Fetch messages (RLS will handle authorization)
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

        const supabase = await createServerSupabaseClient()

        // Mark all unread messages in this conversation as read
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
