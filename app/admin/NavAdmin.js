"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", texto: "Resumen" },
  { href: "/admin/productos", texto: "Productos" },
  { href: "/admin/productos/nuevo", texto: "Nuevo producto" },
];

export default function NavAdmin() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel admin">
      <ul className="flex flex-wrap gap-2">
        {LINKS.map(({ href, texto }) => {
          const actual = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={`block rounded-full px-4 py-2 font-semibold ${actual ? "bg-tostado text-crema" : "hover:bg-kraft/60"}`}
              >
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
