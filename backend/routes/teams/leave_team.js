const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Permet à un membre de quitter une équipe (hors capitaine)
router.post('/', async (req, res) => {
  const { team_id, player_id } = req.body;

  if (!team_id || !player_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Vérifie que l'équipe existe et récupère le capitaine et le ladder
    const [teamRows] = await db.execute(
      'SELECT captain_id, ladder_id FROM teams WHERE id = ?',
      [team_id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    const { captain_id, ladder_id } = teamRows[0];

    if (parseInt(captain_id) === parseInt(player_id)) {
      return res.status(403).json({ error: 'The captain cannot leave the team' });
    }

    // Vérifie que le joueur est bien membre de l'équipe
    const [memberRows] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND player_id = ?',
      [team_id, player_id]
    );

    if (memberRows.length === 0) {
      return res.status(400).json({ error: 'Player is not a member of this team' });
    }

    // Vérifie qu'aucun match n'est en attente, accepté ou disputé
    const [matchRows] = await db.execute(
      `SELECT id FROM matches
       WHERE (team_1_id = ? OR team_2_id = ?)
         AND status IN ('pending', 'accepted', 'disputed')`,
      [team_id, team_id]
    );

    if (matchRows.length > 0) {
      return res.status(400).json({
        error: 'Cannot leave the team: a match is pending, accepted or disputed.'
      });
    }

    // Supprime l'entrée dans team_members
    await db.execute(
      'DELETE FROM team_members WHERE team_id = ? AND player_id = ?',
      [team_id, player_id]
    );

    // Met à jour la colonne team_id correspondant au ladder pour ce joueur
    let column = 'team_id_ladder3';
    if (ladder_id === 1) column = 'team_id_ladder1';
    else if (ladder_id === 2) column = 'team_id_ladder2';
    await db.execute(
      `UPDATE players SET ${column} = NULL WHERE id = ?`,
      [player_id]
    );

    res.json({ message: 'Player removed from the team' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Error removing player' });
  }
});

module.exports = router;