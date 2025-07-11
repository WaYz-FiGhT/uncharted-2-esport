const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// POST /tickets/create
router.post('/', async (req, res) => {
  const userId = req.session?.user?.id;
  const { match_id, team_id, message } = req.body;

  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  if (!match_id || !team_id || !message?.trim()) {
    return res.status(400).json({ error: 'Invalid fields' });
  }

  try {
    // Vérifie si un ticket existe déjà pour cette équipe et ce match
    const [existing] = await db.execute(
      `SELECT id FROM dispute_tickets WHERE match_id = ? AND team_id = ?`,
      [match_id, team_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'A ticket has already been sent by this team.' });
    }

    await db.execute(
      `INSERT INTO dispute_tickets (match_id, team_id, message, created_at)
       VALUES (?, ?, ?, UTC_TIMESTAMP())`,
      [match_id, team_id, message.trim()]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    logger.error('Ticket creation error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /tickets : Liste tous les tickets (pour admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        dt.id AS ticket_id,
        dt.match_id,
        m.scheduled_time,
        m.team_1_id,
        m.team_2_id,
        team1.name AS team_1_name,
        team2.name AS team_2_name,
        dt.team_id AS ticket_team_id,
        t.name AS ticket_team_name,
        dt.message,
        dt.created_at,
        m.official_result
      FROM dispute_tickets dt
      JOIN matches m ON dt.match_id = m.id
      JOIN teams t ON dt.team_id = t.id
      LEFT JOIN teams team1 ON m.team_1_id = team1.id
      LEFT JOIN teams team2 ON m.team_2_id = team2.id
      WHERE m.status = 'disputed'
      ORDER BY m.scheduled_time DESC, dt.created_at DESC;

    `);
    res.json(rows);
  } catch (err) {
    logger.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


module.exports = router;
