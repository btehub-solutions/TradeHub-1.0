import { NextResponse } from 'next/server'
import { getAllListings, createListing } from '@/lib/mockData'

export async function GET() {
  try {
    const data = getAllListings()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.location || !body.seller_name || !body.seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newListing = createListing({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      location: body.location,
      seller_name: body.seller_name,
      seller_phone: body.seller_phone,
      image_url: body.image_url || null
    })

    return NextResponse.json(newListing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
