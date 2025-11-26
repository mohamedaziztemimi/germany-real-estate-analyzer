/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Pin the workspace root to this project to avoid auto-detection warnings with multiple lockfiles.
    root: ".",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Default to the deployed API so the app does not break when a local backend is not running.
        destination:
          process.env.API_REWRITE_TARGET || "https://realestate-api-qpks.onrender.com/api/:path*",
      },
    ]
  },
}

export default nextConfig
