import Link from "next/link";
import Image from "next/image";
import fotoPortada from "../public/portada.webp";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="w-64 overflow-hidden rounded-3xl bg-tostado sm:w-72">
        <Image src={fotoPortada} alt="" sizes="288px" placeholder="blur" className="h-auto w-full" />
      </div>
      <h1 className="mt-8 font-display text-5xl">No encontramos esta página</h1>
      <p className="mt-4 text-marron">Puede que el café que buscás ya no esté disponible o que el link tenga un error.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/productos" className="boton">
          Ver el catálogo
        </Link>
        <Link href="/" className="boton-secundario">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
