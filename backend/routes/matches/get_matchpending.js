const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /api/dispTeams?user_id=xxx
// GET /get_team/team?id=3
router.get('/', async (req, res) => {
  const { team_id } = req.query;
  
    try {
      const [rows] = await db.execute(
        `SELECT m.id, l.name, m.status, m.match_game_mode, m.player_number, g.name_games, m.created_at, t.id AS team_1_id
        FROM matches m
        JOIN ladders l ON m.ladder_id = l.id
        JOIN games g ON l.game_id = g.id
        JOIN teams t ON m.team_1_id = t.id
        WHERE m.status = 'pending'
          AND m.ladder_id = (
            SELECT ladder_id FROM teams WHERE id = ?
          )`,
        [team_id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Pas de matchs trouvés' });
      }
  
      res.json(rows);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  

module.exports = router;
