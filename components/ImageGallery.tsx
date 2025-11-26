'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
    images: string[]
    title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextImage()
        }
        if (isRightSwipe) {
            prevImage()
        }

        setTouchStart(0)
        setTouchEnd(0)
    }

    if (images.length === 0) {
        return (
            <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">No images available</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Main Gallery */}
            <div className="relative group">
                {/* Main Image */}
                <div
                    className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl overflow-hidden cursor-zoom-in"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Zoom Indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to enlarge</span>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    prevImage()
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    nextImage()
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-thin pb-2">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                        ? 'border-blue-600 dark:border-blue-400 shadow-glow scale-110'
                                        : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Dot Indicators for Mobile */}
                {images.length > 1 && (
                    <div className="md:hidden flex justify-center gap-2 mt-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-blue-600 dark:bg-blue-400 w-8'
                                        : 'bg-gray-300 dark:bg-slate-600 w-2 hover:bg-blue-400 dark:hover:bg-blue-500'
                                    }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95"
                        aria-label="Close lightbox"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative max-w-7xl max-h-full">
                        <img
                            src={images[currentIndex]}
                            alt={`${title} - Image ${currentIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
