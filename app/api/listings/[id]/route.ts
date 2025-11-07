import { NextResponse } from 'next/server'
import { getListingById } from '@/lib/mockData'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = getListingById(params.id)

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Listing not found' },
      { status: 404 }
    )
  }
}
