/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  // Add headers to help with CORS and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // Improve error handling for API routes
  async rewrites() {
    return [];
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

module.exports = nextConfig;
