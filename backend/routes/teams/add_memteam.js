const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Ajouter un membre à une équipe
router.post('/', async (req, res) => {
  const { team_id, player_id, ladder_id } = req.body;
  logger.info('💡 Données reçues:', { team_id, player_id, ladder_id });

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

    // Insère le joueur dans la table team_members
    const [result] = await db.execute(
      `INSERT INTO team_members (team_id, player_id, role, created_at)
       VALUES (?, ?, 'member', NOW())`,
      [team_id, player_id]
    );


    // Met à jour la colonne team_id correspondant au ladder pour ce joueur
    let column = 'team_id_ladder3';
    if (Number(ladder_id) === 1) column = 'team_id_ladder1';
    else if (Number(ladder_id) === 2) column = 'team_id_ladder2';
    await db.execute(
      `UPDATE players SET ${column} = ? WHERE id = ?`,
      [team_id, player_id]
    );

    res.status(201).json({ id: result.insertId, team_id, player_id });

  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Error adding player to team' });
  }
});

module.exports = router;
