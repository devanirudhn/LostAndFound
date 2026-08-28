import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER_IMAGE = 'https://placehold.co/200x150/e2e8f0/94a3b8?text=No+Image'

export default function MyItemsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const { data } = await API.get('/api/items/user/my-items')
        if (data.success) setItems(data.items)
      } catch {
        toast.error('Failed to load your items')
      } finally {
        setLoading(false)
      }
    }
    fetchMyItems()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return
    setDeletingId(id)
    try {
      await API.delete(`/api/items/${id}`)
      setItems((prev) => prev.filter((item) => item._id !== id))
      toast.success('Item deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMarkResolved = async (id) => {
    try {
      const { data } = await API.put(`/api/items/${id}`, { status: 'resolved' })
      if (data.success) {
        setItems((prev) => prev.map((item) => item._id === id ? data.item : item))
        toast.success('Marked as resolved!')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} posted by you
          </p>
        </div>
        <Link to="/report" className="btn-primary">
          + Report Item
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'lost', 'found'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'all' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl text-gray-500">No items yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Report a lost or found item to see it here
          </p>
          <Link to="/report" className="mt-4 inline-block btn-primary">
            Report an Item
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-start">
              {/* Thumbnail */}
              <img
                src={item.image?.url || PLACEHOLDER_IMAGE}
                alt={item.title}
                className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/items/${item._id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                  >
                    {item.title}
                  </Link>
                  <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
                    {item.type}
                  </span>
                  <span className={item.status === 'active' ? 'badge-active' : 'badge-resolved'}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{item.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>📍 {item.location}</span>
                  <span>📅 {new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  to={`/my-items/edit/${item._id}`}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  Edit
                </Link>
                {item.status === 'active' && (
                  <button
                    onClick={() => handleMarkResolved(item._id)}
                    className="btn-secondary text-sm py-1.5 px-3 text-green-700 hover:bg-green-50"
                  >
                    ✅
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="btn-danger text-sm py-1.5 px-3"
                >
                  {deletingId === item._id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
