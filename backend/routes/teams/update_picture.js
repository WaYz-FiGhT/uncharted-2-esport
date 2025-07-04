const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.post('/', async (req, res) => {
  const { team_id, captain_id, team_picture_url } = req.body;

  if (!team_id || !captain_id || !team_picture_url) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const [rows] = await db.execute('SELECT captain_id FROM teams WHERE id = ?', [team_id]);
    if (rows.length === 0 || Number(rows[0].captain_id) !== Number(captain_id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.execute('UPDATE teams SET team_picture_url = ? WHERE id = ?', [team_picture_url, team_id]);
    res.json({ message: 'Team picture updated' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;