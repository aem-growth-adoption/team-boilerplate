# Google OAuth Setup

Step-by-step guide to configuring Google OAuth for your project.

## 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - User type: **Internal** (if using Google Workspace) or **External**
   - App name: your project name
   - Authorized domains: your deployment domain
6. Application type: **Web application**
7. Name: your project name

## 2. Configure Redirect URIs

Add authorized redirect URIs for each environment:

**Local development:**
```
http://localhost:3000/auth/callback
```

**Production (Cloudflare Workers):**
```
https://your-project.your-subdomain.workers.dev/auth/callback
```

**Custom domain (if applicable):**
```
https://your-domain.com/auth/callback
```

## 3. Save Your Credentials

After creating, you'll get:
- **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`)
- **Client secret** (looks like `GOCSPX-...`)

## 4. Set Up Local Development

Create `.dev.vars` in your project root (this file is gitignored):

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
SESSION_SECRET=any-random-string-for-local-dev
```

## 5. Set Up Production Secrets

```bash
wrangler secret put GOOGLE_CLIENT_ID
# Paste your client ID

wrangler secret put GOOGLE_CLIENT_SECRET
# Paste your client secret

wrangler secret put SESSION_SECRET
# Use a strong random string: openssl rand -hex 32
```

## 6. Domain Restriction

The auth flow restricts access to `@adobe.com` accounts:
- The `hd=adobe.com` parameter is sent to Google (UI hint for account picker)
- **Server-side validation** in `worker/auth.js` checks both `hd` claim and email domain
- Non-@adobe.com accounts get a 403 response

To change the allowed domain, update the `ALLOWED_DOMAIN` constant in `worker/auth.js`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "redirect_uri_mismatch" | The callback URL doesn't match what's in Google Console. Check protocol (http vs https) and port. |
| "access_denied" | User declined permissions or isn't in the allowed domain. |
| Login works locally but not in production | Make sure you added the production callback URL to Google Console. |
| "invalid_client" | Client ID or secret is wrong. Re-check in Google Console. |
