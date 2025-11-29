import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const days = parseInt(searchParams.get('days') || '30')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Call the RPC function we created in the migration
        const { data, error } = await supabase
            .rpc('get_seller_analytics', {
                p_seller_id: userId,
                p_days: days
            })

        if (error) {
            console.error('Error fetching analytics:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(data || [])

    } catch (error: any) {
        console.error('Analytics GET error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch analytics' },
            { status: 500 }
        )
    }
}

// POST - Record a view
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { listingId } = body

        if (!listingId) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Get IP and User Agent from headers (simplified for this example)
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // Simple hash for anonymity (in production use a proper hash)
        const ipHash = Buffer.from(ip).toString('base64')

        const { error } = await supabase
            .rpc('record_listing_view', {
                p_listing_id: listingId,
                p_ip_hash: ipHash,
                p_user_agent: userAgent
            })

        if (error) {
            console.error('Error recording view:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Analytics POST error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to record view' },
            { status: 500 }
        )
    }
}
