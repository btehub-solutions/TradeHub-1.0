'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface AnalyticsData {
    date: string
    total_views: number
    total_favorites: number
    total_messages: number
}

interface AnalyticsChartProps {
    data: AnalyticsData[]
    type?: 'views' | 'favorites' | 'messages'
}

export default function AnalyticsChart({ data, type = 'views' }: AnalyticsChartProps) {
    const config = {
        views: {
            color: '#3b82f6', // blue-500
            gradient: '#93c5fd', // blue-300
            label: 'Views'
        },
        favorites: {
            color: '#ef4444', // red-500
            gradient: '#fca5a5', // red-300
            label: 'Favorites'
        },
        messages: {
            color: '#10b981', // green-500
            gradient: '#6ee7b7', // green-300
            label: 'Messages'
        }
    }

    const { color, gradient, label } = config[type]
    const dataKey = `total_${type}`

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No data available
            </div>
        )
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '0.5rem',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(str) => format(parseISO(str), 'MMMM d, yyyy')}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#color${type})`}
                        name={label}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
