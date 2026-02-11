-- Generic key-value store with optional TTL
CREATE TABLE kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER
);

CREATE INDEX idx_kv_prefix ON kv(key);
CREATE INDEX idx_kv_expires ON kv(expires_at) WHERE expires_at IS NOT NULL;
