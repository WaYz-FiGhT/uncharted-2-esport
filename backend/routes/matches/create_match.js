
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
function getRandomElements(arr, count, exclude = []) {
  const available = arr.filter(m => !exclude.includes(m));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomElement(arr, used) {
  return getRandomElements(arr, 1, Array.from(used))[0];
}

function getMapCount(format) {
  if (format === 'bo1') return 1;
  if (format === 'bo3') return 3;
  return 5; // bo5
}

router.post('/', async (req, res) => {
  let { ladder_id, team_1_id, match_game_mode, match_format, player_number, selectedPlayers } = req.body;

  if (!ladder_id || !team_1_id || !match_game_mode || !match_format || !player_number || !selectedPlayers) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (Array.isArray(selectedPlayers) && selectedPlayers.length < player_number) {
    return res.status(400).json({ error: `Please select at least ${player_number} players.` });
  }

  if (ladder_id == 3 && player_number !== 1) {
    return res.status(400).json({ error: 'Player count must be 1 for this ladder.' });
  }

  if (ladder_id == 2 && (player_number < 3 || player_number > 5)) {
    return res.status(400).json({ error: 'Player count must be between 3 and 5 for this ladder.' });
  }

  if (ladder_id == 1 && player_number !== 2) {
    return res.status(400).json({ error: 'Player count must be 2 for this ladder.' });
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
         .json({ error: 'This team already has a pending or accepted match not reported.' });
    }

    let selectedModes = [];
    let selectedMaps = [];

    if (ladder_id == 3) {
      // Ladder 1v1 : une seule map Village en TDM
      selectedModes = ['TDM'];
      selectedMaps = ['Village'];
      match_game_mode = 'TDM Only';
    } else if (match_game_mode === 'TDM Only') {
      const mapCount = getMapCount(match_format);
      selectedModes = Array(mapCount).fill('TDM');
      selectedMaps = getRandomElements(MAPS.TDM, mapCount);
    } else if (match_game_mode === 'Mixte mode') {
      selectedModes = match_format === 'bo3'
        ? ['TDM', 'Plunder', 'TurfWar']
        : ['TDM', 'Plunder', 'TurfWar', 'TDM', 'Plunder'];

      const usedMaps = new Set();
      selectedMaps = selectedModes.map(mode => {
        const modeKey = mode === 'TurfWar' ? 'TurfWar' : mode;
        const map = getRandomElement(MAPS[modeKey], usedMaps);
        usedMaps.add(map);
        return map;
      });
    } else if (match_game_mode === 'Plunder Only') {
      const mapCount = getMapCount(match_format);
      selectedModes = Array(mapCount).fill('Plunder');
      selectedMaps = getRandomElements(MAPS.Plunder, mapCount);
    } else {
      return res.status(400).json({ error: 'Invalid game mode.' });
    }

    const [result] = await db.execute(
      `INSERT INTO matches (ladder_id, team_1_id, match_game_mode, match_format, player_number, scheduled_time, status, map_list, mode_list)
       VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP() + INTERVAL 1 HOUR, ?, ?, ?)`,
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
    res.status(500).json({ error: 'Error creating match' });
  }
});

module.exports = router;
