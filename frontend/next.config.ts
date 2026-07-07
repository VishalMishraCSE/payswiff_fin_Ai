import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow any LAN/hotspot IP to access dev resources on mobile
  allowedDevOrigins: ["*"],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8000/:path*",
      },
      {
        source: "/ws/backend/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
