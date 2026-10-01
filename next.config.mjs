/** @type {import('next').NextConfig} */
const nextConfig = {
  // El catálogo pasó a llamarse /productos: los links viejos redirigen
  async redirects() {
    return [{ source: "/catalogo", destination: "/productos", permanent: true }];
  },
};

export default nextConfig;
