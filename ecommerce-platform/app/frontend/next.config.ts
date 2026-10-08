import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol?: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
}> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
  {
    protocol: "https",
    hostname: "img.vietqr.io",
  },
  {
    protocol: "https",
    hostname: "api.vietqr.io",
  },
  {
    protocol: "https",
    hostname: "api.qrserver.com",
  },
  {
    protocol: "https",
    hostname: "quickchart.io",
  },
  {
    protocol: "https",
    hostname: "*.onrender.com",
  },
  {
    protocol: "https",
    hostname: "*.vercel.app",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3001",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "3001",
  },
];

// Tự động thêm hostname từ NEXT_PUBLIC_API_URL nếu có
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      port: parsed.port || undefined,
    });
  } catch {
    // ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns,
  },
};

export default nextConfig;
