import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['amlrswmssegvmcvuxwfj.supabase.co'],
  },
};

export default nextConfig;
