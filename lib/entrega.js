// Fecha de entrega estimada, en hora de Argentina (UTC-3, sin horario de verano).
// Regla: si se compra un día hábil antes de las 14:00, se despacha ese día;
// si no, el siguiente día hábil. Llega de 1 a 4 días hábiles después del despacho.
// No tiene en cuenta feriados.

export const HORA_CORTE = 14;
const DESFASE_ARGENTINA = -3 * 60 * 60 * 1000;
const UN_DIA = 24 * 60 * 60 * 1000;

// Trabajamos con una fecha "corrida" a la hora argentina y leemos sus partes con getUTC*
function aHoraArgentina(fecha) {
  return new Date(fecha.getTime() + DESFASE_ARGENTINA);
}

function esHabil(fecha) {
  const dia = fecha.getUTCDay(); // 0 domingo, 6 sábado
  return dia !== 0 && dia !== 6;
}

function sumarDiasHabiles(fecha, cantidad) {
  let resultado = fecha;
  let sumados = 0;
  while (sumados < cantidad) {
    resultado = new Date(resultado.getTime() + UN_DIA);
    if (esHabil(resultado)) sumados++;
  }
  return resultado;
}

export function calcularEntrega(ahora = new Date()) {
  const local = aHoraArgentina(ahora);
  const antesDelCorte = esHabil(local) && local.getUTCHours() < HORA_CORTE;
  const despacho = antesDelCorte ? local : sumarDiasHabiles(local, 1);

  // Minutos que faltan para el corte de hoy (solo si todavía se despacha hoy)
  const corte = new Date(local);
  corte.setUTCHours(HORA_CORTE, 0, 0, 0);
  const minutosParaCorte = antesDelCorte ? Math.ceil((corte - local) / 60000) : null;

  return {
    despachaHoy: antesDelCorte,
    despacho,
    desde: sumarDiasHabiles(despacho, 1),
    hasta: sumarDiasHabiles(despacho, 4),
    minutosParaCorte,
  };
}

const formatoDia = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

// "jueves 8 de octubre"
export function formatearDia(fecha) {
  return formatoDia.format(fecha);
}
