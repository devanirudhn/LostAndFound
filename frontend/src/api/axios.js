import axios from 'axios'

// ─── Centralized Axios Instance ───────────────────────────────────────────────
// ALL API requests go through this instance.
// The base URL comes from VITE_API_URL environment variable.
//
// LOCAL:      VITE_API_URL=http://localhost:5000
// PRODUCTION: VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
//
// Never hard-code the backend URL anywhere else in the frontend.
// ─────────────────────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// ─── Request Interceptor — attach JWT token ───────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — handle 401 globally ───────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
