import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null

const getSupabaseClient = () => {
  if (supabase) return supabase

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY) in your environment.'
    )
    return null
  }

  supabase = createClient(supabaseUrl, supabaseKey)
  return supabase
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json([], {
        headers: {
          'x-tradehub-warning': 'Supabase credentials missing'
        }
      })
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()

    console.log('Received listing data:', body)

    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.location || !body.seller_name || !body.seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const listingData = {
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      location: body.location,
      seller_name: body.seller_name,
      seller_phone: body.seller_phone,
      category: body.category || 'Other',
      image_url: body.image_url || null,
      images: body.images || null,
      user_id: body.user_id || null,
      status: 'available'
    }

    console.log('Inserting listing:', listingData)

    const { data, error } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create listing' },
        { status: 500 }
      )
    }

    console.log('Listing created successfully:', data)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    )
  }
}
