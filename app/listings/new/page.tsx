'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, Camera, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/supabase'
import { addListing } from '@/lib/clientStorage'

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    seller_name: '',
    seller_phone: '',
    category: 'Electronics'
  })

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      addListing({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        seller_name: formData.seller_name,
        seller_phone: formData.seller_phone,
        image_url: images.length > 0 ? images[0] : null,
        images: images.length > 0 ? images : undefined,
        category: formData.category
      })
      
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Error posting item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Check if adding these files would exceed 5 images
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    Array.from(files).forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum 5MB per image.`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImages(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const startCamera = async () => {
    try {
      // Try back camera first (mobile), then fallback to any camera
      let stream: MediaStream | null = null
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
      } catch (e) {
        // Fallback to front camera or default camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        })
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please:\n1. Allow camera permissions in your browser\n2. Make sure you\'re using HTTPS or localhost\n3. Check if another app is using the camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (images.length >= 5) {
      alert('Maximum 5 images allowed')
      return
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const base64Image = canvas.toDataURL('image/jpeg', 0.8)
        setImages(prev => [...prev, base64Image])
        stopCamera()
      }
    }
  }

  const postCategories = CATEGORIES.filter(cat => cat !== 'All')

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent || Icons.Package
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to listings
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Post an Item
          </h1>
          <p className="text-gray-600">Fill in the details to list your item</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-large p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., iPhone 13 Pro Max 256GB"
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 appearance-none cursor-pointer"
                >
                  {postCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item in detail..."
                rows={4}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Price & Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25000"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Ikeja, Lagos"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Seller Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.seller_phone}
                  onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                  placeholder="08012345678"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Item Photo
              </label>
              
              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {images.map((img, index) => (
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

              {showCamera ? (
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg font-semibold"
                      disabled={images.length >= 5}
                    >
                      📸 Capture Photo {images.length > 0 && `(${images.length}/5)`}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg font-semibold"
                    >
                      Done
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <label className={`cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-blue-400 transition-all">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <span className="text-sm font-semibold text-gray-700">Upload Photos</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {images.length > 0 ? `${images.length}/5 images` : 'From your files'}
                      </span>
                    </div>
                  </label>

                  {/* Live Camera */}
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={images.length >= 5}
                    className={`flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-blue-400 transition-all cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera className="w-10 h-10 text-gray-400 mb-3" />
                    <span className="text-sm font-semibold text-gray-700">Live Camera</span>
                    <span className="text-xs text-gray-500 mt-1">Take photos</span>
                  </button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 flex items-start mt-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                Add up to 5 photos (optional, max 5MB each). First image will be the main photo.
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
