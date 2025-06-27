
const express = require('express');
const router = express.Router();
const db = require('../../db');

// Listes de maps par mode
const MAPS = {
  TDM: ['Map1_TDM', 'Map2_TDM', 'Map3_TDM', 'Map4_TDM', 'Map5_TDM', 'Map6_TDM'],
  Plunder: ['Map1_Plunder', 'Map2_Plunder', 'Map3_Plunder'],
  TurfWar: ['Map1_Turf', 'Map2_Turf', 'Map3_Turf']
};

// Helper pour tirage aléatoire
function getRandomElements(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

router.post('/', async (req, res) => {
  const { ladder_id, team_1_id, match_game_mode, match_format, player_number, selectedPlayers } = req.body;

  if (!ladder_id || !team_1_id || !match_game_mode || !match_format || !selectedPlayers || selectedPlayers.length === 0) {
    return res.status(400).json({ error: 'Champs manquants ou joueurs non sélectionnés' });
  }

  try {
    // Vérifier qu'aucun match en attente/existant
    const [rows] = await db.execute(
      `SELECT id FROM matches
       WHERE (team_1_id = ? OR team_2_id = ?)
       AND (status = 'pending' OR status = 'accepted')`,
      [team_1_id, team_1_id]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: "Cette équipe a déjà un match en attente ou accepté." });
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
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du match' });
  }
});

module.exports = router;
