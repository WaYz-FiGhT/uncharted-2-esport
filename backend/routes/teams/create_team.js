const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');
const upload = require('../..//uploadConfig');

// Route POST pour créer une nouvelle team
router.post('/', upload.single('picture'), async (req, res) => {
  const { name, user_id, ladder_id } = req.body;
  const team_picture_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !user_id || !ladder_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (!name.trim()) {
    return res.status(400).json({ error: 'Team name cannot be empty or spaces.' });
  }

  if (name.length > 16) {
    return res.status(400).json({ error: 'Team name too long (16 characters max).' });
  }

  try {
    // Vérifie s'il est déjà capitaine ou membre dans une team de ce ladder
    const [conflict] = await db.execute(
      `
      SELECT t.id
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.ladder_id = ?
        AND t.is_deleted = 0
        AND (t.captain_id = ? OR tm.player_id = ?)
      `,
      [ladder_id, user_id, user_id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        error: 'You are already in a team (as member or captain) in this ladder.'
      });
    }

    // Vérifie si le nom est déjà pris dans ce ladder
    const [existing] = await db.execute(
      `SELECT id FROM teams WHERE name = ? AND ladder_id = ? AND is_deleted = 0`,
      [name, ladder_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'A team with this name already exists in this ladder.' });
    }

    // Création de l'équipe
    const [result] = await db.execute(
      `INSERT INTO teams (name, captain_id, ladder_id, team_picture_url, is_deleted) VALUES (?, ?, ?, ?, 0)`,
      [name, user_id, ladder_id, team_picture_url]
    );

    const teamId = result.insertId;

    // Ajoute le capitaine dans team_members
    await db.execute(
      `INSERT INTO team_members (team_id, player_id, role) VALUES (?, ?, ?)`,
      [teamId, user_id, "captain"]
    );

    // Met à jour la colonne team_id correspondant au ladder
    let column = 'team_id_ladder3';
    if (Number(ladder_id) === 1) column = 'team_id_ladder1';
    else if (Number(ladder_id) === 2) column = 'team_id_ladder2';
    await db.execute(
      `UPDATE players SET ${column} = ? WHERE id = ?`,
      [teamId, user_id]
    );

    res.status(201).json({
      team_id: teamId,
      player_id: user_id,
    });

  } catch (err) {
    logger.error('SQL error:', err);
    res.status(500).json({ error: 'Error creating team' });
  }
});

module.exports = router;
