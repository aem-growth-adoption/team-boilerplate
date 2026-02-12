# Hono Patterns

[Hono](https://hono.dev/) is the routing/middleware framework for the worker. ~14KB, built for edge runtimes.

## App Structure

```js
import { Hono } from 'hono';
const app = new Hono();

// Mount sub-routers
app.route('/auth', authRoutes);

// Apply middleware to route groups
app.use('/api/*', authMiddleware);

// Define routes
app.get('/api/me', (c) => c.json({ hello: 'world' }));

export default app;
```

## Context (`c`)

Every handler receives a Hono `Context` object:

```js
// Request data
c.req.url            // full URL
c.req.method         // HTTP method
c.req.param('id')    // route params
c.req.query('q')     // query string params
c.req.header('X-Foo') // request headers
await c.req.json()   // parse JSON body

// Response helpers
c.json({ data })          // JSON response
c.json({ error }, 404)    // JSON with status
c.text('hello')           // plain text
c.redirect('/')           // redirect
c.header('X-Foo', 'bar')  // set response header

// Cloudflare bindings
c.env.KV              // KV namespace
c.env.MY_SECRET    // secret/variable

// Per-request storage (middleware → handler)
c.set('user', userData)
c.get('user')
```

## Middleware

Middleware runs before/after handlers. Call `await next()` to proceed:

```js
async function myMiddleware(c, next) {
  // Before handler
  const start = Date.now();

  await next();

  // After handler
  c.header('X-Response-Time', `${Date.now() - start}ms`);
}

app.use('/api/*', myMiddleware);
```

## Sub-routers

Group related routes into separate Hono apps and mount them:

```js
// feature.js
export const featureRoutes = new Hono();
featureRoutes.get('/list', (c) => { /* ... */ });

// index.js
app.route('/api/feature', featureRoutes);
// Routes become /api/feature/list, etc.
```

## Adding New API Routes

1. Add the route in `worker/index.js` under the `/api/*` group (automatically protected by auth middleware)
2. Access the authenticated user via `c.get('user')`
3. Access KV via `c.env.KV`

```js
app.get('/api/my-feature', async (c) => {
  const user = c.get('user');
  const data = await kvGet(c.env.KV, `feature:${user.email}`);
  return c.json(data);
});
```

## Error Handling

Hono has built-in error handling. For custom errors:

```js
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});
```
