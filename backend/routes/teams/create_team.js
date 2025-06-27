const express = require('express'); 
const router = express.Router();
const db = require('../../db');

// Route POST pour créer une nouvelle team
router.post('/', async (req, res) => {
  const { name, user_id, ladder_id } = req.body;

  if (!name || !user_id || !ladder_id) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    // Vérifie s'il est déjà capitaine ou membre dans une team de ce ladder
    const [conflict] = await db.execute(
      `
      SELECT t.id
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.ladder_id = ?
        AND (t.captain_id = ? OR tm.player_id = ?)
      `,
      [ladder_id, user_id, user_id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        error: "Vous faites déjà partie d'une équipe (en tant que membre ou capitaine) dans ce ladder."
      });
    }

    // Vérifie si le nom est déjà pris dans ce ladder
    const [existing] = await db.execute(
      `SELECT id FROM teams WHERE name = ? AND ladder_id = ?`,
      [name, ladder_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Une équipe avec ce nom existe déjà dans ce ladder." });
    }

    // Création de l'équipe
    const [result] = await db.execute(
      `INSERT INTO teams (name, captain_id, ladder_id) VALUES (?, ?, ?)`,
      [name, user_id, ladder_id]
    );

    const teamId = result.insertId;

    // Ajoute le capitaine dans team_members
    await db.execute(
      `INSERT INTO team_members (team_id, player_id, role) VALUES (?, ?, ?)`,
      [teamId, user_id, "captain"]
    );

    // 🔥 Met à jour le joueur avec le team_id
    await db.execute(
      `UPDATE players SET team_id = ? WHERE id = ?`,
      [teamId, user_id]
    );

    res.status(201).json({
      team_id: teamId,
      player_id: user_id,
    });

  } catch (err) {
    console.error('Erreur SQL :', err);
    res.status(500).json({ error: 'Erreur lors de la création de la team' });
  }
});

module.exports = router;
