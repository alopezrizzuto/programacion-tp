// Reglas de los formularios de cuenta. Las usan el navegador (para avisar antes de enviar)
// y los Route Handlers (para no confiar en lo que llega): una sola fuente de verdad.

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const LARGO_MINIMO_CONTRASENA = 8;

// Deja los datos listos para validar: todo como texto, sin espacios de más y el email en minúsculas.
// La contraseña no se toca: un espacio puede ser parte de ella.
export function normalizar(datos) {
  return {
    nombre: String(datos.nombre ?? "").trim(),
    email: String(datos.email ?? "").trim().toLowerCase(),
    password: String(datos.password ?? ""),
    confirmacion: String(datos.confirmacion ?? ""),
  };
}

function validarEmail(email) {
  if (!email) return "Ingresá tu email.";
  if (!FORMATO_EMAIL.test(email)) return "Revisá el email: tiene que ser del estilo nombre@dominio.com.";
}

// Cada validador devuelve { campo: mensaje } solo con los campos que tienen error,
// en el mismo orden que el formulario (así se enfoca el primero).
export function validarIngreso({ email, password }) {
  const errores = {};
  const errorEmail = validarEmail(email);
  if (errorEmail) errores.email = errorEmail;
  if (!password) errores.password = "Ingresá tu contraseña.";
  return errores;
}

export function validarRegistro({ nombre, email, password, confirmacion }) {
  const errores = {};
  if (nombre.length < 2) errores.nombre = "Ingresá tu nombre (al menos 2 letras).";
  else if (nombre.length > 60) errores.nombre = "El nombre puede tener hasta 60 caracteres.";

  const errorEmail = validarEmail(email);
  if (errorEmail) errores.email = errorEmail;

  if (password.length < LARGO_MINIMO_CONTRASENA) {
    errores.password = `La contraseña necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errores.password = "La contraseña necesita al menos una letra y un número.";
  }

  if (!confirmacion) errores.confirmacion = "Repetí la contraseña.";
  else if (confirmacion !== password) errores.confirmacion = "Las contraseñas no coinciden.";
  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}

// Pasa los errores de Supabase Auth a mensajes en castellano para el usuario
export function traducirErrorAuth(error) {
  switch (error.code) {
    case "invalid_credentials":
      return "El email o la contraseña no son correctos.";
    case "user_already_exists":
    case "email_exists":
      return "Ya hay una cuenta con ese email. Probá ingresar.";
    case "weak_password":
      return "La contraseña es muy fácil de adivinar. Probá con otra.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Hubo demasiados intentos seguidos. Esperá unos minutos y volvé a probar.";
    default:
      return "No pudimos completar la operación. Intentá de nuevo en unos minutos.";
  }
}

// A dónde volver después de ingresar. Solo se aceptan rutas internas ("/cuenta"),
// nunca otro sitio ("//sitio-falso.com"), para que nadie use el link para redirigir a otra página.
export function destinoSeguro(destino) {
  if (typeof destino === "string" && destino.startsWith("/") && !destino.startsWith("//") && !destino.startsWith("/\\")) {
    return destino;
  }
  return "/cuenta";
}
