import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List reviews for a listing or seller
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const listingId = searchParams.get('listingId')
        const sellerId = searchParams.get('sellerId')
        const limit = parseInt(searchParams.get('limit') || '10')

        const supabase = createClient()

        let query = supabase
            .from('reviews')
            .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (
          id,
          raw_user_meta_data
        ),
        listing:listing_id (
          id,
          title
        )
      `)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (listingId) {
            query = query.eq('listing_id', listingId)
        } else if (sellerId) {
            query = query.eq('seller_id', sellerId)
        } else {
            return NextResponse.json(
                { error: 'Listing ID or Seller ID is required' },
                { status: 400 }
            )
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching reviews:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Transform data for easier consumption
        const reviews = data?.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.created_at,
            reviewerName: review.reviewer?.raw_user_meta_data?.full_name || 'Anonymous User',
            listingTitle: review.listing?.title
        })) || []

        return NextResponse.json(reviews)

    } catch (error: any) {
        console.error('Reviews GET error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}

// POST - Create a review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { listingId, sellerId, rating, comment, reviewerId } = body

        if (!listingId || !sellerId || !rating || !reviewerId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Check for self-review
        if (reviewerId === sellerId) {
            return NextResponse.json(
                { error: 'You cannot review yourself' },
                { status: 400 }
            )
        }

        // Check if review already exists for this listing by this user
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('listing_id', listingId)
            .eq('reviewer_id', reviewerId)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'You have already reviewed this listing' },
                { status: 409 }
            )
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                listing_id: listingId,
                seller_id: sellerId,
                reviewer_id: reviewerId,
                rating,
                comment
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating review:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            review: data
        })

    } catch (error: any) {
        console.error('Reviews POST error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create review' },
            { status: 500 }
        )
    }
}
