// Se corre al terminar los tests E2E (y al empezar, por si una corrida se cortó):
// borra lo que crearon los tests. Las cuentas fijas (admin y cliente de prueba) se mantienen.
import { ADMIN, CLIENTE, DOMINIO, baseDePrueba } from "./ayudantes.js";

export default async function limpiar() {
  const supabase = baseDePrueba();

  // Pedidos (sus ítems se borran en cascada) y mensajes de contacto de los tests
  await supabase.from("ordenes").delete().like("email", `%@${DOMINIO}`);
  await supabase.from("mensajes").delete().like("email", `%@${DOMINIO}`);
  // Productos creados desde el admin en los tests (variantes y reseñas en cascada)
  await supabase.from("productos").delete().like("slug", "e2e-%");

  // Cuentas creadas por el test de registro
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const fijas = [ADMIN.email, CLIENTE.email];
  for (const usuario of data?.users ?? []) {
    if (usuario.email?.endsWith(`@${DOMINIO}`) && !fijas.includes(usuario.email)) {
      await supabase.auth.admin.deleteUser(usuario.id);
    }
  }
}
