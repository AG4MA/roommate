/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@roommate/shared', '@roommate/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
