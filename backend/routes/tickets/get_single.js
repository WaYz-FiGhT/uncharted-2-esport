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
    // 1. Récupérer match_id + statut du match
    const [[ticket]] = await db.execute(`
      SELECT dt.match_id, m.status
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
    await db.execute(`
      UPDATE matches SET official_result = ?, status = 'completed' WHERE id = ?
    `, [result, ticket.match_id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur mise à jour résultat :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
