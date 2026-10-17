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

Public-repository main protection should require a PR and passing `Dashboard checks`. No self-review requirement is used for the solo owner. Passing CI is not the owner's approval and does not authorize a production release. The private backend has a separate plan limitation documented in its `ENVIRONMENTS.md`.

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
