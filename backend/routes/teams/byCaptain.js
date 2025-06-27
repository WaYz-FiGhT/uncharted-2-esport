const express = require('express');
const router = express.Router();
const db = require('../../db');

// 🔹 Récupère les équipes où le joueur est capitaine
router.get('/', async (req, res) => {
  const { captain_id } = req.query;

  if (!captain_id) {
    return res.status(400).json({ error: 'ID du capitaine manquant' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM teams WHERE captain_id = ?',
      [captain_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur SQL (byCaptain):', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des équipes (capitaine)' });
  }
});

module.exports = router;
