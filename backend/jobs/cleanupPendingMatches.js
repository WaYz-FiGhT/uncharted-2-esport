const db = require('../db');
const logger = require('../logger');

async function deleteExpiredPendingMatches() {
  try {
    const [rows] = await db.execute(
      `SELECT id FROM matches WHERE status = 'pending' AND created_at <= UTC_TIMESTAMP() - INTERVAL 1 HOUR`
    );
    for (const { id } of rows) {
      await db.execute('DELETE FROM match_players WHERE match_id = ?', [id]);
      await db.execute('DELETE FROM matches WHERE id = ?', [id]);
      logger.info(`Deleted pending match ${id}`);
    }
  } catch (error) {
    const details = error.code || error.sqlMessage || error.message;
    logger.error(`Error deleting pending matches: ${details}`, error);
  }
}

module.exports = function startPendingMatchCleanup(intervalMs = 60 * 1000) {
  deleteExpiredPendingMatches();
  setInterval(deleteExpiredPendingMatches, intervalMs);
};
