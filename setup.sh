#!/usr/bin/env bash
set -euo pipefail

# Growth Boilerplate Setup Script
# Run this after cloning if you're not using Claude Code's /setup skill.

echo "=== Growth Boilerplate Setup ==="
echo ""

# 1. Get project info
read -rp "Project name (kebab-case, e.g. my-cool-tool): " PROJECT_NAME
read -rp "One-line description: " PROJECT_DESCRIPTION

if [ -z "$PROJECT_NAME" ] || [ -z "$PROJECT_DESCRIPTION" ]; then
  echo "Error: Project name and description are required."
  exit 1
fi

echo ""
echo "Setting up: $PROJECT_NAME"
echo ""

# 2. Replace placeholders
FILES=(
  "package.json"
  "wrangler.jsonc"
  "CLAUDE.md"
  "AGENTS.md"
  "index.html"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    ESCAPED_NAME=$(printf '%s\n' "$PROJECT_NAME" | sed 's/[&/\]/\\&/g')
    ESCAPED_DESC=$(printf '%s\n' "$PROJECT_DESCRIPTION" | sed 's/[&/\]/\\&/g')
    sed -i.bak "s|{{PROJECT_NAME}}|$ESCAPED_NAME|g" "$file"
    sed -i.bak "s|{{PROJECT_DESCRIPTION}}|$ESCAPED_DESC|g" "$file"
    rm -f "$file.bak"
    echo "  Updated $file"
  fi
done

# 3. Git setup
git remote remove origin 2>/dev/null || true
git add -A
git commit -m "Initial commit for $PROJECT_NAME"
echo "  Created initial commit"

# 4. Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# 5. Print next steps
echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo ""
echo "1. Set up Google OAuth credentials:"
echo "   See knowledge-base/google-oauth-setup.md for the full guide."
echo "   - Go to https://console.cloud.google.com/ → APIs & Services → Credentials"
echo "   - Create an OAuth 2.0 Client ID (Web application)"
echo "   - Add redirect URI: http://localhost:3000/auth/callback"
echo ""
echo "2. Create the D1 database:"
echo "   wrangler d1 create ${PROJECT_NAME}-db"
echo "   Then update the database_id in wrangler.jsonc"
echo ""
echo "3. Run migrations (local):"
echo "   wrangler d1 migrations apply ${PROJECT_NAME}-db --local"
echo ""
echo "4. Create .dev.vars with your secrets:"
echo "   GOOGLE_CLIENT_ID=your-client-id"
echo "   GOOGLE_CLIENT_SECRET=your-client-secret"
echo '   SESSION_SECRET=<run: openssl rand -hex 16>'
echo ""
echo "5. Start developing:"
echo "   npm run dev"
echo ""
echo "Reminders:"
echo "  - Always use wrangler.jsonc, never .toml"
echo "  - Check latest Cloudflare docs when modifying CF config"
echo "  - Read knowledge-base/ for team conventions"
