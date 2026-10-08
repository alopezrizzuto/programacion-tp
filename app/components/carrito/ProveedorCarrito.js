"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { calcularCarrito } from "@/lib/carrito";
import {
  agregarItem,
  cambiarCantidad,
  obtenerItems,
  obtenerItemsEnServidor,
  quitarItem,
  suscribir,
} from "@/lib/carrito-almacen";
import PanelCarrito from "./PanelCarrito";

// Context: comparte el carrito con cualquier componente de adentro sin pasarlo por props.
const ContextoCarrito = createContext(null);

// "productos" es el catálogo que el layout trae de Supabase: con él se resuelven
// los precios y el stock de cada línea del carrito.
export function ProveedorCarrito({ productos, children }) {
  // useSyncExternalStore lee el carrito del almacén (localStorage) y se re-dibuja cuando cambia.
  // En el servidor devuelve un carrito vacío: el real aparece al cargar en el navegador.
  const items = useSyncExternalStore(suscribir, obtenerItems, obtenerItemsEnServidor);
  const [abierto, setAbierto] = useState(false);

  // useMemo: recalcula los totales solo cuando cambian los ítems o el catálogo, no en cada dibujo
  const carrito = useMemo(() => calcularCarrito(items, productos), [items, productos]);

  const valor = {
    ...carrito,
    productos,
    abierto,
    abrir: () => setAbierto(true),
    cerrar: () => setAbierto(false),
    // Al agregar se abre el panel, así la persona ve lo que sumó
    agregar: (item) => {
      agregarItem(item, productos);
      setAbierto(true);
    },
    // Variante para el upsell: suma sin volver a abrir (ya está abierto)
    sumar: (item) => agregarItem(item, productos),
    cambiarCantidad: (clave, cantidad) => cambiarCantidad(clave, cantidad, productos),
    quitar: quitarItem,
  };

  return (
    <ContextoCarrito.Provider value={valor}>
      {children}
      <PanelCarrito />
    </ContextoCarrito.Provider>
  );
}

export function useCarrito() {
  return useContext(ContextoCarrito);
}
