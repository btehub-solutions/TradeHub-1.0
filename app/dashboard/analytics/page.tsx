'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Eye, Heart, MessageCircle, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import AnalyticsChart from '@/components/AnalyticsChart'

interface AnalyticsData {
    date: string
    total_views: number
    total_favorites: number
    total_messages: number
}

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<AnalyticsData[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState(30)
    const [summary, setSummary] = useState({
        views: 0,
        favorites: 0,
        messages: 0
    })

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to view analytics')
            router.replace('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchAnalytics()
        }
    }, [user, timeRange])

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/analytics?userId=${user?.id}&days=${timeRange}`)

            if (!response.ok) {
                throw new Error('Failed to fetch analytics')
            }

            const analyticsData = await response.json()
            setData(analyticsData)

            // Calculate summary
            const sum = analyticsData.reduce((acc: any, curr: any) => ({
                views: acc.views + Number(curr.total_views),
                favorites: acc.favorites + Number(curr.total_favorites),
                messages: acc.messages + Number(curr.total_messages)
            }), { views: 0, favorites: 0, messages: 0 })

            setSummary(sum)
        } catch (error) {
            console.error('Error loading analytics:', error)
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }, [user, timeRange])

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                                Performance Analytics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Track how your listings are performing over time
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                            {[7, 30, 90].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setTimeRange(days)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeRange === days
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {days === 7 ? 'Last 7 Days' : days === 30 ? 'Last 30 Days' : 'Last 3 Months'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Total Views
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {summary.views.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Listing views in selected period
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Total Favorites
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {summary.favorites.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Times your items were saved
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Total Messages
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {summary.messages.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Inquiries received
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-500" />
                            Views Over Time
                        </h3>
                        {loading ? (
                            <div className="h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl"></div>
                        ) : (
                            <AnalyticsChart data={data} type="views" />
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Favorites Over Time
                        </h3>
                        {loading ? (
                            <div className="h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl"></div>
                        ) : (
                            <AnalyticsChart data={data} type="favorites" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
