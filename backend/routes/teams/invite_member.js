const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Envoyer une invitation à un joueur pour rejoindre une équipe
router.post('/', async (req, res) => {
  const { team_id, player_id, ladder_id } = req.body;

  if (!team_id || !player_id || !ladder_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Vérifie si le joueur est déjà capitaine ou membre dans une team du même ladder
    const [conflict] = await db.execute(
      `
      SELECT t.id
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.ladder_id = ?
        AND t.is_deleted = 0
        AND (t.captain_id = ? OR tm.player_id = ?)
      `,
      [ladder_id, player_id, player_id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        error: 'Player already belongs to a team (as member or captain) in this ladder.'
      });
    }

    // Vérifie qu'il n'y a pas déjà une invitation en attente
    const [existing] = await db.execute(
      `SELECT id FROM team_invitations WHERE team_id = ? AND player_id = ? AND status = 'pending'`,
      [team_id, player_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'An invitation is already pending for this player.' });
    }

    await db.execute(
      `INSERT INTO team_invitations (team_id, player_id, status, created_at)
       VALUES (?, ?, 'pending', NOW())`,
      [team_id, player_id]
    );

    res.status(201).json({ message: 'Invitation sent' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Error sending invitation' });
  }
});

module.exports = router;