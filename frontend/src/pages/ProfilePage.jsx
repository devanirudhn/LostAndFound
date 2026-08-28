import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    phone: user?.phone || '',
    department: user?.department || '',
  })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.put('/api/auth/profile', form)
      if (data.success) {
        updateUser(data.user)
        toast.success('Profile updated successfully!')
        setEditing(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setForm({
      name: user?.name || '',
      rollNumber: user?.rollNumber || '',
      phone: user?.phone || '',
      department: user?.department || '',
    })
    setEditing(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card p-6 sm:p-8">
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 className="mt-3 text-xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', {
              month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                className="input-field bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Roll Number', value: user?.rollNumber || '—' },
              { label: 'Phone', value: user?.phone || '—' },
              { label: 'Department', value: user?.department || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-400 w-32">{label}</span>
                <span className="text-sm font-medium text-gray-800">{value}</span>
              </div>
            ))}
            <button
              onClick={() => setEditing(true)}
              className="btn-primary w-full mt-4"
            >
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
