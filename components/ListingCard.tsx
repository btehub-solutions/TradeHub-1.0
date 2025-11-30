import Link from 'next/link';
import Image from 'next/image';
import { Listing, CATEGORY_ICONS } from '@/lib/supabase';
import { MapPin, Package, Eye, Images } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onQuickView?: (listing: Listing) => void;
  priority?: boolean;
}

export default function ListingCard({ listing, onQuickView, priority = false }: ListingCardProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  const CategoryIcon = getIcon(CATEGORY_ICONS[listing.category])

  return (
    <div className="group relative bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl shadow-soft hover:shadow-medium dark:shadow-slate-900/50 transition-all backdrop-blur-sm h-full flex flex-col">
      <Link href={`/listings/${listing.id}`} className="block relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Sold Badge Overlay */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900/90 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl border-2 border-white/20">
              SOLD
            </div>
          </div>
        )}

        {/* Multiple Images Indicator */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
            <Images className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">
              {listing.images.length}
            </span>
          </div>
        )}


        {/* Quick View Button - Desktop Hover */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(listing);
              }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold shadow-lg hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="mb-3 inline-flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg space-x-1.5 border border-blue-100 dark:border-blue-800/50 w-fit">
          <CategoryIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            {listing.category}
          </span>
        </div>

        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-baseline mb-3">
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            ₦{listing.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-auto">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>
      </div>
    </div>
  );
}
