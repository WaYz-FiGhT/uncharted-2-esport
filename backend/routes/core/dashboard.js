// routes/dashboard.js
const express = require('express');
const router = express.Router();

// Route protégée : Vérifier la session utilisateur
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Vous devez être connecté pour accéder à cette page' });
  }

  // Si l'utilisateur est connecté, afficher le tableau de bord
  res.json({ message: `Bienvenue, ${req.session.user.username}!` });
});

module.exports = router;
