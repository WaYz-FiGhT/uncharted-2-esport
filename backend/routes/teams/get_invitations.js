const express = require('express');
const router = express.Router();
const db = require('../../db');

// Récupérer les invitations en attente pour un joueur
router.get('/', async (req, res) => {
  const { player_id } = req.query;

  if (!player_id) {
    return res.status(400).json({ error: 'Paramètre player_id manquant' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT ti.id, ti.team_id, t.name AS team_name, t.ladder_id
       FROM team_invitations ti
       JOIN teams t ON ti.team_id = t.id
       WHERE ti.player_id = ? AND ti.status = 'pending'`,
      [player_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des invitations' });
  }
});

module.exports = router;