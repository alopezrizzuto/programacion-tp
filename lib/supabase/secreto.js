import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con la clave SECRETA: saltea RLS, así que se usa solo en el servidor
// y solo para lo que no puede depender de la sesión del usuario:
// crear órdenes (se puede comprar sin cuenta), el webhook de Mercado Pago (no trae sesión)
// y el seguimiento por código. La variable no empieza con NEXT_PUBLIC_: nunca llega al navegador.
export function crearClienteSecreto() {
  if (!process.env.SUPABASE_SECRET_KEY) throw new Error("Falta la variable SUPABASE_SECRET_KEY.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
