import Link from "next/link";
import FormularioContacto from "./FormularioContacto";

export const metadata = {
  title: "Contacto",
  description: "Escribinos por pedidos, envíos o para que te ayudemos a elegir tu café.",
};

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
              Hacé el <Link href="/#elegi" className="text-tostado underline">test de café ideal</Link>: son cuatro preguntas.
            </dd>
          </div>
        </dl>
      </div>

      <FormularioContacto />
    </div>
  );
}
