import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["jade-central-hornet-435.mypinata.cloud", "ipfs.io"],
  },
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
};

export default nextConfig;
