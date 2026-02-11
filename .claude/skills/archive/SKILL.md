---
name: archive
description: Archive a project — deletes Cloudflare infra (Worker + D1) and archives the GitHub repo using GitHub's built-in archive feature.
disable-model-invocation: true
---

This skill archives a project created from the growth boilerplate template. It deletes the Cloudflare infrastructure and archives the GitHub repository (making it read-only and hidden from the org's default repo listing).

**IMPORTANT: NEVER delete, remove, or modify local files or directories. This skill only operates on remote resources.**

## Step 1: Identify the project

Read `wrangler.jsonc` to get the worker name and D1 database name. Read `package.json` to confirm the project name. Read the git remote to identify the GitHub repository (org and repo name).

If any of these contain unresolved `{{PROJECT_NAME}}` placeholders, stop and tell the user this project was never set up — there's nothing to archive.

## Step 2: Confirm with the user

**Use the `AskUserQuestion` tool** to ask for confirmation. Show the user exactly what will happen:

- **Delete Cloudflare Worker**: `<worker-name>`
- **Delete Cloudflare D1 database**: `<database-name>`
- **Archive GitHub repo** `<org>/<repo>` (makes it read-only, hidden from default org view)

Ask: "This will permanently delete the infra and archive the repo. Are you sure?" with options "Yes, archive it" and "Cancel".

If the user cancels, stop immediately.

## Step 3: Delete the Cloudflare Worker

Run:
```
npx wrangler delete --name <worker-name>
```

If it fails (e.g. worker doesn't exist), warn but continue.

## Step 4: Delete the D1 database

Run:
```
npx wrangler d1 delete <database-name> -y
```

If it fails (e.g. database doesn't exist or ID is still the placeholder), warn but continue.

## Step 5: Archive the GitHub repository

Run:
```
gh repo archive <org>/<repo> --yes
```

If `gh` is not available or the command fails, print the manual steps:
1. Go to the repository settings page
2. Scroll to the "Danger Zone"
3. Click "Archive this repository"

## Step 6: Done

Summarize what was done:
- Cloudflare Worker and D1 database deleted (or note failures)
- GitHub repository archived (read-only, hidden from default org listing)

Do not touch or delete local files.
