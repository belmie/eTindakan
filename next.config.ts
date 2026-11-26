import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  devIndicators: false,
  allowedDevOrigins: [
    'benjamin-keywords-storage-episode.trycloudflare.com',
    '*.trycloudflare.com',
    'localhost:3000',
    'localhost:5130'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;

