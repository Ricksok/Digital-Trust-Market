/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only enable standalone output for production builds (Docker)
  // In development, Next.js needs to serve chunks normally
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Don't fail build on ESLint errors (we'll fix them separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't fail build on TypeScript errors (type-check separately)
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch real TS errors
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  },
}

module.exports = nextConfig


