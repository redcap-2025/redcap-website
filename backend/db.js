const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',  // InfinityFree: e.g., sql102.infinityfree.com
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'redcap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // For InfinityFree remote: Add SSL if required (usually not, but test)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;


// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT) || 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   ssl: {
//     rejectUnauthorized: true,
//   },
// });
