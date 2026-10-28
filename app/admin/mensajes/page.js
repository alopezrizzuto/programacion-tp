import MarcarLeido from "./MarcarLeido";
import { adminDePagina } from "@/lib/admin";
import { MOTIVOS } from "@/lib/validacion-contacto";

export const metadata = {
  title: "Mensajes",
};

// Mensajes del formulario de contacto, del más nuevo al más viejo. Los no leídos se destacan.
export default async function AdminMensajesPage() {
  const supabase = await adminDePagina();
  const { data: mensajes } = await supabase.from("mensajes").select("*").order("created_at", { ascending: false }).limit(100);
  const sinLeer = mensajes.filter((mensaje) => !mensaje.leido).length;

  return (
    <div>
      <h1 className="font-display text-5xl">Mensajes</h1>
      <p className="mt-3 text-marron">
        {mensajes.length === 0
          ? "Todavía no llegó ningún mensaje del formulario de contacto."
          : `${sinLeer} sin leer de ${mensajes.length}.`}
      </p>

      <ul className="mt-8 space-y-4">
        {mensajes.map((mensaje) => (
          <li
            key={mensaje.id}
            className={`rounded-3xl p-5 sm:p-6 ${mensaje.leido ? "bg-kraft/20 ring-1 ring-marron/15" : "bg-kraft/45"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold">{mensaje.nombre}</span>
                  {!mensaje.leido && <span className="rounded-full bg-tostado px-3 py-0.5 text-sm text-crema">Nuevo</span>}
                </p>
                <p className="mt-1 text-sm text-marron">
                  <a href={`mailto:${mensaje.email}`} className="underline">
                    {mensaje.email}
                  </a>
                  {", "}
                  {MOTIVOS.find((motivo) => motivo.id === mensaje.motivo)?.nombre}
                  {", "}
                  {new Date(mensaje.created_at).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Argentina/Buenos_Aires",
                  })}
                </p>
              </div>
              <MarcarLeido mensaje={{ id: mensaje.id, leido: mensaje.leido }} />
            </div>
            <p className="mt-4 whitespace-pre-line">{mensaje.mensaje}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
