const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');
const multer = require('multer');
const upload = require('../..//uploadConfig');

router.post('/', (req, res) => {
  upload.single('picture')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
      return res.status(400).json({ error: err.message });
    }

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
});

module.exports = router;