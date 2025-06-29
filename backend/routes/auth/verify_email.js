const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.get('/', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM players WHERE verification_token = ?',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token invalide' });
    }

    const userId = rows[0].id;
    await db.execute(
      'UPDATE players SET email_verified = 1, verification_token = NULL WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Email vérifié' });
  } catch (err) {
    logger.error('Erreur vérification email :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;