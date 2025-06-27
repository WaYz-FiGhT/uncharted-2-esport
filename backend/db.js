const mysql = require('mysql2/promise'); // version promise directe

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uncharted2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
