// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Still load .env (optional, for overrides)

const pool = mysql.createPool({
  host: '127.0.0.1',           // ✅ Localhost IP (preferred over 'localhost')
  port: 3306,                  // ✅ Default MySQL port
  user: 'root',                // ✅ Default user for local MySQL (XAMPP/MAMP)
  password: '2025',                // ✅ Often empty for local dev
  database: 'redcap_db',       // ✅ Your database name (must exist)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 1000, // Better than 0
  ssl: false,                  // Not needed for localhost
});

// Test connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    console.log(`👉 Connected to MySQL at ${connection.config.host}:${connection.config.port}`);
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('🔧 Check: Is MySQL running? Does database "redcap_db" exist?');
    process.exit(1); // Exit if DB fails
  });

module.exports = pool;