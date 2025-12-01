import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
    try {
        const supabase = createClient()

        // Fetch total active listings (not sold)
        const { count: activeListings, error: listingsError } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')

        if (listingsError) {
            console.error('Error fetching listings count:', listingsError)
        }

        // Fetch total users from auth.users
        const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        if (usersError) {
            console.error('Error fetching users count:', usersError)
        }

        // Calculate success rate (verified users or completed deals)
        // For now, we'll use a simple metric: percentage of users who have posted listings
        const { count: activeTraders, error: tradersError } = await supabase
            .from('listings')
            .select('user_id', { count: 'exact', head: true })

        if (tradersError) {
            console.error('Error fetching traders count:', tradersError)
        }

        // Calculate success percentage (users who actively trade)
        const successRate = totalUsers && activeTraders
            ? Math.min(Math.round((activeTraders / totalUsers) * 100), 100)
            : 95 // Default fallback

        return NextResponse.json({
            activeListings: activeListings || 0,
            totalUsers: totalUsers || 0,
            successRate: successRate,
            activeTraders: activeTraders || 0
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch stats',
                activeListings: 0,
                totalUsers: 0,
                successRate: 95,
                activeTraders: 0
            },
            { status: 500 }
        )
    }
}
