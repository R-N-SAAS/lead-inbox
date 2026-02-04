/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimierung für Vercel Deployment
  swcMinify: true,
  
  // Umgebungsvariablen
  env: {
    NEXT_PUBLIC_APP_NAME: 'Lead Inbox',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Bilder-Domains (falls externe Bilder geladen werden)
  images: {
    domains: [],
  },
  
  // Redirects (handled by middleware and app/page.tsx)
  async redirects() {
    return [];
  },
  
  // Headers für Security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // CORS für Widget
      {
        source: '/api/webhook/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
