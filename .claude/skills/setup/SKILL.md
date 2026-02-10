---
name: setup
description: Create and set up a new project from the growth boilerplate template. Handles repo creation, placeholder replacement, dependency installation, and guides through Google OAuth and D1 setup.
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
- GitHub org or username for the repo (e.g. `alexcarol`)
- Whether to use the **current directory** or create a **new subdirectory**

The repo is always created as **private**.

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
gh repo create <org>/<project-name> --template alexcarol/team-boilerplate --private
git clone https://github.com/<org>/<project-name>.git .
```
If the current directory isn't empty, warn and suggest using a new subdirectory instead.

If the user chose **new subdirectory**:
```
gh repo create <org>/<project-name> --template alexcarol/team-boilerplate --private --clone
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

## Step 6: Guide through infrastructure setup

Print each step clearly:

**a. Google OAuth credentials:**
- Reference the guide at `knowledge-base/google-oauth-setup.md`
- They need a Google Cloud project with OAuth 2.0 credentials
- Redirect URIs: `http://localhost:3000/auth/callback` (dev) and their production URL

**b. Create the D1 database:**
```
wrangler d1 create <project-name>-db
```
- Tell them to copy the `database_id` from the output and update it in `wrangler.jsonc`

**c. Run migrations:**
```
wrangler d1 migrations apply <project-name>-db --local
```

**d. Create `.dev.vars`** for local development:
```
GOOGLE_CLIENT_ID=<their-client-id>
GOOGLE_CLIENT_SECRET=<their-client-secret>
SESSION_SECRET=<any-random-string>
```

**e. Production secrets** (when ready to deploy):
```
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SESSION_SECRET
```

## Step 7: Done

Tell the user setup is complete and they can start developing with `npm run dev`. Point them to `knowledge-base/` if they want to learn more about the project conventions.
