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

**If `gh` is not available**, install it automatically:
```bash
brew install gh
```
If `brew` is not available either, install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Then install `gh` with `brew install gh`.

**After installing `gh`**, or if `gh` is available but not authenticated (check with `gh auth status`), log in non-interactively with pre-selected defaults:
```bash
gh auth login --hostname github.com --git-protocol https --web
```
This chooses GitHub.com, HTTPS protocol, and opens the browser for authentication — no interactive prompts. Tell the user to complete the login in the browser window that opens, then wait for confirmation before continuing.

**Once `gh` is installed and authenticated**, run the appropriate commands based on the answers already collected above. Do not ask again.

If the user chose **current directory**:
```
gh repo create aem-growth-adoption/<project-name> --template aem-growth-adoption/team-boilerplate --private
```
Then clone into the current directory. Use `git clone ... .` only if the directory is truly empty. Otherwise (e.g. a `.claude` directory exists), use this approach instead:
```
git init
git remote add origin https://github.com/aem-growth-adoption/<project-name>.git
git fetch origin
git checkout -b main origin/main
```

If the user chose **new subdirectory**:
```
gh repo create aem-growth-adoption/<project-name> --template aem-growth-adoption/team-boilerplate --private --clone
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
- `index.html`: replace `{{PROJECT_NAME}}`
- `app.jsx`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`

Note: `CLAUDE.md` imports `AGENTS.md` via `@AGENTS.md`, so it doesn't need separate replacement.

Then, redesign `app.jsx` to be a visually appealing landing page for the project using React Spectrum components. The page should reflect the project's purpose based on its name and description. Be creative — use Spectrum layout components (`Flex`, `Grid`, `View`), typography (`Heading`, `Text`), and interactive elements (`Button`, `Well`, `Divider`, etc.) to make it look polished and professional. Keep it a single file.

## Step 4: Remove boilerplate skills

Delete the `.claude/skills/` directory — it contains skills (`setup`, `teardown`) that belong to the boilerplate template and are not needed in the new project.

**Do NOT delete `.claude/settings.json`** — it contains the Cloudflare plugin configuration that the new project needs. Only remove the `skills/` subdirectory:

```
rm -rf .claude/skills
```

## Step 5: Git setup

Stage all files and create an initial commit: `Initial commit for <project-name>`

## Step 6: Install dependencies

The project requires the Node version specified in `.nvmrc`. Before installing, ensure the correct version is active:

```
nvm install
npm install
```

If `nvm` is not available, attempt to install it first:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install
```
If that also fails, check `node --version` against `.nvmrc` and warn the user about the version mismatch.

## Step 7: Set up Cloudflare infrastructure

> **Note:** If the user's Cloudflare account has access to multiple accounts, they should set `CLOUDFLARE_ACCOUNT_ID` before running wrangler commands (e.g. `export CLOUDFLARE_ACCOUNT_ID=<account-id>`). Mention this if wrangler prompts for an account choice or fails with an account-related error.

### 7a. Create the D1 database

```bash
npx wrangler d1 create <project-name>-db --update-config --binding DB
```

This creates the database and adds the `d1_databases` config to `wrangler.jsonc` automatically. If wrangler fails (e.g. not logged in), tell the user to run `npx wrangler login` and re-run `/setup` from this step.

### 7b. Run migrations locally

Run `npx wrangler d1 migrations apply <project-name>-db --local`.

### 7c. Apply migrations remotely

Run `npx wrangler d1 migrations apply <project-name>-db --remote`.

### 7d. Commit infrastructure changes

Stage `wrangler.jsonc` and commit: `Configure D1 database`

## Step 8: Deploy

Run `npm run deploy` to build and deploy the project to Cloudflare Workers. Share the live URL with the user from the deploy output.

## Step 8a: Register with Access

Clone `aem-growth-adoption/access-apps` (if not already cloned). Add an entry to `apps.json`:

```json
{ "name": "<project-name>", "status": "active" }
```

Commit and push. GitHub Actions will create the Access app and set `CF_ACCESS_AUD` on the worker.

## Step 9: Done

Tell the user what was done automatically vs. what's left:
- **Done**: D1 database created, `database_id` configured in `wrangler.jsonc`, migrations applied locally and remotely, deployed to Cloudflare Workers, Access app registered (or pending CI)
- Auth is handled by Cloudflare Zero Trust — `CF_ACCESS_AUD` is set automatically via the access-apps repo
- Run `npm run dev` for local development

Point them to `knowledge-base/` for more on project conventions.
