import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper serverless function configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
