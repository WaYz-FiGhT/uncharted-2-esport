const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../db');
const logger = require('../../logger');
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Champs manquants' });

  try {
    const [rows] = await db.execute(
      `SELECT id, username, password, is_admin, email_verified,
              team_id_ladder1, team_id_ladder2
       FROM players WHERE username = ?`,
      [username]
    );

    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: 'Utilisateur introuvable' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Mot de passe incorrect' });

    if (!user.email_verified) {
      return res.status(401).json({ error: 'Email non vérifié' });
    }

    // ⬇️ On stocke aussi le team_id (s'il est présent)
    const isAdmin = Boolean(user.is_admin);
    req.session.user = {
      id: user.id,
      username: user.username,
      team_id_ladder1: user.team_id_ladder1,
      team_id_ladder2: user.team_id_ladder2,
      is_admin: isAdmin
    };
    res.json({
      username: user.username,
      team_id_ladder1: user.team_id_ladder1,
      team_id_ladder2: user.team_id_ladder2,
      is_admin: isAdmin
    });

  } catch (err) {
    logger.error('Erreur de connexion :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
