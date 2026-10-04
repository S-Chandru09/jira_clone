import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    baseURL: process.env.API_BASE_URL || "http://localhost:8080",
  },
};

export default nextConfig;
