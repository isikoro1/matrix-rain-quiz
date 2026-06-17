export async function createSession(db, session) {
  await db.prepare(
    `INSERT INTO sessions (id, player_id, mode, started_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(session.id, session.playerId, session.mode, session.startedAt, session.expiresAt)
    .run();
}

export async function findSession(db, id) {
  return db.prepare(
    `SELECT id, player_id, mode, started_at, expires_at, used_at
     FROM sessions
     WHERE id = ?`
  )
    .bind(id)
    .first();
}

export async function markSessionUsed(db, id, usedAt) {
  const result = await db.prepare(
    `UPDATE sessions
     SET used_at = ?
     WHERE id = ? AND used_at IS NULL`
  )
    .bind(usedAt, id)
    .run();
  return Boolean(result.meta?.changes);
}

export async function upsertDailyScore(db, entry) {
  await db.prepare(
    `INSERT INTO score_entries (
       id, player_id, name, mode, score, cleared, questions, play_date, created_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(player_id, mode, play_date) DO UPDATE SET
       name = excluded.name,
       score = excluded.score,
       cleared = excluded.cleared,
       questions = excluded.questions,
       updated_at = excluded.updated_at,
       hidden = 0,
       hidden_reason = NULL
     WHERE excluded.score > score`
  )
    .bind(
      entry.id,
      entry.playerId,
      entry.name,
      entry.mode,
      entry.score,
      entry.cleared,
      entry.questions,
      entry.playDate,
      entry.createdAt,
      entry.updatedAt
    )
    .run();
}

export async function listScores(db, { mode, period, playDate, limit }) {
  if (period === "daily") {
    const result = await db.prepare(
      `SELECT name, score, cleared, questions, play_date, updated_at
       FROM score_entries
       WHERE mode = ? AND play_date = ? AND hidden = 0
       ORDER BY score DESC, updated_at ASC
       LIMIT ?`
    )
      .bind(mode, playDate, limit)
      .all();
    return result.results || [];
  }

  const result = await db.prepare(
    `SELECT name, score, cleared, questions, play_date, updated_at
     FROM (
       SELECT
         name,
         score,
         cleared,
         questions,
         play_date,
         updated_at,
         ROW_NUMBER() OVER (
           PARTITION BY player_id
           ORDER BY score DESC, updated_at ASC
         ) AS player_rank
       FROM score_entries
       WHERE mode = ? AND hidden = 0
     )
     WHERE player_rank = 1
     ORDER BY score DESC, updated_at ASC
     LIMIT ?`
  )
    .bind(mode, limit)
    .all();
  return result.results || [];
}
