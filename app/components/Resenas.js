import Estrellas from "./Estrellas";
import { promedioResenas } from "@/lib/productos";

// Reseñas de un producto: promedio, cuántas hay de cada puntaje y la lista.
export default function Resenas({ producto }) {
  const promedio = promedioResenas(producto);
  const total = producto.resenas.length;
  const porPuntaje = [5, 4, 3, 2, 1].map((puntaje) => ({
    puntaje,
    cantidad: producto.resenas.filter((resena) => resena.puntaje === puntaje).length,
  }));

  if (total === 0) {
    return (
      <section id="resenas" aria-labelledby="titulo-resenas" className="scroll-mt-24">
        <h2 id="titulo-resenas" className="font-display text-4xl leading-none sm:text-5xl">
          Reseñas
        </h2>
        <p className="mt-6 text-lg text-marron">Todavía no hay reseñas de este producto.</p>
      </section>
    );
  }

  return (
    <section id="resenas" aria-labelledby="titulo-resenas" className="scroll-mt-24">
      <h2 id="titulo-resenas" className="font-display text-4xl leading-none sm:text-5xl">
        Reseñas
      </h2>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-display text-7xl leading-none">
            {promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 })}
          </p>
          <Estrellas puntaje={promedio} className="mt-3 h-5 w-5" />
          <p className="mt-2 text-marron">Promedio de {total} reseñas</p>
          <dl className="mt-6 space-y-2">
            {porPuntaje.map(({ puntaje, cantidad }) => (
              <div key={puntaje} className="flex items-center gap-3 text-[15px]">
                <dt className="w-24 shrink-0 whitespace-nowrap">{puntaje} {puntaje === 1 ? "estrella" : "estrellas"}</dt>
                <dd className="flex flex-1 items-center gap-3">
                  <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-kraft/70">
                    <span className="block h-full rounded-full bg-tostado" style={{ width: `${(cantidad / total) * 100}%` }} />
                  </span>
                  <span className="w-4 text-right tabular-nums">{cantidad}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {producto.resenas.map((resena) => (
            <li key={resena.autor} className="rounded-3xl bg-kraft/45 p-6">
              <Estrellas puntaje={resena.puntaje} />
              <p className="mt-3 text-lg leading-snug">{resena.texto}</p>
              <p className="mt-4 text-marron">{resena.autor}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
