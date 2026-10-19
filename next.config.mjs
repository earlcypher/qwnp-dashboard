import { getDashboardEnvironment } from './config/environment.mjs';

getDashboardEnvironment();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig;
