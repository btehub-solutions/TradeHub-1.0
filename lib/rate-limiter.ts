/**
 * Rate Limiter Implementation
 * Uses sliding window algorithm with in-memory storage
 * Suitable for single-instance deployments (Vercel serverless)
 */

interface RateLimitConfig {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Maximum requests per window
}

interface RateLimitEntry {
    count: number
    resetTime: number
}

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
    PUBLIC_API: { windowMs: 60000, maxRequests: 100 }, // 100 req/min
    AUTHENTICATED_API: { windowMs: 60000, maxRequests: 1000 }, // 1000 req/min
    IMAGE_UPLOAD: { windowMs: 60000, maxRequests: 10 }, // 10 uploads/min
    AUTH_ENDPOINTS: { windowMs: 300000, maxRequests: 5 }, // 5 req/5min (stricter for security)
} as const

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map()
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor() {
        // Cleanup old entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, 5 * 60 * 1000)
    }

    /**
     * Check if a request should be rate limited
     * @param identifier - Unique identifier (IP address, user ID, etc.)
     * @param config - Rate limit configuration
     * @returns Object with allowed status and remaining requests
     */
    check(
        identifier: string,
        config: RateLimitConfig
    ): {
        allowed: boolean
        remaining: number
        resetTime: number
        retryAfter?: number
    } {
        const now = Date.now()
        const key = `${identifier}`
        const entry = this.store.get(key)

        // No entry or expired entry
        if (!entry || now > entry.resetTime) {
            const resetTime = now + config.windowMs
            this.store.set(key, { count: 1, resetTime })
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime,
            }
        }

        // Entry exists and is valid
        if (entry.count < config.maxRequests) {
            entry.count++
            this.store.set(key, entry)
            return {
                allowed: true,
                remaining: config.maxRequests - entry.count,
                resetTime: entry.resetTime,
            }
        }

        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter,
        }
    }

    /**
     * Reset rate limit for a specific identifier
     * @param identifier - Unique identifier to reset
     */
    reset(identifier: string): void {
        this.store.delete(identifier)
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now()
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key)
            }
        }
    }

    /**
     * Get current statistics
     */
    getStats(): {
        totalEntries: number
        activeEntries: number
    } {
        const now = Date.now()
        let activeEntries = 0

        for (const entry of this.store.values()) {
            if (now <= entry.resetTime) {
                activeEntries++
            }
        }

        return {
            totalEntries: this.store.size,
            activeEntries,
        }
    }

    /**
     * Cleanup on shutdown
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
        }
        this.store.clear()
    }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export default rateLimiter

/**
 * Helper function to get identifier from request
 * Uses IP address as primary identifier, falls back to user agent
 */
export function getRequestIdentifier(request: Request, userId?: string): string {
    if (userId) {
        return `user:${userId}`
    }

    // Get IP from various headers (Vercel, Cloudflare, etc.)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    return `ip:${ip}`
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: {
    remaining: number
    resetTime: number
    retryAfter?: number
}): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    }

    if (result.retryAfter !== undefined) {
        headers['Retry-After'] = result.retryAfter.toString()
    }

    return headers
}
