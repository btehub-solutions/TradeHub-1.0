import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const userId = formData.get('userId') as string

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            )
        }

        if (files.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 images allowed' },
                { status: 400 }
            )
        }

        const supabase = createClient()
        const uploadedUrls: string[] = []

        for (const file of files) {
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF` },
                    { status: 400 }
                )
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File too large: ${file.name}. Maximum size is 5MB` },
                    { status: 400 }
                )
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            // Convert File to ArrayBuffer then to Buffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('listing-images')
                .upload(fileName, buffer, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Failed to upload ${file.name}: ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(data.path)

            uploadedUrls.push(publicUrl)
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls,
            count: uploadedUrls.length
        })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to upload images' },
            { status: 500 }
        )
    }
}

// DELETE endpoint to remove images from storage
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const imageUrl = searchParams.get('url')
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            )
        }

        // Extract file path from URL
        const supabase = createClient()
        const urlParts = imageUrl.split('/listing-images/')

        if (urlParts.length < 2) {
            return NextResponse.json(
                { error: 'Invalid image URL' },
                { status: 400 }
            )
        }

        const filePath = urlParts[1]

        // Verify the file belongs to the user
        if (!filePath.startsWith(userId)) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this image' },
                { status: 403 }
            )
        }

        // Delete from storage
        const { error } = await supabase.storage
            .from('listing-images')
            .remove([filePath])

        if (error) {
            console.error('Delete error:', error)
            return NextResponse.json(
                { error: `Failed to delete image: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully'
        })

    } catch (error: any) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete image' },
            { status: 500 }
        )
    }
}
