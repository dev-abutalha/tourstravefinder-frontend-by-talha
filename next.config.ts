import type { NextConfig } from 'next';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/faq', destination: '/faqs', permanent: true },
      { source: '/privacy-policy', destination: '/pages/privacy', permanent: true },
      { source: '/terms-and-conditions', destination: '/pages/terms', permanent: true },
      { source: '/things-to-do', destination: '/products', permanent: true },
      { source: '/top-attractions', destination: '/attractions', permanent: true },
      { source: '/order-status', destination: '/order-tracker', permanent: true },
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/my-account', destination: '/account', permanent: false },
      { source: '/my-account/:path*', destination: '/account', permanent: false },
      { source: '/my-reservation', destination: '/checkout', permanent: false },
      { source: '/guided-tours', destination: '/products', permanent: true },
      { source: '/support', destination: '/contact', permanent: false },
      { source: '/partner', destination: '/contact', permanent: false },
      { source: '/product/:slug', destination: '/products/:slug', permanent: true },
      { source: '/product-category/:slug', destination: '/categories/:slug', permanent: true },
      { source: '/submit-review', destination: '/submit-review', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/media/:path*', destination: `${API_URL}/media/:path*` },
      { source: '/images/:path*', destination: `${API_URL}/images/:path*` },
    ];
  },
};

export default nextConfig;
