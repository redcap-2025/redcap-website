// db.js
const mysql = require('mysql2/promise');

// 🔒 Validate required environment variables
if (!process.env.MYSQLHOST || !process.env.MYSQLPORT || !process.env.MYSQLUSER || !process.env.MYSQLPASSWORD) {
  console.error('❌ Missing required MySQL environment variables. Check Render dashboard.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || 'railway',
  ssl: {
    rejectUnauthorized: false // 🔐 Required for Railway's proxy.rlwy.net
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,        // 💡 Prevent idle timeout
  keepAliveInitialDelay: 1000,  // ms
});

// ✅ Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Successfully connected to MySQL database');
    console.log(`👉 Host: ${process.env.MYSQLHOST}:${process.env.MYSQLPORT}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('💡 Check: DB_HOST, DB_PORT, SSL, and network access.');
    console.error('🔧 Ensure env vars are set in Render Dashboard (not .env file).');
  });

// 🛡️ Optional: Handle pool errors
pool.on('error', (err) => {
  console.error('⚠️ MySQL Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconnecting...');
    // Let Render restart the service if needed
    process.exit(1);
  }
});

module.exports = pool;