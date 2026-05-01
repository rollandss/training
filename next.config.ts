import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.251",
    "192.168.0.251:3000",
    "192.168.0.251:3001",
  ],
};

export default nextConfig;
