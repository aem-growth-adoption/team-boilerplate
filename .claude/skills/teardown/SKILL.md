---
name: teardown
description: Fully delete a project created from this boilerplate — removes the Cloudflare Worker, D1 database, and GitHub repository.
disable-model-invocation: true
---

This skill tears down a project created from the growth boilerplate template. It deletes the Cloudflare Worker, D1 database, and GitHub repository.

**IMPORTANT: NEVER delete, remove, or modify local files or directories. This skill only removes remote resources.**

## Step 1: Identify the project

Read `wrangler.jsonc` to get the worker name and D1 database name. Read `package.json` to confirm the project name. Read the git remote to identify the GitHub repository.

If any of these contain unresolved `{{PROJECT_NAME}}` placeholders, stop and tell the user this project was never set up — there's nothing to tear down.

## Step 2: Confirm with the user

**Use the `AskUserQuestion` tool** to ask for confirmation. Show the user exactly what will be deleted:

- **Cloudflare Worker**: `<worker-name>` (from `wrangler.jsonc` `name` field)
- **Cloudflare D1 database**: `<database-name>` (from `wrangler.jsonc` `d1_databases[0].database_name`)
- **GitHub repository**: `<org>/<repo>` (from git remote)

Ask: "This will permanently delete all of the above. Are you sure?" with options "Yes, delete everything" and "Cancel".

If the user cancels, stop immediately.

## Step 3: Delete the Cloudflare Worker

Run:
```
npx wrangler delete --name <worker-name>
```

If it asks for confirmation, pass `--force` or pipe `yes` as needed. If it fails (e.g. worker doesn't exist), warn but continue.

## Step 4: Delete the D1 database

Get the `database_id` from `wrangler.jsonc`. Run:
```
npx wrangler d1 delete <database-name>
```

Pass `-y` to skip confirmation. If it fails (e.g. database doesn't exist or ID is still the placeholder), warn but continue.

## Step 5: Delete the GitHub repository

Run:
```
gh repo delete <org>/<repo> --yes
```

If `gh` is not available or the command fails, print the manual steps:
1. Go to the repository settings page
2. Scroll to the "Danger Zone"
3. Click "Delete this repository"

## Step 6: Done

Summarize what was deleted and what failed (if anything). Do not touch or delete local files.
