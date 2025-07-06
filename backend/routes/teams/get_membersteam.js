const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /api/dispTeams?user_id=xxx
// GET /get_team/team?id=3
router.get('/', async (req, res) => {
    const teamId = req.query.team_id;

  
    if (!teamId) {
      return res.status(400).json({ error: 'Missing team_id parameter' });
    }
  
    try {
      const [rows] = await db.execute(`
        SELECT p.id, p.username, p.psn, p.profile_picture_url, tm.role
        FROM team_members tm
        JOIN players p ON tm.player_id = p.id
        WHERE tm.team_id = ?
      `, [teamId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No members found' });
      }
  
      res.json(rows);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;
