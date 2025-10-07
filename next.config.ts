import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure environment variables are available at runtime
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    DO_SPACES_REGION: process.env.DO_SPACES_REGION,
    DO_SPACES_KEY: process.env.DO_SPACES_KEY,
    DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
    DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
  },
  // Enable server external packages for better performance
  serverExternalPackages: ['mongoose'],
  // Add webpack config for handling mongoose in production
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
};

export default nextConfig;
