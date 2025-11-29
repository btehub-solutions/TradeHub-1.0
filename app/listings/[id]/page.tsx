'use client'

import { useEffect, useState } from 'react'
import { Listing } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, MessageCircle, User, Phone, Package, Shield, Info } from 'lucide-react'
import ImageCarousel from '@/components/ImageCarousel'

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [listingId, setListingId] = useState<string>('')
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Unwrap params
  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setListingId(resolvedParams.id)
    }
    init()
  }, [params])

  // Fetch listing
  useEffect(() => {
    if (!listingId) return

    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`, { cache: 'no-store' })

        if (!response.ok) {
          throw new Error('Failed to fetch listing')
        }

        const data: Listing = await response.json()
        setListing(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching listing:', error)
        setListing(null)
        setError('Unable to load this listing. It may have been removed or you have no network connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [listingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!listing) {
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Listing unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition"
          >
            Go back home
          </Link>
        </div>
      )
    }

    notFound()
  }

  // Format phone number for WhatsApp (remove leading 0, add 234)
  const phoneNumber = listing.seller_phone.replace(/^0/, '234')
  const whatsappMessage = `Hi, I'm interested in your ${listing.title} listed on TradeHub for ₦${listing.price.toLocaleString()}`
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const displayImages = listing.images && listing.images.length > 0
    ? listing.images
    : listing.image_url
      ? [listing.image_url]
      : []

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
      >
        ← Back to listings
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50">
        {/* Image Carousel */}
        <div className="p-4 sm:p-6">
          <ImageCarousel images={displayImages} title={listing.title} />
        </div>

        <div className="p-4 sm:p-6">
          {/* Category Badge */}
          <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Package className="w-4 h-4 mr-2" />
            {listing.category}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 break-words">{listing.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-4 mb-6">
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
              ₦{listing.price.toLocaleString()}
            </p>
            <div className="flex items-start sm:items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 mr-1.5 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="break-words text-sm sm:text-base">{listing.location}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <div className="border-t dark:border-slate-700 pt-4 sm:pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium break-words">{listing.seller_name}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium break-words">{listing.seller_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors mb-8"
          >
            <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Contact Seller on WhatsApp</span>
          </a>

          {/* How it Works & Safety Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* How it Works */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">How it Works</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Click &quot;Contact Seller&quot; to chat via WhatsApp</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Check availability and arrange a meeting</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Meet in a safe, public location</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Inspect the item before paying</span>
                </li>
              </ul>
            </div>

            {/* Safety Tips */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Safety Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Never pay in advance for items</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Meet in open, public places</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Check the item thoroughly</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Pay only when satisfied</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
