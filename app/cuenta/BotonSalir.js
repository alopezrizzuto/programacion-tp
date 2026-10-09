"use client";

import { useSesion } from "../components/sesion/ProveedorSesion";

export default function BotonSalir() {
  const { salir } = useSesion();
  return (
    <button type="button" onClick={salir} className="boton-secundario">
      Cerrar sesión
    </button>
  );
}
