const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /get_myteams/dispTeamsMember?player_id=xxx
router.get('', async (req, res) => {
  const playerId = req.query.player_id;

  if (!playerId) {
    return res.status(400).json({ error: 'Paramètre player_id manquant' });
  }

  try {
    const [teams] = await db.execute(
      `SELECT t.id, t.name
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.player_id = ?`,
      [playerId]
    );

    res.json(teams); // ✅ On retourne bien la variable correcte ici
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
