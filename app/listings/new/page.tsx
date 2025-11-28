'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import { toast } from 'react-hot-toast'

export default function NewListingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

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
    setImageFiles([])
    setPreviews([])
  }

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
      toast.error('Please sign in to post a listing')
      router.replace('/auth/signin')
      return
    }

    if (imageFiles.length === 0) {
      toast.error('Please upload at least one image of your item')
      return
    }

    setLoading(true)

    try {
      const toastId = toast.loading('Uploading images...')

      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages()
      }

      toast.loading('Posting your item...', { id: toastId })

      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        user_id: user.id,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls.length > 0 ? imageUrls : null,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const MAX_IMAGES = 5
    const MAX_SIZE_MB = 5 * 1024 * 1024

    if (imageFiles.length + files.length > MAX_IMAGES) {
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

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    toast.success('Image removed')
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
                Item Photo *
              </label>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {previews.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
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
              )}

              {/* File Upload */}
              <label className={`cursor-pointer ${previews.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={previews.length >= 5}
                />
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Upload Photos</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {previews.length > 0 ? `${previews.length}/5 images` : 'Click to select from your files'}
                  </span>
                </div>
              </label>

              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start mt-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 mr-2"></span>
                Add up to 5 photos (required, max 5MB each). First image will be the main photo.
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
