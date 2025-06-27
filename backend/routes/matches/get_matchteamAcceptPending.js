const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  const { team_id, ladder_id } = req.query;
  console.log('📥 Requête matchTeam reçue avec :', { team_id, ladder_id });

  try {
    const [rows] = await db.execute(
      `SELECT status, team_1_id, team_2_id
        FROM matches
        WHERE (status = 'pending' OR status = 'accepted')
        AND (team_1_id = 26 OR team_2_id = 26)`,
      [team_id, team_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
