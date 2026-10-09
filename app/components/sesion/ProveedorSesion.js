"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ContextoSesion = createContext(null);

// Le pregunta al servidor quién está conectado (o null si nadie)
async function consultarSesion() {
  try {
    const respuesta = await fetch("/api/auth/sesion", { cache: "no-store" });
    return (await respuesta.json()).usuario;
  } catch {
    return null;
  }
}

// Comparte con toda la tienda quién está conectado (lo usa el header y los formularios de cuenta).
// La sesión real vive en cookies; acá solo se guarda lo que muestra la interfaz.
export function ProveedorSesion({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la tienda: el estado se actualiza recién cuando llega la respuesta.
  // `activo` evita actualizar si el componente ya no está en pantalla.
  useEffect(() => {
    let activo = true;
    consultarSesion().then((datos) => {
      if (!activo) return;
      setUsuario(datos);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  // Después de ingresar o crear la cuenta
  const refrescar = useCallback(async () => {
    setUsuario(await consultarSesion());
  }, []);

  async function salir() {
    await fetch("/api/auth/salir", { method: "POST" });
    setUsuario(null);
    router.push("/");
    router.refresh();
  }

  return (
    <ContextoSesion.Provider value={{ usuario, cargando, refrescar, salir }}>{children}</ContextoSesion.Provider>
  );
}

export function useSesion() {
  return useContext(ContextoSesion);
}
