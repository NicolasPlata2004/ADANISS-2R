# S10 · El metal que se estira cuando te pesas

## Gancho

Cuando te subes a una báscula digital, el metal que está debajo de ti **se dobla**. [pausa] Muy poco. El sensor pegado a ese metal se estira apenas unas millonésimas de metro: mucho menos que el grosor de un cabello. Y aun así, con ese estiramiento diminuto, la báscula muestra tu peso con divisiones de cien gramos. [pausa] Ese mismo sensor vigila puentes, pesa camiones enteros y comprueba que las alas de los aviones aguanten. Se llama galga extensiométrica, y en el fondo es una tira de metal finísima, en zigzag, que cambia su resistencia cuando la estiras.

## Promesa

En este video vas a ver por qué un metal cambia su resistencia al estirarse, cómo un puente de cuatro resistencias detecta cambios diminutos, qué hay dentro de una celda de carga, dónde hay galgas escondidas, y cómo hacer una báscula con un ESP32.

## Dónde está

Las básculas de baño y de cocina son el ejemplo obvio. Las de baño suelen tener cuatro sensores, uno en cada pata, y suman lo que mide cada uno. [pausa] En el supermercado está la báscula de las frutas; en las carreteras, las básculas que pesan camiones completos; en las grúas, el sistema que impide levantar más de lo permitido. Algunas impresoras 3D detectan cuándo la boquilla toca la cama midiendo una fuerza diminuta. [pausa] Los ingenieros pegan galgas en puentes, presas y edificios para vigilar cómo se deforman con los años, y en piezas de aviones y carros de carreras para medir los esfuerzos reales. [pausa] Y en muchos celulares hay un primo suyo: el barómetro, una membrana diminuta de silicio con resistencias que cambian cuando la presión del aire la dobla. Es tan sensible que puede notar que subiste un piso por las escaleras.

## La física

¿Por qué un metal cambia su resistencia cuando lo estiras? [pausa] La resistencia de un hilo depende de su forma: cuanto más largo y más delgado, más le cuesta a la corriente pasar, como a la gente que trata de avanzar por un pasillo largo y estrecho. Cuando estiras un hilo, se alarga y se adelgaza al mismo tiempo, y su resistencia **sube**. Si lo comprimes, baja. [pausa] El cambio es pequeñísimo. Por eso una galga no es un hilo recto: es una lámina de metal en zigzag, con muchas idas y vueltas, sobre una película plástica que se pega a la pieza. Así, en un espacio pequeño cabe un hilo largo, y todas sus idas y vueltas se estiran en la misma dirección. [pausa] Un número clave es el factor de galga, que en las galgas metálicas comunes vale cerca de **dos**. Significa que si la pieza se estira una millonésima de su largo, la resistencia cambia unas dos millonésimas. [pausa] Un ejemplo: con una galga de 350 ohmios, estirar el metal una milésima de su largo, que ya es bastante para una pieza de acero, cambia su resistencia apenas 0,7 ohmios. Medir algo así exige un truco.

## La historia

El primero en notar el efecto fue William Thomson, más conocido como Lord Kelvin, en 1856: vio que los hilos de cobre y de hierro cambiaban su resistencia al estirarlos. [pausa] Pero la galga pegada nació en 1938, inventada casi al mismo tiempo por dos personas. Edward Simmons, en el Instituto de Tecnología de California, estudiaba cómo responden los metales a los golpes. Y Arthur Ruge, en el MIT, estudiaba cómo los terremotos sacudían los tanques de agua elevados, con un modelo tan delgado que ningún instrumento de la época podía medir cómo se deformaba. Ruge pegó un hilo finísimo sobre papel, pegó el papel al tanque… y funcionó. [pausa] Desde entonces, la galga se volvió una herramienta básica de la ingeniería.

## El puente

