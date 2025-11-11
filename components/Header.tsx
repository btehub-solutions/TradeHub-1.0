'use client'

import Link from 'next/link'
import { Plus, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-soft' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              TradeHub
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                </Link>
                <Link href="/listings/new">
                  <button className="group relative inline-flex items-center justify-center px-6 py-2.5 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95">
                    <Plus className="w-5 h-5 mr-2" />
                    Post Item
                  </button>
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="group relative inline-flex items-center justify-center px-6 py-2.5 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
