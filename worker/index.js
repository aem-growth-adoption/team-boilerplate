import { Hono } from 'hono';
import { authMiddleware } from './auth.js';
import { dbGet, dbSet, dbDelete, dbListKeys } from './db.js';

const app = new Hono();

// Internal tools — prevent search engine indexing on all worker-handled routes
app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
});

// Protect all API routes with basic auth middleware
app.use('/api/*', authMiddleware);

// GET /api/me — return current user
app.get('/api/me', (c) => {
  return c.json(c.get('user'));
});

// Example CRUD routes using KV helpers

// GET /api/items — list all items
app.get('/api/items', async (c) => {
  const keys = await dbListKeys(c.env.DB, 'item:');
  const items = [];
  for (const key of keys) {
    const value = await dbGet(c.env.DB, key);
    if (value) items.push({ id: key.replace('item:', ''), ...value });
  }
  return c.json(items);
});

// GET /api/items/:id — get single item
app.get('/api/items/:id', async (c) => {
  const item = await dbGet(c.env.DB, `item:${c.req.param('id')}`);
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
  await dbSet(c.env.DB, `item:${id}`, item);
  return c.json({ id, ...item }, 201);
});

// PUT /api/items/:id — update item
app.put('/api/items/:id', async (c) => {
  const existing = await dbGet(c.env.DB, `item:${c.req.param('id')}`);
  if (!existing) return c.json({ error: 'Not found' }, 404);
  const body = await c.req.json();
  const updated = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };
  await dbSet(c.env.DB, `item:${c.req.param('id')}`, updated);
  return c.json({ id: c.req.param('id'), ...updated });
});

// DELETE /api/items/:id — delete item
app.delete('/api/items/:id', async (c) => {
  const existing = await dbGet(c.env.DB, `item:${c.req.param('id')}`);
  if (!existing) return c.json({ error: 'Not found' }, 404);
  await dbDelete(c.env.DB, `item:${c.req.param('id')}`);
  return c.json({ success: true });
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
