// Escala de 1 a 5 dibujada con segmentos (acidez, cuerpo). Usa el color del texto,
// así funciona sobre fondo claro y oscuro. El valor para lectores de pantalla va aparte.
export default function Escala({ valor, ancho = "w-4" }) {
  return (
    <>
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1.5 ${ancho} rounded-full bg-current ${n <= valor ? "" : "opacity-20"}`} />
        ))}
      </span>
      <span className="sr-only">{valor} de 5</span>
    </>
  );
}
