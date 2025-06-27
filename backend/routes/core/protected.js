// routes/protected.js
const express = require('express');
const router = express.Router();

// Route protégée : vérifier si l'utilisateur est connecté
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Vous devez être connecté pour accéder à cette page' });
  }

  // Si l'utilisateur est connecté, afficher des données protégées
  res.json({ message: `Bienvenue, ${req.session.user.username}!` });
});

module.exports = router;
