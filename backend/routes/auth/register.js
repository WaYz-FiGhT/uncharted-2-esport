const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../../db');

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  // 🔸 Vérification des champs
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    // 🔸 Vérifier si l'utilisateur existe déjà
    const [existing] = await db.execute(
      'SELECT id FROM players WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Utilisateur ou email déjà utilisé.' });
    }

    // 🔸 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔸 Insertion en BDD
    const [result] = await db.execute(
      'INSERT INTO players (username, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );

    res.status(201).json({ id: result.insertId, username, email });
  } catch (err) {
    console.error('Erreur lors de la création du joueur :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
