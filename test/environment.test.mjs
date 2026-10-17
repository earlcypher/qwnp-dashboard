import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardEnvironment } from '../config/environment.mjs';

const staging = {
  VERCEL_ENV: 'preview', NEXT_PUBLIC_APP_ENV: 'staging',
  NEXT_PUBLIC_API_URL: 'https://staging-test.onrender.com',
  NEXT_PUBLIC_EXPECTED_API_ORIGIN: 'https://staging-test.onrender.com'
};
test('preview builds use an explicit, matching staging backend', () => {
  assert.equal(getDashboardEnvironment(staging).environment, 'staging');
});
test('staging refuses production, localhost, credentials, paths and mismatched origin', () => {
  for (const url of ['https://qwnp.onrender.com', 'http://localhost:3000', 'https://secret@staging-test.onrender.com', 'https://staging-test.onrender.com/path', 'https://other.onrender.com']) {
    assert.throws(() => getDashboardEnvironment({ ...staging, NEXT_PUBLIC_API_URL: url }), /Staging/);
  }
  assert.throws(() => getDashboardEnvironment({ ...staging, NEXT_PUBLIC_EXPECTED_API_ORIGIN: undefined }), /Staging/);
});
test('preview builds fail rather than defaulting to production or local configuration', () => {
  assert.throws(() => getDashboardEnvironment({ VERCEL_ENV: 'preview' }), /Preview/);
});
test('production build must not use staging and must use production backend', () => {
  assert.throws(() => getDashboardEnvironment({ ...staging, VERCEL_ENV: 'production' }), /Production/);
  assert.equal(getDashboardEnvironment({ VERCEL_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://qwnp.onrender.com' }).environment, 'production');
});
test('local development defaults remain available', () => {
  assert.equal(getDashboardEnvironment({}).apiUrl, 'http://localhost:3000');
});
