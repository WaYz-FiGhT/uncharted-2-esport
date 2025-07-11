const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /teams/ranking?ladder_id=1
router.get('/', async (req, res) => {
  const { ladder_id } = req.query;

  if (!ladder_id) {
    return res.status(400).json({ error: 'Missing ladder_id' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT
        t.id,
        t.name,
        t.team_picture_url,
        t.xp,
        (
          SELECT COUNT(*)
          FROM matches m
          WHERE (m.team_1_id = t.id AND m.official_result = 'win_team_1')
             OR (m.team_2_id = t.id AND m.official_result = 'win_team_2')
        ) AS wins,
        (
          SELECT COUNT(*)
          FROM matches m
          WHERE (m.team_1_id = t.id AND m.official_result = 'win_team_2')
             OR (m.team_2_id = t.id AND m.official_result = 'win_team_1')
        ) AS losses
      FROM teams t
      WHERE t.ladder_id = ?
        AND t.is_deleted = 0
      ORDER BY t.xp DESC`,
      [ladder_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;