El truco para medir cambios tan pequeños tiene casi doscientos años: el puente de Wheatstone. [pausa] Imagina cuatro resistencias en forma de rombo, alimentadas por arriba y por abajo. Si las cuatro son iguales, los dos lados del rombo quedan al mismo voltaje, y entre ellos la diferencia es **cero**. Pero si una cambia un poquito, aparece una pequeña diferencia de voltaje. [pausa] La gracia es que medir algo pequeño que parte de cero es mucho más fácil que medir un cambio diminuto sobre un valor grande. Y si en vez de una galga pones cuatro, dos que se estiran y dos que se comprimen, la señal se multiplica por cuatro, y los cambios de temperatura se cancelan, porque afectan a las cuatro por igual. [pausa] Aun así, la señal final es de apenas unas milésimas de voltio.

## Por dentro

Ahora, la celda de carga, la pieza que está dentro de tu báscula de cocina. [pausa] Es una barra de aluminio con un agujero en el centro, con forma de ocho alargado. Ese agujero adelgaza la barra en cuatro puntos, y justo ahí están pegadas las galgas. Cuando pones peso en un extremo, la barra se deforma como una ese muy suave: dos puntos se estiran y dos se comprimen. [pausa] Esas cuatro galgas forman el puente completo. Por eso salen cuatro cables: dos para alimentar el puente, normalmente rojo y negro, y dos para la señal, normalmente verde y blanco. [pausa] La barra está diseñada para que, con su peso máximo, se doble apenas unas décimas de milímetro y vuelva siempre a su forma. Si la sobrecargas mucho, el aluminio se deforma para siempre y la celda queda inservible.

## Con un ESP32

Para leer esas milésimas de voltio necesitas un amplificador especial, como el módulo HX711. [pausa] Es un convertidor de 24 bits: divide su rango en más de dieciséis millones de pasos. Amplifica la señal del puente 128 veces y entrega el resultado por dos pines digitales, diez u ochenta veces por segundo. La celda se conecta al HX711 con sus cuatro cables, y el HX711 al ESP32 con otros cuatro: alimentación, tierra, datos y reloj. [pausa] Luego hay que calibrar. Primero, con la báscula vacía, guardas la lectura como cero: eso es la tara. Después pones algo de peso conocido, por ejemplo un litro de agua, que sin el envase pesa casi exactamente un kilo, y calculas cuántos pasos del convertidor equivalen a un gramo. [pausa] Con eso puedes hacer una báscula de cocina, un comedero que avisa cuando tu mascota se queda sin comida, un contador de piezas por peso o una colmena que te dice cuánta miel tiene.

## Los límites

Las galgas tienen sus manías. [pausa] La temperatura cambia la resistencia del metal y dilata la barra, así que los buenos diseños la compensan. Si dejas un peso encima mucho tiempo, la lectura se arrastra un poquito: a eso se le llama fluencia. Las vibraciones meten ruido, y si la fuerza llega de lado o en el punto equivocado, la lectura sale mal. [pausa] Por eso una báscula de precisión no es solo un sensor: es una pieza de metal bien diseñada, una galga bien pegada y una electrónica que filtra el ruido.

## Tres datos

Tres datos para cerrar la serie. [pausa] Uno: tu báscula mide fuerza, no masa. En los polos la gravedad es un poco más fuerte que en el ecuador, así que la misma persona marcaría cerca de medio por ciento más. Una balanza de dos platos, en cambio, compara masas y marca lo mismo en cualquier lugar. [pausa] Dos: hasta 2019, el kilogramo era un cilindro de metal guardado bajo tres campanas de vidrio cerca de París. Hoy se define a partir de una constante de la física, la constante de Planck. [pausa] Tres: para certificar un avión de pasajeros, sus alas se cargan hasta una vez y media la máxima carga esperada en vuelo, llenas de galgas que registran cada deformación. En la prueba del Boeing 787, en 2010, las puntas de las alas subieron unos siete metros y medio.

## Cierre

Recapitulemos. Un metal en zigzag que se alarga, un puente de cuatro resistencias que convierte ese cambio en voltaje y un amplificador que lo cuenta en millones de pasos. Con eso se pesan tus frutas, tus maletas y los camiones, y se vigilan puentes y aviones. [pausa] La próxima vez que te subas a una báscula, acuérdate: debajo de ti hay un metal que se estira mucho menos que el grosor de un cabello… y lo nota. [pausa] Con esto cerramos esta serie de diez sensores. ¿Cuál quieres que expliquemos en la próxima temporada? Déjalo en los comentarios.
