'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import { toast } from 'react-hot-toast'
import { Listing } from '@/lib/supabase'

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [fetchingListing, setFetchingListing] = useState(true)
    const [listingId, setListingId] = useState<string>('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        seller_name: '',
        seller_phone: '',
        category: 'Electronics'
    })

    // Unwrap params and fetch listing
    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params
            setListingId(resolvedParams.id)
        }
        init()
    }, [params])

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to edit listings')
            router.replace('/auth/signin')
        }
    }, [user, authLoading, router])

    // Fetch listing data
    useEffect(() => {
        const fetchListing = async () => {
            if (!listingId || !user?.id) return

            setFetchingListing(true)
            try {
                const response = await fetch(`/api/listings/${listingId}`, {
                    cache: 'no-store'
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch listing')
                }

                const listing: Listing = await response.json()

                // Verify user owns this listing
                if (listing.user_id !== user.id) {
                    toast.error('You can only edit your own listings')
                    router.replace('/dashboard')
                    return
                }

                // Populate form with existing data
                setFormData({
                    title: listing.title,
                    description: listing.description || '',
                    price: listing.price.toString(),
                    location: listing.location,
                    seller_name: listing.seller_name || '',
                    seller_phone: listing.seller_phone || '',
                    category: listing.category
                })

                // Set existing images
                if (listing.images && listing.images.length > 0) {
                    setExistingImages(listing.images)
                } else if (listing.image_url) {
                    setExistingImages([listing.image_url])
                }

            } catch (error: any) {
                console.error('Error fetching listing:', error)
                toast.error('Failed to load listing')
                router.replace('/dashboard')
            } finally {
                setFetchingListing(false)
            }
        }

        fetchListing()
    }, [listingId, user?.id, router])

    const uploadImages = async () => {
        const urls: string[] = []

        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
            const filePath = `${user?.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('listings')
                .upload(filePath, file)

            if (uploadError) {
                throw new Error(`Error uploading image: ${uploadError.message}`)
            }

            const { data } = supabase.storage
                .from('listings')
                .getPublicUrl(filePath)

            urls.push(data.publicUrl)
        }

        return urls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in to edit listings')
            router.replace('/auth/signin')
            return
        }

        setLoading(true)

        try {
            const toastId = toast.loading('Uploading new images...')

            // Upload new images if any
            let newImageUrls: string[] = []
            if (imageFiles.length > 0) {
                newImageUrls = await uploadImages()
            }

            // Combine existing and new images
            const allImages = [...existingImages, ...newImageUrls]

            toast.loading('Updating your listing...', { id: toastId })

            const updateData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                seller_name: formData.seller_name,
                seller_phone: formData.seller_phone,
                category: formData.category,
                image_url: allImages.length > 0 ? allImages[0] : null,
                images: allImages.length > 0 ? allImages : null,
            }

            const response = await fetch(`/api/listings/${listingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    data: updateData
                })
            })

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}))
                throw new Error(errorBody?.error || 'Failed to update listing')
            }

            toast.success('Listing updated successfully!', { id: toastId })
            router.push('/dashboard')

        } catch (error: any) {
            console.error('Error:', error)
            toast.error(error.message || 'Error updating listing. Please try again.')
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const MAX_IMAGES = 5
        const MAX_SIZE_MB = 5 * 1024 * 1024
        const totalImages = existingImages.length + imageFiles.length + files.length

        if (totalImages > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        const newFiles: File[] = []
        const newPreviews: string[] = []

        Array.from(files).forEach(file => {
            if (file.size > MAX_SIZE_MB) {
                toast.error(`${file.name} is too large. Maximum 5MB per image.`)
                return
            }
            newFiles.push(file)
            newPreviews.push(URL.createObjectURL(file))
        })

        setImageFiles(prev => [...prev, ...newFiles])
        setPreviews(prev => [...prev, ...newPreviews])
    }

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
        toast.success('Image removed')
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
        toast.success('Image will be removed when you save')
    }

    const postCategories = CATEGORIES.filter(cat => cat !== 'All')

    if (authLoading || !user || fetchingListing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to dashboard
                    </Link>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        Edit Listing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">Update your listing details</p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-large p-4 sm:p-6 md:p-8 animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Item Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., iPhone 13 Pro Max 256GB"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Category *
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    {postCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your item in detail..."
                                rows={4}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                            />
                        </div>

                        {/* Price & Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Price (₦) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="25000"
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Ikeja, Lagos"
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Seller Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.seller_name}
                                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    WhatsApp Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.seller_phone}
                                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                                    placeholder="08012345678"
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Image Management */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Item Photos
                            </label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Images</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {existingImages.map((img, index) => (
                                            <div key={`existing-${index}`} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold">
                                                        Main
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {previews.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New Images to Add</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {previews.map((img, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            <label className={`cursor-pointer ${existingImages.length + previews.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={existingImages.length + previews.length >= 5}
                                />
                                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                                    <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Add More Photos</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {existingImages.length + previews.length > 0
                                            ? `${existingImages.length + previews.length}/5 images`
                                            : 'Click to select from your files'}
                                    </span>
                                </div>
                            </label>

                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start mt-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 mr-2"></span>
                                Maximum 5 photos total (max 5MB each). First image will be the main photo.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-large hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Listing'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
