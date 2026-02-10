# AI Development Conventions

Learnings and conventions for developing with AI tools on this boilerplate.

## Tool-Agnostic Knowledge

The `knowledge-base/` directory is the team's shared brain. It's plain markdown — readable by Claude, Cursor, Codex, Copilot, or any other AI tool.

- **CLAUDE.md** and **AGENTS.md** are thin wrappers that point here
- Add `.cursorrules` if using Cursor (point it to knowledge-base/ too)
- Any new AI tool can consume these docs without changes

## Conventions

### Always use `wrangler.jsonc`
Never `wrangler.toml`. The JSON format is what we standardize on.

### Check latest Cloudflare docs
Cloudflare APIs and config change frequently. When generating or modifying Cloudflare configuration, always verify against the current docs at https://developers.cloudflare.com/workers/.

### Keep auth isolated
All auth logic lives in `worker/auth.js`. When adding features, don't scatter auth checks — use the middleware pattern. Any route under `/api/*` is automatically protected.

### Use the KV pattern for simple data
Before reaching for a new table, consider if the KV helpers in `worker/db.js` are sufficient. They handle JSON serialization and TTL automatically.

### Migrations are append-only
Never edit an existing migration file. Always create a new one. Use `wrangler d1 migrations create` to generate the next numbered file.

## Adding a Learning

When you discover something useful — a gotcha, a pattern, a better approach:

1. Add it to the relevant doc in `knowledge-base/`
2. If it's a new topic, create a new doc and update `knowledge-base/README.md`
3. PR it to the boilerplate repo so the whole team benefits

### Contributing Back to the Boilerplate

Your project and the boilerplate will diverge quickly, so you can't simply push changes back. To contribute a learning or fix:

1. Clone the boilerplate repo separately: `git clone git@github.com:adobe/growth-boilerplate.git boilerplate-upstream`
2. Copy the relevant files (typically `knowledge-base/` docs) from your project into the clone
3. Open a PR from there

<!-- TODO: Streamline this workflow. Ideas: a script that diffs knowledge-base/ against upstream, or a GitHub Action that accepts learning submissions as issues. -->

## Prompt Tips

When working with AI tools on this codebase:

- Point the tool to `knowledge-base/` for context on team conventions
- For Cloudflare-specific questions, include "check the latest Cloudflare Workers docs"
- For auth changes, remind the tool that only `worker/auth.js` should be modified
- The example CRUD routes in `worker/index.js` show the pattern for new endpoints
