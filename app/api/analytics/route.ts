import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { withMiddleware, AppError } from '@/lib/api-middleware'
import { apiCache, generateCacheKey } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch analytics data
async function handleGET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!userId) {
        throw new AppError('User ID is required', 400, 'MISSING_USER_ID')
    }

    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
        throw new AppError('Days must be between 1 and 365', 400, 'INVALID_DAYS')
    }

    // Check cache first
    const cacheKey = generateCacheKey('/api/analytics', { userId, days })
    const cached = apiCache.get(cacheKey)
    if (cached) {
        return NextResponse.json(cached, {
            headers: { 'X-Cache': 'HIT' }
        })
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
        throw new AppError('Failed to fetch analytics', 500, 'DB_ERROR', error.message)
    }

    const result = data || []

    // Cache for 5 minutes
    apiCache.set(cacheKey, result, 5 * 60 * 1000)

    return NextResponse.json(result, {
        headers: { 'X-Cache': 'MISS' }
    })
}

export const GET = withMiddleware<NextRequest>(handleGET, {
    rateLimit: 'AUTHENTICATED_API',
    errorHandling: true,
})

// POST - Record a view
async function handlePOST(request: NextRequest) {
    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
        throw new AppError('Listing ID is required', 400, 'MISSING_LISTING_ID')
    }

    const supabase = createClient()

    // Get IP and User Agent from headers
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Simple hash for anonymity
    const ipHash = Buffer.from(ip).toString('base64')

    const { error } = await supabase
        .rpc('record_listing_view', {
            p_listing_id: listingId,
            p_ip_hash: ipHash,
            p_user_agent: userAgent
        })

    if (error) {
        console.error('Error recording view:', error)
        throw new AppError('Failed to record view', 500, 'DB_ERROR', error.message)
    }

    return NextResponse.json({ success: true })
}

export const POST = withMiddleware<NextRequest>(handlePOST, {
    rateLimit: 'PUBLIC_API',
    errorHandling: true,
})
