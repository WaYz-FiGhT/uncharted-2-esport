const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /teams/ranking?ladder_id=1
router.get('/', async (req, res) => {
  const { ladder_id } = req.query;

  if (!ladder_id) {
    return res.status(400).json({ error: 'ladder_id manquant' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, name, xp FROM teams WHERE ladder_id = ? ORDER BY xp DESC`,
      [ladder_id]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;