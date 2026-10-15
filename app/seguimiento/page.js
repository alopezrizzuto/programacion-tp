import FormularioSeguimiento from "./FormularioSeguimiento";

export const metadata = {
  title: "Seguí tu pedido",
  description: "Consultá el estado de tu pedido de Origen Café con el código de seguimiento.",
};

export default function SeguimientoPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-5xl">Seguí tu pedido</h1>
      <p className="mt-3 text-marron">
        Ingresá el código que te dimos al comprar. Empieza con OC-, por ejemplo OC-7K2M9QXHPA.
      </p>
      <FormularioSeguimiento />
    </div>
  );
}
