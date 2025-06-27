const express = require('express');
const router = express.Router();
const db = require('../../db');
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
        team2.name AS team_2_name,
        t.name AS team_name,
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
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération ticket :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /tickets/:ticket_id/set-result
router.post('/:ticket_id/set-result', async (req, res) => {
  const { ticket_id } = req.params;
  const { winner } = req.body;

  if (!['team_1', 'team_2'].includes(winner)) {
    return res.status(400).json({ error: 'Gagnant invalide.' });
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
      return res.status(404).json({ error: 'Ticket introuvable.' });
    }

    if (ticket.status !== 'disputed') {
      return res.status(400).json({ error: 'Le résultat a déjà été fixé.' });
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

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur mise à jour résultat :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
