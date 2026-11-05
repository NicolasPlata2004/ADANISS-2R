# S08 · El chip que cronometra la luz

## Gancho

La luz es lo más rápido que existe: en un segundo le daría siete vueltas y media a la Tierra. [pausa] Y aun así, en muchos celulares hay un chip más pequeño que un grano de arroz capaz de **cronometrar** cuánto tarda la luz en ir hasta tu mano y volver. Ese viaje dura unas pocas milmillonésimas de segundo. [pausa] Con luz que rebota, muchos carros autónomos dibujan la calle en tres dimensiones, las aspiradoras robot hacen el mapa de tu casa y los arqueólogos encontraron ciudades mayas enteras escondidas bajo la selva. **Sin excavar.**

## Promesa

Se llama sensor de tiempo de vuelo, y su versión que escanea el entorno se llama LiDAR. En este video vas a ver cómo se cronometra algo tan rápido como la luz, por qué un solo fotón puede disparar una avalancha de electrones, y cómo medir distancias con un ESP32 y un sensor del tamaño de una lenteja.

## Dónde está

En muchos celulares hay sensores de este tipo, que ayudan a la cámara a enfocar rápido, incluso con poca luz. Algunos teléfonos y tabletas de gama alta traen un LiDAR que mide la habitación entera en tres dimensiones, para medir muebles o colocar objetos virtuales. [pausa] La segunda versión del Kinect, el accesorio de Xbox que veía tu cuerpo para jugar, era una cámara de tiempo de vuelo. [pausa] Muchos robotaxis llevan LiDAR en el techo, girando o escaneando decenas de veces por segundo. Los drones lo usan para mapear terrenos, y los ingenieros para medir carreteras, puentes y bosques árbol por árbol. [pausa] Y desde aviones, los arqueólogos han barrido selvas enteras. Algunos pulsos se cuelan entre las hojas, llegan al suelo y vuelven, y así aparecen pirámides, caminos y canales que nadie veía desde hacía más de mil años. En Guatemala, un solo estudio encontró más de sesenta mil estructuras.

## La física

La luz viaja a casi 300.000 kilómetros por segundo. Dicho de otra forma: en una milmillonésima de segundo, un nanosegundo, recorre unos 30 centímetros. [pausa] Un sensor de tiempo de vuelo hace lo mismo que el ultrasónico del episodio anterior: lanza un pulso, espera el rebote y mide el tiempo. La diferencia es la escala. Si un objeto está a un metro, la luz va y vuelve en unos 6,7 nanosegundos. Para medir con precisión de un centímetro, hay que distinguir diferencias de unas 67 **billonésimas** de segundo. Ningún cronómetro común se acerca a eso. [pausa] Hay dos estrategias. La directa: disparar pulsos de láser muy cortos y medir la llegada de cada uno con un reloj electrónico ultrarrápido. Y la indirecta: encender y apagar la luz millones de veces por segundo y medir cuánto se atrasa ese parpadeo cuando vuelve. [pausa] Hay un tercer truco que no mide tiempo: la triangulación. El láser sale por un lado, el punto de luz aparece en una cámara al otro lado, y su posición en la imagen depende de la distancia. Muchas aspiradoras robot usan esa idea en la torrecita que gira encima. [pausa] Casi todos usan luz infrarroja, invisible para ti. Muchos trabajan cerca de los 940 nanómetros, un color que llega debilitado en la luz del sol, porque el vapor de agua del aire lo absorbe. Así el sol molesta menos.

## Por dentro

El sensor más popular para proyectos es el VL53L0X, del tamaño de una lenteja. [pausa] Por un lado tiene un láser diminuto llamado VCSEL: en vez de salir por el borde del chip, la luz sale hacia arriba, por la superficie. Emite en 940 nanómetros, y su potencia es tan baja que es seguro para los ojos: es un láser de clase uno. [pausa] Por el otro lado tiene el receptor, y aquí está la magia: una matriz de diodos de avalancha de un solo fotón, llamados SPAD. Cada diodo se carga con un voltaje por encima de su punto de ruptura, como una trampa lista para saltar. Cuando llega un único fotón, libera un electrón; ese electrón se acelera y arranca otros, que arrancan otros más… y en una fracción de nanosegundo hay una **avalancha** de corriente que se puede medir. Un solo grano de luz dispara la trampa. Luego el circuito la apaga y la vuelve a cargar. [pausa] Pero un fotón suelto también puede venir del sol o de una lámpara. Por eso muchos de estos sensores disparan miles de pulsos y arman un histograma: cuentan cuántos fotones llegaron en cada instante. La luz ambiente cae en todos los instantes por igual, pero el eco del láser siempre llega al mismo tiempo y forma un pico. La posición de ese pico es la distancia. [pausa] Con un solo punto así tienes un medidor de distancia. Con miles de puntos, o con un espejo que barre el espacio, tienes un LiDAR.

