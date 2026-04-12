/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mapbox-gl'],
  output: 'export',
  images: {
    unoptimized: true, // no Image Optimization API on static export
  },
}

module.exports = nextConfig
