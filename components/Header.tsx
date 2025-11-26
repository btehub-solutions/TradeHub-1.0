'use client'

import Link from 'next/link'
import { Plus, ShoppingBag, LayoutDashboard, LogOut, Menu, X, Moon, Sun, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
    setMobileMenuOpen(false)
    router.push('/')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-soft'
        : 'bg-white dark:bg-gray-900'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              TradeHub
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Home Button */}
            <Link href="/">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </Link>

            {loading ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
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
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              <span>Theme</span>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Home Button Mobile */}
            <Link href="/" onClick={closeMobileMenu}>
              <button className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </Link>

            {loading ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center">Loading...</div>
            ) : user ? (
              <>
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <button className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                </Link>
                <Link href="/listings/new" onClick={closeMobileMenu}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Post Item</span>
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
