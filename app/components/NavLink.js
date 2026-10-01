"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Link del menú que se marca como activo cuando estás en esa página.
// Es Client Component porque necesita leer la URL actual en el navegador.
export default function NavLink({ href, children }) {
  const pathname = usePathname();
  const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`border-b py-1 transition-colors hover:border-cafe ${
        activo ? "border-espresso font-medium" : "border-transparent text-cafe"
      }`}
    >
      {children}
    </Link>
  );
}
