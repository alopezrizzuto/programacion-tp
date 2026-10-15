import FormularioCheckout from "./FormularioCheckout";

export const metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl">Finalizar compra</h1>
      <p className="mt-3 text-marron">No hace falta crear una cuenta: al terminar te damos un código para seguir tu pedido.</p>
      <FormularioCheckout />
    </div>
  );
}
