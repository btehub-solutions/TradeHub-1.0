import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Chatbot from '@/components/Chatbot'
import { AuthProvider } from '@/lib/AuthProvider'
import { ThemeProvider } from '@/lib/ThemeProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://tradehub.vercel.app'),
  title: {
    default: 'TradeHub - Your Community\'s Trusted Marketplace in Nigeria',
    template: '%s | TradeHub'
  },
  description: 'Buy and sell quality pre-owned items in Nigeria. Connect with trusted local traders, browse thousands of listings across electronics, fashion, furniture, and more. Trade with transparency on TradeHub.',
  keywords: [
    'marketplace Nigeria',
    'buy sell Nigeria',
    'local trading Nigeria',
    'pre-owned items',
    'classified ads Nigeria',
    'second hand items Nigeria',
    'online marketplace',
    'Lagos marketplace',
    'Abuja marketplace',
    'Nigerian classifieds'
  ],
  authors: [{ name: 'TradeHub' }],
  creator: 'TradeHub',
  publisher: 'TradeHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://tradehub.vercel.app',
    siteName: 'TradeHub',
    title: 'TradeHub - Your Community\'s Trusted Marketplace in Nigeria',
    description: 'Buy and sell quality pre-owned items in Nigeria. Connect with trusted local traders and trade with transparency.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TradeHub - Nigerian Marketplace'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeHub - Your Community\'s Trusted Marketplace',
    description: 'Buy and sell quality pre-owned items in Nigeria. Connect with trusted local traders.',
    images: ['/twitter-image.png'],
    creator: '@tradehub'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Header />
            <main className="flex-grow bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
            <Footer />
            <Chatbot />
          </AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProvider>
      </body>
    </html>
  )
}
