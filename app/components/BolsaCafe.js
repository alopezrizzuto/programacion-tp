// Bolsa de café ilustrada: el "packaging" de Origen mientras no haya fotos de producto.
// Bolsa de papel kraft con cierre, válvula y una etiqueta del color del perfil:
// frutal clara, equilibrado marrón, intenso tostado (los mismos tonos de la paleta).
// "simple": sin textos, para tamaños chicos (miniaturas del carrito), donde no se leerían.

const ETIQUETA = {
  frutal: { fondo: "#f3ebdd", texto: "#2a1a12", linea: "#634330" },
  equilibrado: { fondo: "#634330", texto: "#f3ebdd", linea: "#d6c1a0" },
  intenso: { fondo: "#2a1a12", texto: "#f3ebdd", linea: "#d6c1a0" },
};

// Nombres largos en dos renglones ("Colombia Huila" → "Colombia" / "Huila")
function renglones(nombre) {
  const [primera, ...resto] = nombre.split(" ");
  return nombre.length > 11 && resto.length > 0 ? [primera, resto.join(" ")] : [nombre];
}

// Cierre de arriba: un rectángulo con el borde dentado (12 dientes de 12 unidades de ancho)
const CIERRE = "M48 30 H192 V50 H48 Z M48 30" + " l6 -5 l6 5".repeat(12);

const LETRA = { fontFamily: "var(--font-archivo)" };
const SELLO = { ...LETRA, fontWeight: 760, fontStretch: "120%" };

export default function BolsaCafe({ cafe, simple = false, className = "" }) {
  const colores = ETIQUETA[cafe.perfil] ?? ETIQUETA.equilibrado;
  const id = `bolsa-${cafe.slug}`;
  const lineas = renglones(cafe.nombre);
  const largo = Math.max(...lineas.map((linea) => linea.length));
  const tamano = largo > 10 ? 15 : 18;

  return (
    <svg viewBox="0 0 240 320" aria-hidden="true" className={className}>
      <defs>
        {/* Sombreado de izquierda a derecha: da volumen al papel */}
        <linearGradient id={`${id}-papel`} x1="0" x2="1">
          <stop offset="0" stopColor="#b8976a" />
          <stop offset="0.16" stopColor="#d8c29e" />
          <stop offset="0.52" stopColor="#e4d2b2" />
          <stop offset="0.86" stopColor="#cfb28b" />
          <stop offset="1" stopColor="#a98a5f" />
        </linearGradient>
        <linearGradient id={`${id}-cierre`} x1="0" x2="1">
          <stop offset="0" stopColor="#a8875c" />
          <stop offset="0.5" stopColor="#c9ab82" />
          <stop offset="1" stopColor="#9e7f55" />
        </linearGradient>
      </defs>

      {/* Sombra en el piso */}
      <ellipse cx="120" cy="306" rx="80" ry="6" fill="#2a1a12" opacity="0.1" />

      {/* Cuerpo de la bolsa */}
      <path d="M50 44 H190 L203 284 Q204 300 188 300 H52 Q36 300 37 284 Z" fill={`url(#${id}-papel)`} />
      {/* Pliegues laterales */}
      <path d="M62 50 L56 296 M178 50 L184 296" stroke="#5a3d26" strokeOpacity="0.12" strokeWidth="2" />
      {/* Cierre de arriba, con el borde dentado */}
      <path
        d={CIERRE}
        fill={`url(#${id}-cierre)`}
      />
      <path d="M50 56 H190" stroke="#5a3d26" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Válvula de desgasificación: deja salir el gas del café recién tostado */}
      <circle cx="168" cy="82" r="8" fill="#5a3d26" fillOpacity="0.18" />
      <circle cx="168" cy="82" r="3.5" fill="#5a3d26" fillOpacity="0.35" />

      {!simple && (
        <text x="120" y="108" textAnchor="middle" fontSize="9.5" fill="#4a3222" fillOpacity="0.75" style={LETRA}>
          Café de especialidad
        </text>
      )}

      {/* Etiqueta */}
      <rect x="60" y="124" width="120" height="132" rx="6" fill={colores.fondo} />
      {!simple && (
        <g fill={colores.texto} textAnchor="middle">
          <text x="120" y="146" fontSize="10" style={SELLO}>
            Origen Café
          </text>
          <path d="M84 155 H156" stroke={colores.linea} strokeOpacity="0.6" />
          {lineas.map((linea, i) => (
            <text key={linea} x="120" y={(lineas.length === 1 ? 190 : 180) + i * (tamano + 3)} fontSize={tamano} style={SELLO}>
              {linea}
            </text>
          ))}
          <text x="120" y="230" fontSize="9" opacity="0.85" style={LETRA}>
            {cafe.origen}
          </text>
          <text x="120" y="244" fontSize="8.5" opacity="0.7" style={LETRA}>
            Tostado {cafe.tostado}
          </text>
        </g>
      )}
    </svg>
  );
}
