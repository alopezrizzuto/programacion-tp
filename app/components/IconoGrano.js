// Grano de café dibujado en SVG. Decorativo: los lectores de pantalla lo ignoran.
export default function IconoGrano({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(30 12 12)" />
      <path
        d="M9 4.5c3 2.5 1 6.5 3 9s3.5 4 3 6"
        fill="none"
        stroke="var(--color-crema)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
