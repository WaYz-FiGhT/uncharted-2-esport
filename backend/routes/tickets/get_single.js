const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');
const isAdmin = require('./isAdmin');

router.use(isAdmin);

// GET /tickets/:ticket_id
router.get('/:ticket_id', async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT
        dt.id,
        dt.match_id,
        m.scheduled_time,
        team1.name AS team_1_name,
        team1.id AS team_1_id,
        team2.name AS team_2_name,
        team2.id AS team_2_id,
        t.name AS team_name,
        t.id AS team_id,
        dt.message,
        dt.created_at
      FROM dispute_tickets dt
      JOIN teams t ON dt.team_id = t.id
      JOIN matches m ON dt.match_id = m.id
      LEFT JOIN teams team1 ON m.team_1_id = team1.id
      LEFT JOIN teams team2 ON m.team_2_id = team2.id
      WHERE dt.id = ?
    `, [ticket_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    logger.error('Ticket fetch error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /tickets/:ticket_id/set-result
router.post('/:ticket_id/set-result', async (req, res) => {
  const { ticket_id } = req.params;
  const { winner } = req.body;

  if (!['team_1', 'team_2'].includes(winner)) {
    return res.status(400).json({ error: 'Invalid winner.' });
  }

  try {
    // 1. Récupérer match_id, statut et équipes du match
    const [[ticket]] = await db.execute(`
      SELECT dt.match_id, m.status, m.team_1_id, m.team_2_id
      FROM dispute_tickets dt
      JOIN matches m ON dt.match_id = m.id
      WHERE dt.id = ?
    `, [ticket_id]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    if (ticket.status !== 'disputed') {
      return res.status(400).json({ error: 'Result already set.' });
    }

    const result = winner === 'team_1' ? 'win_team_1' : 'win_team_2';

    // 2. Mise à jour du match
    await db.execute(
      `UPDATE matches SET official_result = ?, status = 'completed' WHERE id = ?`,
      [result, ticket.match_id]
    );

    // 3. Mise à jour de l'XP des équipes
    const [teamRows] = await db.execute(
      `SELECT id, xp FROM teams WHERE id IN (?, ?)`,
      [ticket.team_1_id, ticket.team_2_id]
    );

    const team1XP = teamRows.find(t => t.id === ticket.team_1_id)?.xp || 0;
    const team2XP = teamRows.find(t => t.id === ticket.team_2_id)?.xp || 0;

    const eloChange = (ratingA, ratingB, winA) => {
      const K = 32;
      const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
      const scoreA = winA ? 1 : 0;
      const changeA = Math.round(K * (scoreA - expectedA));
      return changeA;
    };

    if (result === 'win_team_1') {
      const change1 = eloChange(team1XP, team2XP, true);
      const change2 = -eloChange(team2XP, team1XP, true);
      await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change1, ticket.team_1_id]);
      await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change2, ticket.team_2_id]);
    } else if (result === 'win_team_2') {
      const change2 = eloChange(team2XP, team1XP, true);
      const change1 = -eloChange(team1XP, team2XP, true);
      await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change1, ticket.team_1_id]);
      await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change2, ticket.team_2_id]);
    }
    const [playerRows] = await db.execute(
      `SELECT player_id, team_id FROM match_players WHERE match_id = ?`,
      [ticket.match_id]
    );

    for (const { player_id, team_id: pTeamId } of playerRows) {
      if (result === 'win_team_1') {
        if (pTeamId === ticket.team_1_id) {
          await db.execute(`UPDATE players SET wins = wins + 1 WHERE id = ?`, [player_id]);
        } else if (pTeamId === ticket.team_2_id) {
          await db.execute(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player_id]);
        }
      } else if (result === 'win_team_2') {
        if (pTeamId === ticket.team_2_id) {
          await db.execute(`UPDATE players SET wins = wins + 1 WHERE id = ?`, [player_id]);
        } else if (pTeamId === ticket.team_1_id) {
          await db.execute(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player_id]);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Result update error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
