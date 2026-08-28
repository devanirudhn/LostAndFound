import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Electronics', 'Documents', 'Clothing', 'Accessories',
  'Books', 'Keys', 'Wallet/Purse', 'Stationery', 'Sports Equipment', 'Other',
]

export default function ReportItemPage({ editMode = false }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: '',
    status: 'active',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(editMode)

  // Load existing item in edit mode
  useEffect(() => {
    if (!editMode || !id) return

    const fetchItem = async () => {
      try {
        const { data } = await API.get(`/api/items/${id}`)
        if (data.success) {
          const item = data.item
          setForm({
            title: item.title,
            description: item.description,
            type: item.type,
            category: item.category,
            location: item.location,
            date: new Date(item.date).toISOString().split('T')[0],
            contactInfo: item.contactInfo || '',
            status: item.status,
          })
          if (item.image?.url) setExistingImage(item.image.url)
        }
      } catch {
        toast.error('Failed to load item for editing')
        navigate('/my-items')
      } finally {
        setFetching(false)
      }
    }

    fetchItem()
  }, [editMode, id, navigate])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title || !form.description || !form.category || !form.location || !form.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (imageFile) formData.append('image', imageFile)

      let data
      if (editMode && id) {
        const res = await API.put(`/api/items/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        data = res.data
      } else {
        const res = await API.post('/api/items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        data = res.data
      }

      if (data.success) {
        toast.success(editMode ? 'Item updated!' : 'Item reported successfully!')
        navigate(`/items/${data.item._id}`)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save item'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {editMode ? '✏️ Edit Item' : '📋 Report an Item'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {['lost', 'found'].map((t) => (
                <label key={t} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`text-center py-3 rounded-lg border-2 font-medium transition-colors ${
                    form.type === t
                      ? t === 'lost'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                    {t === 'lost' ? '🔴 I Lost Something' : '🟢 I Found Something'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Black iPhone 14 with cracked screen"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the item in detail — color, brand, distinguishing marks..."
              className="input-field resize-none"
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date {form.type === 'lost' ? 'Lost' : 'Found'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Library 2nd floor, Block-A Canteen, Parking Lot"
              className="input-field"
              required
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Contact Info
            </label>
            <input
              type="text"
              name="contactInfo"
              value={form.contactInfo}
              onChange={handleChange}
              placeholder="Phone number or any other contact preference"
              className="input-field"
            />
          </div>

          {/* Status (edit only) */}
          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Photo (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-2 text-center">
                {(imagePreview || existingImage) ? (
                  <div>
                    <img
                      src={imagePreview || existingImage}
                      alt="Preview"
                      className="mx-auto h-32 w-auto rounded-lg object-cover"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {imagePreview ? 'New image selected' : 'Existing image'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl">📷</span>
                    <p className="text-sm text-gray-500">Click to upload an image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm btn-secondary"
                >
                  {imagePreview || existingImage ? 'Change image' : 'Upload image'}
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {editMode ? 'Updating...' : 'Reporting...'}
              </span>
            ) : editMode ? (
              'Update Item'
            ) : (
              'Report Item'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
