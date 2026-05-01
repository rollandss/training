import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://192.168.0.251",
    "http://192.168.0.251:3000",
    "http://192.168.0.251:3001",
  ],
};

export default nextConfig;
