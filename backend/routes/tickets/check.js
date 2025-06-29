const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /tickets/check?match_id=...&team_id=...
router.get('/', async (req, res) => {
  const { match_id, team_id } = req.query;

  if (!match_id || !team_id) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id FROM dispute_tickets WHERE match_id = ? AND team_id = ?`,
      [match_id, team_id]
    );
    res.json({ alreadySent: rows.length > 0 });
  } catch (err) {
    logger.error('Erreur check ticket :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
