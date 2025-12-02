/**
 * API Middleware Utilities
 * Centralized error handling, validation, and response formatting
 */

import { NextResponse } from 'next/server'
import rateLimiter, { getRequestIdentifier, createRateLimitHeaders, RATE_LIMITS } from './rate-limiter'

export interface ApiError {
    message: string
    code?: string
    statusCode: number
    details?: any
}

export class AppError extends Error {
    statusCode: number
    code?: string
    details?: any

    constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.details = details
        this.name = 'AppError'
    }
}

/**
 * Standardized error response
 */
export function errorResponse(
    error: Error | AppError | string,
    statusCode: number = 500
): NextResponse {
    const isAppError = error instanceof AppError
    const message = typeof error === 'string' ? error : error.message

    const response: ApiError = {
        message,
        statusCode: isAppError ? error.statusCode : statusCode,
        code: isAppError ? error.code : undefined,
        details: isAppError ? error.details : undefined,
    }

    // Log error server-side
    console.error('[API Error]', {
        message,
        statusCode: response.statusCode,
        code: response.code,
        stack: typeof error !== 'string' ? error.stack : undefined,
    })

    return NextResponse.json(response, { status: response.statusCode })
}

/**
 * Standardized success response
 */
export function successResponse<T>(
    data: T,
    statusCode: number = 200,
    headers?: Record<string, string>
): NextResponse {
    return NextResponse.json(data, {
        status: statusCode,
        headers,
    })
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit<T extends Request = Request>(
    handler: (request: T) => Promise<NextResponse>,
    limitType: keyof typeof RATE_LIMITS = 'PUBLIC_API'
) {
    return async (request: T): Promise<NextResponse> => {
        try {
            const identifier = getRequestIdentifier(request)
            const config = RATE_LIMITS[limitType]
            const result = rateLimiter.check(identifier, config)

            const headers = createRateLimitHeaders(result)

            if (!result.allowed) {
                return NextResponse.json(
                    {
                        message: 'Too many requests. Please try again later.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        statusCode: 429,
                    },
                    {
                        status: 429,
                        headers,
                    }
                )
            }

            // Execute handler
            const response = await handler(request)

            // Add rate limit headers to response
            Object.entries(headers).forEach(([key, value]) => {
                response.headers.set(key, value)
            })

            return response
        } catch (error) {
            return errorResponse(error as Error)
        }
    }
}

/**
 * Error handling middleware wrapper
 */
export function withErrorHandling<T extends Request = Request>(
    handler: (request: T) => Promise<NextResponse>
) {
    return async (request: T): Promise<NextResponse> => {
        const startTime = Date.now()

        try {
            const response = await handler(request)

            // Add performance timing header
            const duration = Date.now() - startTime
            response.headers.set('X-Response-Time', `${duration}ms`)

            return response
        } catch (error) {
            const duration = Date.now() - startTime
            console.error('[API Error]', {
                url: request.url,
                method: request.method,
                duration: `${duration}ms`,
                error: error instanceof Error ? error.message : 'Unknown error',
            })

            return errorResponse(error as Error)
        }
    }
}

/**
 * Request validation helper
 */
export function validateRequest(
    body: any,
    requiredFields: string[]
): { valid: boolean; missing?: string[] } {
    const missing = requiredFields.filter((field) => {
        const value = body[field]
        return value === undefined || value === null || value === ''
    })

    if (missing.length > 0) {
        return { valid: false, missing }
    }

    return { valid: true }
}

/**
 * Pagination helper
 */
export interface PaginationParams {
    page: number
    limit: number
    offset: number
}

export function getPaginationParams(
    searchParams: URLSearchParams,
    defaultLimit: number = 20,
    maxLimit: number = 100
): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(
        maxLimit,
        Math.max(1, parseInt(searchParams.get('limit') || defaultLimit.toString()))
    )
    const offset = (page - 1) * limit

    return { page, limit, offset }
}

/**
 * Paginated response helper
 */
export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / params.limit)

    return {
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1,
        },
    }
}

/**
 * Combine multiple middleware
 */
export function withMiddleware<T extends Request = Request>(
    handler: (request: T) => Promise<NextResponse>,
    options: {
        rateLimit?: keyof typeof RATE_LIMITS
        errorHandling?: boolean
    } = {}
) {
    let wrappedHandler = handler

    // Apply error handling first (innermost)
    if (options.errorHandling !== false) {
        wrappedHandler = withErrorHandling(wrappedHandler)
    }

    // Apply rate limiting (outermost)
    if (options.rateLimit) {
        wrappedHandler = withRateLimit(wrappedHandler, options.rateLimit)
    }

    return wrappedHandler
}
