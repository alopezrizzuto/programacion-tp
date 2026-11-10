// Validación de email compartida por login, registro, checkout y contacto (antes había tres copias).
//
// Auditoría de seguridad: el patrón viejo, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, podía tardar muchísimo
// con un email armado a propósito ("a@" + miles de puntos + "@"): el punto encajaba en dos partes
// del patrón y el motor probaba todas las combinaciones (tiempo cuadrático). Dos arreglos:
// 1. El largo se controla ANTES del patrón: nunca se evalúa un texto enorme.
// 2. El dominio se arma con partes sin puntos unidas por puntos: cada texto se puede repartir de
//    una sola manera, así que el tiempo crece en línea recta.

export const LARGO_MAXIMO_EMAIL = 254; // el máximo que permite el estándar de email

const FORMATO_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;

export function emailValido(email) {
  return typeof email === "string" && email.length <= LARGO_MAXIMO_EMAIL && FORMATO_EMAIL.test(email);
}
