import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Upload foto dari admin lewat Server Action (maks. file 2 MB; batas body Vercel 4,5 MB)
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  // PGlite hanya dipakai untuk dev lokal tanpa DATABASE_URL
  serverExternalPackages: ['@electric-sql/pglite', 'sharp'],
};

export default nextConfig;
