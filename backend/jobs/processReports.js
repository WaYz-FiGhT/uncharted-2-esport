const db = require('../db');

async function finalizeOldReports() {
  try {
    const [rows] = await db.execute(`
      SELECT m.id AS match_id, m.team_1_id, m.team_2_id, mr.team_id, mr.result
      FROM matches m
      JOIN match_reports mr ON m.id = mr.match_id
      WHERE m.status = 'accepted'
        AND NOT EXISTS (
          SELECT 1 FROM match_reports mr2
          WHERE mr2.match_id = m.id AND mr2.team_id <> mr.team_id
        )
        AND mr.created_at <= NOW() - INTERVAL 3 HOUR
    `);

    for (const row of rows) {
      const { match_id, team_1_id, team_2_id, team_id, result } = row;
      let finalResult = 'disputed';
      let newStatus = 'disputed';

      if (result === 'win') {
        finalResult = team_id === team_1_id ? 'win_team_1' : 'win_team_2';
        newStatus = 'completed';
      } else if (result === 'lose') {
        finalResult = team_id === team_1_id ? 'win_team_2' : 'win_team_1';
        newStatus = 'completed';
      } else if (result === 'disputed') {
        finalResult = 'disputed';
        newStatus = 'disputed';
      }

      await db.execute(
        `UPDATE matches SET official_result = ?, status = ? WHERE id = ?`,
        [finalResult, newStatus, match_id]
      );

      if (newStatus === 'completed') {
        const [teamRows] = await db.execute(
          `SELECT id, xp FROM teams WHERE id IN (?, ?)`,
          [team_1_id, team_2_id]
        );

        const team1XP = teamRows.find(t => t.id === team_1_id)?.xp || 0;
        const team2XP = teamRows.find(t => t.id === team_2_id)?.xp || 0;

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
          await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change1, team_1_id]);
          await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change2, team_2_id]);
        } else if (finalResult === 'win_team_2') {
          const change2 = eloChange(team2XP, team1XP, true);
          const change1 = -eloChange(team1XP, team2XP, true);
          await db.execute(`UPDATE teams SET xp = GREATEST(0, xp + ?) WHERE id = ?`, [change1, team_1_id]);
          await db.execute(`UPDATE teams SET xp = xp + ? WHERE id = ?`, [change2, team_2_id]);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la finalisation des reports :', error);
  }
}

module.exports = function startReportProcessing(intervalMs = 5 * 1000) {
  finalizeOldReports();
  setInterval(finalizeOldReports, intervalMs);
};