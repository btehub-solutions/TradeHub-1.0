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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality or redirect to search page
      console.log('Searching for:', searchQuery)
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.user_metadata?.full_name) return 'U'
    const nameParts = user.user_metadata.full_name.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm'
        : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              TradeHub
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Browse Items
            </Link>
            <Link href="/listings/new" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Sell Item
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-800 border focus:border-blue-500 dark:focus:border-blue-400 rounded-full transition-all outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link href="/wishlist">
                  <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
                    <Heart className="w-5 h-5" />
                    {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span> */}
                  </button>
                </Link>

                {/* User Dropdown */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 pl-2 pr-1 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          href="/listings/my"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>My Listings</span>
                        </Link>
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>My Account</span>
                        </Link>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <button className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-800 border focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <Link href="/" onClick={closeMobileMenu}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
                <Home className="w-5 h-5 text-gray-400" />
                <span>Home</span>
              </button>
            </Link>

            <Link href="/browse" onClick={closeMobileMenu}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
                <span>Browse Items</span>
              </button>
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
            >
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
                <span>Theme</span>
              </div>
              <span className="text-sm text-gray-500 capitalize">{theme}</span>
            </button>

            {loading ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">Loading...</div>
            ) : user ? (
              <>
                <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                <div className="px-4 py-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>

                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-gray-400" />
                    <span>Dashboard</span>
                  </button>
                </Link>

                <Link href="/listings/new" onClick={closeMobileMenu}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 mt-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Post Item</span>
                  </button>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link href="/auth/signin" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors border border-gray-200 dark:border-gray-700">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
