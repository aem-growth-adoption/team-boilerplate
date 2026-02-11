# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Architecture

- **Worker**: Hono app on Cloudflare Workers (`worker/index.js`)
- **Auth**: Basic HTTP auth with hardcoded credentials (`worker/auth.js`) — placeholder until IMS auth is implemented
- **Database**: Cloudflare D1 (SQLite) for KV storage (`worker/db.js`)
- **Frontend**: Vanilla JS + Vite (`index.html`, `app.js`, `styles.css`)
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
- **Auth is handled by middleware** — all `/api/*` routes are automatically protected. Access the user via `c.get('user')`.
- **Use the KV helpers** in `worker/db.js` for simple data storage before creating new tables.
- **Migrations are append-only** — never edit existing migration files, always create new ones.

## Adding API Routes

Add routes in `worker/index.js`. Any route under `/api/*` is protected by auth middleware:

```js
app.get('/api/my-feature', async (c) => {
  const user = c.get('user');
  const data = await dbGet(c.env.DB, `feature:${user.email}`);
  return c.json(data);
});
```

## Adding D1 Tables

1. Create a migration: `wrangler d1 migrations create {{PROJECT_NAME}}-db description`
2. Write SQL in the generated file
3. Apply locally: `wrangler d1 migrations apply {{PROJECT_NAME}}-db --local`
4. Apply to production: `wrangler d1 migrations apply {{PROJECT_NAME}}-db --remote`
