/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['pb-api.mytestprojects.com', 's3.ap-south-1.amazonaws.com'],
    unoptimized: true
  },
};

module.exports = nextConfig;
