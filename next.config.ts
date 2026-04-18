import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  // Increase the body parser limit for API routes handling large video uploads
  api: {
    bodyParser: {
      sizeLimit: '200mb',
    },
    responseLimit: '200mb',
  },
};

export default nextConfig;
