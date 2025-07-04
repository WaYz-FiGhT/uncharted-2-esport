const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /matches/details/:id
router.get('/:id', async (req, res) => {
  const matchId = req.params.id;

  try {
    const [matchRows] = await db.execute(`
      SELECT
        m.*, 
        t1.name AS team_1_name,
        t1.team_picture_url AS team_1_picture_url,
        t2.name AS team_2_name,
        t2.team_picture_url AS team_2_picture_url
      FROM matches m
      LEFT JOIN teams t1 ON m.team_1_id = t1.id
      LEFT JOIN teams t2 ON m.team_2_id = t2.id
      WHERE m.id = ?
    `, [matchId]);

    if (matchRows.length === 0) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }

    const match = matchRows[0];

    const [mapRows] = await db.execute(`
      SELECT JSON_UNQUOTE(JSON_EXTRACT(mode_list, CONCAT('$[', idx, ']'))) AS game_mode,
             JSON_UNQUOTE(JSON_EXTRACT(map_list, CONCAT('$[', idx, ']'))) AS map_name
      FROM matches
      JOIN (
        SELECT 0 AS idx UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
      ) AS idxs
      WHERE matches.id = ?
      AND idx < JSON_LENGTH(mode_list)
    `, [matchId]);

    const [playerRows] = await db.execute(
      `SELECT p.psn, p.profile_picture_url, mp.team_id, t.name
       FROM match_players mp
       JOIN players p ON mp.player_id = p.id
       JOIN teams t ON mp.team_id = t.id
       WHERE mp.match_id = ?`,
      [matchId]
    );

    const playersByTeam = {};
    playerRows.forEach(row => {
      if (!playersByTeam[row.team_id]) {
        playersByTeam[row.team_id] = {
          name: row.name,
          players: []
        };
      }
      playersByTeam[row.team_id].players.push({ psn: row.psn, profile_picture_url: row.profile_picture_url });
    });

    res.json({
      id: match.id,
      ladder_id: match.ladder_id,
      team_1_id: match.team_1_id,
      team_2_id: match.team_2_id,
      team_1_name: match.team_1_name,
      team_1_picture_url: match.team_1_picture_url,
      team_2_name: match.team_2_name,
      team_2_picture_url: match.team_2_picture_url,
      game_mode: match.match_game_mode,
      format: match.match_format,
      player_number: match.player_number,
      status: match.status,
      scheduled_time: match.scheduled_time,
      maps: mapRows,
      players: playersByTeam,
      result: match.official_result
    });

  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
