/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Suppress noisy optional telemetry peer-dep warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // Silence @opentelemetry optional missing module warnings
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    return config;
  },
};

export default nextConfig;
