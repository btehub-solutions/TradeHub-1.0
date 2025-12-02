import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * Health Check Endpoint
 * Returns system health status including database connectivity
 */
export async function GET() {
    const startTime = Date.now()
    const health: {
        status: 'healthy' | 'degraded' | 'unhealthy'
        timestamp: string
        checks: {
            database: { status: string; responseTime?: number; error?: string }
            api: { status: string; responseTime: number }
        }
        uptime: number
    } = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            database: { status: 'unknown' },
            api: { status: 'ok', responseTime: 0 },
        },
        uptime: process.uptime(),
    }

    // Check database connectivity
    try {
        const dbStartTime = Date.now()
        const supabase = createClient()

        // Simple query to test database connection
        const { error } = await supabase
            .from('listings')
            .select('id')
            .limit(1)
            .single()

        const dbResponseTime = Date.now() - dbStartTime

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine for health check
            health.checks.database = {
                status: 'unhealthy',
                responseTime: dbResponseTime,
                error: error.message,
            }
            health.status = 'degraded'
        } else {
            health.checks.database = {
                status: 'healthy',
                responseTime: dbResponseTime,
            }
        }

        // Warn if database is slow
        if (dbResponseTime > 1000) {
            health.status = 'degraded'
            health.checks.database.status = 'slow'
        }
    } catch (error: any) {
        health.checks.database = {
            status: 'unhealthy',
            error: error.message || 'Database connection failed',
        }
        health.status = 'unhealthy'
    }

    // Calculate API response time
    health.checks.api.responseTime = Date.now() - startTime

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    })
}
