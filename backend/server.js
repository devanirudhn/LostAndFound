require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────

// Your Vercel frontend
const FRONTEND_URL = 'https://lost-and-found-k336.vercel.app';

const allowedOrigins = [
  FRONTEND_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin
      // (Postman, curl, mobile apps, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow the Vercel frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('❌ CORS blocked origin:', origin);

      return callback(
        new Error(`CORS policy: origin ${origin} not allowed`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LostFound API is running',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LostFound API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // CORS error
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
// Render provides PORT dynamically.
// Locally defaults to 5000.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LostFound API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;