import { Listing, CATEGORY_ICONS } from '@/lib/supabase'
import { getListingById } from '@/lib/mockData'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, MessageCircle, User, Phone } from 'lucide-react'
import * as Icons from 'lucide-react'

async function getListing(id: string): Promise<Listing | null> {
  return getListingById(id)
}

function getIcon(iconName: string) {
  const IconComponent = Icons[iconName as keyof typeof Icons] as any
  return IconComponent || Icons.Package
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const listing = await getListing(params.id)

  if (!listing) {
    notFound()
  }

  const phoneNumber = listing.seller_phone.replace(/^0/, '234')
  const whatsappMessage = `Hi, I'm interested in your ${listing.title} listed on TradeHub for ₦${listing.price.toLocaleString()}` 
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}` 
  
  const IconComponent = getIcon(CATEGORY_ICONS[listing.category])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 group animate-fade-in"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-large animate-scale-in">
              {listing.image_url ? (
                <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <IconComponent className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-3xl shadow-large p-8 animate-slide-up">
              {/* Category Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-xl mb-4">
                <IconComponent className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">
                  {listing.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {listing.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-lg">{listing.location}</span>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  ₦{listing.price.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-large p-6 sticky top-24 animate-slide-up">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Information</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Seller</p>
                    <p className="font-semibold text-gray-900">{listing.seller_name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{listing.seller_phone}</p>
                  </div>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full inline-flex items-center justify-center px-6 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-large hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact on WhatsApp
              </a>

              <p className="text-xs text-gray-500 text-center mt-4">
                Click to start a conversation with the seller
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
