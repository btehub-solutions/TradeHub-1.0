import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export createClient for use in API routes (server-side, no auth context by default)
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // API routes don't need session persistence
      autoRefreshToken: false,
    }
  })
}

// Client-side Supabase client using cookies (via @supabase/ssr)
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey
)

// Types
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
  status: 'available' | 'sold'
  user_id: string
  created_at: string
}

export type User = {
  id: string
  email: string
}

export type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

// Categories
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

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const signUp = async (email: string, password: string, fullName: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      data: {
        full_name: fullName
      }
    }
  })
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
}
