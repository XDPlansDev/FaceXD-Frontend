// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      loaders: {
        // Configurações padrão do Turbo
      }
    }
  }
};

module.exports = nextConfig;
