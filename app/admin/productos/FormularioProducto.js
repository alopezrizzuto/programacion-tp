"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Campo from "../../components/Campo";
import SubirImagen from "./SubirImagen";
import { PERFILES, TOSTADOS } from "@/lib/productos";
import { hayErrores } from "@/lib/auth";
import { crearSlug, normalizarProducto, validarProducto } from "@/lib/validacion-producto";

// Cada fila de variante necesita una clave estable para React (las nuevas todavía no tienen id)
let ultimaClave = 0;
const nuevaClave = () => `nueva-${++ultimaClave}`;

function variantesIniciales(categoria) {
  return categoria === "cafe"
    ? [250, 500, 1000].map((peso) => ({ clave: nuevaClave(), peso_gramos: peso, precio: "", stock: "" }))
    : [{ clave: nuevaClave(), nombre: "Unidad", precio: "", stock: "" }];
}

// Las listas se escriben en un texto (separadas por coma o una por línea) y acá se vuelven arreglos
const separar = (texto, separador) => String(texto ?? "").split(separador);
function leerEspecificaciones(texto) {
  return separar(texto, "\n")
    .filter((linea) => linea.trim())
    .map((linea) => {
      const dosPuntos = linea.indexOf(":");
      return dosPuntos === -1 ? [linea, ""] : [linea.slice(0, dosPuntos), linea.slice(dosPuntos + 1)];
    });
}

