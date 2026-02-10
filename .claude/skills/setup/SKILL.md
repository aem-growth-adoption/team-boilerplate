---
name: setup
description: Customize a new project created from the growth boilerplate template. Replaces placeholders, commits, installs deps, and guides through Google OAuth and D1 setup.
disable-model-invocation: true
---

After creating a new project from the growth boilerplate template, this skill customizes it for you.

The user should have already run:
```
gh repo create <org>/my-tool --template alexcarol/team-boilerplate --private --clone
```

Follow these steps in order:

1. **Ask the user** for:
   - Project name (kebab-case, e.g. `my-cool-tool`)
   - One-line description of the project

2. **Replace placeholders** in these files:
   - `package.json`: replace `{{PROJECT_NAME}}` with the project name and `{{PROJECT_DESCRIPTION}}` with the description
   - `wrangler.jsonc`: replace `{{PROJECT_NAME}}` with the project name
   - `CLAUDE.md`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`
   - `AGENTS.md`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`
   - `index.html`: replace `{{PROJECT_NAME}}` and `{{PROJECT_DESCRIPTION}}`

3. **Git setup**:
   - Stage all files and create an initial commit: `Initial commit for <project-name>`

4. **Install dependencies**: Run `npm install`

5. **Guide the user through setup**. Print each step clearly:

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

6. **Remind them**:
   - Always use `wrangler.jsonc`, never `.toml`
   - Check latest Cloudflare docs when modifying CF config
   - Read `knowledge-base/` for team conventions
   - Run `npm run dev` to start on port 3000
