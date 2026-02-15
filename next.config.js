/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.cjkamenge.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.api.cjkamenge.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.cjk.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.api.cjk.com",
        pathname: "/media/**",
      },
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
