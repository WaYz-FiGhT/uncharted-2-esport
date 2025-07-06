const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');
const upload = require('../..//uploadConfig');

router.post('/', upload.single('picture'), async (req, res) => {
  const { player_id } = req.body;

  if (!player_id || !req.file) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const pictureUrl = `/uploads/${req.file.filename}`;

  try {
    await db.execute(
      'UPDATE players SET profile_picture_url = ? WHERE id = ?',
      [pictureUrl, player_id]
    );
    res.json({ message: 'Profile picture updated', url: pictureUrl });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;