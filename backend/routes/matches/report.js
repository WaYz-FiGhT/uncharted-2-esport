const express = require('express');
const router = express.Router();
const db = require('../../db');
const logger = require('../../logger');

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

      // ⛔ Vérifie que le match existe et est bien accepté
    const [matchRows] = await db.execute(
      `SELECT status, team_1_id, team_2_id FROM matches WHERE id = ?`,
      [match_id]
    );

    if (matchRows.length === 0) {
      return res.status(404).json({ error: 'Match introuvable' });
    }

    const { status, team_1_id: team1Id, team_2_id: team2Id } = matchRows[0];

    if (status !== 'accepted') {
      return res
        .status(400)
        .json({ error: "Ce match n'est pas encore accepté." });
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
      const team1Report = reports.find(r => r.team_id === team1Id);
      const team2Report = reports.find(r => r.team_id === team2Id);

      // In case of unexpected ordering, fall back to the array order
      const team1 = team1Report || reports[0];
      const team2 = team2Report || reports[1];

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

      // ⭐ Mise à jour de l'XP des équipes lorsque le match est complété
      if (newStatus === 'completed') {
        const [teamRows] = await db.execute(
          `SELECT id, xp FROM teams WHERE id IN (?, ?)`,
          [team1.team_id, team2.team_id]
        );

        const team1XP = teamRows.find(t => t.id === team1Id)?.xp || 0;
        const team2XP = teamRows.find(t => t.id === team2Id)?.xp || 0;

        const eloChange = (ratingA, ratingB, winA) => {
          const K = 32;
          const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
          const scoreA = winA ? 1 : 0;
          const changeA = Math.round(K * (scoreA - expectedA));
          return changeA;
        };

        if (finalResult === 'win_team_1') {
          const change1 = eloChange(team1XP, team2XP, true);
          const change2 = -eloChange(team2XP, team1XP, true);
          await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change1, team1Id]);
          await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change2, team2Id]);
        } else if (finalResult === 'win_team_2') {
          const change2 = eloChange(team2XP, team1XP, true);
          const change1 = -eloChange(team1XP, team2XP, true);
          await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change1, team1Id]);
          await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change2, team2Id]);
        }
      }
    }

    res.json({ success: true, message: 'Résultat reporté avec succès.' });
  } catch (err) {
    logger.error(err);
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
    logger.error('Erreur /report/check:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
