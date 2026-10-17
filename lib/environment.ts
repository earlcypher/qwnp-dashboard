import { getDashboardEnvironment } from '../config/environment.mjs';

const config = getDashboardEnvironment({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_EXPECTED_API_ORIGIN: process.env.NEXT_PUBLIC_EXPECTED_API_ORIGIN,
});

export const APP_ENV = config.environment;
export const API_BASE_URL = config.apiUrl;
