'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

type Testimonial = {
    id: number
    name: string
    location: string
    rating: number
    text: string
    initials: string
    bgColor: string
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Adebayo Johnson",
        location: "Lagos",
        rating: 5,
        text: "I sold my laptop in just 2 days! The platform is easy to use and the buyers were genuine. Highly recommend TradeHub for anyone looking to sell quickly.",
        initials: "AJ",
        bgColor: "bg-blue-500"
    },
    {
        id: 2,
        name: "Chioma Okafor",
        location: "Abuja",
        rating: 5,
        text: "Found exactly what I was looking for at a great price. The seller was verified and the transaction was smooth and safe. Best marketplace experience!",
        initials: "CO",
        bgColor: "bg-purple-500"
    },
    {
        id: 3,
        name: "Ibrahim Musa",
        location: "Kano",
        rating: 5,
        text: "Best marketplace for local trading. I've bought and sold multiple items with zero issues. The community is trustworthy and responsive!",
        initials: "IM",
        bgColor: "bg-green-500"
    },
    {
        id: 4,
        name: "Blessing Eze",
        location: "Port Harcourt",
        rating: 5,
        text: "As a first-time seller, I was nervous, but TradeHub made it so easy. Got my item sold within hours and the buyer was very professional.",
        initials: "BE",
        bgColor: "bg-pink-500"
    },
    {
        id: 5,
        name: "Yusuf Abdullahi",
        location: "Kaduna",
        rating: 5,
        text: "Great platform for finding quality pre-owned items. Prices are fair and sellers are honest. I've made several purchases and all went smoothly.",
        initials: "YA",
        bgColor: "bg-indigo-500"
    },
    {
        id: 6,
        name: "Ngozi Okonkwo",
        location: "Enugu",
        rating: 5,
        text: "Love the local focus! I can meet sellers nearby which makes transactions safer and faster. TradeHub has become my go-to marketplace.",
        initials: "NO",
        bgColor: "bg-teal-500"
    }
]

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const nextTestimonial = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const goToTestimonial = (index: number) => {
        setIsAutoPlaying(false)
        setCurrentIndex(index)
    }

    // Get 3 testimonials to display (current and next 2)
    const getVisibleTestimonials = () => {
        const visible = []
        for (let i = 0; i < 3; i++) {
            visible.push(testimonials[(currentIndex + i) % testimonials.length])
        }
        return visible
    }

    const visibleTestimonials = getVisibleTestimonials()

    return (
        <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        What Our Community Says
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Hear from real buyers and sellers who trust TradeHub for their local trading needs
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {visibleTestimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Quote Icon */}
                            <div className="mb-4">
                                <Quote className="w-8 h-8 text-blue-500 opacity-50" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                &quot;{testimonial.text}&quot;
                            </p>

                            {/* User Info */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                                    {testimonial.initials}
                                </div>
                                {/* Name & Location */}
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {testimonial.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-4">
                    {/* Previous Button */}
                    <button
                        onClick={prevTestimonial}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex gap-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToTestimonial(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'w-8 bg-blue-600'
                                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextTestimonial}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}
