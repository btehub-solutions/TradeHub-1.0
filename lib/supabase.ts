import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials are provided
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export type Listing = {
  id: string
  title: string
  description: string
  price: number
  location: string
  seller_name: string
  seller_phone: string
  image_url: string | null
  images?: string[]  // Multiple images support
  category: string
  created_at: string
}

// Define available categories
export const CATEGORIES = [
  'All',
  'Electronics',
  'Vehicles',
  'Real Estate',
  'Furniture',
  'Fashion',
  'Other'
] as const

export type Category = typeof CATEGORIES[number]

// Modern icon mapping using Lucide React icon names
export const CATEGORY_ICONS: Record<string, string> = {
  'All': 'Store',
  'Electronics': 'Smartphone',
  'Vehicles': 'Car',
  'Real Estate': 'Home',
  'Furniture': 'Armchair',
  'Fashion': 'Shirt',
  'Other': 'Package'
}
