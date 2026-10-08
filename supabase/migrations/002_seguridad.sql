-- 002_seguridad.sql: Row Level Security (RLS).
-- Con RLS activado, la base solo devuelve o modifica las filas que una política permite.
-- Así, aunque alguien saltee la página y llame directo a la API de Supabase, los datos quedan protegidos.

-- ¿El usuario actual es admin? security definer: lee profiles sin pasar por sus propias políticas
-- (si no, una política de profiles que consulta profiles se llamaría a sí misma sin fin).
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.productos enable row level security;
alter table public.variantes enable row level security;
alter table public.resenas enable row level security;
alter table public.profiles enable row level security;
alter table public.ordenes enable row level security;
alter table public.orden_items enable row level security;

-- Catálogo: cualquiera ve los productos activos; el admin ve todos y es el único que modifica.
create policy "productos: lectura pública de activos" on public.productos
  for select to anon, authenticated
  using (activo or public.es_admin());
create policy "productos: el admin modifica" on public.productos
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "variantes: lectura de productos visibles" on public.variantes
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id and (p.activo or public.es_admin())));
create policy "variantes: el admin modifica" on public.variantes
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "resenas: lectura pública" on public.resenas
  for select to anon, authenticated
  using (true);
create policy "resenas: el admin modifica" on public.resenas
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Perfiles: cada uno ve el suyo (el admin, todos). Solo se puede cambiar el nombre propio:
-- la columna role no se puede tocar desde la API (se cambia por SQL, ver README).
create policy "profiles: ver el propio" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy "profiles: editar el propio" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (nombre) on public.profiles to authenticated;

-- Órdenes: cada cliente ve las suyas; el admin ve todas y puede cambiar el estado.
-- Las crea el servidor en E6 (con la clave secreta), por eso no hay política de insert para usuarios.
create policy "ordenes: ver las propias" on public.ordenes
  for select to authenticated
  using (user_id = auth.uid() or public.es_admin());
create policy "ordenes: el admin actualiza" on public.ordenes
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "orden_items: ver los de mis órdenes" on public.orden_items
  for select to authenticated
  using (exists (select 1 from public.ordenes o where o.id = orden_id and (o.user_id = auth.uid() or public.es_admin())));
