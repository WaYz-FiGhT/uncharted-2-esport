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
      `SELECT id, username, psn, team_id_ladder1, team_id_ladder2, team_id_ladder3
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
    let totalWins = 0;
    let totalLosses = 0;

    if (teamIds.length > 0) {
      const [teamRows] = await db.execute(
        `SELECT id, name FROM teams WHERE id IN (${teamIds.map(() => '?').join(',')})`,
        teamIds
      );
      teams = teamRows;

      for (const teamId of teamIds) {
        const [[{ wins }]] = await db.execute(
          `SELECT COUNT(*) AS wins FROM matches
           WHERE (team_1_id = ? AND official_result = 'win_team_1')
              OR (team_2_id = ? AND official_result = 'win_team_2')`,
          [teamId, teamId]
        );
        const [[{ losses }]] = await db.execute(
          `SELECT COUNT(*) AS losses FROM matches
           WHERE (team_1_id = ? AND official_result = 'win_team_2')
              OR (team_2_id = ? AND official_result = 'win_team_1')`,
          [teamId, teamId]
        );
        totalWins += wins;
        totalLosses += losses;
      }
    }

    res.json({
      username: user.username,
      psn: user.psn,
      teams,
      wins: totalWins,
      losses: totalLosses
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;