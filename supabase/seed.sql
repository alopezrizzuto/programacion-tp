-- seed.sql: datos iniciales de Origen Café (6 cafés × 3 pesos, 4 accesorios y reseñas de ejemplo).
-- Se corre una vez, después de las migraciones. Usa ids fijos para que los carritos guardados sigan valiendo.

insert into public.productos (id, categoria, nombre, slug, descripcion, descripcion_corta, origen, region, altura, proceso, variedad, perfil, tostado, acidez, cuerpo, notas) values
  (1, 'cafe', 'Etiopía Yirgacheffe', 'etiopia-yirgacheffe', 'Un clásico de la cuna del café. Lavado y de altura, con una taza delicada, floral y cítrica que se luce en métodos de filtro.', null, 'Etiopía', 'Yirgacheffe, Sidama', '1.900 a 2.200 m', 'Lavado', 'Heirloom etíope', 'frutal', 'claro', 5, 2, array['jazmín', 'limón', 'bergamota']::text[]),
  (2, 'cafe', 'Kenia AA', 'kenia-aa', 'Granos de la clasificación más alta de Kenia. Jugoso y brillante, con una acidez que recuerda a los frutos rojos.', null, 'Kenia', 'Nyeri', '1.700 a 1.900 m', 'Lavado', 'SL28 y SL34', 'frutal', 'claro', 5, 3, array['frutos rojos', 'grosella', 'pomelo']::text[]),
  (3, 'cafe', 'Colombia Huila', 'colombia-huila', 'De las montañas del sur de Colombia. Dulce y redondo, con notas a caramelo y manzana: el café de todos los días.', null, 'Colombia', 'Huila', '1.600 a 1.900 m', 'Lavado', 'Caturra y Castillo', 'equilibrado', 'medio', 3, 3, array['caramelo', 'manzana roja', 'panela']::text[]),
  (4, 'cafe', 'Guatemala Antigua', 'guatemala-antigua', 'Cultivado entre volcanes en Antigua. Una taza cálida con chocolate y especias, que funciona igual de bien solo o con leche.', null, 'Guatemala', 'Antigua', '1.500 a 1.700 m', 'Lavado', 'Bourbon', 'equilibrado', 'medio', 3, 3, array['chocolate', 'canela', 'nuez']::text[]),
  (5, 'cafe', 'Brasil Cerrado', 'brasil-cerrado', 'Natural de la meseta del Cerrado Mineiro. Cuerpo cremoso, acidez baja y un final largo a chocolate y maní.', null, 'Brasil', 'Cerrado Mineiro', '1.000 a 1.200 m', 'Natural', 'Mundo Novo y Catuaí', 'intenso', 'medio-oscuro', 2, 4, array['chocolate', 'maní tostado', 'dulce de leche']::text[]),
  (6, 'cafe', 'Blend Espresso', 'blend-espresso', 'Nuestro blend de la casa, pensado para la cafetera espresso. Intenso, con mucho cuerpo y un amargor de cacao que se banca la leche.', null, 'Brasil y Colombia', 'Cerrado Mineiro y Huila', '1.000 a 1.900 m', 'Natural y lavado', 'Blend de la casa', 'intenso', 'oscuro', 1, 5, array['cacao amargo', 'melaza', 'nuez tostada']::text[]);

insert into public.productos (id, categoria, nombre, slug, descripcion, descripcion_corta, beneficios, especificaciones) values
  (7, 'accesorio', 'Vasos de doble vidrio', 'vasos-doble-vidrio', 'Dos vasos de vidrio borosilicato con doble pared: la cámara de aire mantiene la temperatura del café y deja el exterior frío al tacto. Se ven las capas de un cortado o la crema de un espresso.', 'Set x2 de 250 ml. El café se mantiene caliente y no te quemás la mano.', array['Mantiene el café caliente por más tiempo', 'No te quemás la mano: el vidrio de afuera queda frío', 'Aptos para lavavajillas y microondas']::text[], '[["Contenido","2 vasos"],["Capacidad","250 ml cada uno"],["Material","Vidrio borosilicato de doble pared"],["Cuidado","Apto lavavajillas y microondas"]]'::jsonb),
  (8, 'accesorio', 'Contenedor hermético al vacío', 'contenedor-al-vacio', 'Un contenedor de acero con tapa de vacío: al cerrarlo, una válvula saca el aire que oxida el café. Tiene un fechador en la tapa para anotar el día que abriste la bolsa.', 'Para 500 g de grano. Saca el aire y conserva el aroma por semanas.', array['Conserva el aroma hasta 4 veces más que la bolsa abierta', 'Fechador en la tapa para saber cuándo la abriste', 'Acero opaco: la luz tampoco llega al café']::text[], '[["Capacidad","500 g de café en grano"],["Material","Acero inoxidable y tapa de vacío"],["Medidas","11 cm de diámetro, 18 cm de alto"],["Extra","Fechador de mes y día en la tapa"]]'::jsonb),
  (9, 'accesorio', 'Tamping set', 'tamping-set', 'Todo lo que necesitás para preparar el portafiltro como en una cafetería: el distribuidor nivela el café molido y el tamper lo compacta de forma pareja para que el agua pase igual por todos lados.', 'Tamper de 58 mm, distribuidor y base. Espresso parejo en cada tiro.', array['Extracciones parejas, sin canales de agua', 'Tamper calibrado: siempre la misma presión', 'Base de silicona que protege la mesada']::text[], '[["Incluye","Tamper, distribuidor y base de silicona"],["Medida","58 mm (portafiltros estándar)"],["Material","Acero inoxidable y madera"],["Tamper","Calibrado a 15 kg de presión"]]'::jsonb),
  (10, 'accesorio', 'Balanza con timer', 'balanza-con-timer', 'Pesá el café y el agua y medí el tiempo de extracción en el mismo lugar. Con la misma receta, el café sale igual de rico todos los días, en V60, prensa o espresso.', 'Precisión de 0,1 g y cronómetro. La receta exacta, todas las veces.', array['Precisión de 0,1 g para recetas exactas', 'Cronómetro integrado para medir la extracción', 'Se carga por USB, sin pilas']::text[], '[["Capacidad","Hasta 3 kg"],["Precisión","0,1 g"],["Funciones","Tara y cronómetro"],["Carga","USB-C, batería recargable"]]'::jsonb);

