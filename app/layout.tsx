import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/lib/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TradeHub - Buy & Sell in Nigeria',
  description: 'Your local marketplace for pre-loved items',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow bg-gray-50">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
