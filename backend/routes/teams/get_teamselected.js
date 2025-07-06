const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /api/dispTeams?user_id=xxx
// GET /get_team/team?id=3
router.get('/', async (req, res) => {
    const teamId = req.query.id;
  
    if (!teamId) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }
  
    try {
      const [rows] = await db.execute(' SELECT l.id AS ladder_id, l.name AS ladder_name, t.name AS team_name, t.team_picture_url, g.name_games, t.captain_id FROM teams t JOIN ladders l ON t.ladder_id = l.id JOIN games g ON l.game_id = g.id WHERE t.id = ?', [teamId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      res.json(rows[0]);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;
