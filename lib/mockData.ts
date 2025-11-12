import { Listing } from './supabase'

// Mock data store for testing without Supabase
export const mockListings: Listing[] = ([
  // ELECTRONICS (IDs 1-8)
  {
    id: '1',
    title: 'iPhone 13 Pro Max 256GB',
    description: 'Excellent condition, barely used. Comes with original box, charger, and case. No scratches on screen. Battery health 98%.',
    price: 450000,
    location: 'Ikeja, Lagos',
    seller_name: 'Adebayo Johnson',
    seller_phone: '08012345678',
    image_url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop',
    category: 'Electronics',
    status: 'available' as const,
    user_id: 'mock-user-1',
    created_at: new Date('2024-11-01').toISOString()
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra',
    description: 'Brand new condition. 512GB storage, 12GB RAM. Phantom Black color. Still under warranty.',
    price: 520000,
    location: 'Victoria Island, Lagos',
    seller_name: 'Chioma Okafor',
    seller_phone: '08098765432',
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-02').toISOString()
  },
  {
    id: '3',
    title: 'MacBook Pro M2 14-inch',
    description: 'Like new! 16GB RAM, 512GB SSD. Perfect for developers and designers. Includes original charger and box.',
    price: 1200000,
    location: 'Lekki, Lagos',
    seller_name: 'Emeka Nwosu',
    seller_phone: '08087654321',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-03').toISOString()
  },
  {
    id: '4',
    title: 'Sony PlayStation 5',
    description: 'PS5 with disc drive. Comes with 2 controllers and 3 games (FIFA 24, Spider-Man, God of War). Excellent condition.',
    price: 380000,
    location: 'Surulere, Lagos',
    seller_name: 'Tunde Bakare',
    seller_phone: '08076543210',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-04').toISOString()
  },
  {
    id: '5',
    title: 'iPad Air 5th Gen 64GB',
    description: 'Space Gray, WiFi only. Perfect for students. Includes Apple Pencil 2nd gen and smart keyboard.',
    price: 280000,
    location: 'Yaba, Lagos',
    seller_name: 'Fatima Ibrahim',
    seller_phone: '08065432109',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-05').toISOString()
  },
  {
    id: '6',
    title: 'Canon EOS 90D DSLR Camera',
    description: 'Professional camera with 18-135mm lens. Low shutter count. Includes camera bag, extra battery, and 64GB SD card.',
    price: 650000,
    location: 'Abuja',
    seller_name: 'David Okonkwo',
    seller_phone: '08054321098',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-05').toISOString()
  },
  {
    id: '7',
    title: 'Apple Watch Series 8 45mm',
    description: 'GPS + Cellular. Midnight aluminum case with sport band. Barely used, like new condition.',
    price: 180000,
    location: 'Port Harcourt',
    seller_name: 'Grace Eze',
    seller_phone: '08043210987',
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-06').toISOString()
  },
  {
    id: '8',
    title: 'HP Pavilion Gaming Laptop',
    description: 'Intel i7, 16GB RAM, 512GB SSD, RTX 3050. Perfect for gaming and work. Excellent cooling system.',
    price: 420000,
    location: 'Ibadan',
    seller_name: 'Oluwaseun Adeyemi',
    seller_phone: '08032109876',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop',
    category: 'Electronics',
    created_at: new Date('2024-11-06').toISOString()
  },
  
  // FURNITURE (IDs 9-13)
  {
    id: '9',
    title: 'Modern L-Shaped Sofa Set',
    description: 'Grey fabric sofa, 7-seater. Very comfortable and clean. Only 6 months old. Moving to smaller apartment.',
    price: 185000,
    location: 'Lekki Phase 1, Lagos',
    seller_name: 'Blessing Adamu',
    seller_phone: '08091234567',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
    category: 'Furniture',
    created_at: new Date('2024-11-07').toISOString()
  },
  {
    id: '10',
    title: 'King Size Bed Frame with Mattress',
    description: 'Solid wood bed frame with orthopedic mattress. Excellent condition. Mattress is 1 year old, very clean.',
    price: 95000,
    location: 'Ajah, Lagos',
    seller_name: 'Ibrahim Musa',
    seller_phone: '08081234567',
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
    category: 'Furniture',
    created_at: new Date('2024-11-07').toISOString()
  },
  {
    id: '11',
    title: '6-Seater Dining Table Set',
    description: 'Beautiful wooden dining table with 6 cushioned chairs. Perfect for family dinners. Barely used.',
    price: 125000,
    location: 'Ikeja GRA, Lagos',
    seller_name: 'Ngozi Obi',
    seller_phone: '08071234567',
    image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
    category: 'Furniture',
    created_at: new Date('2024-11-08').toISOString()
  },
  {
    id: '12',
    title: 'Executive Office Desk & Chair',
    description: 'Large executive desk with drawers and ergonomic leather chair. Perfect for home office. Like new.',
    price: 78000,
    location: 'Wuse 2, Abuja',
    seller_name: 'Michael Okafor',
    seller_phone: '08061234567',
    image_url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop',
    category: 'Furniture',
    created_at: new Date('2024-11-08').toISOString()
  },
  {
    id: '13',
    title: 'Wardrobe 4-Door with Mirror',
    description: 'Spacious wardrobe with hanging space and shelves. Mirror on one door. Excellent storage solution.',
    price: 65000,
    location: 'Ogba, Lagos',
    seller_name: 'Aisha Bello',
    seller_phone: '08051234567',
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop',
    category: 'Furniture',
    created_at: new Date('2024-11-09').toISOString()
  },

  // VEHICLES (IDs 14-16)
  {
    id: '14',
    title: 'Toyota Camry 2018 LE',
    description: 'Clean Nigerian used. 4-cylinder, automatic. Full AC, leather seats. First body, accident-free. Very neat.',
    price: 8500000,
    location: 'Ikeja, Lagos',
    seller_name: 'Chukwudi Eze',
    seller_phone: '08041234567',
    image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
    category: 'Vehicles',
    created_at: new Date('2024-11-09').toISOString()
  },
  {
    id: '15',
    title: 'Honda Accord 2016',
    description: 'Tokunbo (foreign used). V6 engine, very sharp. Chilling AC, alloy wheels. Buy and drive.',
    price: 7200000,
    location: 'Berger, Lagos',
    seller_name: 'Yusuf Abdullahi',
    seller_phone: '08031234567',
    image_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
    category: 'Vehicles',
    created_at: new Date('2024-11-10').toISOString()
  },
  {
    id: '16',
    title: 'Lexus RX 350 2015',
    description: 'Foreign used, full option. Panoramic roof, reverse camera, leather interior. Very clean and sharp.',
    price: 15500000,
    location: 'Victoria Island, Lagos',
    seller_name: 'Adeola Williams',
    seller_phone: '08021234567',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
    category: 'Vehicles',
    created_at: new Date('2024-11-10').toISOString()
  },

  // FASHION (IDs 17-19)
  {
    id: '17',
    title: 'Louis Vuitton Neverfull MM Bag',
    description: 'Authentic LV bag, barely used. Comes with dust bag and receipt. Perfect condition, no stains.',
    price: 420000,
    location: 'Lekki Phase 1, Lagos',
    seller_name: 'Funke Adeyemi',
    seller_phone: '08011234567',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
    category: 'Fashion',
    created_at: new Date('2024-11-11').toISOString()
  },
  {
    id: '18',
    title: 'Nike Air Jordan 1 Retro High',
    description: 'Size 43 (US 9.5). Brand new in box. Chicago colorway. 100% authentic with receipt.',
    price: 185000,
    location: 'Surulere, Lagos',
    seller_name: 'Tobiloba Akin',
    seller_phone: '08001234567',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
    category: 'Fashion',
    created_at: new Date('2024-11-11').toISOString()
  },
  {
    id: '19',
    title: 'Rolex Submariner Watch (Pre-owned)',
    description: 'Authentic Rolex, serviced recently. Comes with box and papers. Minor wear, keeps perfect time.',
    price: 3500000,
    location: 'Ikoyi, Lagos',
    seller_name: 'Emeka Nnamdi',
    seller_phone: '07091234567',
    image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop',
    category: 'Fashion',
    created_at: new Date('2024-11-12').toISOString()
  },

  // OTHER - Home Appliances, Sports, etc (IDs 20-30)
  {
    id: '20',
    title: 'Samsung 55" 4K Smart TV',
    description: 'Crystal UHD TV with HDR. Netflix, YouTube built-in. Perfect picture quality. 2 years old.',
    price: 285000,
    location: 'Gbagada, Lagos',
    seller_name: 'Kemi Oluwole',
    seller_phone: '07081234567',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-12').toISOString()
  },
  {
    id: '21',
    title: 'LG Inverter AC 1.5HP',
    description: 'Energy efficient split unit AC. Very cold, low power consumption. 1 year old with warranty.',
    price: 195000,
    location: 'Festac, Lagos',
    seller_name: 'Bola Adebayo',
    seller_phone: '07071234567',
    image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-13').toISOString()
  },
  {
    id: '22',
    title: 'Hisense Double Door Refrigerator',
    description: '350L capacity, frost-free. Very neat and functional. Energy saving. Selling due to relocation.',
    price: 165000,
    location: 'Magodo, Lagos',
    seller_name: 'Segun Ogunleye',
    seller_phone: '07061234567',
    image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-13').toISOString()
  },
  {
    id: '23',
    title: 'Bosch Washing Machine 7kg',
    description: 'Front load automatic washing machine. Multiple wash programs. Very efficient and quiet.',
    price: 145000,
    location: 'Yaba, Lagos',
    seller_name: 'Amina Hassan',
    seller_phone: '07051234567',
    image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-14').toISOString()
  },
  {
    id: '24',
    title: 'Treadmill - Commercial Grade',
    description: 'Heavy duty treadmill with digital display. Speed up to 20km/h. Foldable design. Like new condition.',
    price: 320000,
    location: 'Lekki, Lagos',
    seller_name: 'Chidi Okoro',
    seller_phone: '07041234567',
    image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-14').toISOString()
  },
  {
    id: '25',
    title: 'Complete Home Gym Set',
    description: 'Bench press, dumbbells (5-30kg), barbell, weight plates. Everything for home workout. Barely used.',
    price: 185000,
    location: 'Ikeja, Lagos',
    seller_name: 'Femi Ajayi',
    seller_phone: '07031234567',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-15').toISOString()
  },
  {
    id: '26',
    title: 'Yamaha Acoustic Guitar',
    description: 'Professional quality acoustic guitar. Excellent sound. Comes with case, strap, and extra strings.',
    price: 85000,
    location: 'Surulere, Lagos',
    seller_name: 'Tobi Adewale',
    seller_phone: '07021234567',
    image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-15').toISOString()
  },
  {
    id: '27',
    title: 'Roland Digital Piano 88 Keys',
    description: 'Full-size weighted keys. Multiple instrument sounds. Perfect for learning and performance. Like new.',
    price: 295000,
    location: 'Victoria Island, Lagos',
    seller_name: 'Chiamaka Nwankwo',
    seller_phone: '07011234567',
    image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-16').toISOString()
  },
  {
    id: '28',
    title: 'Baby Crib with Mattress',
    description: 'Wooden baby crib, convertible to toddler bed. Includes quality mattress. Very sturdy and safe.',
    price: 55000,
    location: 'Ajah, Lagos',
    seller_name: 'Mercy Okon',
    seller_phone: '06091234567',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-16').toISOString()
  },
  {
    id: '29',
    title: 'Kids Bicycle Age 5-8 Years',
    description: 'Pink bicycle with training wheels. Basket and bell included. Excellent condition, barely used.',
    price: 28000,
    location: 'Ikeja, Lagos',
    seller_name: 'Folake Adebisi',
    seller_phone: '06081234567',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-17').toISOString()
  },
  {
    id: '30',
    title: 'JAMB & WAEC Past Questions (2015-2024)',
    description: 'Complete set of past questions with answers. All subjects. Perfect for exam preparation.',
    price: 12000,
    location: 'Yaba, Lagos',
    seller_name: 'Ahmed Balogun',
    seller_phone: '06071234567',
    image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
    category: 'Other',
    created_at: new Date('2024-11-17').toISOString()
  }
] as any[]).map((listing: any) => ({
  ...listing,
  status: listing.status || 'available',
  user_id: listing.user_id || 'mock-user-1'
})) as Listing[]

