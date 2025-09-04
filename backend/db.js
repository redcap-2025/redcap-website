// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Use with caution; better to verify CA in prod
    : undefined,
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('Check your DB_HOST, DB_USER, DB_PASSWORD, and network access.');
  });

module.exports = pool;