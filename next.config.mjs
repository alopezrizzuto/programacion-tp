/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rutas que cambiaron de nombre: los links viejos redirigen a las nuevas
  async redirects() {
    return [
      { source: "/catalogo", destination: "/productos", permanent: true },
      { source: "/login", destination: "/ingresar", permanent: true },
    ];
  },
};

export default nextConfig;
