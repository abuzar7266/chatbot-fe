import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features if needed
  // experimental: {
  //   // Add experimental features here
  // },
};

export default nextConfig;

