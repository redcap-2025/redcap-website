// routes/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Only affects local dev

// 🔧 Determine if in production
const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
  // Use Railway MySQL in production, localhost in development
  host: isProduction ? process.env.MYSQLHOST : (process.env.DB_HOST || '127.0.0.1'),
  port: isProduction ? parseInt(process.env.MYSQLPORT) : (parseInt(process.env.DB_PORT) || 3306),
  user: isProduction ? process.env.MYSQLUSER : (process.env.DB_USER || 'root'),
  password: isProduction ? process.env.MYSQLPASSWORD : (process.env.DB_PASSWORD || '2025'),
  database: isProduction ? process.env.MYSQLDATABASE : (process.env.DB_NAME || 'redcap_db'),

  // SSL only required for Railway proxy
  ssl: isProduction ? { rejectUnauthorized: false } : null,

  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 1000,
});

// ✅ Test connection on startup
pool.getConnection()
  .then((connection) => {
    console.log('✅ Successfully connected to MySQL database');
    console.log(`👉 Host: ${connection.config.host}:${connection.config.port}`);
    console.log(`👉 Database: ${connection.config.database}`);
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    if (isProduction) {
      console.error('💡 Check: MYSQLHOST, MYSQLPORT, SSL, and env vars in Render Dashboard');
    } else {
      console.error('🔧 Check: Is MySQL running? Does database "redcap_db" exist?');
    }
    process.exit(1);
  });

// 🛡️ Handle connection errors (e.g., idle timeout)
pool.on('error', (err) => {
  console.error('⚠️ MySQL Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' && isProduction) {
    console.log('🔄 Reconnecting...');
    process.exit(1); // Let Render restart the service
  }
});

module.exports = pool;