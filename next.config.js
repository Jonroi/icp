/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mozilla/readability', 'jsdom'],
  },
  async rewrites() {
    return [
      {
        source: '/api/read',
        destination: '/api/readability',
      },
    ];
  },
};

module.exports = nextConfig;
