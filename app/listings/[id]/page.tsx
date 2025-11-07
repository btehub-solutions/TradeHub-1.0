'use client'

import { useEffect, useState } from 'react'
import { Listing, CATEGORY_ICONS } from '@/lib/supabase'
import { getListingById } from '@/lib/clientStorage'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ListingDetailPage() {
  const params = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const id = params.id as string
    const data = getListingById(id)
    setListing(data)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!listing) {
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
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        ← Back to listings
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Image Carousel */}
        {displayImages.length > 0 ? (
          <div className="relative">
            <img
              src={displayImages[currentImageIndex]}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-96 object-cover"
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
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xl">No image available</span>
          </div>
        )}

        <div className="p-6">
          {/* Category Badge */}
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <span className="mr-1">{CATEGORY_ICONS[listing.category] || '📦'}</span>
            {listing.category}
          </span>

          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>

          <div className="flex items-baseline gap-4 mb-6">
            <p className="text-4xl font-bold text-blue-600">
              ₦{listing.price.toLocaleString()}
            </p>
            <p className="text-gray-600">📍 {listing.location}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Seller Information</h2>
            <p className="text-gray-700">
              <strong>Name:</strong> {listing.seller_name}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {listing.seller_phone}
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-4 rounded-lg font-semibold text-lg"
          >
            💬 Contact Seller on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
