import { Cormorant_Garamond, Inter } from "next/font/google";
import BarraPromos from "./components/BarraPromos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: {
    default: "Origen Café · Café de especialidad",
    template: "%s · Origen Café",
  },
  description:
    "Cafés de especialidad de Etiopía, Kenia, Colombia, Guatemala y Brasil, tostados cada semana. Elegí el peso y la molienda para tu método.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-espresso focus:px-4 focus:py-2 focus:text-crema"
        >
          Saltar al contenido
        </a>
        <BarraPromos />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
