// Reglas del formulario de contacto. Igual que los otros formularios: las usa el navegador
// (para avisar antes de enviar) y la API (para no confiar en lo que llega).
// Los límites coinciden con los CHECK de la tabla mensajes (migración 005).

export const MOTIVOS = [
  { id: "elegir", nombre: "Quiero ayuda para elegir un café" },
  { id: "pedido", nombre: "Consulta sobre mi pedido" },
  { id: "envios", nombre: "Envíos" },
  { id: "mayorista", nombre: "Ventas por mayor" },
  { id: "otro", nombre: "Otro" },
];

export const LARGO_MAXIMO_MENSAJE = 2000;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const texto = (valor) => String(valor ?? "").trim();

export function normalizarContacto(datos) {
  return {
    nombre: texto(datos.nombre),
    email: texto(datos.email).toLowerCase(),
    motivo: texto(datos.motivo),
    mensaje: texto(datos.mensaje),
    // Campo trampa: invisible para las personas. Si viene completo, lo llenó un bot.
    sitio: texto(datos.sitio),
  };
}

// Devuelve { campo: mensaje } solo con los campos que tienen error, en el orden del formulario
export function validarContacto(datos) {
  const errores = {};
  if (datos.nombre.length < 2) errores.nombre = "Ingresá tu nombre.";
  else if (datos.nombre.length > 80) errores.nombre = "El nombre puede tener hasta 80 caracteres.";

  if (!datos.email) errores.email = "Ingresá tu email para poder responderte.";
  else if (!FORMATO_EMAIL.test(datos.email) || datos.email.length > 120) {
    errores.email = "Revisá el email: tiene que ser del estilo nombre@dominio.com.";
  }

  if (!MOTIVOS.some((motivo) => motivo.id === datos.motivo)) errores.motivo = "Elegí el motivo de tu consulta.";

  if (datos.mensaje.length < 10) errores.mensaje = "Contanos un poco más (al menos 10 caracteres).";
  else if (datos.mensaje.length > LARGO_MAXIMO_MENSAJE) {
    errores.mensaje = `El mensaje puede tener hasta ${LARGO_MAXIMO_MENSAJE} caracteres.`;
  }
  return errores;
}
