'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface ImageCarouselProps {
    images: string[]
    title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No images available</p>
                </div>
            </div>
        )
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const goToImage = (index: number) => {
        setCurrentIndex(index)
    }

    return (
        <>
            {/* Main Carousel */}
            <div className="relative group">
                {/* Main Image */}
                <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        className="w-full h-full object-contain"
                    />

                    {/* Zoom Button */}
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="View fullscreen"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                        ? 'border-blue-600 dark:border-blue-400 scale-105'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                    }`}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                        aria-label="Close fullscreen"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Fullscreen Image */}
                    <div className="max-w-7xl max-h-screen p-4">
                        <img
                            src={images[currentIndex]}
                            alt={`${title} - Image ${currentIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-screen-lg overflow-x-auto px-4">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToImage(index)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? 'border-white scale-110'
                                            : 'border-white/30 hover:border-white/60'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
