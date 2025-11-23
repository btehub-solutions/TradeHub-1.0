'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import { Listing } from '@/lib/supabase'
import { Edit2, Trash2, CheckCircle, Eye, Plus, Package, MapPin } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Listing>>({})

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



  const startEdit = (listing: Listing) => {
    setEditingId(listing.id)
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      image_url: listing.image_url
    })
  }

  const handleUpdate = async (id: string) => {
    if (!user) return

    try {
      const sanitizedData = { ...editForm }
      if (typeof sanitizedData.price === 'number' && Number.isNaN(sanitizedData.price)) {
        delete sanitizedData.price
      }

      const response = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          data: sanitizedData
        })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to update listing')
      }

      const updated = await response.json()
      setListings(listings.map(l => (l.id === id ? updated : l)))
      setEditingId(null)
      toast.success('Listing updated successfully')
    } catch (error) {
      console.error('Error updating listing:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update listing')
    }
  }

  const skeletonItems = useMemo(() => Array.from({ length: 3 }), [])

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading your listings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all w-full md:w-auto justify-center">
            <Plus className="w-5 h-5" />
            <span>Add New Listing</span>
          </button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-soft">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven&apos;t posted any items yet</p>
          <Link href="/listings/new">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Post Your First Item
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-all ${listing.status === 'sold' ? 'opacity-75' : ''
                }`}
            >
              {editingId === listing.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Title"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    rows={3}
                    placeholder="Description"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Price"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdate(listing.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row gap-6">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-48 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full h-48 md:w-32 md:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-2 md:gap-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                            {getCategoryIcon(listing.category)}
                            {listing.category}
                          </span>
                          {listing.status === 'sold' && (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" />
                              SOLD
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{listing.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{listing.description}</p>
                      </div>
                      <div className="text-left md:text-right md:ml-4">
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{listing.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-4">
                      Posted {new Date(listing.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/listings/${listing.id}`}>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </Link>

                      {listing.status === 'available' && (
                        <>
                          <button
                            onClick={() => startEdit(listing)}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
