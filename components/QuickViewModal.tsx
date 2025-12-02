'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, MapPin, User, Phone, ArrowRight, Images, ExternalLink } from 'lucide-react'
import { Listing, CATEGORY_ICONS } from '@/lib/supabase'
import * as Icons from 'lucide-react'

interface QuickViewModalProps {
    listing: Listing
    onClose: () => void
}

export default function QuickViewModal({ listing, onClose }: QuickViewModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const images = listing.images && listing.images.length > 0
        ? listing.images
        : listing.image_url
            ? [listing.image_url]
            : []

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const getIcon = (iconName: string) => {
        const IconComponent = Icons[iconName as keyof typeof Icons] as any
        return IconComponent || Icons.Package
    }

    const CategoryIcon = getIcon(CATEGORY_ICONS[listing.category])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-slate-800 relative h-64 md:h-auto md:min-h-full flex-shrink-0">
                    {images.length > 0 ? (
                        <div className="relative w-full h-full">
                            <img
                                src={images[currentImageIndex]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Image Navigation if multiple */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setCurrentImageIndex(idx)
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx
                                                ? 'bg-white w-6'
                                                : 'bg-white/50 hover:bg-white/80'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Images className="w-16 h-16" />
                        </div>
                    )}

                    {/* Sold Badge */}
                    {listing.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                            <div className="bg-white/10 backdrop-blur-md border-2 border-white/50 text-white px-8 py-3 rounded-xl font-bold text-2xl transform -rotate-12 shadow-xl">
                                SOLD
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {listing.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {listing.title}
                    </h2>

                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            ₦{listing.price.toLocaleString()}
                        </span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{listing.location}</span>
                        </div>

                        <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300">
                            <p className="line-clamp-4">{listing.description}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Seller Information
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                                {listing.seller_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {listing.seller_name}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{listing.seller_phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                        <Link
                            href={`/listings/${listing.id}`}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            View Full Details
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
