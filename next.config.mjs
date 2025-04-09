const nextConfig = {
  reactStrictMode: true,
  // Removido o 'output: export' pois vamos usar SSR com Firebase
  images: {
    unoptimized: true, // Necessário pro Firebase Hosting SSR funcionar com imagens
  },
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
