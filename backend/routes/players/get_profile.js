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
      `SELECT id, username, psn, profile_picture_url, team_id_ladder1, team_id_ladder2, team_id_ladder3
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
    let wins = 0;
    let losses = 0;

    if (teamIds.length > 0) {
      const [teamRows] = await db.execute(
        `SELECT id, name FROM teams WHERE id IN (${teamIds.map(() => '?').join(',')})`,
        teamIds
      );
      teams = teamRows;

    const [[{ wins: winCount }]] = await db.execute(
      `SELECT COUNT(*) AS wins
       FROM match_players mp
       JOIN matches m ON mp.match_id = m.id
       WHERE mp.player_id = ?
         AND m.status = 'completed'
         AND (
           (mp.team_id = m.team_1_id AND m.official_result = 'win_team_1') OR
           (mp.team_id = m.team_2_id AND m.official_result = 'win_team_2')
         )`,
      [user.id]
    );

    const [[{ losses: lossCount }]] = await db.execute(
      `SELECT COUNT(*) AS losses
       FROM match_players mp
       JOIN matches m ON mp.match_id = m.id
       WHERE mp.player_id = ?
         AND m.status = 'completed'
         AND (
           (mp.team_id = m.team_1_id AND m.official_result = 'win_team_2') OR
           (mp.team_id = m.team_2_id AND m.official_result = 'win_team_1')
         )`,
      [user.id]
    );
    wins = winCount;
    losses = lossCount;
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