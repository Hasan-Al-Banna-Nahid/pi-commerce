import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com", "example.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
