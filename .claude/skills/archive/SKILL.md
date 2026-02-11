---
name: archive
description: Archive a project — deletes Cloudflare infra (Worker + D1) and moves the GitHub repo into the aem-growth-adoption/archive monorepo via git subtree.
disable-model-invocation: true
---

This skill archives a project created from the growth boilerplate template. It deletes the Cloudflare infrastructure and moves the GitHub repository into the `aem-growth-adoption/archive` monorepo, preserving full commit history.

**IMPORTANT: NEVER delete, remove, or modify local files or directories. This skill only operates on remote resources.**

## Step 1: Identify the project

Read `wrangler.jsonc` to get the worker name and D1 database name. Read `package.json` to confirm the project name. Read the git remote to identify the GitHub repository (org and repo name).

If any of these contain unresolved `{{PROJECT_NAME}}` placeholders, stop and tell the user this project was never set up — there's nothing to archive.

## Step 2: Confirm with the user

**Use the `AskUserQuestion` tool** to ask for confirmation. Show the user exactly what will happen:

- **Delete Cloudflare Worker**: `<worker-name>`
- **Delete Cloudflare D1 database**: `<database-name>`
- **Move GitHub repo** `<org>/<repo>` into `aem-growth-adoption/archive` as subdirectory `<repo>/` (preserving history), then delete the original repo

Ask: "This will permanently delete the infra and move the repo to the archive. Are you sure?" with options "Yes, archive it" and "Cancel".

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

## Step 5: Move the repo into the archive monorepo

Clone the archive monorepo into a temporary directory:
```
git clone https://github.com/aem-growth-adoption/archive.git /tmp/archive-$$
```

Use `git subtree add` to pull the project repo into a subdirectory, preserving its full commit history:
```
cd /tmp/archive-$$
git subtree add --prefix=<repo>/ https://github.com/<org>/<repo>.git main
git push origin main
```

If the subtree add fails (e.g. the subdirectory already exists), warn and stop — the project may already be archived.

Clean up the temporary clone:
```
rm -rf /tmp/archive-$$
```

## Step 6: Delete the original GitHub repository

Only do this after the subtree add and push in Step 5 succeeded. Run:
```
gh repo delete <org>/<repo> --yes
```

If `gh` is not available or the command fails, print the manual steps:
1. Go to the repository settings page
2. Scroll to the "Danger Zone"
3. Click "Delete this repository"

## Step 7: Done

Summarize what was done:
- Cloudflare Worker and D1 database deleted (or note failures)
- Repository moved to `aem-growth-adoption/archive` under `<repo>/` with full history preserved
- Original repository deleted

Do not touch or delete local files.
