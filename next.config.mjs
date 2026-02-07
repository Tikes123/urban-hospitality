/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/vendor", permanent: false },
      { source: "/admin/:path*", destination: "/vendor/:path*", permanent: false },
    ]
  },
}

export default nextConfig
