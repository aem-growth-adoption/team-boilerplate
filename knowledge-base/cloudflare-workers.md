# Cloudflare Workers Patterns

## Always use `wrangler.jsonc`

- Use `wrangler.jsonc` (JSON with comments), **never** `wrangler.toml`.
- Always check the [latest Cloudflare docs](https://developers.cloudflare.com/workers/) when generating or modifying CF config — APIs and config formats change frequently.
- Include the schema reference: `"$schema": "node_modules/wrangler/config-schema.json"`

## Project Structure

```
worker/
├── index.js     # Hono app entrypoint, exported as default
├── auth.js      # OAuth routes + middleware
└── db.js        # D1 helpers (sessions + KV)
```

The `main` field in `wrangler.jsonc` points to `worker/index.js`. This file exports the Hono app as `export default app`.

## Assets & Routing

Static assets are served by Cloudflare's asset handling. Worker code only runs for paths matching `run_worker_first`:

```jsonc
"assets": {
  "not_found_handling": "single-page-application",
  "run_worker_first": ["/api/*", "/auth/*"]
}
```

Everything not matching `/api/*` or `/auth/*` serves static files from the build output.

## Compatibility Flags

Always include `nodejs_compat` for access to Node.js APIs (crypto, etc.):

```jsonc
"compatibility_flags": ["nodejs_compat"]
```

## Secrets

Set secrets via `wrangler secret put <NAME>`. Never commit secrets to the repo.

For local development, use `.dev.vars`:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=any-random-string-here
```

## Deployment

```bash
npm run deploy    # builds with Vite, then runs wrangler deploy
```

First deploy creates the worker. Subsequent deploys update it.

## Gotchas

- **No filesystem access**: Workers run in V8 isolates, not Node.js. No `fs`, no `path`.
- **Execution limits**: 50ms CPU time on free plan, 30s on paid. Most requests finish in <5ms.
- **Subrequest limits**: 50 subrequests per invocation (each `fetch()` call counts).
- **Global state is ephemeral**: Workers can be evicted at any time. Never rely on in-memory state across requests.
- **D1 is SQLite**: Standard SQL, but some features differ from PostgreSQL/MySQL. See [d1-patterns.md](d1-patterns.md).
