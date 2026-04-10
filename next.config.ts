import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // R3F v9 compatibility — disable component caching if available
  },
};

export default nextConfig;
