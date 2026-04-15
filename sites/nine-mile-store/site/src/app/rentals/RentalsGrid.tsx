'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, generateSlug } from '@/lib/utils'
import { urlForImage } from '@/lib/sanity-image'

interface RentalItem {
  _id: string
  name: string
  slug: { current: string }
  image: any
  description: string
  dailyRate: number
  weeklyRate?: number
  category: string
  categoryTitle: string
}

function getImageUrl(image: any) {
  try {
    return image ? urlForImage(image).width(400).height(300).fit('crop').url() : null
  } catch {
    return null
  }
}

export default function RentalsGrid({ items }: { items: RentalItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const { categories, filteredItems, categoryTitles } = useMemo(() => {
    const cats = ['all', ...new Set(items.map((item) => item.category).filter(Boolean))]
    const catTitles = new Map(items.map((item) => [item.category, item.categoryTitle]))

    let filtered = items
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return (a.dailyRate || 0) - (b.dailyRate || 0)
        case 'price-high':
          return (b.dailyRate || 0) - (a.dailyRate || 0)
        default:
          return 0
      }
    })

    return { categories: cats, filteredItems: filtered, categoryTitles: catTitles }
  }, [items, selectedCategory, sortBy])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Equipment Rentals</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Browse our professional-grade tools and equipment. Daily and weekly rates available.
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-surface text-foreground/70 hover:bg-surface-alt'
              }`}
            >
              {category === 'all' ? 'All Items' : categoryTitles.get(category)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface border border-black/10 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <p className="text-muted mb-6">
        Showing {filteredItems.length} of {items.length} items
        {selectedCategory !== 'all' && ` in "${categoryTitles.get(selectedCategory)}"`}
      </p>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const imageUrl = getImageUrl(item.image)
            const slug = item.slug?.current || generateSlug(item.name)

            return (
              <Link key={item._id} href={`/rentals/${slug}`} className="group">
                <div className="bg-surface rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-black/5">
                  <div className="relative h-48 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-alt flex items-center justify-center text-muted">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2 mb-4">
                      {item.description || 'No description available.'}
                    </p>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(item.dailyRate || 0)}
                          </span>
                          <span className="text-xs text-muted">/day</span>
                        </div>
                        {item.weeklyRate && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-secondary">
                              {formatCurrency(item.weeklyRate)}
                            </span>
                            <span className="text-xs text-muted">/week</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium bg-surface-alt rounded-full px-3 py-1 capitalize">
                        {item.categoryTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">
            {selectedCategory === 'all'
              ? 'No rental items available at this time.'
              : `No items found in "${categoryTitles.get(selectedCategory)}" category.`}
          </p>
        </div>
      )}
    </main>
  )
}
