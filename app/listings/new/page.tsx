'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import { toast } from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

export default function NewListingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    seller_name: '',
    seller_phone: '',
    category: 'Electronics'
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to post a listing')
      router.replace('/auth/signin')
    }
  }, [user, authLoading, router])

  const initialFormState = useMemo(() => ({
    title: '',
    description: '',
    price: '',
    location: '',
    seller_name: '',
    seller_phone: '',
    category: 'Electronics'
  }), [])

  const resetForm = () => {
    setFormData(initialFormState)
    setImageUrls([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to post a listing')
      router.replace('/auth/signin')
      return
    }

    if (imageUrls.length === 0) {
      toast.error('Please upload at least one image of your item')
      return
    }

    setLoading(true)

    try {
      const toastId = toast.loading('Posting your item...')

      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        user_id: user.id,
        image_url: imageUrls[0], // First image as primary
        images: imageUrls,
        status: 'available'
      }

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Item posted successfully!', { id: toastId })
      resetForm()
      router.replace('/dashboard')

    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error posting item. Please try again.')
      setLoading(false)
    }
  }

  const postCategories = CATEGORIES.filter(cat => cat !== 'All')

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to listings
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Post an Item
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Fill in the details to list your item</p>
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

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Item Photos *
              </label>

              <ImageUpload
                images={imageUrls}
                onImagesChange={setImageUrls}
                maxImages={10}
                userId={user.id}
              />
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
                  Posting...
                </>
              ) : (
                'Post Item'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
