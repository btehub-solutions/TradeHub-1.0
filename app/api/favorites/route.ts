import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List user's favorites
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

        // Get favorites with listing details
        const { data, error } = await supabase
            .from('favorites')
            .select(`
        id,
        created_at,
        listing:listings (
          id,
          title,
          description,
          price,
          location,
          seller_name,
          seller_phone,
          image_url,
          images,
          category,
          status,
          user_id,
          created_at
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching favorites:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Transform data to flatten listing object
        const favorites = data?.map(fav => ({
            favoriteId: fav.id,
            favoritedAt: fav.created_at,
            ...fav.listing
        })) || []

        return NextResponse.json(favorites)

    } catch (error: any) {
        console.error('Favorites GET error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch favorites' },
            { status: 500 }
        )
    }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, listingId } = body

        if (!userId || !listingId) {
            return NextResponse.json(
                { error: 'User ID and Listing ID are required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Check if already favorited
        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('listing_id', listingId)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Already favorited' },
                { status: 409 }
            )
        }

        // Add to favorites
        const { data, error } = await supabase
            .from('favorites')
            .insert({
                user_id: userId,
                listing_id: listingId
            })
            .select()
            .single()

        if (error) {
            // Check if it's the self-favorite error
            if (error.message.includes('Cannot favorite your own listing')) {
                return NextResponse.json(
                    { error: 'You cannot favorite your own listing' },
                    { status: 400 }
                )
            }

            console.error('Error adding favorite:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            favorite: data
        })

    } catch (error: any) {
        console.error('Favorites POST error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to add favorite' },
            { status: 500 }
        )
    }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const listingId = searchParams.get('listingId')

        if (!userId || !listingId) {
            return NextResponse.json(
                { error: 'User ID and Listing ID are required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('listing_id', listingId)

        if (error) {
            console.error('Error removing favorite:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Removed from favorites'
        })

    } catch (error: any) {
        console.error('Favorites DELETE error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to remove favorite' },
            { status: 500 }
        )
    }
}
