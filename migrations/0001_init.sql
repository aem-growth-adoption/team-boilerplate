-- Sessions table for Google OAuth
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Generic key-value store with optional TTL
CREATE TABLE kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER
);

CREATE INDEX idx_kv_prefix ON kv(key);
CREATE INDEX idx_kv_expires ON kv(expires_at) WHERE expires_at IS NOT NULL;
