# S02 · Tu pantalla no siente tu dedo

## Gancho

Tu pantalla no siente tu dedo. **Siente el agua salada que llevas por dentro.** [pausa] Por eso, si te pones guantes de lana, el celular te ignora. Pero si tocas la pantalla con una salchicha, **funciona**. Y si le cae una gota de agua, a veces se pone a tocar cosas solo. [pausa] Todo eso tiene la misma explicación, y está escondida en una rejilla invisible que tienes justo debajo del vidrio. Una rejilla que mide algo que tu cuerpo hace todo el tiempo sin que lo notes.

## Promesa

En este video vas a ver qué hay debajo de ese vidrio, capa por capa; por qué tu dedo deforma un campo eléctrico que el celular revisa cien veces por segundo; y cómo construir un botón táctil con papel aluminio y un ESP32.

## Dónde está

Empecemos por lo obvio: el celular, la tableta y el reloj inteligente. [pausa] Pero también el touchpad del portátil, la pantalla del carro, los botones de muchas estufas de inducción, los ascensores modernos y las lámparas que se encienden con solo tocarlas. Muchos audífonos inalámbricos que pausan la música con un toque usan el mismo principio, y algunos grifos y dispensadores también. [pausa] Antes era distinto. Muchos cajeros viejos, las primeras agendas electrónicas y la consola Nintendo DS tenían pantallas resistivas: dos láminas flexibles que se tocaban cuando hacías presión. Funcionaban con cualquier cosa, hasta con una uña, pero solo detectaban un punto a la vez y había que apretar. La pantalla capacitiva cambió eso: no necesita fuerza, solo cercanía. Y eso es lo que la hace sentir mágica.

## La física

Para entenderla necesitamos una sola idea: el **condensador**. [pausa] Toma dos piezas de metal y sepáralas con algo que no conduzca, como aire o plástico. Si conectas una a un voltaje, se llena de cargas, y esas cargas atraen cargas contrarias en la otra pieza, aunque no se toquen. Entre las dos aparece un campo eléctrico, como hilos invisibles que van de una a otra. A la cantidad de carga que pueden guardar por cada voltio se le llama capacitancia. [pausa] Ahora la parte importante: tu cuerpo es un conductor. Por dentro eres básicamente agua con sal. Cuando acercas el dedo a esas dos piezas de metal, tu dedo se convierte en un tercer conductor que se roba parte de esos hilos de campo. El campo que antes iba de una pieza a la otra ahora se desvía hacia ti. [pausa] Resultado: la capacitancia entre las dos piezas **cambia**. Muy poquito, pero cambia. Y eso se puede medir. [pausa] Tu pantalla no detecta presión, ni calor, ni la forma de tu dedo. Detecta ese pequeño robo de campo eléctrico. Por eso un guante de lana no sirve: la lana no conduce y es gruesa, así que tu dedo queda demasiado lejos del vidrio y el cambio es tan pequeño que el chip lo ignora. Y por eso una salchicha sí sirve: tiene agua y sal, igual que tú. Para la pantalla, una salchicha es un dedo bastante convincente.

## La rejilla

Ahora, ¿cómo sabe dónde tocaste? [pausa] Debajo del vidrio hay dos capas de pistas transparentes, hechas de óxido de indio y estaño, un material que conduce la electricidad y deja pasar la luz. Una capa tiene filas y la otra, columnas, separadas por una película aislante. Donde una fila cruza una columna se forma un pequeño condensador. Una pantalla de celular tiene unas pocas decenas de filas y columnas, y eso da cientos de cruces. [pausa] Un chip controlador hace un barrido: le manda una señal a la primera fila y escucha en todas las columnas cuánta llega a cada cruce. Luego la segunda fila, luego la tercera. Repite la pantalla completa unas cien veces por segundo, y en algunos celulares para juegos, varios cientos. [pausa] Cuando tu dedo está cerca de un cruce, a esa columna le llega un poco menos de señal. El chip arma un mapa de todos los cruces, como un mapa de calor, y busca las manchas. Tu dedo casi nunca cae justo sobre un cruce, así que compara los cruces vecinos y calcula el centro con precisión de fracciones de milímetro. Como mide cada cruce por separado, puede ver dos, cinco o diez dedos a la vez. Eso es lo que permite hacer zoom con dos dedos.

