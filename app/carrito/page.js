import ContenidoCarrito from "./ContenidoCarrito";

export const metadata = {
  title: "Carrito",
};

// La página es un Server Component (puede exportar metadata); el contenido
// lee el carrito del navegador, por eso va en un Client Component aparte.
export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-6xl leading-[0.95]">Tu carrito</h1>
      <ContenidoCarrito />
    </div>
  );
}
