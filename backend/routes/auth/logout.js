// routes/logout.js
const express = require('express');
const router = express.Router();

// Route pour déconnecter l'utilisateur
router.post('/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }

    res.status(200).json({ success: 'Déconnexion réussie' });
  });
});

module.exports = router;
