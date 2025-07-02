const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Permet au capitaine de supprimer son équipe si aucune activité en cours
router.delete('/', async (req, res) => {
  const { team_id, captain_id } = req.body;

  if (!team_id || !captain_id) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Vérifie que l'équipe existe et récupère le capitaine et le ladder
    const [teamRows] = await db.execute(
      'SELECT captain_id, ladder_id FROM teams WHERE id = ?',
      [team_id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ error: "Équipe non trouvée" });
    }

    const { captain_id: storedCaptain, ladder_id } = teamRows[0];

    if (parseInt(storedCaptain) !== parseInt(captain_id)) {
      return res.status(403).json({ error: "Seul le capitaine peut supprimer l'équipe" });
    }

    // Vérifie qu'il est le seul membre de l'équipe
    const [memberCount] = await connection.execute(
      'SELECT COUNT(*) AS count FROM team_members WHERE team_id = ?',
      [team_id]
    );

    if (memberCount[0].count > 1) {
      return res.status(400).json({ error: "Vous ne pouvez supprimer l'équipe que si vous êtes seul dedans" });
    }

    // Vérifie qu'aucun match n'est en attente, accepté ou disputé
    const [matchRows] = await connection.execute(
      `SELECT id FROM matches
       WHERE (team_1_id = ? OR team_2_id = ?)
         AND status IN ('pending', 'accepted', 'disputed')`,
      [team_id, team_id]
    );

    if (matchRows.length > 0) {
      return res.status(400).json({
        error: "Impossible de supprimer l'équipe : un match est en attente, accepté ou disputé."
      });
    }
    // Marque l'équipe comme supprimée au lieu de retirer les matchs
    await connection.execute(
      'UPDATE teams SET is_deleted = 1 WHERE id = ?',
      [team_id]
    );

    // Supprime les membres de l'équipe
    await connection.execute('DELETE FROM team_members WHERE team_id = ?', [team_id]);

    // Supprime les invitations liées à cette équipe
    await connection.execute('DELETE FROM team_invitations WHERE team_id = ?', [team_id]);

    // Supprime les éventuels tickets de litige liés à cette équipe
    await connection.execute('DELETE FROM dispute_tickets WHERE team_id = ?', [team_id]);

    // Met à jour la colonne team_id correspondante pour le capitaine
    let column = 'team_id_ladder3';
    if (ladder_id === 1) column = 'team_id_ladder1';
    else if (ladder_id === 2) column = 'team_id_ladder2';
    await connection.execute(
      `UPDATE players SET ${column} = NULL WHERE id = ?`,
      [captain_id]
    );

    // Ne supprime pas physiquement l'équipe pour conserver l'historique des matchs

    await connection.commit();

    res.json({ message: "Équipe supprimée" });
  } catch (err) {
    if (connection) await connection.rollback();
    logger.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de l'équipe" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;