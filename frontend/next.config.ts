import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    domains: ["jade-central-hornet-435.mypinata.cloud", "ipfs.io"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mypinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
    ],
  },
  
  // Build configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  
  // Ensure proper routing for App Router
  trailingSlash: false,
};

export default nextConfig;
