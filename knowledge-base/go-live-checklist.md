# Go-Live Checklist

Things to update when graduating an experiment to production.

## Auth

- [ ] Update `CF_ACCESS_TEAM` in `worker/auth.js` from `aem-poc` to the production Access team name
- [ ] Create a production Cloudflare Access application and set the `CF_ACCESS_AUD` secret to its audience tag
