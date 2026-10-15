"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Campo from "../components/Campo";
import ImagenProducto from "../components/ImagenProducto";
import { useCarrito } from "../components/carrito/ProveedorCarrito";
import { useSesion } from "../components/sesion/ProveedorSesion";
import { hayErrores } from "@/lib/auth";
import { formatearPrecio, PROMOS } from "@/lib/tienda";
import { MEDIOS_PAGO, PROVINCIAS, normalizarCheckout, validarCheckout } from "@/lib/validacion-checkout";

// true recién en el navegador: el carrito vive en localStorage y en el servidor siempre está vacío
const sinSuscripcion = () => () => {};
function useEnNavegador() {
  return useSyncExternalStore(sinSuscripcion, () => true, () => false);
}

export default function FormularioCheckout() {
  const router = useRouter();
  const enNavegador = useEnNavegador();
  const carrito = useCarrito();
  const { usuario } = useSesion();
  const [medioPago, setMedioPago] = useState("mercadopago");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false);

  if (!enNavegador) return <div className="mt-10 h-96" aria-hidden="true" />;

  if (carrito.unidades === 0 && !enviando) {
    return (
      <div className="mt-10 max-w-xl rounded-3xl bg-kraft/45 p-8">
        <p>Tu carrito está vacío.</p>
        <Link href="/productos" className="boton mt-6 inline-flex">
          Ver los cafés
        </Link>
      </div>
    );
  }

  const esTransferencia = medioPago === "transferencia";
  const totalFinal = esTransferencia ? carrito.totalTransferencia : carrito.totalAPagar;

  function leer(formulario) {
    return normalizarCheckout({ ...Object.fromEntries(new FormData(formulario)), medioPago });
  }

  // Después del primer intento, los mensajes se actualizan mientras escribís
  function alCambiar(evento) {
    if (!intentado) return;
    const nuevos = validarCheckout(leer(evento.currentTarget));
    setErrores(nuevos);
    if (!hayErrores(nuevos)) setErrorGeneral("");
  }

  async function alEnviar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = leer(formulario);
    const nuevos = validarCheckout(datos);
    setIntentado(true);
    setErrores(nuevos);
    setErrorGeneral("");
    if (hayErrores(nuevos)) {
      setErrorGeneral("Revisá los campos marcados.");
      formulario.elements.namedItem(Object.keys(nuevos)[0])?.focus?.();
      return;
    }

    setEnviando(true);
    try {
      // Se mandan solo los ítems (variante, molienda, cantidad): el servidor pone los precios
      const respuesta = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, items: carrito.items }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setErrores(resultado.errores ?? {});
        setErrorGeneral(resultado.error ?? "Revisá los campos marcados.");
        setEnviando(false);
        return;
      }
      // El pedido ya está guardado: el carrito se vacía
      carrito.vaciar();
      if (resultado.linkPago) window.location.assign(resultado.linkPago); // a Mercado Pago
      else router.push(`/seguimiento/${resultado.codigo}?nuevo=1`);
    } catch {
      setErrorGeneral("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <form noValidate onSubmit={alEnviar} onChange={alCambiar} className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="min-w-0 space-y-12">
        <fieldset className="space-y-6">
          <legend className="font-display text-2xl">Contacto</legend>
          {/* key: cuando llega la sesión, el campo se vuelve a armar con el email de la cuenta */}
          <Campo
            key={usuario?.email ?? "sin-sesion"}
            id="email"
            etiqueta="Email"
            type="email"
            autoComplete="email"
            defaultValue={usuario?.email ?? ""}
            ayuda="Lo usamos solo para avisarte sobre tu pedido."
            error={errores.email}
            required
          />
          {!usuario && (
            <p className="text-sm text-marron">
              ¿Tenés cuenta?{" "}
              <Link href="/ingresar?siguiente=/checkout" className="font-semibold text-tostado underline">
                Ingresá
              </Link>{" "}
              y el pedido también te queda en Mis pedidos.
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="font-display text-2xl">Envío</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Campo id="nombre" etiqueta="Nombre y apellido" autoComplete="name" error={errores.nombre} required />
            <Campo id="telefono" etiqueta="Teléfono" type="tel" autoComplete="tel" error={errores.telefono} required />
          </div>
          <Campo
            id="direccion"
            etiqueta="Dirección"
            autoComplete="street-address"
            ayuda="Calle, número, piso y departamento."
            error={errores.direccion}
            required
          />
          <div className="grid gap-6 sm:grid-cols-[1fr_1fr_0.7fr]">
            <Campo id="ciudad" etiqueta="Ciudad" autoComplete="address-level2" error={errores.ciudad} required />
            <Campo id="provincia" etiqueta="Provincia" como="select" defaultValue="" autoComplete="address-level1" error={errores.provincia} required>
              <option value="">Elegí</option>
              {PROVINCIAS.map((provincia) => (
                <option key={provincia}>{provincia}</option>
              ))}
            </Campo>
            <Campo id="codigoPostal" etiqueta="Código postal" autoComplete="postal-code" error={errores.codigoPostal} required />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl">Pago</legend>
          <div className="mt-6 space-y-3">
            {MEDIOS_PAGO.map((medio) => (
              <label
                key={medio.id}
                className={`flex cursor-pointer gap-4 rounded-2xl border-[1.5px] p-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                  medioPago === medio.id ? "border-tostado bg-kraft/45" : "border-marron/30 hover:border-tostado"
                }`}
              >
                <input
                  type="radio"
                  name="medioPago"
                  value={medio.id}
                  checked={medioPago === medio.id}
                  onChange={() => setMedioPago(medio.id)}
                  className="mt-1 h-4 w-4 accent-tostado"
                />
                <span>
                  <span className="font-semibold">{medio.nombre}</span>
                  <span className="block text-marron">{medio.detalle}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Resumen: se calcula con el mismo código que usa el servidor (lib/carrito.js) */}
      <aside aria-labelledby="titulo-resumen" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl bg-kraft/45 p-6 sm:p-8">
          <h2 id="titulo-resumen" className="font-display text-2xl">
            Tu pedido
          </h2>
          <ul className="mt-6 space-y-4">
            {carrito.lineas.map((linea) => (
              <li key={linea.clave} className="flex items-center gap-4">
                <div className="w-14 shrink-0 overflow-hidden rounded-xl">
                  <ImagenProducto producto={linea.producto} sizes="56px" miniatura />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{linea.producto.nombre}</p>
                  <p className="text-sm text-marron">
                    {linea.variante.nombre}
                    {linea.molienda && `, molienda ${linea.molienda}`}, x{linea.cantidad}
                  </p>
                </div>
                <p className="tabular-nums">{formatearPrecio(linea.total)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-1.5 border-t border-marron/20 pt-5 tabular-nums">
            <div className="flex justify-between">
              <dt>Productos</dt>
              <dd>{formatearPrecio(carrito.subtotal)}</dd>
            </div>
            {carrito.ahorroBundles > 0 && (
              <div className="flex justify-between font-semibold text-cereza">
                <dt>Descuento por bolsas</dt>
                <dd>−{formatearPrecio(carrito.ahorroBundles)}</dd>
              </div>
            )}
            {esTransferencia && (
              <div className="flex justify-between font-semibold text-cereza">
                <dt>Transferencia ({PROMOS.descuentoTransferencia}% OFF)</dt>
                <dd>−{formatearPrecio(carrito.ahorroTransferencia)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{carrito.costoEnvio === 0 ? "Gratis" : formatearPrecio(carrito.costoEnvio)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-xl font-semibold">
              <dt>Total</dt>
              <dd aria-live="polite">{formatearPrecio(totalFinal)}</dd>
            </div>
          </dl>

          {errorGeneral && (
            <p role="alert" className="mt-6 rounded-xl bg-cereza px-4 py-3 text-crema">
              {errorGeneral}{" "}
              {!hayErrores(errores) && (
                <Link href="/carrito" className="font-semibold underline">
                  Ir al carrito
                </Link>
              )}
            </p>
          )}
          <button type="submit" disabled={enviando} className="boton mt-6 w-full">
            {enviando ? "Procesando…" : esTransferencia ? "Confirmar pedido" : "Pagar con Mercado Pago"}
          </button>
          <p className="mt-3 text-center text-sm text-marron">
            {esTransferencia
              ? "Al confirmar te mostramos los datos para transferir."
              : "Te llevamos a Mercado Pago para pagar de forma segura."}
          </p>
        </div>
      </aside>
    </form>
  );
}
