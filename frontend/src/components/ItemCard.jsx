import { Link } from 'react-router-dom'

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image'

export default function ItemCard({ item }) {
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown date'

  return (
    <Link to={`/items/${item._id}`} className="card group hover:shadow-md transition-shadow duration-200 block">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={item.image?.url || PLACEHOLDER_IMAGE}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
        />
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
            {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </span>
        </div>
        {/* Status Badge */}
        {item.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <span className="badge-resolved capitalize">{item.status}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>📁</span>
            <span>{item.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>📍</span>
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {item.postedBy?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-gray-500 truncate">
            {item.postedBy?.name || 'Unknown'}
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  )
}
