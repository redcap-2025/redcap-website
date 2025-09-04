// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db'); // MySQL pool

dotenv.config();

const app = express();

// ✅ CORS: Fix trailing space and validate REACT_APP_FRONTEND_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'https://recapweb.netlify.app', // 🔴 Removed trailing spaces
];

// Use REACT_APP_FRONTEND_URL if set and valid
if (process.env.REACT_APP_FRONTEND_URL && !allowedOrigins.includes(process.env.REACT_APP_FRONTEND_URL)) {
  allowedOrigins.push(process.env.REACT_APP_FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`, req.body);
  next();
});

// Health check endpoint (for Render/monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running on Render with MySQL!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/bookings', require('./routes/bookings'));

// ✅ Validate DB connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    console.log(`👉 Host: ${process.env.MYSQLHOST}:${process.env.MYSQLPORT}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed at startup:', err.message);
    console.error('💡 Check: MYSQLHOST, MYSQLPORT, SSL, and env vars in Render Dashboard');
    process.exit(1); // Crash early if DB is unreachable
  });

// ✅ Bind to 0.0.0.0 and use PORT (Required by Render)
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Available via Render at: https://${process.env.RENDER_EXTERNAL_HOSTNAME}`);
});

// 🔐 Global error handlers
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection:', reason);
  process.exit(1);
});