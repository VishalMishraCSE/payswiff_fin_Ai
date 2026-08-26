import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN/hotspot IP to access dev resources on mobile
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.148.115",
    "192.168.148.204",
    "10.138.212.71",
  ],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8005";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/ws/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
