/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'rental-digitech.s3.ap-northeast-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig 