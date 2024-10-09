const withPWA = require("next-pwa");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true, scrollRestoration: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "coventiassets.blob.core.windows.net",
      },
    ],
    ...withPWA({
      dest: "public",
      register: true,
      skipWaiting: true,

      // buildExcludes: [/middleware-manifest.json$/],
      // disable: process.env.NODE_ENV === "development",
    }),
  },
};

module.exports = nextConfig;