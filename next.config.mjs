/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS || '').split(',').filter(Boolean),
};

export default nextConfig