// Storage key for localStorage
const STORAGE_KEY = 'tradehub_listings'
const ID_COUNTER_KEY = 'tradehub_next_id'

// Initialize from localStorage if available (browser only)
function getStoredListings(): Listing[] {
  if (typeof window === 'undefined') return mockListings
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.length > 0 ? parsed : mockListings
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error)
  }
  return mockListings
}

function getNextId(): number {
  if (typeof window === 'undefined') return mockListings.length + 1
  
  try {
    const stored = localStorage.getItem(ID_COUNTER_KEY)
    if (stored) return parseInt(stored, 10)
  } catch (error) {
    console.error('Error reading ID counter:', error)
  }
  return mockListings.length + 1
}

function saveListings(listings: Listing[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

function saveNextId(id: number): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ID_COUNTER_KEY, String(id))
  } catch (error) {
    console.error('Error saving ID counter:', error)
  }
}

// In-memory counter for new IDs
let nextId = getNextId()
let allListings = getStoredListings()

export function getAllListings(): Listing[] {
  allListings = getStoredListings()
  return [...allListings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getListingById(id: string): Listing | null {
  allListings = getStoredListings()
  return allListings.find(listing => listing.id === id) || null
}

export function createListing(data: Omit<Listing, 'id' | 'created_at'>): Listing {
  allListings = getStoredListings()
  const newListing: Listing = {
    ...data,
    id: String(nextId++),
    created_at: new Date().toISOString()
  }
  allListings.push(newListing)
  saveListings(allListings)
  saveNextId(nextId)
  return newListing
}
