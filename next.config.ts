import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "res.cloudinary.com",
      "www.mi.com",
      "www.vivo.com",
      "www.oppo.com",
      "www.xiaomi.com",
      "www.samsung.com",
      "www.apple.com",
      "fdn2.gsmarena.com",
      "www.gsmarena.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
