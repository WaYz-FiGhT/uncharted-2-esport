const express = require('express');
const router = express.Router();
const db = require('../../db');

// POST /matches/report
router.post('/', async (req, res) => {
  const userId = req.session?.user?.id;
  const { match_id, team_id, result } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Non connecté' });
  }

  if (!match_id || !team_id || !['win', 'lose', 'disputed'].includes(result)) {
    return res.status(400).json({ error: 'Champs invalides' });
  }

  try {
    // 🔒 Vérifie si ce match a déjà été reporté par cette équipe
    const [existing] = await db.execute(
      `SELECT id FROM match_reports WHERE match_id = ? AND team_id = ?`,
      [match_id, team_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cette équipe a déjà reporté ce match.' });
    }

    // ✅ Insertion du report
    await db.execute(
      `INSERT INTO match_reports (match_id, team_id, result)
       VALUES (?, ?, ?)`,
      [match_id, team_id, result]
    );

    // 🔍 Vérifie si les deux équipes ont reporté
    const [reports] = await db.execute(
      `SELECT team_id, result FROM match_reports WHERE match_id = ?`,
      [match_id]
    );

    if (reports.length === 2) {
      const team1 = reports[0];
      const team2 = reports[1];

      let finalResult = 'pending';
      let newStatus = 'pending';

      if (team1.result === 'disputed' || team2.result === 'disputed') {
        finalResult = 'disputed';
        newStatus = 'disputed';
      } else if (team1.result === 'win' && team2.result === 'lose') {
        finalResult = 'win_team_1';
        newStatus = 'completed';
      } else if (team1.result === 'lose' && team2.result === 'win') {
        finalResult = 'win_team_2';
        newStatus = 'completed';
      } else {
        finalResult = 'disputed';
        newStatus = 'disputed';
      }

      // 🔄 Met à jour le résultat officiel et le statut
      await db.execute(
        `UPDATE matches
         SET official_result = ?, status = ?
         WHERE id = ?`,
        [finalResult, newStatus, match_id]
      );
    }

    res.json({ success: true, message: 'Résultat reporté avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /matches/report/check?match_id=...&team_id=...
router.get('/check', async (req, res) => {
  const { match_id, team_id } = req.query;

  if (!match_id || !team_id) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT result FROM match_reports WHERE match_id = ? AND team_id = ?`,
      [match_id, team_id]
    );

    if (rows.length > 0) {
      return res.json({ alreadyReported: true, result: rows[0].result });
    } else {
      return res.json({ alreadyReported: false });
    }
  } catch (err) {
    console.error('Erreur /report/check:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
