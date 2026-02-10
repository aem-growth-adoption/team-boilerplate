# Growth Boilerplate

Cloudflare Workers boilerplate for rapid prototyping with Google OAuth (@adobe.com), Hono, D1, and a portable knowledge base.

## Quick Start

### Install the `/setup` skill globally

```bash
git clone https://github.com/alexcarol/team-boilerplate.git ~/.claude/skill-repos/team-boilerplate \
  && ln -s ~/.claude/skill-repos/team-boilerplate/.claude/skills/setup ~/.claude/skills/setup
```

This symlinks the skill into Claude Code's global skills directory. To update later:

```bash
git -C ~/.claude/skill-repos/team-boilerplate pull
```

### Create a new project

From any directory in Claude Code, run:

```
/setup
```

The skill creates a new repo from the template, customizes it, installs dependencies, and walks you through Google OAuth and D1 configuration. It works from an empty directory or creates a new one.

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
