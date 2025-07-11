const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const logger = require('../../logger');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../../db');

router.post('/', async (req, res) => {

  const { username, email, password, confirmPassword, psn } = req.body;
  const profilePictureUrl = null;
    

  // 🔸 Vérification des champs
  if (!username || !email || !password || !confirmPassword || !psn) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!username.trim()) {
    return res.status(400).json({ error: 'Username cannot be empty or spaces.' });
  }

  if (!psn.trim()) {
    return res.status(400).json({ error: 'PSN cannot be empty or spaces.' });
  }

  if (username.length < 4 || username.length > 16) {
    return res.status(400).json({ error: 'Username must be between 4 and 16 characters.' });
  }

  if (psn.length < 4 || psn.length > 16) {
    return res.status(400).json({ error: 'PSN must be between 4 and 16 characters.' });
  }

  if (password.length < 8 || password.length > 24) {
    return res.status(400).json({ error: 'Password must be between 8 and 24 characters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    // 🔸 Vérifier si l'utilisateur existe déjà
    const [existing] = await db.execute(
      'SELECT id FROM players WHERE username = ? OR email = ? OR psn = ?',
      [username, email, psn]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username, email or PSN already used.' });
    }

    // 🔸 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');

    // 🔸 Insertion en BDD avec PSN et token de vérification
    const [result] = await db.execute(
      'INSERT INTO players (username, email, password, psn, profile_picture_url, verification_token, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, UTC_TIMESTAMP())',
      [username, email, hashedPassword, psn, profilePictureUrl, token]
    );

       // 🔸 Envoi de l'email de vérification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://uncharted-esport.com';
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: 'noreply@unchartedesport.com',
      to: email,
      subject: 'Confirm your registration',
      text: `Click this link to verify your email and activate your account: ${verifyLink}`
    });
    logger.info('✅ Email envoyé à', email);

    res.status(201).json({ message: 'User created. Check your email.' });
  } catch (err) {
    logger.error('Error creating player:', err);
    res.status(500).json({ error: 'Server error.' });
    logger.error('❌ Error complète :', err);
  }
});

module.exports = router;
