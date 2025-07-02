const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.get('/', async (req, res) => {
  const { team_id, ladder_id } = req.query;
  logger.info('📥 Requête matchTeam reçue avec :', { team_id, ladder_id });

  try {
    const [rows] = await db.execute(
      `SELECT status, team_1_id, team_2_id
        FROM matches
        WHERE (status = 'pending' OR status = 'accepted')
        AND (team_1_id = 26 OR team_2_id = 26)`,
      [team_id, team_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
