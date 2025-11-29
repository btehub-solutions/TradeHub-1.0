'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
    userId: string
}

export default function ImageUpload({
    images,
    onImagesChange,
    maxImages = 10,
    userId
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: file.type as any
        }

        try {
            return await imageCompression(file, options)
        } catch (error) {
            console.error('Compression error:', error)
            return file // Return original if compression fails
        }
    }

    const uploadImages = useCallback(async (files: File[]) => {
        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`)
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('userId', userId)

        try {
            // Compress images before upload
            const compressedFiles = await Promise.all(
                files.map(async (file, index) => {
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                    const compressed = await compressImage(file)
                    setUploadProgress(prev => ({ ...prev, [file.name]: 50 }))
                    return compressed
                })
            )

            // Add compressed files to form data
            compressedFiles.forEach(file => {
                formData.append('files', file)
            })

            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const data = await response.json()

            // Update images array
            onImagesChange([...images, ...data.urls])

            // Clear progress
            setUploadProgress({})
            toast.success(`${data.count} image(s) uploaded successfully`)

        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error?.message || 'Failed to upload images')
            setUploadProgress({})
        } finally {
            setUploading(false)
        }
    }, [images, maxImages, userId, onImagesChange])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadImages(acceptedFiles)
        }
    }, [images, userId])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif']
        },
        maxFiles: maxImages - images.length,
        disabled: uploading || images.length >= maxImages
    })

    const removeImage = async (index: number) => {
        const imageUrl = images[index]

        try {
            // Delete from storage
            const response = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}&userId=${userId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete image')
            }

            // Remove from array
            const newImages = images.filter((_, i) => i !== index)
            onImagesChange(newImages)
            toast.success('Image removed')

        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to remove image')
        }
    }

    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images]
        const [movedImage] = newImages.splice(fromIndex, 1)
        newImages.splice(toIndex, 0, movedImage)
        onImagesChange(newImages)
    }

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center space-y-3">
                        {uploading ? (
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        ) : (
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        )}

                        <div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                or click to browse ({images.length}/{maxImages} images)
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                            <span>JPEG, PNG, WebP, GIF • Max 5MB per image</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                                    {filename}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                        >
                            {/* Primary Badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10 shadow-lg">
                                    Primary
                                </div>
                            )}

                            {/* Image */}
                            <img
                                src={image}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* Move Left */}
                                {index > 0 && (
                                    <button
                                        onClick={() => moveImage(index, index - 1)}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                        title="Move left"
                                    >
                                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* Remove */}
                                <button
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Move Right */}
                                {index < images.length - 1 && (
                                    <button
                                        onClick={() => moveImage(index, index + 1)}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                        title="Move right"
                                    >
                                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Image number */}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Helper text */}
            {images.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    💡 The first image will be the primary image shown in listings. Use arrows to reorder.
                </p>
            )}
        </div>
    )
}
