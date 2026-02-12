# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Architecture

- **Worker**: Hono app on Cloudflare Workers (`worker/index.js`)
- **Auth**: Cloudflare Zero Trust (`worker/auth.js`) — verifies Access JWT on all routes. Access apps are managed via the [`access-apps`](https://github.com/aem-growth-adoption/access-apps) GitOps repo; `/setup` registers new projects automatically.
- **Storage**: Cloudflare KV (`worker/kv.js`)
- **Frontend**: React + React Spectrum + Vite (`index.html`, `app.jsx`)
- **Deployment**: Cloudflare Workers via `npm run deploy`

## Team Knowledge

Read `knowledge-base/` for team conventions, patterns, and guides. This is the team's shared brain — portable across any AI tool.

## Key Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run deploy    # Build and deploy to Cloudflare Workers
```

## Conventions

- **Always use `wrangler.jsonc`**, never `.toml`. Check the latest Cloudflare docs when generating CF config.
- **Auth is handled by middleware** — all routes are protected via Cloudflare Zero Trust JWT verification. Access the user via `c.get('user')`. Requires `CF_ACCESS_AUD` secret (the Access application audience tag).
- **Use the KV helpers** in `worker/kv.js` for simple data storage.

## Adding API Routes

Add routes in `worker/index.js`. All routes are protected by auth middleware:

```js
app.get('/api/my-feature', async (c) => {
  const user = c.get('user');
  const data = await kvGet(c.env.KV, `feature:${user.email}`);
  return c.json(data);
});
```

## Adding D1

If you need relational/SQL storage beyond what KV provides, you can add Cloudflare D1. See `knowledge-base/d1-patterns.md` for setup instructions, migration patterns, and query examples.
