# Dashboard environments

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

The staging backend is free/on-demand and is deliberately suspended when not in a scheduled QA session. A published Preview URL can therefore load while its API is unavailable. Resume the staging backend for testing and suspend it afterward; do not add keep-alive pings.

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

CI uses pinned checkout/setup-node actions and Node 22, with no production secrets, a job timeout and concurrency cancellation. The pre-existing removed `next lint` command remains a documented limitation; type-check/build success is not a lint or browser E2E pass.

## Current hosted setup status (2026-10-17)

The staging source branch and GitHub CI are ready. **Hosted Preview is not configured or verified yet.** Render API creation cannot fetch the private backend repository, and no staging service is visible in the authenticated account's accessible workspaces. Do not guess an API URL or use production as a fallback. Vercel's automatically triggered staging/feature Preview builds currently fail closed because the required Preview configuration has not been set. The GitHub `Dashboard checks` job independently passes with a safe fixture origin.

After obtaining the actual staging service ID/URL, set all three Preview-only public variables above and rebuild. Production variable scope and main are unchanged by this setup. A Preview URL alone does not prove backend availability.

## Release and rollback

Before any main merge or production deployment, obtain explicit owner approval and record the tested backend/dashboard SHAs. A production build must use Production-scoped API settings, not a promoted staging bundle. After the approved rollout, verify the production deployment and harmless authentication smoke tests. For an approved rollback, use only a previously verified **Production** deployment/build, never a Preview artifact; reconcile main via a checked revert PR rather than force-pushing. Backend deployment and database rollback have separate approval/compatibility requirements documented in the backend runbook.
