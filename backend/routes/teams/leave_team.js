const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Permet à un membre de quitter une équipe (hors capitaine)
router.post('/', async (req, res) => {
  const { team_id, player_id } = req.body;

  if (!team_id || !player_id) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    // Vérifie que l'équipe existe et récupère le capitaine et le ladder
    const [teamRows] = await db.execute(
      'SELECT captain_id, ladder_id FROM teams WHERE id = ?',
      [team_id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ error: "Équipe non trouvée" });
    }

    const { captain_id, ladder_id } = teamRows[0];

    if (parseInt(captain_id) === parseInt(player_id)) {
      return res.status(403).json({ error: "Le capitaine ne peut pas quitter l'équipe" });
    }

    // Vérifie que le joueur est bien membre de l'équipe
    const [memberRows] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND player_id = ?',
      [team_id, player_id]
    );

    if (memberRows.length === 0) {
      return res.status(400).json({ error: "Le joueur n'est pas membre de cette équipe" });
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
        error: "Impossible de quitter l'équipe : un match est en attente, accepté ou disputé."
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

    res.json({ message: "Joueur retiré de l'équipe" });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du joueur" });
  }
});

module.exports = router;