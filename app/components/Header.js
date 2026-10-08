"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERFILES } from "@/lib/productos";
import IconoGrano from "./IconoGrano";
import IconoBolsa from "./IconoBolsa";
import { useCarrito } from "./carrito/ProveedorCarrito";

// Client Component: el header guarda en estado qué menú está abierto
// (el desplegable de Productos o el menú de celular) y lee la URL actual.
export default function Header() {
  const pathname = usePathname();
  const { unidades, abrir } = useCarrito();
  const [productosAbierto, setProductosAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  function cerrarTodo() {
    setProductosAbierto(false);
    setMenuMovilAbierto(false);
  }

  // Cierra el desplegable cuando el foco del teclado sale de él
  function alPerderFoco(evento) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) setProductosAbierto(false);
  }

  function claseLink(href) {
    const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `py-2 transition-colors hover:text-crema ${activo ? "text-crema" : "text-kraft"}`;
  }

  return (
    <header
      className="sticky top-0 z-40 bg-tostado text-crema"
      onKeyDown={(evento) => evento.key === "Escape" && cerrarTodo()}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        {/* Logo provisorio: se reemplaza por public/logo.svg cuando esté */}
        <Link href="/" onClick={cerrarTodo} className="flex items-center gap-2" aria-label="Origen Café, inicio">
          <IconoGrano className="h-6 w-6 text-kraft" />
          <span className="font-display text-xl">Origen Café</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[15px]">
            <li>
              <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={claseLink("/")}>
                Inicio
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => setProductosAbierto(true)}
              onMouseLeave={() => setProductosAbierto(false)}
              onBlur={alPerderFoco}
            >
              <button
                type="button"
                aria-expanded={productosAbierto}
                aria-controls="menu-productos"
                onClick={() => setProductosAbierto(!productosAbierto)}
                className={`flex items-center gap-1 ${claseLink("/productos")}`}
              >
                Productos
                <Chevron abierto={productosAbierto} />
              </button>
              <div
                id="menu-productos"
                hidden={!productosAbierto}
                className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3"
              >
                <MenuProductos alElegir={cerrarTodo} />
              </div>
            </li>
            <li>
              <Link href="/#elegi" className={claseLink("/#elegi")}>
                Elegí tu café ideal
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                aria-current={pathname === "/contacto" ? "page" : undefined}
                className={claseLink("/contacto")}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className={`hidden text-[15px] sm:block ${claseLink("/login")}`}>
            Ingresar
          </Link>
          {/* Bolsa con contador: abre el panel del carrito */}
          <button
            type="button"
            onClick={() => {
              cerrarTodo();
              abrir();
            }}
            aria-label={`Abrir carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-kraft transition-colors hover:text-crema"
          >
            <IconoBolsa className="h-6 w-6" />
            {unidades > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-crema px-1 text-xs font-bold text-tostado tabular-nums"
              >
                {unidades}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-expanded={menuMovilAbierto}
            aria-controls="menu-movil"
            aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="grid h-10 w-10 place-items-center rounded-full text-kraft hover:text-crema lg:hidden"
          >
            <IconoMenu abierto={menuMovilAbierto} />
          </button>
        </div>
      </div>

      {/* Menú de celular: mismos destinos, todo desplegado */}
      <nav
        id="menu-movil"
        aria-label="Principal"
        hidden={!menuMovilAbierto}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 px-4 pb-8 pt-4 lg:hidden"
      >
        <ul className="space-y-1 text-lg">
          <li><Link href="/" onClick={cerrarTodo} className="block py-2">Inicio</Link></li>
          <li className="py-2">
            <MenuProductos alElegir={cerrarTodo} movil />
          </li>
          <li><Link href="/#elegi" onClick={cerrarTodo} className="block py-2">Elegí tu café ideal</Link></li>
          <li><Link href="/contacto" onClick={cerrarTodo} className="block py-2">Contacto</Link></li>
          <li><Link href="/login" onClick={cerrarTodo} className="block py-2">Ingresar</Link></li>
        </ul>
      </nav>
    </header>
  );
}

function MenuProductos({ alElegir, movil = false }) {
  return (
    <div className={movil ? "" : "grid grid-cols-[1.4fr_1fr] gap-6 rounded-2xl bg-crema p-6 text-tostado shadow-2xl"}>
      <div>
        <Link
          href="/productos#cafes"
          onClick={alElegir}
          className={`font-display block ${movil ? "py-2 text-lg" : "text-xl hover:underline"}`}
        >
          Cafés
        </Link>
        <ul className={movil ? "border-l border-white/15 pl-4" : "mt-3 space-y-3"}>
          {PERFILES.map((perfil) => (
            <li key={perfil.id}>
              <Link
                href={`/productos#${perfil.id}`}
                onClick={alElegir}
                className={movil ? "block py-1.5 text-base text-kraft" : "group block"}
              >
                <span className={movil ? "" : "font-semibold group-hover:underline"}>{perfil.plural}</span>
                {!movil && <span className="mt-0.5 block text-sm leading-snug text-marron">{perfil.corta}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={movil ? "mt-2" : "rounded-xl bg-kraft p-4"}>
        <Link
          href="/productos#accesorios"
          onClick={alElegir}
          className={`font-display block ${movil ? "py-2 text-lg" : "text-xl hover:underline"}`}
        >
          Accesorios
        </Link>
        {!movil && (
          <p className="mt-2 text-sm leading-snug text-tostado">
            Vasos, contenedor al vacío, tamping set y balanza para preparar mejor en casa.
          </p>
        )}
        {!movil && (
          <Link href="/productos" onClick={alElegir} className="mt-4 inline-block text-sm font-semibold underline">
            Ver todos los productos
          </Link>
        )}
      </div>
    </div>
  );
}

function Chevron({ abierto }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`h-3 w-3 transition-transform ${abierto ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function IconoMenu({ abierto }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
    </svg>
  );
}
