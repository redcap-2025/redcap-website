const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 🔎 Global request logger (add this before routes)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`, req.body);
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/bookings'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("DB config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 Unhandled Rejection:", reason);
});