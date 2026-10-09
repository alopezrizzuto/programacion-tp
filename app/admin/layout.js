import NavAdmin from "./NavAdmin";
import { adminDePagina } from "@/lib/admin";

export const metadata = {
  title: { default: "Panel admin", template: "%s | Panel admin" },
  robots: { index: false }, // que los buscadores no lo muestren
};

// Todo lo que está dentro de /admin pasa por acá: si no sos admin, no se muestra.
// Cada página vuelve a chequearlo al leer sus datos (el layout no se vuelve a ejecutar
// al navegar entre páginas del panel), y RLS en la base es la última barrera.
export default async function AdminLayout({ children }) {
  await adminDePagina();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-marron/20 pb-6">
        <p className="font-display text-2xl">Panel admin</p>
        <NavAdmin />
      </div>
      <div className="pt-10">{children}</div>
    </div>
  );
}
