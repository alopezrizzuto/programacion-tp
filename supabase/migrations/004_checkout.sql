-- 004_checkout.sql: lo que necesita el checkout (compra con email, envío, medios de pago y seguimiento).
-- Las órdenes se crean y se actualizan solo desde el servidor, con la clave secreta
-- (POST /api/ordenes y el webhook de Mercado Pago). Por eso no hay políticas de insert para usuarios.

-- Se puede comprar sin cuenta: user_id queda en null y el pedido se sigue con su código.
-- Si se borra un usuario, sus pedidos quedan (sin usuario) en lugar de impedir el borrado.
alter table public.ordenes alter column user_id drop not null;
alter table public.ordenes drop constraint ordenes_user_id_fkey;
alter table public.ordenes
  add constraint ordenes_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null;

-- Estados del pedido, en orden: pendiente → pagada → enviada → entregada (o rechazada / cancelada)
alter table public.ordenes drop constraint ordenes_estado_check;
alter table public.ordenes add constraint ordenes_estado_check
  check (estado in ('pendiente', 'pagada', 'rechazada', 'cancelada', 'enviada', 'entregada'));

-- La tabla todavía no tiene filas, así que las columnas nuevas pueden ser obligatorias
alter table public.ordenes
  add column codigo text not null unique check (codigo ~ '^OC-[A-Z0-9]{10}$'),
  add column email text not null,
  add column medio_pago text not null check (medio_pago in ('mercadopago', 'transferencia')),
  add column envio_nombre text not null,
  add column envio_telefono text not null,
  add column envio_direccion text not null,
  add column envio_ciudad text not null,
  add column envio_provincia text not null,
  add column envio_codigo_postal text not null,
  -- Montos en pesos: total = subtotal - descuento_bundles - descuento_transferencia + costo_envio
  add column subtotal integer not null check (subtotal >= 0),
  add column descuento_bundles integer not null default 0 check (descuento_bundles >= 0),
  add column descuento_transferencia integer not null default 0 check (descuento_transferencia >= 0),
  add column costo_envio integer not null default 0 check (costo_envio >= 0),
  -- Link de pago de Mercado Pago, para volver a intentar si el pago no salió
  add column mp_link text;

-- Cada ítem guarda cómo se llamaba el producto al comprarlo ("Kenia AA, 250 g"),
-- así el pedido se sigue leyendo bien aunque después se edite el producto.
alter table public.orden_items add column descripcion text not null;

-- Confirma el pago de un pedido y descuenta el stock, todo en una sola transacción:
-- o pasan las dos cosas o ninguna. Si el pedido ya estaba pagado, no hace nada
-- (Mercado Pago puede avisar dos veces el mismo pago: el stock no se descuenta dos veces).
create function public.confirmar_pago(p_orden_id bigint, p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado text;
begin
  -- "for update" bloquea la fila: si llegan dos avisos a la vez, el segundo espera al primero
  select estado into v_estado from public.ordenes where id = p_orden_id for update;
  if v_estado is null or v_estado not in ('pendiente', 'rechazada') then
    return false;
  end if;

  update public.variantes v
  set stock = greatest(v.stock - i.cantidad, 0)
  from (
    select variante_id, sum(cantidad) as cantidad
    from public.orden_items
    where orden_id = p_orden_id
    group by variante_id
  ) i
  where v.id = i.variante_id;

  update public.ordenes
  set estado = 'pagada', mp_payment_id = coalesce(p_payment_id, mp_payment_id)
  where id = p_orden_id;

  return true;
end;
$$;

-- Solo el servidor (clave secreta) puede llamarla: ni visitantes ni usuarios conectados
revoke execute on function public.confirmar_pago(bigint, text) from public, anon, authenticated;
grant execute on function public.confirmar_pago(bigint, text) to service_role;
