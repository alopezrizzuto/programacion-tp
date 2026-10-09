// Campo de formulario con su etiqueta asociada (htmlFor + id).
// `ayuda` es un texto fijo debajo del campo y `error` el mensaje de validación:
// los dos se conectan al control con aria-describedby para que los lea un lector de pantalla.
// `como` elige el control: "input" (por defecto), "textarea" o "select" (las opciones van como children).
// El resto de las props (defaultValue, min, rows, onChange…) pasan directo al control.
export default function Campo({
  id,
  etiqueta,
  type = "text",
  como: Control = "input",
  ayuda,
  error,
  name = id,
  className = "",
  children,
  ...resto
}) {
  const descripciones = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold">{etiqueta}</label>
      <Control
        id={id}
        name={name}
        type={Control === "input" ? type : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripciones || undefined}
        className={`mt-2 w-full rounded-xl border bg-crema px-4 py-3 ${error ? "border-cereza" : "border-marron/40"}`}
        {...resto}
      >
        {children}
      </Control>
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
