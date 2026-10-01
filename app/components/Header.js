import Link from "next/link";
import IconoGrano from "./IconoGrano";
import NavLink from "./NavLink";

export default function Header() {
  return (
    <header className="border-b border-beige">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between">
        {/* Logo provisorio: se reemplaza por public/logo.svg cuando esté */}
        <Link href="/" className="flex items-center gap-2">
          <IconoGrano className="h-6 w-6 text-cafe" />
          <span className="font-serif text-2xl font-semibold tracking-wide">Origen Café</span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <li><NavLink href="/">Inicio</NavLink></li>
            <li><NavLink href="/catalogo">Catálogo</NavLink></li>
            <li><NavLink href="/carrito">Carrito</NavLink></li>
            <li><NavLink href="/login">Ingresar</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
