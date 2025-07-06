const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// 🔹 Récupère les équipes où le joueur est capitaine
router.get('/', async (req, res) => {
  const { captain_id } = req.query;

  if (!captain_id) {
    return res.status(400).json({ error: 'Missing captain_id parameter' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM teams WHERE captain_id = ? AND is_deleted = 0',
      [captain_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error('SQL error (byCaptain):', err);
    res.status(500).json({ error: 'Error fetching teams (captain)' });
  }
});

module.exports = router;
