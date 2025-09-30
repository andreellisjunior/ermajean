/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      'lh3.googleusercontent.com',
      'pbs.twimg.com',
      'images.unsplash.com',
      'logos-world.net',
    ],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export for Capacitor
  trailingSlash: true, // Helps with routing in mobile apps
  distDir: 'out', // Output directory for static export
};

module.exports = nextConfig;
