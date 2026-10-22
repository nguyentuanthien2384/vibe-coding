import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol?: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
}> = [
  {
    protocol: 'https',
    hostname: 'i.pravatar.cc',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: '*.onrender.com',
  },
  {
    protocol: 'https',
    hostname: '*.vercel.app',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '3001',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '3001',
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

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  basePath: basePath ? basePath : undefined,
  assetPrefix: basePath ? basePath : undefined,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns,
  },
};

export default nextConfig;
