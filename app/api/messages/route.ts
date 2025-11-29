import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List user's conversations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        const supabase = createClient()

        // Get conversations with listing and other user details
        const { data, error } = await supabase
            .from('conversations')
            .select(`
        id,
        listing_id,
        buyer_id,
        seller_id,
        created_at,
        updated_at,
        listing:listings (
          id,
          title,
          price,
          images,
          image_url,
          status
        )
      `)
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Error fetching conversations:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        console.log('Fetched conversations:', data?.length || 0)

        // For each conversation, get the last message and other user info
        const conversationsWithDetails = await Promise.all(
            (data || []).map(async (conv) => {
                // Get last message
                const { data: lastMessage } = await supabase
                    .from('messages')
                    .select('content, created_at, sender_id, read')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                // Get unread count
                const { count: unreadCount } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('read', false)
                    .neq('sender_id', userId)

                // Determine other user ID
                const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id

                // Get other user details
                const { data: otherUser } = await supabase
                    .from('auth.users')
                    .select('raw_user_meta_data')
                    .eq('id', otherUserId)
                    .maybeSingle()

                return {
                    ...conv,
                    lastMessage: lastMessage || null,
                    unreadCount: unreadCount || 0,
                    otherUserId,
                    otherUserName: otherUser?.raw_user_meta_data?.full_name || 'User'
                }
            })
        )

        console.log('Returning conversations with details:', conversationsWithDetails.length)
        return NextResponse.json(conversationsWithDetails)

    } catch (error: any) {
        console.error('Conversations GET error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch conversations' },
            { status: 500 }
        )
    }
}

// POST - Send a message (creates conversation if needed)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { listingId, buyerId, sellerId, senderId, content } = body

        if (!listingId || !buyerId || !sellerId || !senderId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Use the helper function to create conversation and send first message
        const { data: conversationId, error: sendError } = await supabase
            .rpc('send_first_message', {
                p_listing_id: listingId,
                p_buyer_id: buyerId,
                p_seller_id: sellerId,
                p_sender_id: senderId,
                p_content: content.trim()
            })

        if (sendError) {
            console.error('Error sending message:', sendError)
            return NextResponse.json(
                { error: sendError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            conversationId
        })

    } catch (error: any) {
        console.error('Messages POST error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to send message' },
            { status: 500 }
        )
    }
}
