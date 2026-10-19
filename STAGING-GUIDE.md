# What's new: staging dashboard and contributor quick start

Updated **18 October 2026**. This documents the new code on **`staging`**, not a production release. Hosted Preview is now configured and has passed a browser smoke test; its Free API backend is intentionally on-demand.

## What's new

| Area | New behavior |
|---|---|
| Shared configuration | `lib/environment.ts` exports the API base URL used by all API callers. |
| Environment validation | `config/environment.mjs` is used by the build and browser configuration. Preview requires an explicit staging environment. |
| Wrong-origin protection | Staging requires an explicit matching HTTPS API origin and rejects the known production origin, credentials in URLs, extra paths and localhost. |
| Visual identification | `app/layout.tsx` displays a visible STAGING banner. |
| Tests and CI | Node 22 CI runs hygiene checks, isolated environment tests, TypeScript checking and a production build using a non-routable fixture origin. |
| Release controls | Work enters `staging` first; production main merges/releases require explicit owner approval. |

The earlier maintenance changes remain in [RELEASE-NOTES-2026-10-17.md](RELEASE-NOTES-2026-10-17.md). Use [ENVIRONMENTS.md](ENVIRONMENTS.md) for the environment/release runbook.

## Current state: verified hosted staging

**Verified 18 October 2026:** the Preview build is READY and uses `https://qwnp-staging.onrender.com`. Browser testing verified the STAGING banner, free-key rejection, enterprise login and dashboard stats/analytics/key listing. There were no production API calls, live Qwen requests or key-management writes.

Normal Vercel sign-in protection remains enabled. Only a temporary, Preview-deployment-specific test link was created, and it was revoked after testing; no project-wide bypass was added. The backend is a Free, private-artifact deployment from staging because Render Git access still fails. It must be suspended outside scheduled QA. See [STAGING-HOSTING.md](STAGING-HOSTING.md) for URLs, access and operations. A loaded UI does not guarantee the backend is currently resumed.

## Choose the right configuration

### Local UI development

Use Node 22 and the locked dependency set:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run typecheck
node scripts/check-repository-hygiene.mjs
```

For a local backend, put only public settings in the ignored `.env.local`:

```dotenv
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Then run `npm run dev` and open `http://localhost:3001`. Start with isolated tests; running the UI does not automatically mock the backend. Never assume a local dashboard makes a production API target safe.

If the local backend is intentionally launched with its separate staging database, it must still use production runtime mode and authenticated access; follow the backend guide. The `development` UI flag is for local HTTP configuration and does not display the hosted STAGING banner.

### Hosted Vercel Preview

Configure these **Preview-scope only**, after obtaining the actual backend origin:

| Public variable | Required value |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `staging` |
| `NEXT_PUBLIC_API_URL` | Actual assigned staging HTTPS origin, with no extra path/query |
| `NEXT_PUBLIC_EXPECTED_API_ORIGIN` | Exactly the same origin, without a trailing slash |

`NEXT_PUBLIC_*` values are public and frozen into the browser bundle at build time. Rebuild after changes. Never store Supabase service keys, database passwords, cookies or proxy login keys in these variables. Never promote a staging-built bundle into production; rebuild with Production-scoped settings.

The STAGING banner is intended to identify a staging build, not to prove API availability or full upstream isolation.

## Safe CI-equivalent build

This fixture deliberately does not contact a live backend:

```bash
VERCEL_ENV=preview NEXT_PUBLIC_APP_ENV=staging \
NEXT_PUBLIC_API_URL=https://staging-fixture.invalid \
NEXT_PUBLIC_EXPECTED_API_ORIGIN=https://staging-fixture.invalid \
NEXT_TELEMETRY_DISABLED=1 npm run build
```

**Do not use the fixture origin as a deployed staging endpoint.** It exists only to validate the build safely.

The previously verified baseline passed five environment tests, type-checking and a build with eight generated pages. The latest GitHub CI run is the source of truth for a new candidate. `npm run lint` still calls `next lint`, which is unsupported on Next 16; CI does not claim a lint or browser E2E pass.

## Login and test data

Use the **new staging enterprise proxy key** to log in. It is managed in the backend's ignored `.env.staging`, not this public repository. A free-tier staging key is useful for authorization-denial tests but cannot administer the dashboard.

Staging has a separate Supabase database and proxy keys. Do not copy production key/log rows into it. **Qwen cookies and fingerprint headers are shared with production by explicit owner choice:** session failures and upstream account quotas remain shared. No automated model-list, credential-probe or chat traffic is needed for CI or basic smoke tests.

## Contribution and release checklist

1. From a clean, updated `staging`, create a feature/docs branch.
2. Run the checks above and open a PR with **base `staging`**.
3. Wait for **Dashboard checks**. The Vercel deployment check is separate; inspect it too. Preview configuration is now present, so new candidate deployments should build successfully.
4. When hosted staging is available, verify the STAGING banner, staging login, API origin and harmless backend authorization checks.
5. Record paired backend/dashboard SHAs and request explicit owner approval before a production main merge/release or migration.
6. After approved production rollout, verify the Production deployment separately. For rollback use only an approved, previously verified Production build and reconcile Git through a checked revert PR, not a force-push.
7. Suspend any resumed staging backend after QA. Preview's static UI may remain accessible while its API is suspended.

Public `main` requires a PR and passing `Dashboard checks`, with administrator enforcement. No extra reviewer approval is required because a solo PR author cannot approve their own PR. The owner's explicit production approval is still a separate requirement; a green CI check is not permission to release.

## Troubleshooting

| Failure | Resolution |
|---|---|
| `Preview deployments must explicitly use the staging environment` | Set Preview-only `NEXT_PUBLIC_APP_ENV=staging` alongside both origin values, then rebuild. |
| `Staging must use its explicitly registered HTTPS backend origin` | Check HTTPS, matching origins, no credentials/path/query, and that the origin is not production. |
| UI loads, API is unreachable | The backend may be suspended or starting. Confirm the correct service and plan; do not substitute production or add keep-alive pings. |
| Admin login denied with a free key | Use the staging enterprise key, not a production key or Supabase credential. |
| New variables do not affect the UI | They were compiled into an older bundle; rebuild the intended environment. |

### Related documentation

- [Dashboard environment/release runbook](ENVIRONMENTS.md)
- [Backend staging guide](https://github.com/earlcypher/qwnp/blob/staging/STAGING-GUIDE.md) (private repository; access required)
