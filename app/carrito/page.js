import Link from "next/link";
import IconoGrano from "../components/IconoGrano";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

export const metadata = {
  title: "Carrito",
};

// Por ahora siempre vacío: el carrito (estado + localStorage) se implementa en E6
export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-5xl">Tu carrito</h1>

      <div className="mt-10 flex flex-col items-center bg-kraft px-6 py-16 text-center">
        <IconoGrano className="h-10 w-10 text-marron" />
        <p className="mt-4 font-display text-2xl">Tu carrito está vacío</p>
        <p className="mt-2 max-w-sm text-marron">
          Elegí un café, el peso y la molienda para tu método. Envío gratis desde{" "}
          {formatearPrecio(PROMOS.envioGratisDesde)}.
        </p>
        <Link href="/productos" className="mt-8 boton">
          Ver los cafés
        </Link>
      </div>
    </div>
  );
}
