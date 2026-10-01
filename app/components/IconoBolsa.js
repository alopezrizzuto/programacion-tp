// Bolsa de compras dibujada en SVG. Decorativa: el texto accesible lo pone quien la usa.
export default function IconoBolsa({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12.5H6L5 8Z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" strokeLinecap="round" />
    </svg>
  );
}
