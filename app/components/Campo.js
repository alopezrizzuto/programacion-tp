// Campo de formulario con su etiqueta asociada (htmlFor + id).
// En E3 se le suma el mensaje de error de validación.
export default function Campo({ id, etiqueta, type = "text", autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">{etiqueta}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-marron/40 bg-crema px-4 py-3"
      />
    </div>
  );
}
