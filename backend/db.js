const mysql = require('mysql2/promise'); // version promise directe
const path = require('path');

// Charge .env.production explicitement
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'uncharted2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
