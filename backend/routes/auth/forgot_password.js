const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../../db');
const logger = require('../../logger');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    const [rows] = await db.execute('SELECT id FROM players WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Ne pas révéler si l'email existe ou non
      return res.json({ message: 'If this email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await db.execute(
      'UPDATE players SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
      [token, expires, rows[0].id]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://uncharted-esport.com';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: 'noreply@unchartedesport.com',
      to: email,
      subject: 'Password reset',
      text: `Click this link to reset your password: ${resetLink}`
    });

    logger.info('Password reset email sent to', email);
    res.json({ message: 'If this email exists, a reset link was sent.' });
  } catch (err) {
    logger.error('Password reset request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
