const express = require('express');
const router = express.Router();
const db = require('../../db');

// GET /get_laddername?id=3
router.get('/', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID manquant' });

  try {
    const [rows] = await db.execute(
      `SELECT l.name AS ladder_name, g.name_games AS game_name
       FROM ladders l
       JOIN games g ON l.game_id = g.id
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ladder introuvable' });
    }

    res.json(rows[0]);  // { ladder_name: "...", game_name: "..." }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
