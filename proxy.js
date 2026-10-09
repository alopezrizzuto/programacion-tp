import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Proxy: corre antes de las páginas que usan la sesión (ver matcher).
// La sesión de Supabase vence cada una hora; acá se renueva y se guardan
// las cookies nuevas en la respuesta, porque una página no puede escribir cookies.
export async function proxy(request) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesNuevas, encabezados) {
          // Las cookies nuevas van al pedido (para la página) y a la respuesta (para el navegador)
          cookiesNuevas.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesNuevas.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
          // Que ningún caché guarde una respuesta con la sesión de otro usuario
          Object.entries(encabezados).forEach(([nombre, valor]) => respuesta.headers.set(nombre, valor));
        },
      },
    },
  );

  // getUser valida la sesión con Supabase y, si venció, la renueva
  await supabase.auth.getUser();

  return respuesta;
}

// Solo las páginas que leen la sesión en el servidor. El resto de la tienda es estática.
export const config = {
  matcher: ["/cuenta/:path*", "/ingresar", "/registro"],
};
