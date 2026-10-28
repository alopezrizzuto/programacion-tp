// Íconos de las opciones del test "Elegí tu café ideal", dibujados con líneas (como el resto de la tienda).
// Decorativos: el nombre de la opción ya dice lo mismo.

function Grano({ x, lleno }) {
  return (
    <g transform={`translate(${x} 24) rotate(30)`}>
      <ellipse rx="5.5" ry="8.5" fill={lleno ? "currentColor" : "none"} />
      <path d="M-2 -6.5 C2 -2 -2 2 2 6.5" stroke={lleno ? "var(--fondo-icono, #f3ebdd)" : "currentColor"} fill="none" />
    </g>
  );
}

function Rodaja({ x, r }) {
  // Media naranja vista de frente: un círculo con gajos
  return (
    <g transform={`translate(${x} 24)`}>
      <circle r={r} />
      <circle r={r - 2.5} />
      {[0, 60, 120].map((giro) => (
        <path key={giro} d={`M0 ${-(r - 2.5)} V${r - 2.5}`} transform={`rotate(${giro})`} />
      ))}
    </g>
  );
}

const DIBUJOS = {
  // Intensidad: más granos (y llenos), más intenso
  suave: <Grano x={24} />,
  medio: (
    <>
      <Grano x={17} />
      <Grano x={31} lleno />
    </>
  ),
  fuerte: (
    <>
      <Grano x={11} lleno />
      <Grano x={24} lleno />
      <Grano x={37} lleno />
    </>
  ),
  // Acidez: más rodajas de cítrico, más ácido
  poco: <Rodaja x={24} r={9} />,
  algo: (
    <>
      <Rodaja x={16} r={8} />
      <Rodaja x={32} r={8} />
    </>
  ),
  mucho: (
    <>
      <Rodaja x={9} r={7} />
      <Rodaja x={24} r={7} />
      <Rodaja x={39} r={7} />
    </>
  ),
  // Leche: taza de café negro o con una capa de leche
  solo: (
    <>
      <path d="M12 16h20v12a10 10 0 0 1-20 0z" />
      <path d="M13 20h18v8a9 9 0 0 1-18 0z" fill="currentColor" opacity="0.85" />
      <path d="M32 19h3a4 4 0 0 1 0 8h-3M10 40h24" />
    </>
  ),
  "con-leche": (
    <>
      <path d="M12 12h20v16a10 10 0 0 1-20 0z" />
      <path d="M13 22h18v6a9 9 0 0 1-18 0z" fill="currentColor" opacity="0.85" />
      <path d="M13 16c3 2 6-2 9 0s6 2 9 0M32 16h3a4 4 0 0 1 0 8h-3M10 40h24" />
    </>
  ),
  // Métodos: cada cafetera
  espresso: (
    <>
      <path d="M8 18h22v4a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" />
      <path d="M30 20h10M16 30v4M22 30v4" />
      <path d="M13 38h12v2H13z" />
    </>
  ),
  moka: (
    <>
      <path d="M16 6h16l-3 16h-10z" />
      <path d="M19 22h10l4 18H15z" />
      <path d="M32 10l6 2v8l-5 2M14 24h20" />
    </>
  ),
  filtro: (
    <>
      <path d="M10 12h28l-10 14h-8z" />
      <path d="M20 26h8v4h-8zM14 32h20v6a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" />
      <path d="M38 14l4 2-4 4" />
    </>
  ),
  prensa: (
    <>
      <path d="M14 12h18v28H14z" />
      <path d="M23 4v24M18 28h10M11 12h24M32 18h4v14h-4" />
    </>
  ),
  propio: (
    <>
      <path d="M14 22h20v18H14z" />
      <path d="M17 22l3-8h8l3 8M24 14V8h10" />
      <circle cx="36" cy="8" r="2" />
      <path d="M20 30h8" />
    </>
  ),
};

export default function IconoOpcion({ opcion, className = "" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DIBUJOS[opcion]}
    </svg>
  );
}
