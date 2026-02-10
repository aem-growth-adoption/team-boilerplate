# Growth Boilerplate

Cloudflare Workers boilerplate for rapid prototyping with Google OAuth (@adobe.com), Hono, D1, and a portable knowledge base.

## Quick Start

### Install the skill

```bash
npx skills add alexcarol/team-boilerplate
```

This installs the `/setup` skill globally. Then from any directory:

```bash
/setup
```

The skill will create a new repo from the template, customize it, install dependencies, and walk you through Google OAuth and D1 configuration.

### Or create manually

```bash
gh repo create <org>/my-tool --template alexcarol/team-boilerplate --private --clone
cd my-tool
/setup
```

## What's Included

- **Hono** worker with Google OAuth (`@adobe.com` domain restriction)
- **D1** database with session management and a generic KV store
- **Vanilla JS** frontend with dark/light theme
- **Vite** dev server on port 3000
- **Knowledge base** — portable markdown docs any AI tool can consume

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Cloudflare Workers |
| Routing | Hono |
| Auth | Google OAuth + HMAC-signed session cookies |
| Database | Cloudflare D1 (SQLite) |
| Frontend | Vanilla JS + CSS custom properties |
| Build | Vite + @cloudflare/vite-plugin |

## Project Structure

```
├── .claude/skills/setup/SKILL.md    # /setup skill
├── knowledge-base/                  # Team conventions (portable markdown)
├── worker/
│   ├── index.js                     # Hono app entrypoint
│   ├── auth.js                      # Google OAuth + session middleware
│   └── db.js                        # D1 helpers (sessions + KV)
├── migrations/0001_init.sql         # Sessions + KV tables
├── index.html                       # Frontend shell
├── app.js                           # Auth check, fetch wrapper
├── styles.css                       # Dark/light theme
├── CLAUDE.md                        # AI tool context (points to knowledge-base/)
└── AGENTS.md                        # Same, for Codex/Cursor/etc.
```

## Development

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run deploy    # Build and deploy to Cloudflare Workers
```

## Knowledge Base

The `knowledge-base/` directory is plain markdown — readable by any AI tool, IDE, or human. It covers:

- [Cloudflare Workers patterns](knowledge-base/cloudflare-workers.md)
- [Hono patterns](knowledge-base/hono-patterns.md)
- [Google OAuth setup](knowledge-base/google-oauth-setup.md)
- [D1 patterns](knowledge-base/d1-patterns.md)
- [AI development conventions](knowledge-base/ai-development.md)
- [Experiment lifecycle](knowledge-base/experiment-lifecycle.md)
