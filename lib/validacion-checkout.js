// Reglas del formulario de checkout. Igual que lib/auth.js y lib/validacion-producto.js:
// las usa el navegador (para avisar antes de enviar) y la API (para no confiar en lo que llega).

export const PROVINCIAS = [
  "Ciudad Autónoma de Buenos Aires",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const MEDIOS_PAGO = [
  { id: "mercadopago", nombre: "Mercado Pago", detalle: "Tarjeta de crédito o débito, hasta 6 cuotas sin interés." },
  { id: "transferencia", nombre: "Transferencia bancaria", detalle: "10% OFF en los productos. Te pasamos el alias al confirmar." },
];

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const texto = (valor) => String(valor ?? "").trim();

export function normalizarCheckout(datos) {
  return {
    email: texto(datos.email).toLowerCase(),
    nombre: texto(datos.nombre),
    telefono: texto(datos.telefono),
    direccion: texto(datos.direccion),
    ciudad: texto(datos.ciudad),
    provincia: texto(datos.provincia),
    codigoPostal: texto(datos.codigoPostal).toUpperCase(),
    medioPago: texto(datos.medioPago),
  };
}

// Devuelve { campo: mensaje } solo con los campos que tienen error, en el orden del formulario
export function validarCheckout(datos) {
  const errores = {};
  if (!datos.email) errores.email = "Ingresá tu email para avisarte sobre el pedido.";
  else if (!FORMATO_EMAIL.test(datos.email)) errores.email = "Revisá el email: tiene que ser del estilo nombre@dominio.com.";

  if (datos.nombre.length < 3) errores.nombre = "Ingresá el nombre y apellido de quien recibe.";
  else if (datos.nombre.length > 80) errores.nombre = "El nombre puede tener hasta 80 caracteres.";

  // Solo números, espacios, guiones y un + adelante; entre 8 y 15 dígitos
  const digitos = datos.telefono.replace(/\D/g, "");
  if (!/^\+?[\d\s-]+$/.test(datos.telefono) || digitos.length < 8 || digitos.length > 15) {
    errores.telefono = "Ingresá un teléfono con código de área, por ejemplo 11 4567-8901.";
  }

  if (datos.direccion.length < 5) errores.direccion = "Ingresá calle, número y, si hay, piso y departamento.";
  else if (datos.direccion.length > 120) errores.direccion = "La dirección puede tener hasta 120 caracteres.";
  if (datos.ciudad.length < 2) errores.ciudad = "Ingresá la ciudad o localidad.";
  if (!PROVINCIAS.includes(datos.provincia)) errores.provincia = "Elegí la provincia.";
  // 4 números (1414) o el formato nuevo de 8 caracteres (C1414AAB)
  if (!/^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/.test(datos.codigoPostal)) errores.codigoPostal = "El código postal tiene 4 números (1414) o 8 caracteres (C1414AAB).";

  if (!MEDIOS_PAGO.some((medio) => medio.id === datos.medioPago)) errores.medioPago = "Elegí cómo vas a pagar.";
  return errores;
}
