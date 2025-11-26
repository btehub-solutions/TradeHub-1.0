'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the code from the URL
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error during auth callback:', error)
                    router.push('/auth/signin?error=Authentication failed')
                    return
                }

                if (session) {
                    // Successfully authenticated, redirect to dashboard
                    router.push('/dashboard')
                    router.refresh()
                } else {
                    // No session found, redirect to sign in
                    router.push('/auth/signin')
                }
            } catch (err) {
                console.error('Unexpected error during auth callback:', err)
                router.push('/auth/signin?error=Something went wrong')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Completing sign in...</p>
            </div>
        </div>
    )
}
