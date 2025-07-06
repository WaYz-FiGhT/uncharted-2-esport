const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

// GET /api/dispTeams?user_id=xxx

router.get('/', async (req, res) => {
  const username = req.query.name;

  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM players WHERE username = ?',
      [username]
    );
    res.json(rows);  // Les équipes renvoyées avec l'id et le nom
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
