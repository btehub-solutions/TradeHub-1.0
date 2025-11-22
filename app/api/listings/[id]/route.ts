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

type Params = { params: Promise<{ id: string }> }

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      console.error('Error fetching listing:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Listing not found' },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null)
    const userId = body?.userId
    const data = body?.data

    if (!userId || !data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'userId and data payload are required.' },
        { status: 400 }
      )
    }

    const { data: updatedListing, error } = await supabase
      .from('listings')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating listing:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(updatedListing)
  } catch (error: any) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting listing:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
