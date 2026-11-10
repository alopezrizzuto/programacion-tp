-- 006_limites.sql: largos máximos en la base (auditoría de seguridad).
-- La API ya valida estos máximos (lib/validacion-checkout.js, lib/email.js, lib/auth.js), pero la base
-- es la última barrera: aunque alguien llame a la API saltando el formulario, o use la clave pública
-- directo contra Supabase, no puede guardar textos enormes (por ejemplo, una "ciudad" de varios MB).
-- Los límites coinciden con los del formulario, así que ningún pedido válido queda afuera.

alter table public.ordenes
  add constraint ordenes_email_largo check (char_length(email) <= 254),
  add constraint ordenes_envio_nombre_largo check (char_length(envio_nombre) <= 80),
  add constraint ordenes_envio_telefono_largo check (char_length(envio_telefono) <= 20),
  add constraint ordenes_envio_direccion_largo check (char_length(envio_direccion) <= 120),
  add constraint ordenes_envio_ciudad_largo check (char_length(envio_ciudad) <= 80),
  add constraint ordenes_envio_provincia_largo check (char_length(envio_provincia) <= 60),
  add constraint ordenes_envio_codigo_postal_largo check (char_length(envio_codigo_postal) <= 8);

-- El nombre del perfil se puede cambiar directo con la clave pública (permiso de columna en 002):
-- mismo límite que el formulario de registro
alter table public.profiles
  add constraint profiles_nombre_largo check (nombre is null or char_length(nombre) <= 60);
