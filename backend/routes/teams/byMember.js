const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// 🔹 Récupère les équipes où le joueur est membre
router.get('/', async (req, res) => {
  const { player_id } = req.query;

  if (!player_id) {
    return res.status(400).json({ error: 'ID du joueur manquant' });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT t.*
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.player_id = ?
      AND t.is_deleted = 0
      `,
      [player_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error('SQL error (byMember):', err);
    res.status(500).json({ error: 'Error fetching teams (member)' });
  }
});

module.exports = router;
