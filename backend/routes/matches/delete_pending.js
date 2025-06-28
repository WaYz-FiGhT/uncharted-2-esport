const express = require('express');
const router = express.Router();
const db = require('../../db');

// Delete a match only if it is still pending
router.delete('/', async (req, res) => {
  const { match_id } = req.body;

  if (!match_id) {
    return res.status(400).json({ error: 'Paramètre manquant' });
  }

  try {
    const [rows] = await db.execute('SELECT status FROM matches WHERE id = ?', [match_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Match introuvable' });
    }

    if (rows[0].status !== 'pending') {
      return res.status(400).json({ error: "Le match n'est pas en attente" });
    }

    await db.execute('DELETE FROM match_players WHERE match_id = ?', [match_id]);
    await db.execute('DELETE FROM matches WHERE id = ?', [match_id]);

    res.json({ message: 'Match supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;