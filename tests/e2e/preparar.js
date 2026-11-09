// Se corre una vez antes de todos los tests E2E: deja la base de prueba en un estado conocido.
import { randomBytes } from "node:crypto";
import { ADMIN, CLIENTE, baseDePrueba } from "./ayudantes.js";
import limpiar from "./limpiar.js";

// Stock del seed (supabase/seed.sql): los tests que confirman pagos lo descuentan, así que se repone
const STOCK_DEL_SEED = {
  101: 14, 102: 8, 103: 3, 201: 10, 202: 0, 203: 4, 301: 20, 302: 15, 303: 9,
  401: 12, 402: 6, 403: 2, 501: 25, 502: 18, 503: 11, 601: 30, 602: 22, 603: 14,
  701: 16, 801: 9, 901: 4, 1001: 12,
};

// Crea la cuenta si no existe y le pone la contraseña de esta corrida
async function asegurarUsuario(supabase, { email, nombre }, contrasena) {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existente = data.users.find((usuario) => usuario.email === email);
  if (existente) {
    const { error } = await supabase.auth.admin.updateUserById(existente.id, { password: contrasena });
    if (error) throw error;
    return existente.id;
  }
  const { data: creado, error } = await supabase.auth.admin.createUser({
    email,
    password: contrasena,
    email_confirm: true,
    user_metadata: { nombre },
  });
  if (error) throw error;
  return creado.user.id;
}

export default async function preparar() {
  const supabase = baseDePrueba();

  // Por si una corrida anterior se cortó a mitad de camino
  await limpiar();

  for (const [id, stock] of Object.entries(STOCK_DEL_SEED)) {
    const { error } = await supabase.from("variantes").update({ stock }).eq("id", Number(id));
    if (error) throw new Error(`No se pudo reponer el stock (¿corriste el seed en el proyecto de prueba?): ${error.message}`);
  }
  await supabase.from("productos").update({ activo: true }).lte("id", 10);

  // Una contraseña al azar por corrida: los tests la leen de esta variable (pasa a los procesos de los tests)
  process.env.E2E_CONTRASENA = randomBytes(12).toString("base64url") + "1a";
  const idAdmin = await asegurarUsuario(supabase, ADMIN, process.env.E2E_CONTRASENA);
  await asegurarUsuario(supabase, CLIENTE, process.env.E2E_CONTRASENA);
  // El trigger crear_perfil arma el perfil como "cliente": al admin se le cambia el rol
  const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", idAdmin);
  if (error) throw error;
}
