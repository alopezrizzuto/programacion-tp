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

export function ProveedorCarrito({ children }) {
  // useSyncExternalStore lee el carrito del almacén (localStorage) y se re-dibuja cuando cambia.
  // En el servidor devuelve un carrito vacío: el real aparece al cargar en el navegador.
  const items = useSyncExternalStore(suscribir, obtenerItems, obtenerItemsEnServidor);
  const [abierto, setAbierto] = useState(false);

  // useMemo: recalcula los totales solo cuando cambian los ítems, no en cada dibujo
  const carrito = useMemo(() => calcularCarrito(items), [items]);

  const valor = {
    ...carrito,
    abierto,
    abrir: () => setAbierto(true),
    cerrar: () => setAbierto(false),
    // Al agregar se abre el panel, así la persona ve lo que sumó
    agregar: (item) => {
      agregarItem(item);
      setAbierto(true);
    },
    // Variante para el upsell: suma sin volver a abrir (ya está abierto)
    sumar: agregarItem,
    cambiarCantidad,
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
