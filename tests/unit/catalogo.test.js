// Búsqueda y filtros del catálogo (lib/catalogo.js): validación de la URL y filtrado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrarProductos, leerFiltros, paisesDeOrigen } from "../../lib/catalogo.js";
import { PRODUCTOS } from "./catalogo-de-prueba.js";

const paises = paisesDeOrigen(PRODUCTOS);
const leer = (consulta) => leerFiltros(new URLSearchParams(consulta), { paises });
const nombres = (consulta) => filtrarProductos(PRODUCTOS, leer(consulta).filtros).map((p) => p.nombre);

test("los países salen de los cafés, separando el blend", () => {
  assert.deepEqual(paises, ["Brasil", "Colombia", "Etiopía", "Guatemala"]);
});

test("filtros válidos, sin repetidos", () => {
  const { filtros, errores } = leer("perfil=frutal&perfil=frutal&peso=250&precioMax=30000&stock=1");
  assert.deepEqual(errores, {});
  assert.deepEqual(filtros.perfil, ["frutal"]);
  assert.deepEqual(filtros.peso, [250]);
  assert.equal(filtros.precioMax, 30000);
  assert.equal(filtros.conStock, true);
});

test("valores que no existen: error por campo y el filtro se ignora", () => {
  const { filtros, errores } = leer("perfil=dulce&origen=Marte&peso=300");
  assert.match(errores.perfil, /dulce/);
  assert.match(errores.origen, /Marte/);
  assert.match(errores.peso, /300/);
  assert.deepEqual(filtros.perfil, []);
});

test("precios: enteros sin signos, y el máximo no puede ser menor que el mínimo", () => {
  assert.ok(leer("precioMin=-5").errores.precioMin);
  assert.ok(leer("precioMin=20.000").errores.precioMin);
  assert.ok(leer("precioMin=abc").errores.precioMin);
  assert.match(leer("precioMin=50000&precioMax=10000").errores.precioMax, /mayor que el mínimo/);
});

test("la búsqueda tiene un máximo de 60 caracteres", () => {
  assert.ok(leer(`q=${"a".repeat(61)}`).errores.q);
  assert.equal(leer(`q=${"a".repeat(60)}`).errores.q, undefined);
});

test("búsqueda sin importar tildes ni mayúsculas, en nombre, origen y notas", () => {
  assert.deepEqual(nombres("q=ETIOPIA"), ["Etiopía Yirgacheffe"]);
  assert.deepEqual(nombres("q=citricas"), ["Etiopía Yirgacheffe"]);
  assert.deepEqual(nombres("q=chocolate"), ["Guatemala Antigua"]);
  // En los accesorios busca en el nombre y la descripción corta
  assert.deepEqual(nombres("q=precision"), ["Balanza con timer"]);
});

test("filtros de café: dejan afuera los accesorios", () => {
  assert.deepEqual(nombres("tostado=oscuro"), ["Blend Espresso"]);
  assert.deepEqual(nombres("acidez=alta"), ["Etiopía Yirgacheffe"]);
  assert.deepEqual(nombres("cuerpo=media"), ["Guatemala Antigua"]);
});

test("el blend aparece buscando por Brasil o por Colombia", () => {
  assert.deepEqual(nombres("origen=Brasil"), ["Blend Espresso"]);
  assert.deepEqual(nombres("origen=Colombia"), ["Blend Espresso"]);
});

test("peso, precio y stock filtran las variantes de cada producto", () => {
  const [etiopia] = filtrarProductos(PRODUCTOS, leer("q=etiopia&stock=1").filtros);
  assert.deepEqual(etiopia.variantes.map((v) => v.id), [11]); // la de 500 g no tiene stock
  assert.deepEqual(nombres("peso=1000"), ["Blend Espresso"]);
  // El precio no es un filtro solo de café: entra la balanza ($30.000) y la Etiopía de 500 g ($36.000)
  assert.deepEqual(nombres("precioMin=26000&precioMax=40000"), ["Etiopía Yirgacheffe", "Balanza con timer"]);
});

test("sin filtros vuelven todos los productos", () => {
  assert.equal(nombres("").length, PRODUCTOS.length);
});
