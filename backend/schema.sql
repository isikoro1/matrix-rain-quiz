CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  started_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_player_mode
ON sessions(player_id, mode, started_at);

CREATE TABLE IF NOT EXISTS score_entries (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  cleared INTEGER NOT NULL,
  questions INTEGER NOT NULL,
  play_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0,
  hidden_reason TEXT,
  UNIQUE(player_id, mode, play_date)
);

CREATE INDEX IF NOT EXISTS idx_score_entries_daily
ON score_entries(mode, play_date, hidden, score DESC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_score_entries_all_time
ON score_entries(mode, hidden, score DESC, updated_at ASC);
