const express = require('express');
const db = require('../../db');
const router = express.Router();

// Vérification de l'email à partir du token
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
      return res.status(400).json({ error: 'Lien de vérification invalide ou expiré.' });
    }

    await db.execute(
      'UPDATE players SET email_verified = 1, verification_token = NULL WHERE id = ?',
      [rows[0].id]
    );

    res.json({ message: 'Email vérifié avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'email :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
