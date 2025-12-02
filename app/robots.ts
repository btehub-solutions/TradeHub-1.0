import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/dashboard/*',
                    '/messages/',
                    '/messages/*',
                    '/api/',
                    '/api/*',
                    '/auth/signin',
                    '/auth/signup',
                    '/listings/new',
                    '/listings/*/edit'
                ],
            },
        ],
        sitemap: 'https://tradehub.vercel.app/sitemap.xml',
    }
}
