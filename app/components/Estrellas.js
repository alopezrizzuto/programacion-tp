// Puntaje de 1 a 5 con estrellas. El texto para lectores de pantalla va en aria-label.
export default function Estrellas({ puntaje, className = "h-4 w-4" }) {
  const llenas = Math.round(puntaje);
  const texto = `${puntaje.toLocaleString("es-AR", { maximumFractionDigits: 1 })} de 5 estrellas`;

  return (
    <span role="img" aria-label={texto} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((numero) => (
        <svg
          key={numero}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`${className} ${numero <= llenas ? "text-marron" : "text-kraft"}`}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}
