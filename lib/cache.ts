/**
 * Simple LRU Cache with TTL support
 * For caching API responses and expensive computations
 */

interface CacheEntry<T> {
    value: T
    expiresAt: number
    accessedAt: number
}

interface CacheStats {
    hits: number
    misses: number
    size: number
    maxSize: number
}

class LRUCache<T = any> {
    private cache: Map<string, CacheEntry<T>> = new Map()
    private maxSize: number
    private stats: CacheStats

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            maxSize,
        }
    }

    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or undefined if not found/expired
     */
    get(key: string): T | undefined {
        const entry = this.cache.get(key)

        if (!entry) {
            this.stats.misses++
            return undefined
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            this.stats.misses++
            this.stats.size = this.cache.size
            return undefined
        }

        // Update access time (for LRU)
        entry.accessedAt = Date.now()
        this.cache.delete(key)
        this.cache.set(key, entry) // Move to end (most recently used)

        this.stats.hits++
        return entry.value
    }

    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlMs - Time to live in milliseconds (default: 60 seconds)
     */
    set(key: string, value: T, ttlMs: number = 60000): void {
        // If cache is full, remove least recently used
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value
            if (firstKey) {
                this.cache.delete(firstKey)
            }
        }

        const entry: CacheEntry<T> = {
            value,
            expiresAt: Date.now() + ttlMs,
            accessedAt: Date.now(),
        }

        this.cache.set(key, entry)
        this.stats.size = this.cache.size
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key)
        if (!entry) return false

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            this.stats.size = this.cache.size
            return false
        }

        return true
    }

    /**
     * Delete a specific key
     */
    delete(key: string): boolean {
        const result = this.cache.delete(key)
        this.stats.size = this.cache.size
        return result
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear()
        this.stats.size = 0
    }

    /**
     * Remove expired entries
     */
    cleanup(): void {
        const now = Date.now()
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key)
            }
        }
        this.stats.size = this.cache.size
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return { ...this.stats }
    }

    /**
     * Get cache hit rate
     */
    getHitRate(): number {
        const total = this.stats.hits + this.stats.misses
        return total === 0 ? 0 : this.stats.hits / total
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats.hits = 0
        this.stats.misses = 0
    }
}

// Cache instances for different purposes
export const apiCache = new LRUCache<any>(200) // API responses
export const queryCache = new LRUCache<any>(100) // Database queries

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
    // Server-side only
    setInterval(() => {
        apiCache.cleanup()
        queryCache.cleanup()
    }, 5 * 60 * 1000)
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
    endpoint: string,
    params?: Record<string, any>
): string {
    if (!params) return endpoint

    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&')

    return `${endpoint}?${sortedParams}`
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs: number = 60000,
    cache: LRUCache<T> = apiCache
): Promise<T> {
    // Check cache first
    const cached = cache.get(key)
    if (cached !== undefined) {
        return cached
    }

    // Execute function and cache result
    const result = await fn()
    cache.set(key, result, ttlMs)
    return result
}

export default LRUCache
