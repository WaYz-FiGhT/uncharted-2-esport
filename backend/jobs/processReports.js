const db = require('../db');
const logger = require('../logger');
const { eloChange } = require('../utils/elo');

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
        AND mr.created_at <= UTC_TIMESTAMP() - INTERVAL 3 HOUR
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

        const [playerRows] = await db.execute(
          `SELECT player_id, team_id FROM match_players WHERE match_id = ?`,
          [match_id]
        );

        for (const { player_id, team_id: pTeamId } of playerRows) {
          if (finalResult === 'win_team_1') {
            if (pTeamId === team_1_id) {
              await db.execute(`UPDATE players SET wins = wins + 1 WHERE id = ?`, [player_id]);
            } else if (pTeamId === team_2_id) {
              await db.execute(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player_id]);
            }
          } else if (finalResult === 'win_team_2') {
            if (pTeamId === team_2_id) {
              await db.execute(`UPDATE players SET wins = wins + 1 WHERE id = ?`, [player_id]);
            } else if (pTeamId === team_1_id) {
              await db.execute(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player_id]);
            }
          }
        }
      }
    }
  } catch (error) {
    const details = error.code || error.sqlMessage || error.message;
    logger.error(`Error finalizing reports: ${details}`, error);
  }
}

module.exports = function startReportProcessing(intervalMs = 5 * 1000) {
  finalizeOldReports();
  setInterval(finalizeOldReports, intervalMs);
};
