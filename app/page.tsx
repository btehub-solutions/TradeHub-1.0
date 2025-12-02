'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, TrendingUp, Images, AlertCircle, Lightbulb, Grid3x3, List, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Listing, CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'react-hot-toast'
import FeatureCard from '@/components/FeatureCard'
import HeroHeader from '@/components/HeroHeader'
import CategoryGrid from '@/components/CategoryGrid'
import ListingCard from '@/components/ListingCard'
import QuickViewModal from '@/components/QuickViewModal'
import Testimonials from '@/components/Testimonials'
import TrustBadges from '@/components/TrustBadges'
import StructuredData from '@/components/StructuredData'


function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState<Listing[]>([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const itemsPerPage = 12
  const listingsRef = useRef<HTMLDivElement>(null)

  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get('category') || 'All'
    const searchQuery = searchParams.get('search') || ''
    setSelectedCategory(category)
    setSearch(searchQuery)
  }, [searchParams])

  // Ad carousel data
  const ads = useMemo(() => [
    {
      title: 'BTEHub Solutions',
      subtitle: 'Transforming Business With Artificial Intelligence',
      description: 'BTEHub specializes in AI Innovation to help businesses unlock the full potential of artificial intelligence with measurable results.',
      link: 'https://btehubsolutions.vercel.app/',
      linkText: 'Learn more about AI Solutions',
      image: '/btehub-ad.jpg',
      bgColor: 'bg-black',
      borderColor: 'border-gray-800',
      badgeBg: 'bg-blue-900/50',
      badgeText: 'text-blue-400',
      badgeBorder: 'border-blue-800',
      pingColor: 'bg-blue-400',
      dotColor: 'bg-blue-500',
      subtitleColor: 'text-blue-400',
      hoverColor: 'hover:text-blue-400',
      gradientFrom: 'from-black/80',
      gradientFromMd: 'md:from-black'
    },
    {
      title: 'Olas Realtor & Consulting',
      subtitle: 'Your Trusted Real Estate Partner',
      description: 'Services include: Project Management, Agency/Sales of Property, Property Management, Valuation, Feasibility Appraisal, Architectural Drawings, and Title Documentation.',
      link: 'https://olasrealtor.com',
      linkText: 'Visit Website',
      image: '/olas-realtor-ad.jpg',
      bgColor: 'bg-green-950',
      borderColor: 'border-green-900',
      badgeBg: 'bg-green-900/50',
      badgeText: 'text-green-400',
      badgeBorder: 'border-green-800',
      pingColor: 'bg-green-400',
      dotColor: 'bg-green-500',
      subtitleColor: 'text-orange-400',
      hoverColor: 'hover:text-orange-400',
      gradientFrom: 'from-green-950/80',
      gradientFromMd: 'md:from-green-950'
    }
  ], [])

  const fetchListings = useCallback(
    async (signal?: AbortSignal) => {
      try {
        // Build query parameters
        const params = new URLSearchParams()

        if (search) params.append('search', search)
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)

        const response = await fetch(`/api/listings?${params.toString()}`, {
          cache: 'no-store',
          signal
        })

        if (!response.ok) {
          throw new Error('Failed to fetch listings')
        }

        const data: Listing[] = await response.json()
        setListings(data)
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
    [search, selectedCategory]
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

  // Update URL when filters change
  const updateURL = useCallback((newCategory: string, newSearch: string) => {
    const params = new URLSearchParams()

    if (newSearch) params.set('search', newSearch)
    if (newCategory && newCategory !== 'All') params.set('category', newCategory)

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false })
  }, [router])

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateURL(selectedCategory, value)
  }

  // Handle category change from pills
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateURL(category, search)
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

  // Scroll to listings when page changes
  useEffect(() => {
    if (currentPage > 1 || (currentPage === 1 && listingsRef.current)) {
      // Only scroll if we are not at the top (simple check) or if it's a page change
      // We use a small timeout to ensure DOM is ready if needed, though usually not required in React
      // But here we just want to scroll if the user is deep down the page
      if (window.scrollY > 400) {
        listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [currentPage])

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [ads.length])

  // Get icon component dynamically
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Structured Data for SEO */}
      <StructuredData type="website" />
      <StructuredData type="organization" />

      {/* Hero Header */}
      <HeroHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Grid */}
        <CategoryGrid />

        {/* Sticky Search & Filter Section */}
        <div className="sticky top-16 sm:top-20 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-gray-200/50 dark:border-gray-800/50 py-4 mb-8 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar Section */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 w-5 h-5 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 border border-gray-200 rounded-xl shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 transition-all text-base placeholder:text-gray-400 dark:placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Quick Filters
                </h2>
              </div>
              <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {CATEGORIES.map((category) => {
                  const IconComponent = getIcon(CATEGORY_ICONS[category])
                  const isSelected = selectedCategory === category

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`group relative inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 mr-1.5 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div ref={listingsRef} className="scroll-mt-24"></div>

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
        </div >

        {/* Listings Grid */}
        {
          loading ? (
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
                {paginatedListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ListingCard
                      listing={listing}
                      onQuickView={setSelectedListing}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 mb-12 flex flex-col items-center gap-6">
                  {/* Page Numbers */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(prev => Math.max(1, prev - 1))
                      }}
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
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                      }}
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
          )
        }

        {/* Testimonials Section */}
        <Testimonials />

        {/* Trust Badges Section */}
        <TrustBadges />

        {/* Ad Carousel Section */}
        <div className="mt-20 mb-16 animate-fade-in">
          <div className={`${ads[currentAdIndex].bgColor} rounded-3xl overflow-hidden shadow-xl border ${ads[currentAdIndex].borderColor} transition-all duration-500 relative`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ads[currentAdIndex].badgeBg} ${ads[currentAdIndex].badgeText} text-xs font-medium w-fit mb-6 border ${ads[currentAdIndex].badgeBorder}`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ads[currentAdIndex].pingColor} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${ads[currentAdIndex].dotColor}`}></span>
                  </span>
                  Featured Partner
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {ads[currentAdIndex].title}
                </h2>
                <p className={`${ads[currentAdIndex].subtitleColor} font-medium text-lg mb-6`}>
                  {ads[currentAdIndex].subtitle}
                </p>
                <p className="text-gray-300 leading-relaxed mb-8">
                  {ads[currentAdIndex].description}
                </p>
                <a href={ads[currentAdIndex].link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center text-white font-semibold ${ads[currentAdIndex].hoverColor} transition-colors group`}>
                  {ads[currentAdIndex].linkText}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className={`relative h-64 md:h-auto ${ads[currentAdIndex].bgColor} flex items-center justify-center`}>
                <img
                  src={ads[currentAdIndex].image}
                  alt={ads[currentAdIndex].title}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${ads[currentAdIndex].gradientFrom} via-transparent to-transparent ${ads[currentAdIndex].gradientFromMd} md:via-transparent md:to-transparent pointer-events-none`} />
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <button
                onClick={() => setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all hover:scale-110"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex justify-center gap-2">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAdIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentAdIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    aria-label={`Go to ad ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentAdIndex((prev) => (prev + 1) % ads.length)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all hover:scale-110"
                aria-label="Next ad"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
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
      </div >
      {/* Quick View Modal */}
      {
        selectedListing && (
          <QuickViewModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )
      }
    </div >
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
