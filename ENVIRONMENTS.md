# Dashboard environments

**Start here:** [What's new and contributor quick start](STAGING-GUIDE.md). This page remains the detailed operating runbook.

Production remains `main`. Staging uses the `staging` branch and Vercel Preview, not a paid Custom Environment. Feature branches can use the same Preview variables; they share the one staging backend/database rather than receiving isolated per-PR databases.

## Preview configuration

Set these in Vercel's Preview scope only:

- `NEXT_PUBLIC_APP_ENV=staging`
- `NEXT_PUBLIC_API_URL=<assigned staging HTTPS backend origin>`
- `NEXT_PUBLIC_EXPECTED_API_ORIGIN=<same staging HTTPS backend origin>`

Public variables are compiled into the browser bundle. Rebuild after changing them. Never promote a staging-built bundle to production; rebuild with production settings. Existing production API configuration is not copied into Preview.

The build refuses Preview without an explicit staging environment, rejects production/localhost as a staging backend, and rejects mismatched origins. All API callers use the central `lib/environment.ts` configuration. A visible STAGING banner distinguishes the test UI.

## Credentials and availability

Use only the newly generated staging enterprise proxy key to log into this UI. The key is in the backend's ignored owner-readable `.env.staging` on the MCP machine, not in this repository or a NEXT_PUBLIC variable. Backend database/service credentials never belong in the dashboard.

The test database and proxy keys are separate. Qwen cookies/headers are shared with production by owner decision, so upstream limits and session invalidation are still shared. There are no automated live-chat CI tests.

The verified staging backend uses Free/on-demand hosting and must be suspended outside scheduled QA. See [STAGING-HOSTING.md](STAGING-HOSTING.md) for access and its explicit resume/suspend workflow. A published Preview URL can therefore load while its API is unavailable. Resume the staging backend for testing and suspend it afterward; do not add keep-alive pings.

## Release workflow

Feature PR -> `staging` -> automated checks and planned QA -> explicit owner approval -> PR/merge to `main` -> separately verified production rollout.

Public-repository main protection now requires a PR and passing `Dashboard checks`, with administrator enforcement enabled. No self-review requirement is used for the solo owner. Passing CI is not the owner's approval and does not authorize a production release. The private backend has a separate plan limitation documented in its `ENVIRONMENTS.md`.

## CI and local checks

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run typecheck
node scripts/check-repository-hygiene.mjs
# Safe build fixture, no live backend required:
VERCEL_ENV=preview NEXT_PUBLIC_APP_ENV=staging \
NEXT_PUBLIC_API_URL=https://staging-fixture.invalid \
NEXT_PUBLIC_EXPECTED_API_ORIGIN=https://staging-fixture.invalid \
NEXT_TELEMETRY_DISABLED=1 npm run build
```

CI uses pinned checkout/setup-node actions and Node 22, with no production secrets, a job timeout and concurrency cancellation. The legacy `npm run lint` script still calls `next lint`, which is unsupported on Next 16; lint is not part of this CI. Type-check/build success is not a lint or browser E2E pass.

## Current hosted setup status (2026-10-18)

Hosted staging is configured and has passed a real browser smoke test: the STAGING banner is visible, a free key is denied admin login, and the staging enterprise key loads dashboard stats, analytics and the key list from the staging backend. No production API requests, live Qwen calls or key-management writes were made.

Preview-only `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_EXPECTED_API_ORIGIN` are set to staging / `https://qwnp-staging.onrender.com`. The build is READY. Existing Vercel sign-in protection remains enabled; a newly created, short-lived access link used only for the Preview test was revoked. No project-wide automation bypass was created.

Render Git access still fails, so the private backend is delivered via a verified source artifact from its staging branch to a Free image-backed service. It remains the same codebase, not a public fork. [STAGING-HOSTING.md](STAGING-HOSTING.md) explains the links, cold-start tradeoff and planned suspension outside QA. A reachable Preview UI does not imply its backend is currently resumed.

## Release and rollback

Before any main merge or production deployment, obtain explicit owner approval and record the tested backend/dashboard SHAs. A production build must use Production-scoped API settings, not a promoted staging bundle. After the approved rollout, verify the production deployment and harmless authentication smoke tests. For an approved rollback, use only a previously verified **Production** deployment/build, never a Preview artifact; reconcile main via a checked revert PR rather than force-pushing. Backend deployment and database rollback have separate approval/compatibility requirements documented in the backend runbook.
