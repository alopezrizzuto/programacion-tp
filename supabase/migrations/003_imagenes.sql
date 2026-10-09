-- 003_imagenes.sql: lugar para guardar las fotos de los productos (Supabase Storage).
-- Un "bucket" es una carpeta de archivos. Este es público para leer (las fotos se ven en la tienda),
-- pero solo un admin puede subir, reemplazar o borrar archivos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 4194304, array['image/jpeg', 'image/png', 'image/webp']);

-- Storage también usa RLS: cada archivo es una fila de storage.objects
create policy "imagenes: el admin sube" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and public.es_admin());
create policy "imagenes: el admin reemplaza" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and public.es_admin());
create policy "imagenes: el admin borra" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and public.es_admin());
