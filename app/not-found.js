import Link from "next/link";
import IconoGrano from "./components/IconoGrano";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <IconoGrano className="h-12 w-12 text-caramelo" />
      <h1 className="mt-6 font-serif text-5xl font-semibold">No encontramos esta página</h1>
      <p className="mt-4 text-cafe">Puede que el café que buscás ya no esté disponible o que el link tenga un error.</p>
      <Link href="/catalogo" className="mt-8 bg-espresso px-6 py-3 text-crema transition-colors hover:bg-cafe">
        Ver el catálogo
      </Link>
    </div>
  );
}
