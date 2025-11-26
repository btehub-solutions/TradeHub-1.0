import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'tradehub-auth-token',
    flowType: 'pkce',
    debug: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'tradehub-app'
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      }).catch(error => {
        console.error('Supabase fetch error:', error)
        throw error
      })
    }
  }
})

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

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
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
