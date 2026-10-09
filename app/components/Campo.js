// Campo de formulario con su etiqueta asociada (htmlFor + id).
// `ayuda` es un texto fijo debajo del campo y `error` el mensaje de validación:
// los dos se conectan al input con aria-describedby para que los lea un lector de pantalla.
export default function Campo({ id, etiqueta, type = "text", autoComplete, ayuda, error, required }) {
  const descripciones = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">{etiqueta}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripciones || undefined}
        className={`mt-2 w-full rounded-xl border bg-crema px-4 py-3 ${error ? "border-cereza" : "border-marron/40"}`}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-marron">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-cereza">
          {error}
        </p>
      )}
    </div>
  );
}
