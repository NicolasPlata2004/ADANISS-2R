# S01 · El cristal que convierte un golpe en electricidad

## Gancho

Cada vez que haces clic en un encendedor de cocina, un martillo diminuto golpea un cristal. Y el cristal responde escupiendo **miles de voltios**. Sin pilas. Sin cables. [pausa] Ese mismo truco hace que tu reloj cuente los segundos, que un médico vea a un bebé antes de nacer y que el motor de tu carro sepa cuándo está golpeando. Todo depende de un material que, cuando lo aprietas, **produce electricidad**. Y cuando le das electricidad, **se mueve**.

## Promesa

Se llama efecto piezoeléctrico. En este video vas a ver qué pasa dentro de ese cristal, átomo por átomo; cómo se fabrica el sensor de menos de un dólar que lo aprovecha; y cómo conectarlo a un ESP32 para que una mesa sepa cuándo la tocas.

## Dónde está

El pitido de muchos microondas, la alarma de los detectores de humo y el bip de otros electrodomésticos suelen salir de un disco piezoeléctrico que vibra miles de veces por segundo. Dentro de tu celular y de tu computador hay un cristal de cuarzo que marca el ritmo de todo el procesador. Las ecografías usan cientos de pequeños elementos piezoeléctricos que gritan en ultrasonido y escuchan el eco. Los sensores de parqueo de los carros hacen lo mismo con la pared de tu garaje. Algunas impresoras de tinta disparan gotas con un piezo que se dobla en millonésimas de segundo, y muchas guitarras electroacústicas tienen uno escondido bajo el puente. En los motores, un sensor piezoeléctrico atornillado al bloque escucha el golpeteo de la detonación y le avisa a la computadora del carro para que corrija el encendido. Es muy probable que hoy hayas usado varios sin darte cuenta.

## La física

¿Cómo puede un cristal fabricar electricidad? [pausa] Un cristal es un edificio de átomos ordenados en un patrón que se repite millones de veces. En el cuarzo, ese patrón está hecho de silicio y oxígeno, y cada átomo tiene una carga eléctrica: los de silicio son un poco positivos y los de oxígeno, un poco negativos. Cuando el cristal está en reposo, las cargas están tan bien repartidas que se cancelan. Desde afuera, el cristal es eléctricamente neutro. [pausa] Ahora apriétalo. Los átomos no se rompen, pero se acercan y se corren un poco. Como el patrón no tiene centro de simetría, el centro de las cargas positivas y el de las negativas se separan un poquito. De repente, una cara del cristal queda con un poquito más de carga **positiva** y la cara opuesta con un poquito más de **negativa**. Eso es un voltaje. Si unes las dos caras con un cable, los electrones corren para equilibrarlo. [pausa] Y funciona al revés: si conectas el cristal a una pila, las cargas tiran de los átomos y el cristal se deforma. A esa ida y vuelta se le llama efecto piezoeléctrico directo e inverso. [pausa] Fíjate en un detalle: si aprietas y te quedas quieto, esa carga se va escapando poco a poco por el circuito y el voltaje desaparece. En la práctica, un piezo solo nota los **cambios** de presión. Por eso es perfecto para detectar golpes, vibraciones y sonido, pero no sirve para pesar una bolsa de arroz.

## La historia

Esto lo descubrieron en 1880 dos hermanos franceses, Jacques y Pierre Curie. Pierre, sí, el mismo que años después ganaría el Nobel junto a Marie Curie. Apretaban cristales de cuarzo y de sal de Rochelle, y medían cargas diminutas en sus caras. Un año después, el físico Gabriel Lippmann predijo con matemáticas que el efecto tenía que funcionar al revés, y los Curie lo comprobaron. [pausa] Durante décadas fue una curiosidad de laboratorio. Hasta que llegaron los submarinos. En la Primera Guerra Mundial, Paul Langevin construyó un emisor de ultrasonido con láminas de cuarzo para detectarlos bajo el agua. Llegó casi al final de la guerra, pero fue la base del sonar. [pausa] Hoy casi nadie usa cuarzo para sensores baratos. Se usa una cerámica fabricada a propósito, hecha de millones de cristales diminutos: el PZT, titanato zirconato de plomo. Recién horneada, esa cerámica no es piezoeléctrica, porque sus pequeñas regiones apuntan en todas las direcciones. Para despertarla, se calienta y se somete a un campo eléctrico muy fuerte que alinea esas regiones. A ese proceso se le llama **polarizar**. Desde ese momento, la cerámica responde muchísimo más que el cuarzo.

