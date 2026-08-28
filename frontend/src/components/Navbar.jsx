import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <span className="text-2xl">🔍</span>
            <span>LostFound</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/?type=lost"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Lost Items
            </Link>
            <Link
              to="/?type=found"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              Found Items
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/report"
                  className="hidden sm:inline-flex btn-primary text-sm py-1.5 px-3"
                >
                  + Report Item
                </Link>
                <Link
                  to="/my-items"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  My Items
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-1.5 px-3"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile bottom bar */}
        {user && (
          <div className="sm:hidden flex gap-2 pb-2">
            <Link to="/report" className="flex-1 text-center btn-primary text-sm py-1.5">
              + Report Item
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
