const express = require('express');
const router = express.Router();
const db = require('../../db');

// Accepter un match
router.post('/', async (req, res) => {
  console.log('🔥 Route /accept_match/accept atteinte');

  const { team_1_id, team_2_id, selectedPlayers } = req.body;

  if (!team_1_id || !team_2_id || !selectedPlayers || selectedPlayers.length === 0) {
    return res.status(400).json({ error: 'Champs manquants ou joueurs non sélectionnés' });
  }

  if (team_1_id == team_2_id) {
    return res.status(400).json({ error: 'Tu ne peux pas accepter ton propre match' });
  }

  try {
    // Vérifie s’il y a déjà un match pending ou accepté pour l'équipe 2
    const [existingMatch] = await db.execute(
      `SELECT id FROM matches
       WHERE status IN ('pending', 'accepted')
       AND team_2_id = ?`,
      [team_2_id]
    );

    if (existingMatch.length > 0) {
      return res.status(400).json({ error: 'Un match est déjà en attente ou accepté pour cette équipe.' });
    }

    // Met à jour le match
    const [updateResult] = await db.execute(
      `UPDATE matches
       SET team_2_id = ?, status = 'accepted'
       WHERE team_1_id = ? AND status = 'pending'`,
      [team_2_id, team_1_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Aucun match en attente trouvé pour cette équipe.' });
    }

    // Récupère l'ID du match mis à jour
    const [matchRow] = await db.execute(
      `SELECT id FROM matches WHERE team_1_id = ? AND team_2_id = ? AND status = 'accepted'`,
      [team_1_id, team_2_id]
    );

    const matchId = matchRow[0]?.id;
    if (!matchId) {
      return res.status(500).json({ error: "Impossible de récupérer l'ID du match accepté." });
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
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'acceptation du match" });
  }
});

module.exports = router;
