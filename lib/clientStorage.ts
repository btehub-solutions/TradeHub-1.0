import { Listing } from './supabase'

const STORAGE_KEY = 'tradehub_listings'
const ID_COUNTER_KEY = 'tradehub_next_id'

// Default mock data for first-time users
import { mockListings } from './mockData'

export function getStoredListings(): Listing[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.length > 0 ? parsed : mockListings
    }
    // First time - initialize with mock data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockListings))
    return mockListings
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return mockListings
  }
}

export function saveListings(listings: Listing[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function getNextId(): number {
  if (typeof window === 'undefined') return 1
  
  try {
    const stored = localStorage.getItem(ID_COUNTER_KEY)
    if (stored) return parseInt(stored, 10)
    
    // Initialize with mock data length + 1
    const initialId = mockListings.length + 1
    localStorage.setItem(ID_COUNTER_KEY, String(initialId))
    return initialId
  } catch (error) {
    console.error('Error reading ID counter:', error)
    return mockListings.length + 1
  }
}

export function saveNextId(id: number): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ID_COUNTER_KEY, String(id))
  } catch (error) {
    console.error('Error saving ID counter:', error)
  }
}

export function addListing(data: Omit<Listing, 'id' | 'created_at'>): Listing {
  const listings = getStoredListings()
  const nextId = getNextId()
  
  const newListing: Listing = {
    ...data,
    id: String(nextId),
    created_at: new Date().toISOString()
  }
  
  listings.push(newListing)
  saveListings(listings)
  saveNextId(nextId + 1)
  
  return newListing
}

export function getListingById(id: string): Listing | null {
  const listings = getStoredListings()
  return listings.find(listing => listing.id === id) || null
}
