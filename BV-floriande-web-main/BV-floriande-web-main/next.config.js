/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  // Configuration for Firebase deployment (static export mode)
  output: process.env.BUILD_ENV === 'firebase' ? 'export' : undefined,
  trailingSlash: process.env.BUILD_ENV === 'firebase' ? true : false,
  distDir: process.env.BUILD_ENV === 'firebase' ? 'out' : '.next',
  images: {
    unoptimized: process.env.BUILD_ENV === 'firebase' ? true : false,
  },
  // Add webpack configuration for better error handling
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // We're leaving this commented out due to performance warning
      // config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
};

module.exports = nextConfig;
