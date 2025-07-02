// routes/logout.js
const express = require('express');
const router = express.Router();

// Route pour déconnecter l'utilisateur
router.post('/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }

    res.status(200).json({ success: 'Logout successful' });
  });
});

module.exports = router;
