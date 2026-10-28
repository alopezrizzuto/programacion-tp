import Image from "next/image";
import fotoPortada from "../../public/portada.webp";

// Páginas cortas (ingresar, crear cuenta, seguimiento): el contenido a la izquierda y,
// en pantallas grandes, la foto de las bolsas a la derecha, para que no quede un formulario solo.
// En celular la foto no se muestra: ahí lo importante es llegar rápido al formulario.
export default function ConFotoPortada({ children }) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <div className="mx-auto w-full max-w-md">{children}</div>
      <div className="hidden overflow-hidden rounded-[2rem] bg-tostado lg:block">
        <Image src={fotoPortada} alt="" sizes="(min-width: 1024px) 45vw, 1px" placeholder="blur" className="h-auto w-full" />
      </div>
    </div>
  );
}
