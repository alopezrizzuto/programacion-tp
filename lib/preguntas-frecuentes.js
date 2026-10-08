import { HORA_CORTE } from "./entrega";
import { PROMOS, formatearPrecio } from "./tienda";

const ENVIO = {
  pregunta: "¿Cuándo me llega?",
  respuesta: `Si comprás un día hábil antes de las ${HORA_CORTE}:00, lo despachamos ese mismo día; si no, el día hábil siguiente. Después del despacho llega en 1 a 4 días hábiles según tu zona. El envío es gratis en compras desde ${formatearPrecio(PROMOS.envioGratisDesde)}.`,
};

const PAGO = {
  pregunta: "¿Cómo puedo pagar?",
  respuesta: `Con tarjeta, en hasta ${PROMOS.cuotasSinInteres} cuotas sin interés a través de Mercado Pago, o por transferencia bancaria con ${PROMOS.descuentoTransferencia}% de descuento sobre el total.`,
};

export const FAQ_CAFE = [
  {
    pregunta: "¿Qué molienda elijo?",
    respuesta:
      "Depende de tu cafetera: fina para espresso, media-fina para moka o italiana, media para filtro o V60 y gruesa para prensa francesa. Si tenés molinillo, pedilo en grano entero: es como más dura el aroma.",
  },
  {
    pregunta: "¿Cuánto dura el café una vez abierto?",
    respuesta:
      "Está en su mejor momento entre la primera y la sexta semana después del tostado. Guardalo cerrado, lejos de la luz y del calor. Un contenedor al vacío lo conserva bastante más.",
  },
  {
    pregunta: "¿Qué pasa si no me gusta?",
    respuesta:
      "Te lo cambiamos por otro origen dentro de los 30 días de recibido. Escribinos desde Contacto y coordinamos el cambio.",
  },
  ENVIO,
  PAGO,
];

export const FAQ_ACCESORIO = [
  {
    pregunta: "¿Tiene garantía?",
    respuesta: "Sí, 6 meses contra defectos de fabricación. Si algo falla, escribinos desde Contacto y lo reponemos.",
  },
  ENVIO,
  PAGO,
];