## La historia

La idea es más vieja de lo que parece. En 1965, el ingeniero británico Eric Johnson describió una pantalla táctil capacitiva para controladores de tráfico aéreo. A principios de los años setenta, en el CERN, Frank Beck y Bent Stumpe construyeron pantallas táctiles capacitivas para controlar uno de sus aceleradores de partículas. [pausa] Durante décadas fue tecnología de nicho, cara y difícil de fabricar. El gran salto llegó en 2007, cuando un teléfono puso una pantalla capacitiva multitáctil en el bolsillo de millones de personas y convirtió el gesto de deslizar con el dedo en algo que hoy hasta un bebé intenta hacer con una revista.

## Agua y guantes

Ahora entiendes los problemas. [pausa] El agua conduce, así que una gota también se roba campo y la pantalla puede confundirla con un dedo. Por eso los celulares mezclan dos formas de medir y descartan manchas que no se comportan como un dedo. Bajo el agua, la pantalla queda casi ciega, porque toda la superficie parece tocada al mismo tiempo. [pausa] Los guantes táctiles tienen hilos de plata o de cobre cosidos en las puntas de los dedos, que hacen de puente eléctrico entre tu dedo y el vidrio. Los lápices baratos tienen una punta de goma conductora, ancha como un dedo, porque la pantalla no ve bien puntas finas. Los lápices activos, en cambio, emiten su propia señal, y por eso pueden ser tan finos y medir la inclinación. [pausa] Y un protector de vidrio delgado no estorba: el campo eléctrico lo atraviesa sin problema. Uno demasiado grueso sí puede hacerla menos sensible.

## Con un ESP32

Puedes construir tu propio botón táctil en cinco minutos. [pausa] El ESP32 trae varios pines con sensor capacitivo incluido. Pega un cuadrado de papel aluminio sobre un cartón, conéctale un cable y llévalo a uno de esos pines. En el programa, la función touchRead te devuelve un número. En el ESP32 clásico, cuando no hay nada cerca, el número es alto, y cuando acercas el dedo, baja. [pausa] Solo tienes que elegir un umbral: si la lectura cae por debajo, hay un toque. Y lo más sorprendente: funciona aunque pongas una hoja de papel o una lámina delgada de acrílico encima del aluminio. Con eso puedes hacer interruptores escondidos en una mesa, una lámpara que se enciende al tocar la base o un pequeño piano de cartón. Si pones varios cuadrados en fila, ya tienes un deslizador, como el control de volumen de algunos parlantes.

## Los límites

La pantalla capacitiva tiene límites claros. [pausa] No funciona bien con cosas que no conducen: uñas, guantes normales, la punta de un esfero. Le cuesta con agua y con manos muy secas. Y su resolución depende de la rejilla: por eso escribir a mano exige lápices especiales. Para el futuro, ya hay pantallas que miden la fuerza con la que presionas, superficies flexibles que se doblan con la pantalla y sensores que detectan el dedo antes de tocar el vidrio.

## Tres datos

Tres datos rápidos. [pausa] Uno: tu pantalla te detecta aunque no la toques. Si acercas el dedo a pocos milímetros, el campo ya cambia; los celulares simplemente ignoran esa señal hasta que estás muy cerca. [pausa] Dos: hace años circuló una noticia desde Corea del Sur sobre gente que usaba salchichas para manejar el celular en invierno sin quitarse los guantes. Funciona por la misma razón que tu dedo. [pausa] Tres: el material de las pistas, el óxido de indio y estaño, es tan importante para pantallas y paneles solares que el indio se considera una materia prima crítica, y se investiga cómo reemplazarlo.

## Cierre

Recapitulemos. Una rejilla invisible de pequeños condensadores, un chip que la barre cien veces por segundo y un dedo que se roba un poquito de campo eléctrico. Por eso los guantes fallan, las gotas engañan y una salchicha funciona. [pausa] La próxima vez que deslices el dedo por la pantalla, acuérdate: la pantalla no siente que la tocas. Siente que le robas campo eléctrico. [pausa] En el próximo episodio: el sensor que enciende la luz del baño cuando entras… y por qué te la apaga si te quedas quieto.
