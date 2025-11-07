'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Images } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Listing, CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import { getStoredListings } from '@/lib/clientStorage'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = () => {
    try {
      const data = getStoredListings()
      // Sort by newest first
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setListings(sorted)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory
    const matchesSearch = 
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Get icon component dynamically
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Discover Amazing Deals
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Buy and sell anything in your local community
          </p>

          {/* Modern Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl shadow-soft focus:shadow-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Categories
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => {
              const IconComponent = getIcon(CATEGORY_ICONS[category])
              const isSelected = selectedCategory === category
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative inline-flex items-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-soft hover:shadow-medium hover:scale-105'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">
            {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
            {selectedCategory !== 'All' && <span className="text-blue-600"> in {selectedCategory}</span>}
          </p>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or category filter</p>
            <Link href="/listings/new">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                Post the first item
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing, index) => {
              const IconComponent = getIcon(CATEGORY_ICONS[listing.category])
              
              return (
                <Link
                  href={`/listings/${listing.id}`}
                  key={listing.id}
                  className="group animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 hover:scale-[1.02]">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconComponent className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-soft">
                        <IconComponent className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-700">
                          {listing.category}
                        </span>
                      </div>

                      {/* Multiple Images Indicator */}
                      {listing.images && listing.images.length > 1 && (
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                          <Images className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-semibold text-white">
                            {listing.images.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-baseline mb-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          ₦{listing.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
