// KV helpers

export async function dbGet(db, key) {
  const row = await db.prepare('SELECT value, expires_at FROM kv WHERE key = ?').bind(key).first();
  if (!row) return null;
  if (row.expires_at && row.expires_at <= Math.floor(Date.now() / 1000)) {
    await db.prepare('DELETE FROM kv WHERE key = ?').bind(key).run();
    return null;
  }
  return JSON.parse(row.value);
}

export async function dbSet(db, key, value, expirationTtl = null) {
  const expiresAt = expirationTtl ? Math.floor(Date.now() / 1000) + expirationTtl : null;
  await db.prepare(
    'INSERT OR REPLACE INTO kv (key, value, expires_at) VALUES (?, ?, ?)'
  ).bind(key, JSON.stringify(value), expiresAt).run();
}

export async function dbDelete(db, key) {
  await db.prepare('DELETE FROM kv WHERE key = ?').bind(key).run();
}

export async function dbListKeys(db, prefix) {
  const { results } = await db.prepare(
    'SELECT key FROM kv WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > ?)'
  ).bind(`${prefix}%`, Math.floor(Date.now() / 1000)).all();
  return results.map(r => r.key);
}