## La historia

La palabra LiDAR viene del inglés: detección y medición de distancias con luz. [pausa] Apareció en los años sesenta, poco después de que Theodore Maiman construyera el primer láser, en 1960. En 1962, investigadores del MIT apuntaron un láser a la Luna y detectaron el eco que volvía de su superficie. [pausa] En 1969, los astronautas del Apolo 11 dejaron allá un panel de reflectores especiales que devuelven la luz justo hacia donde vino. Todavía hoy, observatorios en la Tierra les disparan pulsos de láser, cronometran un viaje de unos dos segundos y medio, y miden la distancia a la Luna con precisión de milímetros. Gracias a eso sabemos que la Luna se aleja de nosotros unos 3,8 centímetros cada año. [pausa] En 2007, en una competencia de carros autónomos organizada por el Departamento de Defensa de Estados Unidos, cinco de los seis carros que terminaron la carrera llevaban el mismo LiDAR giratorio en el techo.

## Con un ESP32

El módulo VL53L0X usa el bus I2C, así que bastan cuatro cables: alimentación, tierra y dos líneas de datos, y la mayoría de módulos trabajan sin problema con los 3,3 voltios del ESP32. [pausa] Con una librería, pides una medida y recibes directamente la distancia en milímetros, unas treinta veces por segundo. En el modo normal llega a algo más de un metro, y en el modo de largo alcance, a unos dos metros. [pausa] Un detalle: todos salen de fábrica con la misma dirección en el bus. Si quieres usar varios, tienes que encenderlos uno por uno y cambiarles la dirección. [pausa] Con eso puedes hacer un contador de personas que pasan por una puerta, un medidor de altura, un instrumento que suena según la distancia de tu mano o un robot que mapea una habitación girando el sensor con un servo. Y si quieres más, existen versiones que miden una cuadrícula de ocho por ocho zonas a la vez: una cámara de profundidad de sesenta y cuatro píxeles.

## Los límites

La luz también tiene trampas. [pausa] Las superficies negras y mate devuelven muy poca luz, así que el alcance baja. Los vidrios dejan pasar el pulso y los espejos lo mandan a otra parte. El sol directo inunda el receptor de fotones y le cuesta encontrar el eco. [pausa] En los carros, la lluvia, la niebla y la nieve dispersan los pulsos y crean ecos falsos. Y los LiDAR de alta gama siguen siendo caros: aquel modelo giratorio de 2007 costaba unos 75.000 dólares. Hoy hay modelos sin piezas que giren, mucho más baratos.

## Tres datos

Tres datos para cerrar. [pausa] Uno: el desbloqueo facial de algunos celulares no usa tiempo de vuelo. Proyecta más de treinta mil puntos infrarrojos sobre tu cara, y una cámara analiza cómo se deforman. [pausa] Dos: con una cámara que vea infrarrojo puedes ver los puntos que lanza el LiDAR de un celular: una cuadrícula de luz invisible que se posa sobre los muebles. [pausa] Tres: cada pulso que se dispara hacia los reflectores de la Luna lleva unos cien mil billones de fotones. Y aun con buen clima, se detecta más o menos **uno**.

## Cierre

Recapitulemos. Un láser invisible, un pulso que vuelve en milmillonésimas de segundo, diodos que se disparan con un solo fotón y un histograma que separa el eco del ruido. Con eso tu celular enfoca, los robots dibujan tu casa y descubrimos ciudades perdidas. [pausa] La próxima vez que tu cámara enfoque al instante, piensa que quizá acaba de cronometrar la luz. [pausa] En el próximo episodio: por qué una mesa de metal se siente más fría que una de madera… aunque estén exactamente a la misma temperatura.