insert into public.variantes (id, producto_id, nombre, peso_gramos, precio, stock) values
  (101, 1, '250 g', 250, 19500, 14),
  (102, 1, '500 g', 500, 36000, 8),
  (103, 1, '1 kg', 1000, 68000, 3),
  (201, 2, '250 g', 250, 20500, 10),
  (202, 2, '500 g', 500, 38000, 0),
  (203, 2, '1 kg', 1000, 72000, 4),
  (301, 3, '250 g', 250, 16500, 20),
  (302, 3, '500 g', 500, 30500, 15),
  (303, 3, '1 kg', 1000, 57000, 9),
  (401, 4, '250 g', 250, 17000, 12),
  (402, 4, '500 g', 500, 31500, 6),
  (403, 4, '1 kg', 1000, 59000, 2),
  (501, 5, '250 g', 250, 15000, 25),
  (502, 5, '500 g', 500, 28000, 18),
  (503, 5, '1 kg', 1000, 52000, 11),
  (601, 6, '250 g', 250, 13500, 30),
  (602, 6, '500 g', 500, 25000, 22),
  (603, 6, '1 kg', 1000, 46000, 14),
  (701, 7, 'Set x2', null, 18900, 16),
  (801, 8, '500 g', null, 24500, 9),
  (901, 9, '58 mm', null, 38000, 4),
  (1001, 10, 'Única', null, 29900, 12);

insert into public.resenas (producto_id, autor, puntaje, texto) values
  (1, 'Lucía M.', 5, 'En V60 es otra cosa. Floral de verdad, nunca había probado algo así.'),
  (1, 'Martín R.', 5, 'Llegó con fecha de tostado de dos días antes. Se nota la frescura.'),
  (1, 'Carla S.', 4, 'Muy rico, aunque para mi gusto un poco ácido en prensa francesa.'),
  (2, 'Federico P.', 5, 'Parece jugo de frutos rojos. Mi favorito para la Chemex.'),
  (2, 'Ana L.', 4, 'Intenso y frutal. Lo recomiendo para quien ya toma café de especialidad.'),
  (3, 'Sofía G.', 5, 'Lo tomo en moka todas las mañanas. Dulce, sin amargor.'),
  (3, 'Diego F.', 5, 'Excelente relación precio-calidad. Ya voy por la tercera bolsa.'),
  (3, 'Paula N.', 4, 'Muy equilibrado, ideal para arrancar en el café de especialidad.'),
  (4, 'Joaquín T.', 5, 'Con leche queda espectacular, sale un cortado con gusto a chocolate.'),
  (4, 'Valentina C.', 4, 'Rico y especiado. El envío llegó en un día a Palermo.'),
  (5, 'Nicolás B.', 5, 'Para espresso es perfecto. Crema espesa y nada de acidez.'),
  (5, 'Florencia D.', 5, 'Gusto a chocolate con maní, tal cual dice la descripción.'),
  (5, 'Tomás A.', 4, 'Muy bueno con leche. Lo pido en 1 kg y me dura el mes.'),
  (6, 'Gonzalo V.', 5, 'El mejor blend que probé para capuchino. Potente y parejo.'),
  (6, 'Micaela R.', 4, 'Fuerte como me gusta. La molienda fina vino perfecta para mi cafetera.'),
  (7, 'Camila R.', 5, 'Hermosos. El cortado queda en capas y se ve increíble.'),
  (7, 'Ignacio M.', 5, 'El café tarda mucho más en enfriarse. Los uso todos los días.'),
  (8, 'Rodrigo L.', 5, 'La última semana de la bolsa ya no pierde aroma. Muy buena compra.'),
  (8, 'Valeria P.', 4, 'Funciona perfecto. La tapa es un poco dura al principio.'),
  (9, 'Matías G.', 5, 'Cambió mis espressos. Ahora salen parejos y con mucha más crema.'),
  (9, 'Lorena V.', 5, 'Muy buena calidad, se siente sólido. Fijate que tu portafiltro sea de 58 mm.'),
  (10, 'Bruno S.', 5, 'Desde que peso el café, la V60 me sale siempre igual. Imprescindible.'),
  (10, 'Julieta A.', 4, 'Muy precisa. El timer arranca solo cuando empezás a verter.');

-- Como insertamos ids a mano, adelantamos los contadores para que los próximos no choquen
select setval(pg_get_serial_sequence('public.productos', 'id'), (select max(id) from public.productos));
select setval(pg_get_serial_sequence('public.variantes', 'id'), (select max(id) from public.variantes));
select setval(pg_get_serial_sequence('public.resenas', 'id'), (select max(id) from public.resenas));
