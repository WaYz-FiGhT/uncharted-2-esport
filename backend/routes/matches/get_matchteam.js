const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.get('/', async (req, res) => {
  const { team_id, ladder_id } = req.query;
  logger.info('📥 Requête matchTeam reçue avec :', { team_id, ladder_id });

  if (!team_id || !ladder_id) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT
        m.id,
        m.status,
        m.match_game_mode,
        m.player_number,
        m.official_result,
        m.team_1_id,
        t1.name AS team_1_name,
        m.team_2_id,
        t2.name AS team_2_name,
        l.name AS ladder_name,
        g.name_games
      FROM matches m
      JOIN ladders l ON m.ladder_id = l.id
      JOIN games g ON l.game_id = g.id
      JOIN teams t1 ON m.team_1_id = t1.id
      LEFT JOIN teams t2 ON m.team_2_id = t2.id
      WHERE m.ladder_id = ?
        AND (m.team_1_id = ? OR m.team_2_id = ?)
      ORDER BY m.created_at DESC
    `, [ladder_id, team_id, team_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pas de matchs trouvés' });
    }

    res.json(rows);
  } catch (err) {
    logger.error('Erreur récupération des matchs :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
