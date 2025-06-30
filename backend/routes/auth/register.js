const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const logger = require('../../logger');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../../db');

router.post('/', async (req, res) => {
  const { username, email, password, confirmPassword, psn } = req.body;
    

  // 🔸 Vérification des champs
  if (!username || !email || !password || !confirmPassword || !psn) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  if (username.length > 16) {
    return res.status(400).json({ error: 'Username trop long (16 caractères max).' });
  }

  if (psn.length > 16) {
    return res.status(400).json({ error: 'PSN trop long (16 caractères max).' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    // 🔸 Vérifier si l'utilisateur existe déjà
    const [existing] = await db.execute(
      'SELECT id FROM players WHERE username = ? OR email = ? OR psn = ?',
      [username, email, psn]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Utilisateur, email ou PSN déjà utilisé.' });
    }

    // 🔸 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');

    // 🔸 Insertion en BDD avec PSN et token de vérification
    const [result] = await db.execute(
      'INSERT INTO players (username, email, password, psn, verification_token, email_verified, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
      [username, email, hashedPassword, psn, token]
    );

       // 🔸 Envoi de l'email de vérification
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      secure: false,
      auth: {
        user: 'd6a28cc1be54ae',
        pass: '9235fe8b6ded92'
      }
    });

    const verifyLink = `http://localhost:5173/verify-email?token=${token}`;
    await transporter.sendMail({
      from: 'noreply@unchartedesport.com',
      to: email,
      subject: 'Confirmez votre inscription',
      text: `Cliquez sur ce lien pour activer votre compte : ${verifyLink}`
    });
    logger.info('✅ Email envoyé à', email);

    res.status(201).json({ message: 'Utilisateur créé. Vérifiez votre email.' });
  } catch (err) {
    logger.error('Erreur lors de la création du joueur :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
    logger.error('❌ Erreur complète :', err);

  }
});

module.exports = router;
