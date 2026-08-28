import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import API from '../api/axios'
import ItemCard from '../components/ItemCard'

const CATEGORIES = [
  'Electronics', 'Documents', 'Clothing', 'Accessories',
  'Books', 'Keys', 'Wallet/Purse', 'Stationery', 'Sports Equipment', 'Other',
]

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (type) params.set('type', type)
      if (category) params.set('category', category)
      params.set('page', page)
      params.set('limit', '12')

      const { data } = await API.get(`/api/items?${params}`)
      if (data.success) {
        setItems(data.items)
        setPagination(data.pagination)
      }
    } catch (err) {
      setError('Failed to load items. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, type, category, page])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Sync filters into URL params
  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (type) params.type = type
    if (category) params.category = category
    if (page > 1) params.page = page
    setSearchParams(params, { replace: true })
  }, [search, type, category, page, setSearchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchItems()
  }

  const clearFilters = () => {
    setSearch('')
    setType('')
    setCategory('')
    setPage(1)
  }

  const hasFilters = search || type || category

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Campus Lost & Found
        </h1>
        <p className="mt-2 text-gray-500 text-lg">
          Report or find lost items on your campus
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by title, description, or location..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary px-5">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Type Filter */}
          <div className="flex gap-1">
            {['', 'lost', 'found'].map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'lost'
                      ? 'bg-red-600 text-white'
                      : t === 'found'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === '' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="input-field w-auto py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              ✕ Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-400">
            {pagination.total} item{pagination.total !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchItems} className="mt-4 btn-primary">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl text-gray-500">No items found</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