## Anatomía del disco

Ahora sí, el sensor que puedes comprar por menos de un dólar. [pausa] Es un disco de latón de unos 27 milímetros. Encima tiene pegada una capa delgadísima de cerámica PZT, de unas décimas de milímetro, y sobre ella una película plateada que hace de electrodo. Dos cables: el rojo soldado a la plata, el negro al latón. [pausa] Cuando algo golpea el centro, el disco se dobla como el parche de un tambor. El latón se curva, y la cerámica, pegada a una de sus caras, se ve obligada a estirarse o comprimirse con él. Esa deformación hace aparecer voltaje entre los dos cables. Un golpe seco con el dedo puede dar picos de varios voltios durante unas milésimas de segundo. [pausa] Si en vez de golpearlo le aplicas una señal que sube y baja miles de veces por segundo, el disco vibra y empuja el aire. Así suena el zumbador de muchos microondas. Mismo disco, misma cerámica: una vez **escucha**, la otra vez **habla**.

## Con un ESP32

Vamos a convertirlo en un sensor de verdad. [pausa] Conecta el cable negro a tierra y el rojo a una entrada analógica del ESP32. En paralelo, entre esos dos cables, pon una resistencia de un megaohmio. Sin ella, la carga no tiene por dónde irse y la lectura se queda pegada. Y un detalle que salva placas: los picos del piezo pueden superar los 3,3 voltios que aguanta el ESP32. Una resistencia en serie y un diodo zener de 3,3 voltios recortan esos picos. [pausa] El programa es sencillo. Lees la entrada miles de veces por segundo. Cuando la señal supera un umbral, hubo un golpe. Si quieres ver la señal, conéctalo a un osciloscopio: vas a ver un pico que sube de golpe y luego oscila y se apaga, como una campana. Si además guardas la altura del pico, sabes qué tan fuerte fue. Con eso ya tienes un pad de batería electrónica, un contador de pasos para una escalera o una cerradura que solo abre con tu ritmo secreto de golpes. [pausa] Si pegas el disco debajo de una mesa, toda la mesa se vuelve sensible. Y si pones tres discos en distintas esquinas, puedes comparar en qué instante le llega la vibración a cada uno y estimar dónde tocaste. Así funcionan algunas superficies interactivas.

## Los límites

Un piezo no mide fuerzas quietas, como ya viste. Si lo calientas demasiado, por encima de su temperatura de Curie, sus regiones se desordenan y pierde el efecto. Para recuperarlo habría que volver a polarizarlo. Y el PZT lleva plomo, así que se buscan cerámicas sin plomo que respondan igual de bien. También se investigan películas piezoeléctricas flexibles para ropa, zapatos y puentes que se vigilen a sí mismos.

## Tres datos

Tres datos para tu próxima conversación. [pausa] Uno: tu reloj de cuarzo tiene un diapasón de cristal que vibra **32.768** veces por segundo. No es un número al azar: es 2 elevado a la 15. Un circuito lo divide entre dos quince veces seguidas y obtiene un pulso por segundo. [pausa] Dos: tus huesos son ligeramente piezoeléctricos. El colágeno genera pequeñas cargas cuando el hueso soporta peso, y se estudia su papel en cómo el hueso se fortalece. [pausa] Tres: en Japón se probaron baldosas piezoeléctricas en estaciones de tren para cosechar la energía de los pasos. Funcionan, pero modestamente: en la estación de Tokio, en 2008, el piso de una entrada generaba en un día la energía para encender un bombillo de cien vatios durante algo más de una hora. Un piso piezoeléctrico no va a encender una ciudad.

## Cierre

Recapitulemos. Un cristal sin centro de simetría, átomos que se corren al apretarlo, cargas que aparecen en sus caras. Con eso se encienden estufas, se ven bebés antes de nacer, se cuentan los segundos y se protege un motor. [pausa] La próxima vez que hagas clic en un encendedor, acuérdate: estás golpeando un cristal. [pausa] En el próximo episodio: por qué tu pantalla funciona con tu dedo, no funciona con guantes… y sí funciona con una salchicha.
