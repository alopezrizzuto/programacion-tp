import Link from "next/link";
import { notFound } from "next/navigation";
import { ActualizarSolo, BotonCopiarLink } from "./AccionesSeguimiento";
import { crearClienteSecreto } from "@/lib/supabase/secreto";
import { ESTADOS, FORMATO_CODIGO, PASOS_SEGUIMIENTO } from "@/lib/ordenes";
import { DATOS_TRANSFERENCIA, PROMOS, formatearPrecio } from "@/lib/tienda";

export async function generateMetadata({ params }) {
  return { title: `Pedido ${(await params).codigo}`, robots: { index: false } };
}

// "a****@hotmail.com": el email se muestra a medias, alcanza para reconocerlo
function ocultarEmail(email) {
  const [usuario, dominio] = email.split("@");
  return `${usuario[0]}${"*".repeat(Math.max(usuario.length - 1, 3))}@${dominio}`;
}

// Página del pedido. El código es la "llave": quien lo tiene ve el pedido, sin necesitar cuenta.
// Se lee con la clave secreta (el pedido puede no tener usuario), pero solo por código exacto.
// ?nuevo=1 viene del checkout; ?pago=aprobado|pendiente|rechazado, de la vuelta de Mercado Pago.
export default async function PedidoPage({ params, searchParams }) {
  const { codigo } = await params;
  const { nuevo, pago } = await searchParams;
  if (!FORMATO_CODIGO.test(codigo)) notFound();

  const { data: orden } = await crearClienteSecreto()
    .from("ordenes")
    .select("*, orden_items(id, descripcion, molienda, cantidad, precio_unitario)")
    .eq("codigo", codigo)
    .maybeSingle();
  if (!orden) notFound();

  const esperandoPago = ["pendiente", "rechazada"].includes(orden.estado);
  const esMercadoPago = orden.medio_pago === "mercadopago";
  // Volvió de Mercado Pago con el pago aprobado, pero el webhook todavía no lo confirmó
  const confirmando = pago === "aprobado" && orden.estado === "pendiente";
  const paso = PASOS_SEGUIMIENTO.findIndex((p) => p.estado === orden.estado);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {confirmando && <ActualizarSolo />}

      <p className="text-marron">
        {new Date(orden.created_at).toLocaleDateString("es-AR", {
          dateStyle: "long",
          timeZone: "America/Argentina/Buenos_Aires",
        })}
      </p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">Pedido {orden.codigo}</h1>

      {/* Aviso según de dónde viene la persona */}
      <div role="status" className="mt-8 empty:hidden">
        {pago === "aprobado" && orden.estado !== "pendiente" && !esperandoPago && (
          <Aviso tono="bien" titulo="¡Pago aprobado!">
            Ya estamos preparando tu pedido. Acá vas a ver cuando salga.
          </Aviso>
        )}
        {confirmando && (
          <Aviso titulo="Estamos confirmando tu pago">
            Mercado Pago ya lo aprobó y en unos segundos se actualiza esta página.
          </Aviso>
        )}
        {pago === "pendiente" && orden.estado === "pendiente" && (
          <Aviso titulo="Tu pago está pendiente">
            Cuando Mercado Pago lo acredite, el pedido pasa a pagado. No hace falta que hagas nada más.
          </Aviso>
        )}
        {pago === "rechazado" && esperandoPago && (
          <Aviso tono="mal" titulo="El pago no se completó">
            No se cobró nada. Podés volver a intentarlo con otra tarjeta o medio de pago.
          </Aviso>
        )}
        {nuevo && orden.medio_pago === "transferencia" && (
          <Aviso tono="bien" titulo="¡Recibimos tu pedido!">
            Transferí el total con los datos de abajo y lo preparamos apenas se acredite.
          </Aviso>
        )}
      </div>

      <section aria-labelledby="titulo-codigo" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-tostado p-6 text-crema">
        <div>
          <h2 id="titulo-codigo" className="text-kraft">
            Tu código de seguimiento
          </h2>
          <p className="font-display text-3xl tracking-wide">{orden.codigo}</p>
          <p className="mt-1 text-sm text-kraft">Guardalo: con él podés ver este pedido cuando quieras, en Seguí tu pedido.</p>
        </div>
        <div className="text-crema">
          <BotonCopiarLink />
        </div>
      </section>

      {/* Estado */}
      <section aria-labelledby="titulo-estado" className="mt-12">
        <h2 id="titulo-estado" className="font-display text-3xl">
          Estado: {ESTADOS[orden.estado].nombre}
        </h2>
        {paso >= 0 ? (
          <ol className="mt-6 grid gap-3 sm:grid-cols-4">
            {PASOS_SEGUIMIENTO.map((p, i) => (
              <li
                key={p.estado}
                aria-current={i === paso ? "step" : undefined}
                className={`rounded-2xl px-4 py-3 ${i <= paso ? "bg-tostado text-crema" : "bg-kraft/45 text-marron"}`}
              >
                <span className="sr-only">{i <= paso ? "Hecho: " : "Pendiente: "}</span>
                {p.nombre}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-marron">
            {orden.estado === "rechazada"
              ? "El último intento de pago fue rechazado."
              : "Este pedido se canceló. Si tenés dudas, escribinos desde Contacto."}
          </p>
        )}
      </section>

      {/* Cómo pagar, si todavía falta */}
      {esperandoPago && esMercadoPago && orden.mp_link && (
        <section aria-labelledby="titulo-pagar" className="mt-10 rounded-3xl bg-kraft/45 p-6">
          <h2 id="titulo-pagar" className="font-display text-2xl">
            Falta el pago
          </h2>
          <p className="mt-2 text-marron">Total a pagar: {formatearPrecio(orden.total)}, hasta {PROMOS.cuotasSinInteres} cuotas sin interés.</p>
          <a href={orden.mp_link} className="boton mt-5 inline-flex">
            Pagar con Mercado Pago
          </a>
        </section>
      )}
      {orden.estado === "pendiente" && !esMercadoPago && (
        <section aria-labelledby="titulo-transferir" className="mt-10 rounded-3xl bg-kraft/45 p-6">
          <h2 id="titulo-transferir" className="font-display text-2xl">
            Datos para transferir
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
            <dt className="text-marron">Monto</dt>
            <dd className="font-semibold tabular-nums">{formatearPrecio(orden.total)}</dd>
            <dt className="text-marron">Alias</dt>
            <dd className="font-semibold">{DATOS_TRANSFERENCIA.alias}</dd>
            <dt className="text-marron">CBU</dt>
            <dd className="font-semibold tabular-nums">{DATOS_TRANSFERENCIA.cbu}</dd>
            <dt className="text-marron">Titular</dt>
            <dd className="font-semibold">{DATOS_TRANSFERENCIA.titular}</dd>
            <dt className="text-marron">Referencia</dt>
            <dd className="font-semibold">{orden.codigo}</dd>
          </dl>
          <p className="mt-4 text-sm text-marron">
            Poné el código como referencia. Si no recibimos la transferencia en {DATOS_TRANSFERENCIA.plazoHoras} horas, el
            pedido se cancela. Son datos de ejemplo: es una tienda de demostración.
          </p>
        </section>
      )}

      {/* Detalle */}
      <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="titulo-productos" className="min-w-0">
          <h2 id="titulo-productos" className="font-display text-2xl">
            Productos
          </h2>
          <ul className="mt-4 divide-y divide-marron/20">
            {orden.orden_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <span>
                  {item.descripcion}
                  <span className="block text-sm text-marron">
                    {item.molienda ? `Molienda ${item.molienda}, ` : ""}x{item.cantidad} de {formatearPrecio(item.precio_unitario)}
                  </span>
                </span>
                <span className="tabular-nums">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t border-marron/20 pt-4 tabular-nums">
            {orden.descuento_bundles > 0 && <Fila dato="Descuento por bolsas" valor={-orden.descuento_bundles} />}
            {orden.descuento_transferencia > 0 && <Fila dato="Descuento por transferencia" valor={-orden.descuento_transferencia} />}
            <Fila dato="Envío" valor={orden.costo_envio} gratis />
            <div className="flex justify-between pt-1 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatearPrecio(orden.total)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="titulo-envio" className="min-w-0">
          <h2 id="titulo-envio" className="font-display text-2xl">
            Envío
          </h2>
          <address className="mt-4 not-italic leading-relaxed">
            {orden.envio_nombre}
            <br />
            {orden.envio_direccion}
            <br />
            {orden.envio_ciudad}, {orden.envio_provincia} ({orden.envio_codigo_postal})
          </address>
          <p className="mt-4 text-sm text-marron">Avisos a {ocultarEmail(orden.email)}</p>
          <p className="mt-1 text-sm text-marron">
            Pago con {esMercadoPago ? "Mercado Pago" : "transferencia"}
          </p>
        </section>
      </div>

      <p className="mt-14">
        <Link href="/productos" className="font-semibold underline">
          Seguir comprando
        </Link>
      </p>
    </div>
  );
}

function Aviso({ tono = "neutro", titulo, children }) {
  const estilos = { bien: "bg-tostado text-crema", mal: "bg-cereza text-crema", neutro: "bg-kraft text-tostado" };
  return (
    <div className={`rounded-2xl px-5 py-4 ${estilos[tono]}`}>
      <p className="font-semibold">{titulo}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}

function Fila({ dato, valor, gratis = false }) {
  return (
    <div className={`flex justify-between ${valor < 0 ? "font-semibold text-cereza" : ""}`}>
      <dt>{dato}</dt>
      <dd>{gratis && valor === 0 ? "Gratis" : valor < 0 ? `−${formatearPrecio(-valor)}` : formatearPrecio(valor)}</dd>
    </div>
  );
}
