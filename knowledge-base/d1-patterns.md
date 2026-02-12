# Adding D1 to Your Project

This guide is for projects that need relational/SQL storage beyond what Cloudflare KV provides. D1 is Cloudflare's SQLite database — it runs at the edge alongside your worker.

> **Note:** The boilerplate uses Cloudflare KV by default (`worker/kv.js`). Only add D1 if you need relational queries, joins, indexes, or structured schemas.

## Setup

### Create the database
```bash
wrangler d1 create your-project-db
```

Use `--update-config` to automatically add the D1 binding to `wrangler.jsonc`:
```bash
wrangler d1 create your-project-db --update-config --binding DB
```

> If your user has access to multiple Cloudflare accounts, set `CLOUDFLARE_ACCOUNT_ID` before running wrangler commands.

### Run migrations
```bash
# Local (development)
wrangler d1 migrations apply your-project-db --local

# Remote (production)
wrangler d1 migrations apply your-project-db --remote
```

## Migrations

Migrations live in `migrations/` and are numbered sequentially:

```
migrations/
├── 0001_init.sql
├── 0002_add_feature.sql
└── ...
```

Create a new migration:
```bash
wrangler d1 migrations create your-project-db add_feature
```

Write standard SQL in the generated file. D1 uses SQLite syntax.

Migrations are append-only — never edit an existing migration file, always create a new one.

## Query Patterns

Access D1 through the `DB` binding on `c.env`:

```js
// Single row
const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId)
  .first();

// Multiple rows
const { results } = await c.env.DB.prepare('SELECT * FROM items WHERE status = ?')
  .bind('active')
  .all();

// Insert/Update/Delete
await c.env.DB.prepare('INSERT INTO items (id, name) VALUES (?, ?)')
  .bind(id, name)
  .run();
```

Always use `.bind()` for parameterized queries — never concatenate values into SQL strings.

## SQLite Notes

- **No `NOW()`**: Use `unixepoch()` for current timestamp
- **No `BOOLEAN` type**: Use `INTEGER` (0/1)
- **TEXT for JSON**: Store JSON as TEXT, parse in JS
- **No `ALTER COLUMN`**: To change a column, create a new table and migrate data
- **Indexes matter**: D1 is fast but still benefits from proper indexing
