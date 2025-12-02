'use client'

import { useEffect, useState } from 'react'
import { Listing } from '@/lib/supabase'
import { Package, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
    id: string
    type: 'listed' | 'sold'
    title: string
    date: Date
    listingId: string
}

export default function RecentActivity({ listings }: { listings: Listing[] }) {
    const [activities, setActivities] = useState<ActivityItem[]>([])

    useEffect(() => {
        if (!listings) return

        const newActivities: ActivityItem[] = []

        listings.forEach(listing => {
            // Add "Listed" activity
            newActivities.push({
                id: `${listing.id}-created`,
                type: 'listed',
                title: listing.title,
                date: new Date(listing.created_at),
                listingId: listing.id
            })

            // Add "Sold" activity if applicable
            // Note: Using created_at since updated_at is not available in the Listing type
            if (listing.status === 'sold') {
                newActivities.push({
                    id: `${listing.id}-sold`,
                    type: 'sold',
                    title: listing.title,
                    date: new Date(listing.created_at),
                    listingId: listing.id
                })
            }
        })

        // Sort by date descending and take top 5
        newActivities.sort((a, b) => b.date.getTime() - a.date.getTime())
        setActivities(newActivities.slice(0, 5))
    }, [listings])

    if (activities.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                </h3>
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity
            </h3>
            <div className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 border-l border-gray-100 dark:border-gray-700 last:border-l-0">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${activity.type === 'sold' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />

                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {activity.type === 'sold' ? 'Item Sold' : 'New Listing'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    You {activity.type === 'sold' ? 'marked' : 'listed'} <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{activity.title}&rdquo;</span> {activity.type === 'sold' ? 'as sold' : ''}
                                </p>
                                <span className="text-xs text-gray-400 mt-2 block">
                                    {activity.date.toLocaleDateString()} • {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <Link href={`/listings/${activity.listingId}`}>
                                <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    {activity.type === 'sold' ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Package className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
