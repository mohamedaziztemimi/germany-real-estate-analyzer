/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  turbopack: { root: "." },
  async rewrites() {
    const target =
      process.env.API_REWRITE_TARGET || "https://site--readlestateai--8r2ddr2v5b7f.code.run/";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
