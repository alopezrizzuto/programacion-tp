"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PERFILES, TOSTADOS, nombrePeso } from "@/lib/productos";
import { LARGO_MAXIMO_BUSQUEDA, NIVELES, PESOS } from "@/lib/catalogo";

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Panel de filtros del catálogo. Es un formulario GET común: sin JavaScript, "Ver resultados" lo envía
// y la URL queda con los filtros. Con JavaScript, cada cambio se aplica solo (la búsqueda por texto,
// cuando dejás de escribir) y la página se vuelve a armar en el servidor con los resultados.
// El estado de los filtros vive en la URL, no en React: se puede compartir el link y "atrás" funciona.
export default function FiltrosCatalogo({ filtros, errores, paises, cantidadActivos }) {
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const formulario = useRef(null);
  const espera = useRef(null);
  const ultimaUrl = useRef(parametros.toString());
  const [abierto, setAbierto] = useState(false); // en el celular el panel arranca cerrado
  const [pendiente, iniciarTransicion] = useTransition();

  // Arma la URL con lo que tiene el formulario (sin los campos vacíos) y navega sin recargar ni mover el scroll
  function aplicar() {
    clearTimeout(espera.current);
    const nuevos = new URLSearchParams();
    for (const [clave, valor] of new FormData(formulario.current)) {
      if (String(valor).trim() !== "") nuevos.append(clave, String(valor).trim());
    }
    ultimaUrl.current = nuevos.toString();
    // startTransition: React sigue respondiendo mientras el servidor arma los resultados nuevos
    iniciarTransicion(() => router.replace(nuevos.size ? `${ruta}?${nuevos}` : ruta, { scroll: false }));
  }

  function alCambiar(evento) {
    // En los campos de texto se espera a que la persona deje de escribir
    if (evento.target.type === "search" || evento.target.type === "number") {
      clearTimeout(espera.current);
      espera.current = setTimeout(aplicar, 400);
    } else {
      aplicar();
    }
  }

  // Si la URL cambió desde afuera ("atrás", "Limpiar filtros"), el formulario copia lo que dice la URL
  useEffect(() => {
    const actual = parametros.toString();
    if (actual === ultimaUrl.current) return;
    ultimaUrl.current = actual;
    for (const campo of formulario.current.elements) {
      if (!campo.name) continue;
      if (campo.type === "checkbox") campo.checked = parametros.getAll(campo.name).includes(campo.value);
      else campo.value = parametros.get(campo.name) ?? "";
    }
  }, [parametros]);

  useEffect(() => () => clearTimeout(espera.current), []);

  const listaErrores = Object.values(errores);

  return (
    <aside aria-label="Filtros del catálogo" className="lg:self-start">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="panel-filtros"
        onClick={() => setAbierto(!abierto)}
        className="boton-secundario w-full justify-between lg:hidden"
      >
        Filtros{cantidadActivos > 0 && ` (${cantidadActivos})`}
        <span aria-hidden="true">{abierto ? "−" : "+"}</span>
      </button>

      <form
        ref={formulario}
        id="panel-filtros"
        action={ruta}
        onChange={alCambiar}
        onSubmit={(evento) => {
          evento.preventDefault();
          aplicar();
          setAbierto(false);
        }}
        className={`${abierto ? "block" : "hidden"} mt-4 space-y-6 rounded-3xl bg-kraft/45 p-5 lg:mt-0 lg:block`}
      >
        {listaErrores.length > 0 && (
          <ul role="alert" className="space-y-1 rounded-xl bg-cereza px-4 py-3 text-sm text-crema">
            {listaErrores.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div>
          <label htmlFor="q" className="font-semibold">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filtros.q}
            maxLength={LARGO_MAXIMO_BUSQUEDA}
            placeholder="Nombre, origen o notas"
            className="mt-2 w-full rounded-xl border border-marron/40 bg-crema px-3 py-2"
          />
        </div>

        <GrupoCasillas titulo="Perfil" nombre="perfil" elegidos={filtros.perfil}
          opciones={PERFILES.map((perfil) => ({ valor: perfil.id, texto: perfil.plural }))} />
        <GrupoCasillas titulo="Tostado" nombre="tostado" elegidos={filtros.tostado}
          opciones={TOSTADOS.map((tostado) => ({ valor: tostado, texto: capitalizar(tostado) }))} />
        <GrupoCasillas titulo="Acidez" nombre="acidez" elegidos={filtros.acidez}
          opciones={NIVELES.map((nivel) => ({ valor: nivel.id, texto: nivel.nombre }))} />
        <GrupoCasillas titulo="Cuerpo" nombre="cuerpo" elegidos={filtros.cuerpo}
          opciones={NIVELES.map((nivel) => ({ valor: nivel.id, texto: nivel.nombre }))} />
        <GrupoCasillas titulo="Origen" nombre="origen" elegidos={filtros.origen}
          opciones={paises.map((pais) => ({ valor: pais, texto: pais }))} />
        <GrupoCasillas titulo="Peso de la bolsa" nombre="peso" elegidos={filtros.peso.map(String)}
          opciones={PESOS.map((peso) => ({ valor: String(peso), texto: nombrePeso(peso) }))} />

        <fieldset>
          <legend className="font-semibold">Precio</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="precioMin" className="text-sm text-marron">Desde $</label>
              <input id="precioMin" name="precioMin" type="number" inputMode="numeric" min="0" step="1000"
                defaultValue={filtros.precioMin ?? ""} aria-invalid={Boolean(errores.precioMin)}
                className="mt-1 w-full rounded-xl border border-marron/40 bg-crema px-3 py-2 tabular-nums" />
            </div>
            <div>
              <label htmlFor="precioMax" className="text-sm text-marron">Hasta $</label>
              <input id="precioMax" name="precioMax" type="number" inputMode="numeric" min="0" step="1000"
                defaultValue={filtros.precioMax ?? ""} aria-invalid={Boolean(errores.precioMax)}
                className="mt-1 w-full rounded-xl border border-marron/40 bg-crema px-3 py-2 tabular-nums" />
            </div>
          </div>
        </fieldset>

        <label className="flex items-center gap-3 font-semibold">
          <input type="checkbox" name="stock" value="1" defaultChecked={filtros.conStock} className="h-5 w-5 accent-tostado" />
          Solo con stock
        </label>

        <div className="space-y-3">
          <button type="submit" className="boton w-full">
            {pendiente ? "Buscando…" : "Ver resultados"}
          </button>
          {cantidadActivos > 0 && (
            <Link href={ruta} scroll={false} className="block text-center text-sm underline underline-offset-4">
              Limpiar filtros
            </Link>
          )}
        </div>
      </form>
    </aside>
  );
}

// Un grupo de casillas (fieldset + legend: el lector de pantalla lee "Perfil, Frutales, casilla").
// Se ven como pastillas: la casilla real queda oculta a la vista (sr-only) pero sigue funcionando con
// teclado y lector de pantalla; has-[:checked] pinta la pastilla cuando está tildada.
function GrupoCasillas({ titulo, nombre, opciones, elegidos }) {
  return (
    <fieldset>
      <legend className="font-semibold">{titulo}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((opcion) => (
          <label
            key={opcion.valor}
            className="cursor-pointer rounded-full border border-marron/40 bg-crema px-3.5 py-1.5 text-sm transition-colors hover:border-tostado has-[:checked]:border-tostado has-[:checked]:bg-tostado has-[:checked]:text-crema has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tostado has-[:focus-visible]:ring-offset-2"
          >
            <input
              type="checkbox"
              name={nombre}
              value={opcion.valor}
              defaultChecked={elegidos.includes(opcion.valor)}
              className="sr-only"
            />
            {opcion.texto}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
