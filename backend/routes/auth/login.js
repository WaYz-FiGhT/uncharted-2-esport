const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../db');
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Champs manquants' });

  try {
    const [rows] = await db.execute(
      'SELECT * FROM players WHERE username = ?',
      [username]
    );

    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: 'Utilisateur introuvable' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Mot de passe incorrect' });

    // ⬇️ On stocke aussi le team_id (s'il est présent)
    req.session.user = { id: user.id, username: user.username, team_id: user.team_id,  is_admin: user.is_admin};
    res.json({ username: user.username, team_id: user.team_id, is_admin: user.is_admin });

  } catch (err) {
    console.error('Erreur de connexion :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
