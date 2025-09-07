const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./config/db');
const app = express();

// ✅ Use environment variable for frontend origin
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';

// ✅ FIXED: Removed trailing slash, added 127.0.0.1 variants for Flutter
const LOCALHOSTS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://localhost:49212',
  
  
  'https://recapweb.netlify.app', // Your production frontend
];

const allowedOrigins = [FRONTEND_URL, ...LOCALHOSTS];

// ✅ Configure CORS with origin validation
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, Flutter mobile)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for: ${origin}`);
      return callback(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200, // Important for older browsers
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests for all routes (CRITICAL for POST/PUT with content-type)
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`, req.body);
  next();
});

// Health check endpoint (for Render/monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running...' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/bookings', require('./routes/bookings'));

// ✅ Validate DB connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    console.log(`👉 Host: ${process.env.MYSQLHOST || 'localhost'}:${process.env.MYSQLPORT || 3306}`);
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
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    console.log(`🌍 Available via Render at: https://${process.env.RENDER_EXTERNAL_HOSTNAME}`);
  }
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

const listEndpoints = require("express-list-endpoints");
console.log(listEndpoints(app));