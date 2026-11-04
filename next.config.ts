import type { NextConfig } from "next";

if (process.argv.some((arg) => arg.includes("build"))) {
  process.env.NODE_ENV = "production";
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.run.app"],
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
