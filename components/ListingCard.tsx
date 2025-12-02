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
    <div className="group relative bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm h-full flex flex-col border border-gray-100 dark:border-slate-700/50">
      <Link href={`/listings/${listing.id}`} className="block relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-t-2xl">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <CategoryIcon className="w-16 h-16 text-gray-300 dark:text-slate-600" />
          </div>
        )}

        {/* Sold Badge Overlay */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-xl font-bold text-lg shadow-2xl border border-white/20 tracking-wider">
              SOLD
            </div>
          </div>
        )}

        {/* Multiple Images Indicator */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1.5 border border-white/10">
            <Images className="w-3.5 h-3.5 text-white/90" />
            <span className="text-xs font-semibold text-white/90">
              {listing.images.length}
            </span>
          </div>
        )}


        {/* Quick View Button - Desktop Hover */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(listing);
              }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold shadow-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="mb-3 inline-flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg space-x-1.5 border border-blue-100 dark:border-blue-800/50 w-fit group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
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

        <div className="flex items-baseline mb-4">
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ₦{listing.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700/50">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>
      </div>
    </div>
  );
}
