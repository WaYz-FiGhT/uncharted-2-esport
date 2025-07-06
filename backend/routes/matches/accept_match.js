const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// Accepter un match
router.post('/', async (req, res) => {
  logger.info('🔥 Route /accept_match/accept atteinte');

  const { team_1_id, team_2_id, selectedPlayers } = req.body;

  if (!team_1_id || !team_2_id || !selectedPlayers || selectedPlayers.length === 0) {
    return res.status(400).json({ error: 'Missing fields or players not selected' });
  }

  if (team_1_id == team_2_id) {
    return res.status(400).json({ error: "You can't accept your own match" });
  }

  try {
    // Vérifie s’il y a déjà un match pending ou un match accepté non reporté pour cette équipe
    const [existingMatch] = await db.execute(
      `SELECT m.id
       FROM matches m
       LEFT JOIN match_reports mr ON m.id = mr.match_id AND mr.team_id = ?
       WHERE (m.team_1_id = ? OR m.team_2_id = ?)
         AND (
           m.status = 'pending'
           OR (m.status = 'accepted' AND mr.id IS NULL)
         )`,
      [team_2_id, team_2_id, team_2_id]
    );

    if (existingMatch.length > 0) {
      return res
        .status(400)
        .json({ error: 'A match is already pending or accepted and not reported for this team.' });
    }

    // Met à jour le match
    const [updateResult] = await db.execute(
      `UPDATE matches
       SET team_2_id = ?, status = 'accepted'
       WHERE team_1_id = ? AND status = 'pending'`,
      [team_2_id, team_1_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'No pending match found for this team.' });
    }

    // Récupère l'ID du match mis à jour
    const [matchRow] = await db.execute(
      `SELECT id FROM matches WHERE team_1_id = ? AND team_2_id = ? AND status = 'accepted'`,
      [team_1_id, team_2_id]
    );

    const matchId = matchRow[0]?.id;
    if (!matchId) {
      return res.status(500).json({ error: "Couldn't retrieve accepted match ID." });
    }

    // Insère les joueurs de l'équipe 2 dans match_players
    for (const player_id of selectedPlayers) {
      await db.execute(
        `INSERT INTO match_players (match_id, player_id, team_id)
         VALUES (?, ?, ?)`,
        [matchId, player_id, team_2_id]
      );
    }

    res.status(200).json({ success: true, match_id: matchId });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Error accepting match' });
  }
});

module.exports = router;
