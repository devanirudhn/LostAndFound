import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await API.get(`/api/items/${id}`)
        if (data.success) setItem(data.item)
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error('Item not found')
          navigate('/')
        } else {
          toast.error('Failed to load item')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    setDeleting(true)
    try {
      await API.delete(`/api/items/${id}`)
      toast.success('Item deleted successfully')
      navigate('/my-items')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item')
      setDeleting(false)
    }
  }

  const handleMarkResolved = async () => {
    try {
      const { data } = await API.put(`/api/items/${id}`, { status: 'resolved' })
      if (data.success) {
        setItem(data.item)
        toast.success('Item marked as resolved!')
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!item) return null

  const isOwner = user && item.postedBy?._id === user._id
  const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const postedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="capitalize">{item.type} items</span>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{item.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="card overflow-hidden">
          <img
            src={item.image?.url || PLACEHOLDER_IMAGE}
            alt={item.title}
            className="w-full h-80 object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                </span>
                <span className={item.status === 'active' ? 'badge-active' : 'badge-resolved'}>
                  {item.status}
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{item.description}</p>

            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-20">Category</span>
                <span className="font-medium text-gray-800">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-20">Location</span>
                <span className="font-medium text-gray-800">📍 {item.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-20">Date</span>
                <span className="font-medium text-gray-800">📅 {formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-20">Posted on</span>
                <span className="text-gray-600">{postedDate}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Posted by</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {item.postedBy?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.postedBy?.name}</p>
                {item.postedBy?.rollNumber && (
                  <p className="text-sm text-gray-500">{item.postedBy.rollNumber}</p>
                )}
              </div>
            </div>
            {item.postedBy?.email && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Contact</p>
                <a
                  href={`mailto:${item.postedBy.email}`}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  {item.postedBy.email}
                </a>
                {item.contactInfo && (
                  <p className="mt-1 text-sm text-gray-700">{item.contactInfo}</p>
                )}
              </div>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Manage your post</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/my-items/edit/${item._id}`}
                  className="btn-secondary text-sm flex-1 text-center"
                >
                  ✏️ Edit
                </Link>
                {item.status === 'active' && (
                  <button
                    onClick={handleMarkResolved}
                    className="btn-secondary text-sm flex-1"
                  >
                    ✅ Mark Resolved
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger text-sm flex-1"
                >
                  {deleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
