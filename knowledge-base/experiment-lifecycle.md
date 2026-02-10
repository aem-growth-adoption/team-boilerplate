# Experiment Lifecycle

How we build, validate, and decide on experiments.

## Lifecycle Stages

### 1. Build (1–3 days)

Clone the boilerplate, run `/setup` (or `setup.sh`), and build the core idea.

- Focus on the **one thing** you're testing
- Use the example CRUD routes as a starting point
- Don't over-engineer — this is a prototype
- Deploy early to get a real URL for testing

### 2. Validate (1–2 weeks)

Share with a small group and gather signal.

- Is this solving a real problem?
- Are people coming back without being prompted?
- What's the actual usage pattern?

### 3. Decide

Based on validation, one of three outcomes:

**Graduate** — The experiment proved valuable.
- Move to a production repo with proper CI/CD
- Add monitoring, error tracking, tests
- Plan for scale and maintenance

**Iterate** — The core idea has merit but needs changes.
- Stay in experiment mode
- Adjust based on feedback
- Set a new validation window

**Abandon** — The experiment didn't prove out.
- Document what was learned
- Archive the repo (don't delete — learnings have value)
- Move on to the next idea

## Principles

- **Speed over polish**: The boilerplate handles auth, DB, and deployment. You focus on the idea.
- **Real users, real data**: Deploy to Cloudflare immediately. Don't validate with mockups.
- **Learn and share**: Document findings in `knowledge-base/` so the team benefits regardless of outcome.
- **Small bets**: Each experiment is cheap to run. It's better to try 5 things and find 1 winner than to spend months on a single bet.
