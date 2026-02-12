// KV helpers

export async function kvGet(kv, key) {
  return kv.get(key, { type: "json" });
}

export async function kvSet(kv, key, value, expirationTtl = null) {
  const opts = expirationTtl ? { expirationTtl } : undefined;
  await kv.put(key, JSON.stringify(value), opts);
}

export async function kvDelete(kv, key) {
  await kv.delete(key);
}

export async function kvListKeys(kv, prefix) {
  const { keys } = await kv.list({ prefix });
  return keys.map(k => k.name);
}
