// Las fotos que sube el admin viven en Supabase Storage: next/image solo acepta
// imágenes externas de los lugares permitidos acá (el bucket "productos" de nuestro proyecto).
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Los tests E2E hacen su propio build (contra la base de prueba) en otra carpeta,
  // así no pisan el build normal de .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: supabase
      ? [{ protocol: "https", hostname: supabase.hostname, pathname: "/storage/v1/object/public/productos/**" }]
      : [],
  },
  // Encabezados de seguridad en todas las respuestas (auditoría de seguridad):
  // - X-Frame-Options y frame-ancestors: ningún otro sitio puede mostrar la tienda dentro de un
  //   iframe (evita que engañen a alguien para hacer clic en un botón del admin escondido).
  // - nosniff: el navegador no "adivina" el tipo de un archivo distinto al que dice el servidor.
  // - Referrer-Policy: a otros sitios solo les llega el dominio, nunca la dirección completa
  //   (por ejemplo, el código de seguimiento de /seguimiento/OC-...).
  // - Permissions-Policy: la tienda no usa cámara, micrófono ni ubicación.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
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
