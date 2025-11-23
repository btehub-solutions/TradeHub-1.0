'use client'

import { useEffect, useState } from 'react'
import { Listing } from '@/lib/supabase'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, User, Phone, Package } from 'lucide-react'

export default function ListingDetailPage() {
  const params = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = params.id as string

    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`, { cache: 'no-store' })

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
  }, [params.id])

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
      >
        ← Back to listings
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50">
        {/* Image Carousel */}
        {displayImages.length > 0 ? (
          <div className="relative">
            <img
              src={displayImages[currentImageIndex]}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-96 object-contain bg-gray-100 dark:bg-slate-700"
            />

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              </>
            )}

            {/* Thumbnail Navigation */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-xl">No image available</span>
          </div>
        )}

        <div className="p-6">
          {/* Category Badge */}
          <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Package className="w-4 h-4 mr-2" />
            {listing.category}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{listing.title}</h1>

          <div className="flex items-baseline gap-4 mb-6">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              ₦{listing.price.toLocaleString()}
            </p>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 mr-1.5" />
              {listing.location}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <div className="border-t dark:border-slate-700 pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium">{listing.seller_name}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{listing.seller_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact Seller on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
