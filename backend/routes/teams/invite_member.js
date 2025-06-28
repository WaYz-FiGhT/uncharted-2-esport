const express = require('express');
const router = express.Router();
const db = require('../../db');

// Envoyer une invitation à un joueur pour rejoindre une équipe
router.post('/', async (req, res) => {
  const { team_id, player_id, ladder_id } = req.body;

  if (!team_id || !player_id || !ladder_id) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    // Vérifie si le joueur est déjà capitaine ou membre dans une team du même ladder
    const [conflict] = await db.execute(
      `
      SELECT t.id
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.ladder_id = ?
        AND (t.captain_id = ? OR tm.player_id = ?)
      `,
      [ladder_id, player_id, player_id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        error: "Le joueur fait déjà partie d'une équipe (en tant que membre ou capitaine) dans ce ladder."
      });
    }

    // Vérifie qu'il n'y a pas déjà une invitation en attente
    const [existing] = await db.execute(
      `SELECT id FROM team_invitations WHERE team_id = ? AND player_id = ? AND status = 'pending'`,
      [team_id, player_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Une invitation est déjà en attente pour ce joueur." });
    }

    await db.execute(
      `INSERT INTO team_invitations (team_id, player_id, status, created_at)
       VALUES (?, ?, 'pending', NOW())`,
      [team_id, player_id]
    );

    res.status(201).json({ message: 'Invitation envoyée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation" });
  }
});

module.exports = router;