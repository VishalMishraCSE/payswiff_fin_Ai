import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN/hotspot IP to access dev resources on mobile
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.138.212.71",
    "192.168.148.204",
  ],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
      {
        source: "/ws/backend/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
