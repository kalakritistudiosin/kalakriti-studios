/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify's Next.js runtime (OpenNext) handles output itself; standalone is only for local/container runs.
  ...(process.env.NETLIFY ? {} : { output: 'standalone' }),
  poweredByHeader: false,
  images: {
    // All product/category/hero images are served & optimised by Cloudinary (f_auto, q_auto, width)
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Preview iframe support (Emergent). Safe to tighten on your own domain.
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
