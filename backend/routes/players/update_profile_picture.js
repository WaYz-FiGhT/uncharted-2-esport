const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

router.post('/', async (req, res) => {
  const { player_id, profile_picture_url } = req.body;

  if (!player_id || !profile_picture_url) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await db.execute(
      'UPDATE players SET profile_picture_url = ? WHERE id = ?',
      [profile_picture_url, player_id]
    );
    res.json({ message: 'Profile picture updated' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;