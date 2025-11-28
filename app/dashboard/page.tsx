'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import { Listing } from '@/lib/supabase'
import {
  Edit2, Trash2, CheckCircle, Eye, Plus, Package, MapPin,
  TrendingUp, Banknote, ShoppingBag, Activity, Search, Filter,
  MoreVertical, Calendar
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats calculations
  const stats = useMemo(() => {
    const total = listings.length
    const active = listings.filter(l => l.status === 'available').length
    const sold = listings.filter(l => l.status === 'sold').length
    const totalValue = listings
      .filter(l => l.status === 'available')
      .reduce((acc, curr) => acc + (curr.price || 0), 0)

    return { total, active, sold, totalValue }
  }, [listings])

  const filteredListings = useMemo(() => {
    return listings
      .filter(l => filter === 'all' || l.status === filter)
      .filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [listings, filter, searchQuery])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading, router])

  const fetchMyListings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/listings?userId=${user.id}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody?.error || 'Failed to load your listings')
      }

      const data: Listing[] = await response.json()
      setListings(data)
    } catch (error: any) {
      console.error('Error fetching listings:', error)
      toast.error(error?.message || 'Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchMyListings()
    }
  }, [user, fetchMyListings])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await fetch(`/api/listings/${id}?userId=${user?.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to delete listing')
      }

      setListings(listings.filter(l => l.id !== id))
      toast.success('Listing deleted successfully')
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete listing')
    }
  }

  const handleMarkAsSold = async (id: string) => {
    if (!confirm('Mark this item as sold?')) return

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          data: { status: 'sold' }
        })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to mark as sold')
      }

      // Update local state using functional update to avoid stale state
      setListings(prevListings =>
        prevListings.map(l => l.id === id ? { ...l, status: 'sold' as const } : l)
      )
      toast.success('Item marked as sold')
    } catch (error) {
      console.error('Error marking as sold:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mark as sold')
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, keyof typeof LucideIcons> = {
      'Electronics': 'Smartphone',
      'Vehicles': 'Car',
      'Real Estate': 'Home',
      'Furniture': 'Armchair',
      'Fashion': 'Shirt',
      'Other': 'Package'
    }
    const iconName = iconMap[category] || 'Package'
    const Icon = LucideIcons[iconName] as React.ComponentType<{ className?: string }>
    return Icon ? <Icon className="w-4 h-4" /> : null
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Welcome back, {user.user_metadata?.full_name || 'User'}! Manage your inventory and track performance.
              </p>
            </div>
            <Link href="/listings/new">
              <button className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Post New Item
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="w-16 h-16" />
              </div>
              <p className="text-blue-100 font-medium">Total Listings</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Listings</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Sold</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Items Sold</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.sold}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Banknote className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">Value</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Inventory Value</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₦{stats.totalValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {(['all', 'available', 'sold'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
            />
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No listings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Start selling by creating your first listing'}
            </p>
            {!searchQuery && (
              <Link href="/listings/new">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Create New Listing &rarr;
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${listing.status === 'available'
                      ? 'bg-green-500/90 text-white'
                      : 'bg-gray-900/90 text-white'
                      }`}>
                      {listing.status === 'available' ? 'Active' : 'Sold'}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-md flex items-center gap-1">
                      {getCategoryIcon(listing.category)}
                      {listing.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ₦{listing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link href={`/listings/${listing.id}`} className="col-span-2">
                      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </Link>

                    {listing.status === 'available' && (
                      <>
                        <Link href={`/listings/${listing.id}/edit`} className="col-span-2">
                          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm">
                            <Edit2 className="w-4 h-4" />
                            Edit Listing
                          </button>
                        </Link>
                        <button
                          onClick={() => handleMarkAsSold(listing.id)}
                          className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-500 hover:text-green-600 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Sold
                        </button>
                      </>
                    )}

                    {/* Delete button available for all items */}
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-500 hover:text-red-500 transition-colors text-sm col-span-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
