const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../db');
const logger = require('../../logger');

const router = express.Router();

router.post('/', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM players WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'UPDATE players SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashed, rows[0].id]
    );

    res.json({ message: 'Password updated' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;