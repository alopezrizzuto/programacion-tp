// Las fotos que sube el admin viven en Supabase Storage: next/image solo acepta
// imágenes externas de los lugares permitidos acá (el bucket "productos" de nuestro proyecto).
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabase
      ? [{ protocol: "https", hostname: supabase.hostname, pathname: "/storage/v1/object/public/productos/**" }]
      : [],
  },
  // Rutas que cambiaron de nombre: los links viejos redirigen a las nuevas
  async redirects() {
    return [
      { source: "/catalogo", destination: "/productos", permanent: true },
      { source: "/login", destination: "/ingresar", permanent: true },
    ];
  },
};

export default nextConfig;
