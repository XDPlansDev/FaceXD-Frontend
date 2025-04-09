// Caminho: next.config.mjs

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.15.10:3000',
    'http://192.168.15.33:3000',
    'http://192.168.15.100:3000',
    'http://192.168.15.101:3000',
    'http://192.168.15.60:3000',
  ],
};

export default nextConfig;
