const express = require('express');
const router = express.Router();
const db = require('../../db');

// GET /api/dispTeams?user_id=xxx

router.get('/', async (req, res) => {
  const username = req.query.name;

  if (!username) {
    return res.status(400).json({ error: 'Paramètre username manquant' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM players WHERE username = ?',
      [username]
    );
    res.json(rows);  // Les équipes renvoyées avec l'id et le nom
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
