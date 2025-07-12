const mysql = require('mysql2/promise'); // version promise directe
const path = require('path');

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env';
require('dotenv').config({
  path: path.join(__dirname, envFile),
  override: true,
});

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'uncharted2',
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
