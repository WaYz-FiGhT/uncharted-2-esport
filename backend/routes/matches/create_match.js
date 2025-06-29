
const express = require('express');
const router = express.Router();
const logger = require('../../logger');
const db = require('../../db');

// Listes de maps par mode
const MAPS = {
  TDM: ['Temple', 'Village', 'Train wreck', 'Plaza', 'The fort', 'Facility - Or none DLC map'],
  Plunder: ['The fort', 'Plaza', 'Sanctuary', 'Village', 'Temple'],
  TurfWar: ['Ice cave', 'Train wreck', 'Sanctuary', 'Village', 'Lost city']
};

// Helper pour tirage aléatoire
function getRandomElements(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

router.post('/', async (req, res) => {
  const { ladder_id, team_1_id, match_game_mode, match_format, player_number, selectedPlayers } = req.body;

  if (!ladder_id || !team_1_id || !match_game_mode || !match_format || !player_number || !selectedPlayers) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  if (Array.isArray(selectedPlayers) && selectedPlayers.length < player_number) {
    return res.status(400).json({ error: `Veuillez sélectionner au moins ${player_number} joueurs.` });
  }

  if (ladder_id == 2 && player_number < 3) {
    return res.status(400).json({ error: 'Le nombre de joueurs doit être au moins de 3 pour ce ladder.' });
  }

  if (ladder_id == 1 && player_number < 2) {
    return res.status(400).json({ error: 'Le nombre de joueurs doit être au moins de 2 pour ce ladder.' });
  }

  try {
    // Vérifier qu'aucun match en attente ou accepté non reporté par cette équipe
    const [rows] = await db.execute(
      `SELECT m.id
       FROM matches m
       LEFT JOIN match_reports mr ON m.id = mr.match_id AND mr.team_id = ?
       WHERE (m.team_1_id = ? OR m.team_2_id = ?)
         AND (
           m.status = 'pending'
           OR (m.status = 'accepted' AND mr.id IS NULL)
         )`,
      [team_1_id, team_1_id, team_1_id]
    );

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Cette équipe a déjà un match en attente ou un match accepté non reporté." });
    }

    let selectedModes = [];
    let selectedMaps = [];

    if (match_game_mode === 'TDM Only') {
      const mapCount = match_format === 'bo3' ? 3 : 5;
      selectedModes = Array(mapCount).fill('TDM');
      selectedMaps = getRandomElements(MAPS.TDM, mapCount);
    } else if (match_game_mode === 'Mixte mode') {
      selectedModes = match_format === 'bo3'
        ? ['TDM', 'Plunder', 'TurfWar']
        : ['TDM', 'Plunder', 'TurfWar', 'TDM', 'Plunder'];

      selectedMaps = selectedModes.map(mode => {
        const modeKey = mode === 'TurfWar' ? 'TurfWar' : mode;
        return getRandomElements(MAPS[modeKey], 1)[0];
      });
    } else if (match_game_mode === 'Plunder Only') {
      const mapCount = match_format === 'bo3' ? 3 : 5;
      selectedModes = Array(mapCount).fill('Plunder');
      selectedMaps = getRandomElements(MAPS.Plunder, mapCount);
    } else {
      return res.status(400).json({ error: 'Mode de jeu invalide.' });
    }

    const [result] = await db.execute(
      `INSERT INTO matches (ladder_id, team_1_id, match_game_mode, match_format, player_number, scheduled_time, status, map_list, mode_list)
       VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL 1 HOUR, ?, ?, ?)`,
      [
        ladder_id,
        team_1_id,
        match_game_mode,
        match_format,
        player_number,
        'pending',
        JSON.stringify(selectedMaps),
        JSON.stringify(selectedModes)
      ]
    );

    const matchId = result.insertId;

    // 🔁 Ajout des joueurs
    for (const player_id of selectedPlayers) {
      await db.execute(
        `INSERT INTO match_players (match_id, player_id, team_id) VALUES (?, ?, ?)`,
        [matchId, player_id, team_1_id]
      );
    }

    res.status(201).json({
      id: matchId,
      ladder_id,
      team_1_id,
      match_game_mode,
      match_format,
      selectedMaps,
      selectedModes,
      selectedPlayers,
      status: 'pending'
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du match' });
  }
});

module.exports = router;