// Formulario para crear (sin `producto`) o editar un producto con sus variantes.
// Casi todos los campos son "no controlados": React no guarda cada tecla, se leen del formulario
// con FormData al validar. En estado quedan solo los datos que cambian lo que se muestra.
export default function FormularioProducto({ producto }) {
  const router = useRouter();
  const editando = Boolean(producto);
  const [categoria, setCategoria] = useState(producto?.categoria ?? "cafe");
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [slug, setSlug] = useState(producto?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(editando); // al editar, la dirección no cambia sola
  const [imagenUrl, setImagenUrl] = useState(producto?.imagen_url ?? null);
  const [variantes, setVariantes] = useState(
    () => producto?.variantes.map((variante) => ({ clave: variante.id, ...variante })) ?? variantesIniciales("cafe"),
  );
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const esCafe = categoria === "cafe";

  function leer(formulario) {
    const datos = new FormData(formulario);
    return normalizarProducto({
      ...Object.fromEntries(datos),
      categoria,
      imagen_url: imagenUrl,
      activo: datos.get("activo") === "on",
      notas: separar(datos.get("notas"), ","),
      beneficios: separar(datos.get("beneficios"), "\n"),
      especificaciones: leerEspecificaciones(datos.get("especificaciones")),
      variantes: variantes.map((variante, i) => ({
        id: variante.id,
        nombre: datos.get(`variantes.${i}.nombre`),
        peso_gramos: datos.get(`variantes.${i}.peso_gramos`),
        precio: datos.get(`variantes.${i}.precio`),
        stock: datos.get(`variantes.${i}.stock`),
      })),
    });
  }

  function alCambiarNombre(evento) {
    setNombre(evento.target.value);
    if (!slugEditado) setSlug(crearSlug(evento.target.value));
  }

  function elegirCategoria(nueva) {
    setCategoria(nueva);
    setVariantes(variantesIniciales(nueva));
    setErrores({});
  }

  function agregarVariante() {
    setVariantes([...variantes, { clave: nuevaClave(), nombre: "", precio: "", stock: "" }]);
  }

  function quitarVariante(clave) {
    setVariantes(variantes.filter((variante) => variante.clave !== clave));
    // Los índices de las filas cambian: los errores de variantes se recalculan al guardar
    setErrores((actuales) => Object.fromEntries(Object.entries(actuales).filter(([campo]) => !campo.startsWith("variantes."))));
  }

  // Después del primer intento, los mensajes se actualizan mientras escribís
  function alCambiar(evento) {
    if (!intentado) return;
    const nuevosErrores = validarProducto(leer(evento.currentTarget));
    setErrores(nuevosErrores);
    if (!hayErrores(nuevosErrores)) setErrorGeneral("");
  }

  // Cada control tiene como name la misma clave que su error ("nombre", "variantes.0.precio"…)
  function enfocarPrimerError(formulario, nuevosErrores) {
    formulario.elements.namedItem(Object.keys(nuevosErrores)[0])?.focus?.();
  }

  async function alEnviar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = leer(formulario);
    const nuevosErrores = validarProducto(datos);
    setIntentado(true);
    setErrores(nuevosErrores);
    setErrorGeneral("");
    if (hayErrores(nuevosErrores)) {
      setErrorGeneral("Revisá los campos marcados.");
      return enfocarPrimerError(formulario, nuevosErrores);
    }

    setEnviando(true);
    try {
      const respuesta = await fetch(editando ? `/api/productos/${producto.id}` : "/api/productos", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setErrores(resultado.errores ?? {});
        setErrorGeneral(resultado.error ?? "Revisá los campos marcados.");
        setEnviando(false);
        if (resultado.errores) enfocarPrimerError(formulario, resultado.errores);
        return;
      }
      router.push(`/admin/productos?guardado=${encodeURIComponent(datos.nombre)}`);
      router.refresh();
    } catch {
      setErrorGeneral("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
      setEnviando(false);
    }
  }

  const listaTexto = (campo, separador) => producto?.[campo]?.join(separador) ?? "";

  return (
    <form noValidate onSubmit={alEnviar} onChange={alCambiar} className="max-w-3xl space-y-12">
      {editando ? (
        <p className="text-marron">{esCafe ? "Café" : "Accesorio"}</p>
      ) : (
        <fieldset>
          <legend className="font-display text-2xl">¿Qué vas a cargar?</legend>
          <div className="mt-4 flex gap-3">
            {[
              ["cafe", "Un café"],
              ["accesorio", "Un accesorio"],
            ].map(([valor, texto]) => (
              <label
                key={valor}
                className={`cursor-pointer rounded-full border-[1.5px] px-5 py-2.5 font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                  categoria === valor ? "border-tostado bg-tostado text-crema" : "border-marron/40 hover:border-tostado"
                }`}
              >
                <input
                  type="radio"
                  name="categoria"
                  value={valor}
                  checked={categoria === valor}
                  onChange={() => elegirCategoria(valor)}
                  className="sr-only"
                />
                {texto}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-6">
        <legend className="font-display text-2xl">Datos generales</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Campo id="nombre" etiqueta="Nombre" value={nombre} onChange={alCambiarNombre} error={errores.nombre} required />
          <Campo
            id="slug"
            etiqueta="Dirección de la página"
            value={slug}
            onChange={(evento) => {
              setSlug(evento.target.value);
              setSlugEditado(true);
            }}
            ayuda={`Queda como /${esCafe ? "cafes" : "accesorios"}/${slug || "…"}`}
            error={errores.slug}
            required
          />
        </div>
        <Campo
          id="descripcion"
          etiqueta="Descripción"
          como="textarea"
          rows={4}
          defaultValue={producto?.descripcion}
          error={errores.descripcion}
          required
        />
        {!esCafe && (
          <Campo
            id="descripcion_corta"
            etiqueta="Descripción corta"
            defaultValue={producto?.descripcion_corta ?? ""}
            ayuda="Una línea para la tarjeta del producto."
            error={errores.descripcion_corta}
            required
          />
        )}
        <SubirImagen url={imagenUrl} alCambiar={setImagenUrl} error={errores.imagen_url} />
        <label className="flex items-center gap-3 font-semibold">
          <input type="checkbox" name="activo" defaultChecked={producto?.activo ?? true} className="h-5 w-5 accent-tostado" />
          Visible en la tienda
        </label>
      </fieldset>

      {esCafe ? (
        <fieldset className="space-y-6">
          <legend className="font-display text-2xl">Sabor y origen</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Campo id="origen" etiqueta="Origen" defaultValue={producto?.origen ?? ""} ayuda="País (o países, si es un blend)." error={errores.origen} required />
            <Campo id="region" etiqueta="Región" defaultValue={producto?.region ?? ""} error={errores.region} required />
            <Campo id="altura" etiqueta="Altura" defaultValue={producto?.altura ?? ""} error={errores.altura} required />
            <Campo id="proceso" etiqueta="Proceso" defaultValue={producto?.proceso ?? ""} error={errores.proceso} required />
            <Campo id="variedad" etiqueta="Variedad" defaultValue={producto?.variedad ?? ""} error={errores.variedad} required />
            <Campo id="perfil" etiqueta="Perfil" como="select" defaultValue={producto?.perfil ?? ""} error={errores.perfil} required>
              <option value="">Elegí un perfil</option>
              {PERFILES.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nombre}
                </option>
              ))}
            </Campo>
            <Campo id="tostado" etiqueta="Tostado" como="select" defaultValue={producto?.tostado ?? ""} error={errores.tostado} required>
              <option value="">Elegí un tostado</option>
              {TOSTADOS.map((tostado) => (
                <option key={tostado} value={tostado}>
                  {tostado[0].toUpperCase() + tostado.slice(1)}
                </option>
              ))}
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["acidez", "Acidez"],
                ["cuerpo", "Cuerpo"],
              ].map(([campo, etiqueta]) => (
                <Campo key={campo} id={campo} etiqueta={`${etiqueta} (1 a 5)`} como="select" defaultValue={producto?.[campo] ?? ""} error={errores[campo]} required>
                  <option value="">-</option>
                  {[1, 2, 3, 4, 5].map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </Campo>
              ))}
            </div>
          </div>
          <Campo
            id="notas"
            etiqueta="Notas de sabor"
            defaultValue={listaTexto("notas", ", ")}
            ayuda="Separadas por coma: jazmín, limón, bergamota."
            error={errores.notas}
            required
          />
        </fieldset>
      ) : (
        <fieldset className="space-y-6">
          <legend className="font-display text-2xl">Detalles</legend>
          <Campo
            id="beneficios"
            etiqueta="Beneficios"
            como="textarea"
            rows={4}
            defaultValue={listaTexto("beneficios", "\n")}
            ayuda="Uno por línea."
            error={errores.beneficios}
            required
          />
          <Campo
            id="especificaciones"
            etiqueta="Especificaciones"
            como="textarea"
            rows={4}
            defaultValue={producto?.especificaciones?.map(([dato, valor]) => `${dato}: ${valor}`).join("\n") ?? ""}
            ayuda='Una por línea, con el formato "Dato: valor". Por ejemplo: Capacidad: 250 ml.'
            error={errores.especificaciones}
          />
        </fieldset>
      )}

      <fieldset>
        <legend className="font-display text-2xl">Variantes, precio y stock</legend>
        <p className="mt-2 text-marron">
          {esCafe ? "Una por peso de bolsa. El precio es por bolsa, en pesos." : "Normalmente una sola. El precio es en pesos."}
        </p>
        <ul className="mt-6 space-y-4">
          {variantes.map((variante, i) => (
            <li key={variante.clave} className="grid items-start gap-4 rounded-2xl bg-kraft/45 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
              {esCafe ? (
                <Campo
                  id={`variante-${variante.clave}-peso`}
                  name={`variantes.${i}.peso_gramos`}
                  etiqueta="Peso (gramos)"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  defaultValue={variante.peso_gramos ?? ""}
                  error={errores[`variantes.${i}.peso_gramos`]}
                />
              ) : (
                <Campo
                  id={`variante-${variante.clave}-nombre`}
                  name={`variantes.${i}.nombre`}
                  etiqueta="Nombre"
                  defaultValue={variante.nombre ?? ""}
                  error={errores[`variantes.${i}.nombre`]}
                />
              )}
              <Campo
                id={`variante-${variante.clave}-precio`}
                name={`variantes.${i}.precio`}
                etiqueta="Precio ($)"
                type="number"
                min="1"
                inputMode="numeric"
                defaultValue={variante.precio}
                error={errores[`variantes.${i}.precio`]}
              />
              <Campo
                id={`variante-${variante.clave}-stock`}
                name={`variantes.${i}.stock`}
                etiqueta="Stock"
                type="number"
                min="0"
                inputMode="numeric"
                defaultValue={variante.stock}
                error={errores[`variantes.${i}.stock`]}
              />
              <button
                type="button"
                onClick={() => quitarVariante(variante.clave)}
                disabled={variantes.length === 1}
                className="self-end rounded-full px-3 py-3 text-sm font-semibold underline disabled:opacity-40 sm:mb-0.5"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <button type="button" name="variantes" onClick={agregarVariante} className="boton-secundario mt-4 py-2">
          Agregar variante
        </button>
        {errores.variantes && <p className="mt-2 text-sm font-semibold text-cereza">{errores.variantes}</p>}
      </fieldset>

      <div className="border-t border-marron/20 pt-8">
        {errorGeneral && (
          <p role="alert" className="mb-5 rounded-xl bg-cereza px-4 py-3 text-crema">
            {errorGeneral}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={enviando} className="boton">
            {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear producto"}
          </button>
          <button type="button" onClick={() => router.push("/admin/productos")} className="boton-secundario">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
