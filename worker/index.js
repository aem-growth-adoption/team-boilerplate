import { Hono } from 'hono';
import { authMiddleware } from './auth.js';
import { kvGet, kvSet, kvDelete, kvListKeys } from './kv.js';

const app = new Hono();

// Internal tools — prevent search engine indexing on all worker-handled routes
app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
});

// Verify Access JWT on all routes
app.use('*', authMiddleware);

// GET /api/me — return current user
app.get('/api/me', (c) => {
  return c.json(c.get('user'));
});

// Example CRUD routes using KV helpers

// GET /api/items — list all items
app.get('/api/items', async (c) => {
  const keys = await kvListKeys(c.env.KV, 'item:');
  const items = [];
  for (const key of keys) {
    const value = await kvGet(c.env.KV, key);
    if (value) items.push({ id: key.replace('item:', ''), ...value });
  }
  return c.json(items);
});

// GET /api/items/:id — get single item
app.get('/api/items/:id', async (c) => {
  const item = await kvGet(c.env.KV, `item:${c.req.param('id')}`);
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ id: c.req.param('id'), ...item });
});

// POST /api/items — create item
app.post('/api/items', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const item = {
    ...body,
    createdBy: c.get('user').email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await kvSet(c.env.KV, `item:${id}`, item);
  return c.json({ id, ...item }, 201);
});

// PUT /api/items/:id — update item
app.put('/api/items/:id', async (c) => {
  const existing = await kvGet(c.env.KV, `item:${c.req.param('id')}`);
  if (!existing) return c.json({ error: 'Not found' }, 404);
  const body = await c.req.json();
  const updated = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };
  await kvSet(c.env.KV, `item:${c.req.param('id')}`, updated);
  return c.json({ id: c.req.param('id'), ...updated });
});

// DELETE /api/items/:id — delete item
app.delete('/api/items/:id', async (c) => {
  const existing = await kvGet(c.env.KV, `item:${c.req.param('id')}`);
  if (!existing) return c.json({ error: 'Not found' }, 404);
  await kvDelete(c.env.KV, `item:${c.req.param('id')}`);
  return c.json({ success: true });
});

// Fallback to serve static assets for all other requests
app.get('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
