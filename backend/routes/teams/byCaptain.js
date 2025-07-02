const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// 🔹 Récupère les équipes où le joueur est capitaine
router.get('/', async (req, res) => {
  const { captain_id } = req.query;

  if (!captain_id) {
    return res.status(400).json({ error: 'ID du capitaine manquant' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM teams WHERE captain_id = ? AND is_deleted = 0',
      [captain_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error('Erreur SQL (byCaptain):', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des équipes (capitaine)' });
  }
});

module.exports = router;
