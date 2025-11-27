/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'shroomtopia.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'api.mypsyguide.io',
      },
    ],
  },
};

export default nextConfig;