import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(basePath ? { basePath, trailingSlash: true } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Firebase signInWithPopup requires same-origin-allow-popups
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
