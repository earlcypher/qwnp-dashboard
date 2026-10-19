# Production release notes — 2026-10-19

This release promotes the complete reviewed dashboard `staging` snapshot (`9f23201a41a2e69a5aa8598fe6e8ff55e9a4b5c9`) to `main`, together with this release note.

## Included

- Dynamic model selectors on both Playground surfaces, populated from the configured Qwen Chat session catalog; the first currently available model is selected automatically, with refresh and error states.
- Updated API documentation: retrieve current model IDs from `GET /v1/models` and use a returned ID in chat requests instead of relying on stale examples.
- The reviewed dashboard, cookie-management, selected API-key, theme/chart, and environment-separation changes already present on staging.
- Production/preview environment validation that prevents a production build from targeting staging and requires previews to use their registered staging backend.

## Validation before promotion

- Dashboard typecheck passed.
- Dashboard test suite: 11/11 passed.
- Node 22 production build and `git diff --check` passed.
- The owner completed the authenticated staging review. The staging deployment itself remains protected by Vercel SSO for unauthenticated access.

## Deployment

The production Vercel project is connected to `main`; verify its production deployment and live site after this release PR merges. No API credentials or Qwen session cookies are part of this release note.
