const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username manquant' });
  }

  try {
    const [userRows] = await db.execute(
      `SELECT id, username, psn, profile_picture_url, team_id_ladder1, team_id_ladder2, team_id_ladder3, wins, losses
       FROM players WHERE username = ?`,
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    const teamIds = [user.team_id_ladder1, user.team_id_ladder2, user.team_id_ladder3]
      .filter(id => id);

    let teams = [];
    const wins = user.wins || 0;
    const losses = user.losses || 0;

    if (teamIds.length > 0) {
      const [teamRows] = await db.execute(
        `SELECT id, name FROM teams WHERE id IN (${teamIds.map(() => '?').join(',')})`,
        teamIds
      );
      teams = teamRows;
    }

    res.json({
      id: user.id,
      username: user.username,
      psn: user.psn,
      profile_picture_url: user.profile_picture_url,
      teams,
      wins,
      losses
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;