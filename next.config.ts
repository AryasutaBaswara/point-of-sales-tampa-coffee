import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  devIndicators: false,
  images: {
    domains: ["https://mcbqylhtislzpqmcspxl.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mcbqylhtislzpqmcspxl.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
