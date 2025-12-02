import Script from 'next/script'

interface StructuredDataProps {
    type?: 'organization' | 'website' | 'product' | 'breadcrumb'
    data?: any
}

export default function StructuredData({ type = 'website', data }: StructuredDataProps) {
    const getStructuredData = () => {
        switch (type) {
            case 'organization':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'TradeHub',
                    url: 'https://tradehub.vercel.app',
                    logo: 'https://tradehub.vercel.app/logo.png',
                    description: 'Your Community\'s Trusted Marketplace in Nigeria',
                    sameAs: [
                        'https://twitter.com/tradehub',
                        'https://facebook.com/tradehub',
                    ],
                }

            case 'website':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'TradeHub',
                    url: 'https://tradehub.vercel.app',
                    description: 'Buy and sell quality pre-owned items in Nigeria',
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: 'https://tradehub.vercel.app/?search={search_term_string}'
                        },
                        'query-input': 'required name=search_term_string'
                    }
                }

            case 'product':
                return data ? {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: data.title,
                    description: data.description,
                    image: data.image_url,
                    offers: {
                        '@type': 'Offer',
                        price: data.price,
                        priceCurrency: 'NGN',
                        availability: data.status === 'available'
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/OutOfStock',
                        seller: {
                            '@type': 'Person',
                            name: data.seller_name || 'TradeHub Seller'
                        }
                    },
                    category: data.category
                } : null

            case 'breadcrumb':
                return data ? {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: data.map((item: any, index: number) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: item.url
                    }))
                } : null

            default:
                return null
        }
    }

    const structuredData = getStructuredData()

    if (!structuredData) return null

    return (
        <Script
            id={`structured-data-${type}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}
