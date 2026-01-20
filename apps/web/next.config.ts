import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator-ai/database", "ai", "@ai-sdk/openai"],
  reactStrictMode: true,

  // Security: Disable X-Powered-By header
  poweredByHeader: false,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Security: Enable TypeScript strict checking
  typescript: {
    ignoreBuildErrors: false, // FIXED: Now catches type errors at build time
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Drive (to be migrated to CDN)
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev', // Cloudflare R2 (future CDN)
      },
    ],
  },

  // Environment variables
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  // },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/chat/:slug*',
        destination: '/public-chat/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
