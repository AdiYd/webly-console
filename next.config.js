/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Add transpilePackages to include undici
  transpilePackages: ['undici'],
}

module.exports = nextConfig
