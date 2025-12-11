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
    // Fallback for API URL if not set (helps prevent crash, though calls will fail)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creator-ai-backend.onrender.com', // Replace with actual if known
  }
};

export default nextConfig;
