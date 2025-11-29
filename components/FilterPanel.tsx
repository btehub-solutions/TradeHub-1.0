'use client'

import { useState, useEffect } from 'react'
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import PriceRangeSlider from './PriceRangeSlider'

export interface FilterOptions {
    category: string
    priceRange: [number, number]
    location: string
    sortBy: 'created_at' | 'price' | 'relevance'
    sortOrder: 'ASC' | 'DESC'
}

interface FilterPanelProps {
    filters: FilterOptions
    onFiltersChange: (filters: FilterOptions) => void
    priceMin: number
    priceMax: number
    locations: string[]
    onClearFilters: () => void
}

export default function FilterPanel({
    filters,
    onFiltersChange,
    priceMin,
    priceMax,
    locations,
    onClearFilters
}: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)

    useEffect(() => {
        let count = 0
        if (filters.priceRange[0] > priceMin || filters.priceRange[1] < priceMax) count++
        if (filters.location) count++
        if (filters.sortBy !== 'created_at' || filters.sortOrder !== 'DESC') count++
        setActiveFiltersCount(count)
    }, [filters, priceMin, priceMax])

    const sortOptions = [
        { value: 'created_at-DESC', label: 'Newest First', sortBy: 'created_at' as const, sortOrder: 'DESC' as const },
        { value: 'created_at-ASC', label: 'Oldest First', sortBy: 'created_at' as const, sortOrder: 'ASC' as const },
        { value: 'price-ASC', label: 'Price: Low to High', sortBy: 'price' as const, sortOrder: 'ASC' as const },
        { value: 'price-DESC', label: 'Price: High to Low', sortBy: 'price' as const, sortOrder: 'DESC' as const },
    ]

    const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`

    const handleSortChange = (value: string) => {
        const option = sortOptions.find(opt => opt.value === value)
        if (option) {
            onFiltersChange({
                ...filters,
                sortBy: option.sortBy,
                sortOrder: option.sortOrder
            })
        }
    }

    const handlePriceChange = (priceRange: [number, number]) => {
        onFiltersChange({ ...filters, priceRange })
    }

    const handleLocationChange = (location: string) => {
        onFiltersChange({ ...filters, location })
    }

    return (
        <>
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Filter Panel */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6 mb-6`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                                {activeFiltersCount} active
                            </span>
                        )}
                    </div>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Sort By
                    </label>
                    <div className="relative">
                        <select
                            value={currentSortValue}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                        Price Range
                    </label>
                    <PriceRangeSlider
                        min={priceMin}
                        max={priceMax}
                        value={filters.priceRange}
                        onChange={handlePriceChange}
                        step={1000}
                    />
                </div>

                {/* Location Filter */}
                {locations.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Location
                        </label>
                        <div className="relative">
                            <select
                                value={filters.location}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="">All Locations</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Summary */}
                {activeFiltersCount > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Active Filters:</p>
                        <div className="flex flex-wrap gap-2">
                            {(filters.priceRange[0] > priceMin || filters.priceRange[1] < priceMax) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                    ₦{filters.priceRange[0].toLocaleString()} - ₦{filters.priceRange[1].toLocaleString()}
                                    <button
                                        onClick={() => handlePriceChange([priceMin, priceMax])}
                                        className="hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.location && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                    {filters.location}
                                    <button
                                        onClick={() => handleLocationChange('')}
                                        className="hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {(filters.sortBy !== 'created_at' || filters.sortOrder !== 'DESC') && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                    {sortOptions.find(opt => opt.value === currentSortValue)?.label}
                                    <button
                                        onClick={() => handleSortChange('created_at-DESC')}
                                        className="hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
