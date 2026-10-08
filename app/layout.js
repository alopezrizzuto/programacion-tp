import { Archivo } from "next/font/google";
import BarraPromos from "./components/BarraPromos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ProveedorCarrito } from "./components/carrito/ProveedorCarrito";
import "./globals.css";

// Archivo es una fuente variable: el eje "wdth" permite ensancharla para los títulos
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata = {
  title: {
    default: "Origen Café | Café de especialidad",
    template: "%s | Origen Café",
  },
  description:
    "Cafés de especialidad de Etiopía, Kenia, Colombia, Guatemala y Brasil, tostados cada semana. Elegí el peso y la molienda para tu método.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-base">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-crema focus:px-4 focus:py-2 focus:text-tostado"
        >
          Saltar al contenido
        </a>
        {/* El proveedor comparte el carrito con toda la tienda (header, botones, panel) */}
        <ProveedorCarrito>
          <BarraPromos />
          <Header />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
