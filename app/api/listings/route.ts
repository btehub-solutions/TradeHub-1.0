import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  withMiddleware,
  getPaginationParams,
  createPaginatedResponse,
  validateRequest,
  AppError
} from '@/lib/api-middleware'
import { apiCache, generateCacheKey } from '@/lib/cache'

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

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'tradehub',
      },
    },
  })
  return supabase
}

async function handleGET(request: Request) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new AppError('Database connection unavailable', 503, 'DB_UNAVAILABLE')
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const location = searchParams.get('location')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Get pagination params
  const pagination = getPaginationParams(searchParams, 20, 100)

  // Generate cache key for this request
  const cacheKey = generateCacheKey('/api/listings', {
    userId,
    category,
    minPrice,
    maxPrice,
    location,
    search,
    sortBy,
    sortOrder,
    page: pagination.page,
    limit: pagination.limit,
  })

  // Check cache first (only for public listings, not user-specific)
  if (!userId) {
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
        },
      })
    }
  }

  // Build optimized query - select only needed fields
  let query = supabase
    .from('listings')
    .select('id, title, description, price, location, seller_name, seller_phone, image_url, images, category, status, user_id, created_at', { count: 'exact' })

  // Filter by user ID (for dashboard)
  if (userId) {
    query = query.eq('user_id', userId)
  }

  // Filter by category
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(minPrice)
    if (!isNaN(min)) {
      query = query.gte('price', min)
    }
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice)
    if (!isNaN(max)) {
      query = query.lte('price', max)
    }
  }

  // Filter by location (case-insensitive partial match)
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  // Search in title and description
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply sorting
  const ascending = sortOrder.toLowerCase() === 'asc'
  if (sortBy === 'price') {
    query = query.order('price', { ascending })
  } else if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    throw new AppError('Failed to fetch listings', 500, 'FETCH_ERROR', error.message)
  }

  const response = createPaginatedResponse(data || [], count || 0, pagination)

  // Cache public listings for 60 seconds
  if (!userId) {
    apiCache.set(cacheKey, response, 60000)
  }

  return NextResponse.json(response, {
    headers: {
      'X-Cache': 'MISS',
    },
  })
}

export const GET = withMiddleware(handleGET, {
  rateLimit: 'PUBLIC_API',
  errorHandling: true,
})

async function handlePOST(request: Request) {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new AppError('Database connection unavailable', 503, 'DB_UNAVAILABLE')
  }

  const body = await request.json()

  // Validate required fields
  const validation = validateRequest(body, [
    'title',
    'description',
    'price',
    'location',
    'seller_name',
    'seller_phone',
  ])

  if (!validation.valid) {
    throw new AppError(
      `Missing required fields: ${validation.missing?.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missing: validation.missing }
    )
  }

  // Validate price is a valid number
  const price = parseFloat(body.price)
  if (isNaN(price) || price < 0) {
    throw new AppError('Invalid price value', 400, 'INVALID_PRICE')
  }

  // Validate title and description length
  if (body.title.length > 200) {
    throw new AppError('Title must be 200 characters or less', 400, 'TITLE_TOO_LONG')
  }
  if (body.description.length > 5000) {
    throw new AppError('Description must be 5000 characters or less', 400, 'DESCRIPTION_TOO_LONG')
  }

  const listingData = {
    title: body.title.trim(),
    description: body.description.trim(),
    price,
    location: body.location.trim(),
    seller_name: body.seller_name.trim(),
    seller_phone: body.seller_phone.trim(),
    category: body.category || 'Other',
    image_url: body.image_url || null,
    images: body.images || null,
    user_id: body.user_id || null,
    status: 'available' as const,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    throw new AppError('Failed to create listing', 500, 'DB_INSERT_ERROR', error.message)
  }

  // Invalidate listings cache
  apiCache.clear()

  console.log('Listing created successfully:', data.id)
  return NextResponse.json(data, { status: 201 })
}

export const POST = withMiddleware(handlePOST, {
  rateLimit: 'AUTHENTICATED_API',
  errorHandling: true,
})
