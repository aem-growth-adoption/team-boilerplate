---
name: setup
description: Create and set up a new project from the growth boilerplate template. Handles repo creation, placeholder replacement, dependency installation, and D1 setup.
disable-model-invocation: true
---

This skill sets up a new project from the growth boilerplate template. It works in two modes depending on context.

## Step 0: Detect mode

Check if the current directory contains the boilerplate template by looking for `{{PROJECT_NAME}}` in `package.json`.

- **If placeholders are found**: you're inside a template project. Skip to Step 2.
- **If not found** (or `package.json` doesn't exist): you need to create the repo first. Start at Step 1.

## Step 1: Create the repository (global mode only)

**Use the `AskUserQuestion` tool to ask all of these in a single prompt:**
- Project name (kebab-case, e.g. `my-cool-tool`)
- One-line description
- Whether to use the **current directory** or create a **new subdirectory**

The repo is always created under the `aem-growth-adoption` org as **private**. Do not ask for the org.

Then check if `gh` CLI is available by running `gh --version`.

**If `gh` is not available**, explain the manual steps and stop (the user will re-run `/setup` after cloning manually):
1. Go to https://github.com/alexcarol/team-boilerplate
2. Click "Use this template" → "Create a new repository"
3. Fill in the owner, repo name, and visibility
4. Clone the new repo and cd into it
5. Re-run `/setup`

**If `gh` is available**, run the appropriate commands based on the answers already collected above. Do not ask again.

If the user chose **current directory**:
```
gh repo create aem-growth-adoption/<project-name> --template alexcarol/team-boilerplate --private
git clone https://github.com/aem-growth-adoption/<project-name>.git .
```
If the current directory isn't empty, warn and suggest using a new subdirectory instead.

If the user chose **new subdirectory**:
```
gh repo create aem-growth-adoption/<project-name> --template alexcarol/team-boilerplate --private --clone
cd <project-name>
```

After the repo is created and files are present, continue to Step 2.

## Step 2: Ask for project info (if not already collected)

If you didn't already ask in Step 1, **use the `AskUserQuestion` tool** to ask for:
- Project name (kebab-case, e.g. `my-cool-tool`)
- One-line description of the project

## Step 3: Replace placeholders

Replace in these files:
- `package.json`: replace `{{PROJECT_NAME}}` with the project name and `{{PROJECT_DESCRIPTION}}` with the description
- `wrangler.jsonc`: replace `{{PROJECT_NAME}}` with the project name
- `AGENTS.md`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`
- `index.html`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`

Note: `CLAUDE.md` imports `AGENTS.md` via `@AGENTS.md`, so it doesn't need separate replacement.

## Step 4: Git setup

Stage all files and create an initial commit: `Initial commit for <project-name>`

## Step 5: Install dependencies

The project requires the Node version specified in `.nvmrc`. Before installing, ensure the correct version is active:

```
nvm install
npm install
```

If `nvm` is not available, attempt to install it first:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install
```
If that also fails, check `node --version` against `.nvmrc` and warn the user about the version mismatch.

## Step 6: Set up Cloudflare infrastructure

### 6a. Create the D1 database

Run `npx wrangler d1 create <project-name>-db` and capture the output. Parse the `database_id` from the output and replace `YOUR_DATABASE_ID_HERE` in `wrangler.jsonc` with the actual ID.

If wrangler fails (e.g. not logged in), fall back to printing manual instructions for this step and continue.

### 6b. Run migrations locally

Run `npx wrangler d1 migrations apply <project-name>-db --local`.

### 6c. Commit infrastructure changes

Stage `wrangler.jsonc` (with the updated database_id) and commit: `Configure D1 database for <project-name>`.

## Step 7: Done

Tell the user what was done automatically vs. what's left:
- **Done**: D1 database created, migrations applied, `database_id` configured in `wrangler.jsonc`
- Auth is pre-configured with basic HTTP auth (username: `admin`, password: `admin`) — change credentials in `worker/auth.js`
- Run `npm run dev` to start developing

Point them to `knowledge-base/` for more on project conventions.
