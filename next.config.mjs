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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_REWRITE_TARGET || "http://127.0.0.1:8000/api/:path*",
      },
    ]
  },
}

export default nextConfig
