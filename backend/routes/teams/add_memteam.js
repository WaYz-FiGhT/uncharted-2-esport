const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Ajouter un membre à une équipe
router.post('/', async (req, res) => {
  const { team_id, player_id } = req.body;
  logger.info('💡 Données reçues:', { team_id, player_id });;

  try {
    const [teamRows] = await db.execute(
      'SELECT ladder_id FROM teams WHERE id = ?',
      [team_id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const ladder_id = teamRows[0].ladder_id;

    if (Number(ladder_id) === 3) {
      return res.status(400).json({ error: 'Cannot add members to a 1vs1 team' });
    }
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

    // Insère le joueur dans la table team_members
    const [result] = await db.execute(
      `INSERT INTO team_members (team_id, player_id, role, created_at)
       VALUES (?, ?, 'member', UTC_TIMESTAMP())`,
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
