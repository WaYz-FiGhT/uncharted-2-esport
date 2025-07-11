const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Accepter ou refuser une invitation
router.post('/', async (req, res) => {
  const { invitation_id, accept } = req.body;

  if (!invitation_id || typeof accept === 'undefined') {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const [invRows] = await db.execute(
      `SELECT ti.team_id, ti.player_id, ti.status, t.ladder_id
       FROM team_invitations ti
       JOIN teams t ON ti.team_id = t.id
       WHERE ti.id = ?`,
      [invitation_id]
    );

    if (invRows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const { team_id, player_id, status, ladder_id } = invRows[0];

    if (Number(ladder_id) === 3) {
      await db.execute(`UPDATE team_invitations SET status = 'declined' WHERE id = ?`, [invitation_id]);
      return res.status(400).json({ error: 'Cannot join a 1vs1 team' });
    }


    if (status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    if (accept) {
      // Vérifie si le joueur est déjà dans une équipe du même ladder
      const [conflict] = await db.execute(
        `SELECT t.id
         FROM teams t
         LEFT JOIN team_members tm ON t.id = tm.team_id
         WHERE t.ladder_id = ?
           AND t.is_deleted = 0
           AND (t.captain_id = ? OR tm.player_id = ?)`,
        [ladder_id, player_id, player_id]
      );

      if (conflict.length > 0) {
        await db.execute(`UPDATE team_invitations SET status = 'declined' WHERE id = ?`, [invitation_id]);
        return res.status(400).json({ error: 'Player already in a team for this ladder.' });
      }

      await db.execute(
        `INSERT INTO team_members (team_id, player_id, role, created_at)
         VALUES (?, ?, 'member', UTC_TIMESTAMP())`,
        [team_id, player_id]
      );

      let column = 'team_id_ladder3';
      if (Number(ladder_id) === 1) column = 'team_id_ladder1';
      else if (Number(ladder_id) === 2) column = 'team_id_ladder2';
      await db.execute(
        `UPDATE players SET ${column} = ? WHERE id = ?`,
        [team_id, player_id]
      );

      await db.execute(`UPDATE team_invitations SET status = 'accepted' WHERE id = ?`, [invitation_id]);

      res.json({ message: 'Invitation accepted' });
    } else {
      await db.execute(`UPDATE team_invitations SET status = 'declined' WHERE id = ?`, [invitation_id]);
      res.json({ message: 'Invitation declined' });
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Error processing invitation' });
  }
});

module.exports = router;
