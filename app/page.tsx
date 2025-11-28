'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Images, AlertCircle, Lightbulb, Grid3x3, List, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Listing, CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'react-hot-toast'
import FeatureCard from '@/components/FeatureCard'
import HeroHeader from '@/components/HeroHeader'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

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

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchListings()
  }

  const skeletonItems = useMemo(() => Array.from({ length: 6 }), [])

  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedListings = filteredListings.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory])

  // Get icon component dynamically
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Header */}
      <HeroHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar Section */}
        <div className="mb-12 animate-fade-in">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 w-5 h-5 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 dark:text-white dark:border-slate-700/50 border-0 rounded-2xl shadow-soft focus:shadow-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 transition-all text-lg placeholder:text-gray-400 dark:placeholder:text-slate-400 backdrop-blur-sm"
            />
          </div>
        </div>


        {/* Category Pills */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Categories
            </h2>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map((category) => {
              const IconComponent = getIcon(CATEGORY_ICONS[category])
              const isSelected = selectedCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/70 shadow-soft hover:shadow-medium hover:scale-105 backdrop-blur-sm'
                    }`}
                >
                  <IconComponent className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Info & View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-slate-300 font-medium">
            {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
            {selectedCategory !== 'All' && <span className="text-blue-600 dark:text-blue-400"> in {selectedCategory}</span>}
          </p>

          {/* View Mode Toggle - Mobile Only */}
          <div className="flex md:hidden items-center gap-2 bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-xl p-1 shadow-soft">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'single'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              aria-label="Single view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {skeletonItems.map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-soft p-4 space-y-4">
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
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or category filter</p>
            <Link href="/listings/new">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                Post the first item
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'single'
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
              {paginatedListings.map((listing, index) => {
                const IconComponent = getIcon(CATEGORY_ICONS[listing.category])

                return (
                  <Link
                    href={`/listings/${listing.id}`}
                    key={listing.id}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl shadow-soft hover:shadow-medium dark:shadow-slate-900/50 transition-all backdrop-blur-sm">
                      {error && (
                        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col gap-3 text-sm text-red-700">
                          <span>{error}</span>
                          <button
                            onClick={handleRetry}
                            disabled={loading}
                            className="self-start px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {loading ? 'Retrying...' : 'Try Again'}
                          </button>
                        </div>
                      )}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl">
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
                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {listing.title}
                        </h3>

                        <div className="flex items-baseline mb-3">
                          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            ₦{listing.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                          <span className="line-clamp-1">{listing.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-6">
                {/* Page Numbers */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 text-gray-700 dark:text-slate-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)

                    // Show ellipsis
                    const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3
                    const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400 dark:text-gray-600">
                          ...
                        </span>
                      )
                    }

                    if (!showPage) return null

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/70 shadow-soft hover:shadow-medium'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 text-gray-700 dark:text-slate-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Page Info */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredListings.length)} of {filteredListings.length} items
                </p>
              </div>
            )}
          </>
        )}

        {/* BTEHub Ad Section */}
        <div className="mt-20 mb-16 animate-fade-in">
          <div className="bg-black rounded-3xl overflow-hidden shadow-xl border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 text-xs font-medium w-fit mb-6 border border-blue-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Featured Partner
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  BTEHub Solutions
                </h2>
                <p className="text-blue-400 font-medium text-lg mb-6">
                  Transforming Business With Artificial Intelligence
                </p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  BTEHub specializes in AI Innovation to help businesses unlock the full potential of artificial intelligence with measurable results.
                </p>
                <a href="https://btehubsolutions.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white font-semibold hover:text-blue-400 transition-colors group">
                  Learn more about AI Solutions
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="relative h-64 md:h-auto bg-black flex items-center justify-center">
                <img
                  src="/btehub-ad.jpg"
                  alt="BTEHub Solutions AI"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-black md:via-transparent md:to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Olas Realtor Ad Section */}
        <div className="mb-16 animate-fade-in">
          <div className="bg-green-950 rounded-3xl overflow-hidden shadow-xl border border-green-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-xs font-medium w-fit mb-6 border border-green-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Featured Partner
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Olas Realtor & Consulting
                </h2>
                <p className="text-orange-400 font-medium text-lg mb-6">
                  Your Trusted Real Estate Partner
                </p>
                <p className="text-gray-300 leading-relaxed mb-8">
                  Services include: Project Management, Agency/Sales of Property, Property Management, Valuation, Feasibility Appraisal, Architectural Drawings, and Title Documentation.
                </p>
                <a href="https://olasrealtor.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white font-semibold hover:text-orange-400 transition-colors group">
                  Visit Website
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="relative h-64 md:h-auto bg-green-950 flex items-center justify-center">
                <img
                  src="/olas-realtor-ad.jpg"
                  alt="Olas Realtor & Consulting"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-green-950 md:via-transparent md:to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Why We Built This Platform Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Why We Built This Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We&apos;re on a mission to make local trading simple, safe, and accessible for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <FeatureCard
              icon={AlertCircle}
              title="The Problem"
              description="Finding trustworthy buyers and sellers locally can be challenging. Traditional marketplaces often lack transparency, have hidden fees, and don&apos;t prioritize user safety. Many people struggle to declutter their homes or find affordable pre-owned items because there&apos;s no reliable platform connecting local communities."
              iconBgColor="bg-red-50 dark:bg-red-900/20"
              iconColor="text-red-600 dark:text-red-400"
            />

            <FeatureCard
              icon={Lightbulb}
              title="Our Solution"
              description="TradeHub brings local buyers and sellers together in one secure, transparent marketplace. We verify users, provide clear pricing with no hidden fees, and create a trusted community where you can buy quality pre-owned items or sell things you no longer need. Everything happens locally, making transactions faster, safer, and more personal."
              iconBgColor="bg-green-50 dark:bg-green-900/20"
              iconColor="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        {/* Grow Your Business Section */}
        <div className="mb-16 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Grow Your Business with TradeHub
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Reach thousands of local customers where they shop. Promote your products or services directly to a targeted audience in your community.
              </p>
              <Link href="/advertise">
                <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  Advertise with Us
                  <TrendingUp className="w-5 h-5 ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
