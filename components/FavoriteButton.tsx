'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
    listingId: string
    initialIsFavorited?: boolean
    showCount?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export default function FavoriteButton({
    listingId,
    initialIsFavorited = false,
    showCount = false,
    size = 'md'
}: FavoriteButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
    const [isLoading, setIsLoading] = useState(false)
    const [favoriteCount, setFavoriteCount] = useState(0)

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    }

    toast.success('Added to favorites')
}
        } catch (error: any) {
    console.error('Favorite error:', error)
    toast.error(error.message || 'Failed to update favorite')
} finally {
    setIsLoading(false)
}
    }

return (
    <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all ${isFavorited
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            } shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
        <Heart
            className={`${iconSizes[size]} ${isFavorited ? 'fill-current' : ''} transition-all`}
        />
        {showCount && favoriteCount > 0 && (
            <span className="ml-1 text-xs font-semibold">{favoriteCount}</span>
        )}
    </button>
)
}
