// Campo de formulario con su etiqueta asociada (htmlFor + id).
// En E3 se le suma el mensaje de error de validación.
export default function Campo({ id, etiqueta, type = "text", autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{etiqueta}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 w-full border border-cafe bg-crema px-3 py-3"
      />
    </div>
  );
}
