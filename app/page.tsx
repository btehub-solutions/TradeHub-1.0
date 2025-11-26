'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Images, Sparkles, Heart, Share2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Listing, CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import TrustBadges from '@/components/TrustBadges'
import { toast } from 'react-hot-toast'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearchSticky, setIsSearchSticky] = useState(false)

  const sortByDate = useCallback(
    (items: Listing[]) =>
      [...items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    []
  )

  const fetchListings = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch('/api/listings', {
          cache: 'no-store',
          signal
        })

        if (!response.ok) {
          throw new Error('Failed to fetch listings')
        }

        const data: Listing[] = await response.json()
        setListings(sortByDate(data))
        setError(null)
      } catch (err: any) {
        if (signal?.aborted) return
        console.error('Error fetching listings:', err)
        setListings([])
        const message = err?.message || 'Failed to load listings. Please try again.'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [sortByDate]
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchListings(controller.signal)

    return () => controller.abort()
  }, [fetchListings])

  // Sticky search on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSearchSticky(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchListings()
  }

  const skeletonItems = useMemo(() => Array.from({ length: 8 }), [])

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

  // Check if listing is new (within 3 days)
  const isNewListing = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Sticky Search Bar */}
      {isSearchSticky && (
        <div className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-gray-200 dark:border-slate-700/50 shadow-large animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 border border-gray-200 rounded-xl shadow-soft focus:shadow-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Enhanced Hero Section */}
        <div className="mb-12 md:mb-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full mb-6 animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Nigeria's Fastest Growing Marketplace
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent animate-float">
              Discover Amazing Deals
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 max-w-3xl mx-auto">
            Buy and sell anything in your local community with{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">instant WhatsApp contact</span>
          </p>

          {/* Modern Search Bar */}
          <div className="relative max-w-3xl mx-auto mb-8" id="search">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-6 h-6 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for phones, laptops, furniture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800/70 dark:text-white dark:border-slate-700/50 border-0 rounded-2xl shadow-large focus:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/40 transition-all text-lg placeholder:text-gray-400 dark:placeholder:text-slate-400 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{listings.length}+</span> Active Listings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">1000+</span> Happy Users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">24/7</span> Support
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-10 md:mb-12 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Browse Categories
            </h2>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto pb-3 gap-3 scrollbar-hide fade-edges">
              {CATEGORIES.map((category) => {
                const IconComponent = getIcon(CATEGORY_ICONS[category])
                const isSelected = selectedCategory === category

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative inline-flex items-center px-5 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-glow scale-105'
                        : 'bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/70 shadow-soft hover:shadow-large hover:scale-105 card-hover'
                      }`}
                  >
                    <IconComponent className={`w-5 h-5 mr-2.5 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    <span className="text-sm md:text-base">{category}</span>
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl blur-lg opacity-30 -z-10"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-3">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === 'All' ? 'All Listings' : selectedCategory}
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
              {selectedCategory !== 'All' && <span className="text-blue-600 dark:text-blue-400"> in {selectedCategory}</span>}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex flex-col gap-3 text-sm text-red-700 dark:text-red-400 animate-fade-in">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="self-start px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {skeletonItems.map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-4 space-y-4 animate-pulse">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner-soft">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your search or category filter, or be the first to post in this category!
            </p>
            <Link href="/listings/new">
              <button className="btn-premium">
                Post the first item
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredListings.map((listing, index) => {
              const IconComponent = getIcon(CATEGORY_ICONS[listing.category])
              const isNew = isNewListing(listing.created_at)

              return (
                <Link
                  href={`/listings/${listing.id}`}
                  key={listing.id}
                  className="group animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IconComponent className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}

                      {/* New Badge */}
                      {isNew && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg animate-bounce-subtle">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">NEW</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 glass backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-soft">
                        <IconComponent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          {listing.category}
                        </span>
                      </div>

                      {/* Multiple Images Indicator */}
                      {listing.images && listing.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                          <Images className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-semibold text-white">
                            {listing.images.length}
                          </span>
                        </div>
                      )}

                      {/* Quick Actions (visible on hover) */}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toast.success('Added to wishlist!')
                          }}
                          className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
                        >
                          <Heart className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            if (navigator.share) {
                              navigator.share({
                                title: listing.title,
                                text: `Check out ${listing.title} on TradeHub`,
                                url: window.location.origin + `/listings/${listing.id}`
                              })
                            } else {
                              toast.success('Link copied to clipboard!')
                            }
                          }}
                          className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
                        >
                          <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {listing.title}
                      </h3>

                      <div className="flex items-baseline mb-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₦{listing.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Trust Badges Section */}
        {!loading && <TrustBadges />}
      </div>
    </div>
  )
}
