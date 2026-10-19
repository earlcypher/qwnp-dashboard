const PRODUCTION_ORIGIN = 'https://qwnp.onrender.com';

/**
 * Shared build/client validation. Only pass NEXT_PUBLIC_* values to browser callers.
 * @param {Record<string, string | undefined>} [env]
 */
export function getDashboardEnvironment(env = process.env) {
  const environment = env.NEXT_PUBLIC_APP_ENV || (env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') === PRODUCTION_ORIGIN ? 'production' : 'development');
  const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  if (!['development', 'staging', 'production'].includes(environment)) {
    throw new Error('NEXT_PUBLIC_APP_ENV must be development, staging, or production');
  }
  if (env.VERCEL_ENV === 'preview' && environment !== 'staging') {
    throw new Error('Preview deployments must explicitly use the staging environment');
  }
  if (env.VERCEL_ENV === 'production' && environment === 'staging') {
    throw new Error('Production deployments cannot use staging configuration');
  }
  if (environment === 'staging') {
    let url;
    try { url = new URL(apiUrl); } catch { /* Report no variable values. */ }
    if (!url || url.protocol !== 'https:' || url.username || url.password ||
        !['', '/'].includes(url.pathname) || url.search || url.hash ||
        !env.NEXT_PUBLIC_EXPECTED_API_ORIGIN || url.origin !== env.NEXT_PUBLIC_EXPECTED_API_ORIGIN ||
        url.origin === PRODUCTION_ORIGIN) {
      throw new Error('Staging must use its explicitly registered HTTPS backend origin, never production');
    }
  }
  if (env.VERCEL_ENV === 'production' && apiUrl.replace(/\/$/, '') !== PRODUCTION_ORIGIN) {
    throw new Error('Production deployment must use the registered production backend');
  }
  return { environment, apiUrl: apiUrl.replace(/\/$/, '') };
}
