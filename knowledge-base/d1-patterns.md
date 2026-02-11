# D1 Patterns

D1 is Cloudflare's SQLite database. It runs at the edge alongside your worker.

## Setup

### Create the database
```bash
wrangler d1 create your-project-db
```

This outputs a `database_id` — update it in `wrangler.jsonc`:
```jsonc
"d1_databases": [{
  "binding": "DB",
  "database_id": "paste-id-here",
  "database_name": "your-project-db",
  "migrations_dir": "migrations"
}]
```

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

## KV Pattern

This boilerplate includes a generic key-value store on top of D1 (see `worker/db.js`):

```js
import { dbGet, dbSet, dbDelete, dbListKeys } from './db.js';

// Store a value (with optional TTL in seconds)
await dbSet(db, 'user:preferences:alice', { theme: 'dark' }, 86400);

// Retrieve
const prefs = await dbGet(db, 'user:preferences:alice');

// List keys by prefix
const keys = await dbListKeys(db, 'user:preferences:');

// Delete
await dbDelete(db, 'user:preferences:alice');
```

Values are JSON-serialized automatically. Expired keys are cleaned up on read.

## SQLite Notes

- **No `NOW()`**: Use `unixepoch()` for current timestamp
- **No `BOOLEAN` type**: Use `INTEGER` (0/1)
- **TEXT for JSON**: Store JSON as TEXT, parse in JS
- **No `ALTER COLUMN`**: To change a column, create a new table and migrate data
- **Indexes matter**: D1 is fast but still benefits from proper indexing
