'use client'

import { useEffect, useState } from 'react'
import { Listing } from '@/lib/supabase'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { MapPin, MessageCircle, User, Phone, Package, ArrowLeft, Share2, Clock, CheckCircle } from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'
import { toast } from 'react-hot-toast'

export default function ListingDetailPage() {
  const params = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
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

  const handleShare = async () => {
    if (navigator.share && listing) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out ${listing.title} for ₦${listing.price.toLocaleString()} on TradeHub`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Listing unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{error}</p>
          <Link href="/">
            <button className="btn-premium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go back home
            </button>
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

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 py-6 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6 md:mb-8 group transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to listings</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-slate-800/70 rounded-3xl shadow-large p-4 md:p-6 border border-gray-100 dark:border-slate-700/50 animate-fade-in">
              <ImageGallery images={displayImages} title={listing.title} />
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-slate-800/70 rounded-3xl shadow-large p-6 md:p-8 border border-gray-100 dark:border-slate-700/50 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Description</h2>
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all hover:scale-110 active:scale-95"
                  aria-label="Share listing"
                >
                  <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>

              {/* Meta Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Posted {timeAgo(listing.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>{listing.category}</span>
                </div>
                {listing.status === 'available' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Seller Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white dark:bg-slate-800/70 rounded-3xl shadow-large p-6 md:p-8 border border-gray-100 dark:border-slate-700/50 sticky top-6 animate-scale-in">
              {/* Category Badge */}
              <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl text-sm font-semibold mb-4">
                <Package className="w-4 h-4 mr-2" />
                {listing.category}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 break-words">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Price</p>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₦{listing.price.toLocaleString()}
                </p>
              </div>

              {/* Location */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Location</p>
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500" />
                  <span className="break-words font-medium">{listing.location}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Seller Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white break-words">{listing.seller_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-white break-words">{listing.seller_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <MessageCircle className="w-6 h-6 mr-3 flex-shrink-0 relative z-10 group-hover:animate-bounce-subtle" />
                <span className="relative z-10">Contact on WhatsApp</span>
              </a>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Click to chat directly with the seller
              </p>
            </div>

            {/* Safety Tips */}
            <div className="glass-strong rounded-2xl p-6 border border-gray-200 dark:border-slate-700/50">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Safety Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Meet in a public place</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Check the item before payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Never send money in advance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-gray-200 dark:border-slate-700/50 shadow-large p-4 animate-slide-in-bottom">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-glow active:scale-95 transition-all"
        >
          <MessageCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          Contact Seller
        </a>
      </div>
    </div>
  )
}
