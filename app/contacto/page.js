import Link from "next/link";
import Campo from "../components/Campo";

export const metadata = {
  title: "Contacto",
  description: "Escribinos por pedidos, envíos o para que te ayudemos a elegir tu café.",
};

const MOTIVOS = ["Quiero ayuda para elegir un café", "Consulta sobre mi pedido", "Envíos", "Ventas por mayor", "Otro"];

export default function ContactoPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">Hablemos de café</h1>
        <p className="mt-6 max-w-md text-marron">
          Respondemos en el día hábil. Si no sabés qué café elegir, contanos cómo lo preparás y te recomendamos uno.
        </p>

        <dl className="mt-10 space-y-6">
          <div>
            <dt className="font-semibold">Email</dt>
            <dd className="text-marron">hola@origencafe.com.ar</dd>
          </div>
          <div>
            <dt className="font-semibold">Horario de atención</dt>
            <dd className="text-marron">Lunes a viernes de 9 a 18 h</dd>
          </div>
          <div>
            <dt className="font-semibold">¿Buscás tu café?</dt>
            <dd className="text-marron">
              Hacé el <Link href="/#elegi" className="text-tostado underline">test de café ideal</Link>: son tres clics.
            </dd>
          </div>
        </dl>
      </div>

      <form className="space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-10">
        <Campo id="nombre" etiqueta="Nombre" autoComplete="name" />
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" />
        <div>
          <label htmlFor="motivo" className="text-sm font-semibold">Motivo</label>
          <select id="motivo" name="motivo" className="mt-2 w-full rounded-xl border border-marron/40 bg-crema px-4 py-3">
            {MOTIVOS.map((motivo) => (
              <option key={motivo}>{motivo}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mensaje" className="text-sm font-semibold">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={5}
            className="mt-2 w-full rounded-xl border border-marron/40 bg-crema px-4 py-3"
          />
        </div>
        <div>
          {/* El envío del formulario (validación + fetch) se implementa en E3 */}
          <button type="submit" disabled className="boton w-full">
            Enviar mensaje
          </button>
          <p className="mt-2 text-center text-sm text-marron">El envío se habilita en la próxima etapa del proyecto.</p>
        </div>
      </form>
    </div>
  );
}
