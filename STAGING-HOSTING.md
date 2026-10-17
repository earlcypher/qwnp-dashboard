# Hosted staging: access and test status

Verified **18 October 2026**. This is the nonproduction Preview environment, not a production release.

## Open staging

**Preview:** https://qwnp-dashboard-v2-git-staging-lei-s-projects12.vercel.app

**API:** https://qwnp-staging.onrender.com

1. Sign in to Vercel with the authorized account if prompted. Existing deployment protection remains enabled.
2. Confirm the visible **STAGING** banner.
3. Make sure the Free backend is resumed for a scheduled QA session; it must be suspended outside testing.
4. Log in using the newly generated **staging enterprise proxy key**, managed in the backend's ignored `.env.staging`. A free staging key must be denied admin access. Never use a production proxy key or a Supabase service key.

The stable branch alias follows new staging Preview deployments. A loaded page does not prove the API is currently resumed. The API is deliberately not kept alive by pings.

## Preview configuration

These variables are configured in **Preview scope only**:

```dotenv
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_API_URL=https://qwnp-staging.onrender.com
NEXT_PUBLIC_EXPECTED_API_ORIGIN=https://qwnp-staging.onrender.com
```

They are public build-time values, not secrets. Rebuild after changes. Production environment variables remain separate and unchanged. Never promote a staging-built bundle into production.

## Backend deployment workaround

The Free Singapore backend is image-backed because Render cannot fetch the private Git repository. It runs an immutable official Node runtime; private source is delivered as a checksum-verified Render secret file from the backend staging branch. No public source fork or paid registry was created. Cold starts are slower because locked dependencies install at startup.

The backend's guarded Python publisher controls publication and explicit resume/suspend. See the [backend hosting runbook](https://github.com/earlcypher/qwnp/blob/staging/STAGING-HOSTING.md) (private repository; access required). This is the same codebase and separate staging database/proxy credentials, not a production clone.

Qwen cookies and fingerprint headers are shared with production by owner choice, so upstream account limits/session invalidation remain shared. No live Qwen traffic is required for the tests below.

## Verified browser and API checks

A real headless browser smoke test verified:

- The STAGING banner is visible.
- A free staging key is denied admin login (403).
- A staging enterprise key logs in successfully.
- Dashboard statistics, usage analytics and key listing load from the staging backend (200).
- No production API or upstream Qwen requests were attempted; those routes were blocked during the test.

Hosted API checks also verified health and anonymous/invalid-key denial. No key-management write, model list, credential probe or chat call was made.

Only a newly created short-lived access link for the Preview deployment was used for browser QA. It was revoked afterward. No project-wide automation bypass or sign-in-policy change was made. This is a smoke test, not a complete browser regression suite or live-chat guarantee.

## Session checklist

- [ ] Ask the authorized operator to resume staging for the scheduled session.
- [ ] Verify `/health` reports `environment: staging`.
- [ ] Open Preview through normal Vercel sign-in and confirm STAGING.
- [ ] Use only staging proxy keys and synthetic data.
- [ ] Do not click upstream credential tests or send chats unless separately intended/approved.
- [ ] Suspend the staging backend after QA and verify provider state.

A green Preview or CI check does not approve a production release. Main merges, production deployments and production database migrations still require explicit owner approval. See [ENVIRONMENTS.md](ENVIRONMENTS.md) and [STAGING-GUIDE.md](STAGING-GUIDE.md).
