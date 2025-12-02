'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Eye, MessageCircle, TrendingUp, Calendar, BarChart3, Target, Lightbulb, Award, Clock, Users } from 'lucide-react'
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
        messages: 0
    })

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to view analytics')
            router.replace('/auth/signin')
        }
    }, [user, authLoading, router])

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/analytics?userId=${user?.id}&days=${timeRange}`)

            if (!response.ok) {
                throw new Error('Failed to fetch analytics')
            }

            const analyticsData = await response.json()
            setData(analyticsData)

            // Calculate summary (excluding favorites)
            const sum = analyticsData.reduce((acc: any, curr: any) => ({
                views: acc.views + Number(curr.total_views),
                messages: acc.messages + Number(curr.total_messages)
            }), { views: 0, messages: 0 })

            setSummary(sum)
        } catch (error) {
            console.error('Error loading analytics:', error)
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }, [user, timeRange])

    useEffect(() => {
        if (user) {
            fetchAnalytics()
        }
    }, [user, timeRange, fetchAnalytics])

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const avgViewsPerDay = summary.views / timeRange
    const avgMessagesPerDay = summary.messages / timeRange
    const engagementRate = summary.views > 0 ? ((summary.messages / summary.views) * 100).toFixed(1) : '0'

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
                                Track how your listings are performing and get insights to boost your sales
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                Inquiries
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {summary.messages.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Buyer messages received
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                Avg/Day
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {avgViewsPerDay.toFixed(1)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Average views per day
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                Engagement
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {engagementRate}%
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Message to view ratio
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                            <MessageCircle className="w-5 h-5 text-green-500" />
                            Messages Over Time
                        </h3>
                        {loading ? (
                            <div className="h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl"></div>
                        ) : (
                            <AnalyticsChart data={data} type="messages" />
                        )}
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <Lightbulb className="w-7 h-7 text-blue-600" />
                        Performance Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InsightCard
                            icon={TrendingUp}
                            title="View Performance"
                            insight={
                                avgViewsPerDay > 10
                                    ? "Great job! Your listings are getting good visibility."
                                    : "Consider improving your titles and photos to attract more views."
                            }
                            color="blue"
                        />
                        <InsightCard
                            icon={MessageCircle}
                            title="Engagement Rate"
                            insight={
                                Number(engagementRate) > 5
                                    ? "Excellent! Your listings are generating strong buyer interest."
                                    : "Add more details to your descriptions to encourage inquiries."
                            }
                            color="green"
                        />
                        <InsightCard
                            icon={Clock}
                            title="Response Time"
                            insight="Respond to messages within 1-2 hours to increase your chances of making a sale by 3x."
                            color="purple"
                        />
                        <InsightCard
                            icon={Award}
                            title="Best Practices"
                            insight="Use high-quality photos, competitive pricing, and detailed descriptions to boost performance."
                            color="orange"
                        />
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <Target className="w-7 h-7 text-blue-600" />
                        Tips to Improve Your Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TipItem
                            number={1}
                            title="Optimize Your Titles"
                            description="Use clear, descriptive titles with brand names and key features. Include model numbers for electronics."
                        />
                        <TipItem
                            number={2}
                            title="High-Quality Photos"
                            description="Take well-lit photos from multiple angles. Good photos can increase views by up to 70%."
                        />
                        <TipItem
                            number={3}
                            title="Competitive Pricing"
                            description="Research similar items and price competitively. Items priced right sell 2x faster."
                        />
                        <TipItem
                            number={4}
                            title="Detailed Descriptions"
                            description="Include all relevant details: condition, specifications, what&apos;s included, and reason for selling."
                        />
                        <TipItem
                            number={5}
                            title="Quick Responses"
                            description="Reply to buyer inquiries within 1-2 hours. Fast responses dramatically increase conversion rates."
                        />
                        <TipItem
                            number={6}
                            title="Regular Updates"
                            description="If an item hasn&apos;t sold in a week, consider updating photos, adjusting price, or refreshing the description."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper Components
function InsightCard({ icon: Icon, title, insight, color }: { icon: any, title: string, insight: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{insight}</p>
                </div>
            </div>
        </div>
    )
}

function TipItem({ number, title, description }: { number: number, title: string, description: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{number}</span>
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    )
}
