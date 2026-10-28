"use client";

import { useState } from "react";
import Campo from "../components/Campo";
import { useSesion } from "../components/sesion/ProveedorSesion";
import { hayErrores } from "@/lib/auth";
import { LARGO_MAXIMO_MENSAJE, MOTIVOS, normalizarContacto, validarContacto } from "@/lib/validacion-contacto";

// Formulario de contacto: valida en el navegador, envía con fetch a /api/contacto y muestra
// los errores que devuelva el servidor. Si hay sesión, el nombre y el email vienen completos.
export default function FormularioContacto() {
  const { usuario } = useSesion();
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const [largo, setLargo] = useState(0);
  const [enviado, setEnviado] = useState(null); // { nombre, email } cuando salió bien

  const leer = (formulario) => normalizarContacto(Object.fromEntries(new FormData(formulario)));

  // Después del primer intento, los mensajes se actualizan mientras escribís
  function alCambiar(evento) {
    setLargo(evento.currentTarget.elements.namedItem("mensaje").value.length);
    if (!intentado) return;
    const nuevos = validarContacto(leer(evento.currentTarget));
    setErrores(nuevos);
    if (!hayErrores(nuevos)) setErrorGeneral("");
  }

  async function alEnviar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = leer(formulario);
    const nuevos = validarContacto(datos);
    setIntentado(true);
    setErrores(nuevos);
    setErrorGeneral("");
    if (hayErrores(nuevos)) {
      setErrorGeneral("Revisá los campos marcados.");
      formulario.elements.namedItem(Object.keys(nuevos)[0])?.focus();
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setErrores(resultado.errores ?? {});
        setErrorGeneral(resultado.error ?? "Revisá los campos marcados.");
        return;
      }
      setEnviado({ nombre: datos.nombre.split(" ")[0], email: datos.email });
    } catch {
      setErrorGeneral("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div role="status" className="rounded-3xl bg-tostado p-8 text-crema sm:p-10">
        <p className="font-display text-3xl">¡Gracias, {enviado.nombre}!</p>
        <p className="mt-3 text-kraft">
          Recibimos tu mensaje. Te respondemos en el día hábil a <strong className="text-crema">{enviado.email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setEnviado(null);
            setIntentado(false);
            setLargo(0);
          }}
          className="boton-secundario mt-8 text-crema"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={alEnviar} onChange={alCambiar} className="space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-10">
      {/* key: cuando llega la sesión, los campos se vuelven a armar con los datos de la cuenta */}
      <div key={usuario?.email ?? "sin-sesion"} className="grid gap-6 sm:grid-cols-2">
        <Campo id="nombre" etiqueta="Nombre" autoComplete="name" defaultValue={usuario?.nombre ?? ""} error={errores.nombre} required />
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" defaultValue={usuario?.email ?? ""} error={errores.email} required />
      </div>
      <Campo id="motivo" etiqueta="Motivo" como="select" defaultValue="" error={errores.motivo} required>
        <option value="">Elegí un motivo</option>
        {MOTIVOS.map((motivo) => (
          <option key={motivo.id} value={motivo.id}>
            {motivo.nombre}
          </option>
        ))}
      </Campo>
      <Campo
        id="mensaje"
        etiqueta="Mensaje"
        como="textarea"
        rows={6}
        maxLength={LARGO_MAXIMO_MENSAJE}
        ayuda={`${largo} de ${LARGO_MAXIMO_MENSAJE} caracteres. Si buscás un café, contanos cómo lo preparás.`}
        error={errores.mensaje}
        required
      />

      {/* Campo trampa: oculto para las personas (y para los lectores de pantalla). Solo lo completa un bot. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="sitio">Sitio web</label>
        <input id="sitio" name="sitio" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        {errorGeneral && (
          <p role="alert" className="mb-4 rounded-xl bg-cereza px-4 py-3 text-crema">
            {errorGeneral}
          </p>
        )}
        <button type="submit" disabled={enviando} className="boton w-full">
          {enviando ? "Enviando…" : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}
