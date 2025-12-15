import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator-ai/database"],
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    // Production backend API URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creater-ai.onrender.com',
  }
};

export default nextConfig;
