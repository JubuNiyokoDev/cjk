/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.34.146.127",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;
