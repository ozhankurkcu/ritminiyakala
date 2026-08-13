const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(basePath ? { basePath, trailingSlash: true } : {}),
};

export default nextConfig;
