# S05 · El resorte invisible que sabe dónde está el suelo

## Gancho

Gira tu celular y la pantalla gira con él. [pausa] ¿Cómo sabe hacia dónde está el suelo? No tiene ojos, no tiene brújula para eso. Tiene algo mucho más extraño: un pedacito de silicio colgando de **resortes más delgados que un cabello**. Cuando lo inclinas, ese pedacito se mueve menos que el tamaño de un virus. Y con ese movimiento, tu teléfono cuenta tus pasos, tu reloj sabe si te caíste y el airbag de un carro decide si dispararse.

## Promesa

Se llama acelerómetro MEMS. En este video vas a ver una máquina con piezas móviles que cabe en la cabeza de un alfiler, por qué la gravedad y la aceleración son para él exactamente lo mismo, y cómo medir la inclinación de cualquier cosa con un ESP32.

## Dónde está

Tu celular lo usa todo el tiempo. [pausa] Para girar la pantalla, para contar pasos y para ese truco de sacudir el teléfono y deshacer lo que escribiste. Tu reloj inteligente lo usa para detectar caídas. Los controles de videojuegos que se manejan moviéndolos, los drones que se mantienen nivelados, las cámaras que estabilizan el video. [pausa] En los carros, un acelerómetro siente el frenazo de un choque y decide en milésimas de segundo si inflar el airbag. Muchos portátiles antiguos con disco duro tenían uno para detectar que estaban cayendo y estacionar el cabezal antes del golpe. [pausa] Y hay algo más impresionante: millones de celulares en el mundo pueden funcionar como una red de sismógrafos. Cuando muchos sienten la misma sacudida al mismo tiempo, el sistema puede enviar alertas de terremoto segundos antes de que la onda llegue a otras ciudades.

## La física

La idea es tan vieja como Newton. [pausa] Imagina una pesa colgada de un resorte dentro de una caja. Si aceleras la caja hacia arriba, la pesa se queda un poquito atrás, por inercia, y el resorte se estira. Si frenas, la pesa sigue de largo y el resorte se encoge. Mides cuánto se estiró el resorte y sabes cuánto aceleró la caja. [pausa] Ahora viene lo raro. Si la caja está quieta sobre la mesa, el resorte **también** está estirado: la gravedad tira de la pesa hacia abajo. Para el sensor, estar quieto en la Tierra se siente exactamente igual que acelerar hacia arriba en el espacio. Einstein convirtió esa equivalencia en la base de su teoría de la gravedad. [pausa] Eso es justo lo que aprovecha tu celular. Cuando está quieto, el acelerómetro mide la gravedad, una aceleración de unos 9,8 metros por segundo cada segundo, apuntando hacia arriba. Si mides cuánto de esa aceleración cae en cada uno de tres ejes, sabes cómo está inclinado el teléfono. Así decide hacia dónde girar la pantalla. [pausa] Y cuando caminas, cada paso es un pequeño golpe que sube y baja. El celular cuenta esos golpes y los convierte en pasos.

## Por dentro

Ahora, ¿cómo se mete una pesa con resortes dentro de un chip? [pausa] Con la misma técnica con la que se fabrican los procesadores: grabando silicio. A esto se le llama MEMS, sistemas microelectromecánicos. [pausa] La pesa es una placa de silicio de una fracción de milímetro. Cuelga de vigas tan delgadas que se doblan como resortes: unas pocas micras de ancho, decenas de veces más delgadas que un cabello. A los lados de la pesa salen muchos dedos, como un peine, y entre ellos hay otros dedos fijos. [pausa] Cada par de dedos, uno móvil y uno fijo, forma un pequeño condensador. Cuando la pesa se mueve, los dedos se acercan o se alejan, y la capacitancia cambia. Un circuito en el mismo chip mide esos cambios, que son diminutos, y los convierte en números. [pausa] Para medir en tres direcciones hay tres estructuras así, o una sola pesa diseñada para moverse en tres ejes. Todo eso, junto con su electrónica, cabe en un chip de unos pocos milímetros. Y se fabrican por miles en una sola oblea de silicio.

## La historia

Los primeros acelerómetros de silicio se hicieron en laboratorios universitarios a finales de los años setenta. [pausa] El primer gran mercado fue el airbag. A principios de los años noventa, la empresa Analog Devices lanzó un acelerómetro en un chip pensado para decidir cuándo inflarlo. Antes se usaban interruptores mecánicos con bolitas y resortes. [pausa] El segundo gran salto fue el entretenimiento. En 2006, una consola popularizó los controles que se manejan moviendo el brazo, con un acelerómetro adentro. Y un año después llegaron al gran público los teléfonos inteligentes que giran la pantalla solos. Desde entonces, el acelerómetro se volvió uno de los sensores más fabricados del planeta.

## El airbag

Detengámonos en el airbag, porque ahí el acelerómetro tiene que ser rapidísimo. [pausa] En un choque de frente, el carro pasa de ir a velocidad de ciudad a quedar quieto en más o menos una décima de segundo. El acelerómetro siente una desaceleración enorme, de decenas de veces la gravedad. Pero un bache fuerte o un portazo también dan golpes bruscos, y nadie quiere que el airbag se infle por un hueco en la calle. [pausa] Por eso la computadora no se fija en un solo pico: mira la forma de la señal durante unas milésimas de segundo y la compara con patrones de choque. Si decide inflar, una pequeña carga química llena la bolsa en unas tres centésimas de segundo. Todo eso ocurre antes de que tu cuerpo alcance a llegar al volante.

## Con un ESP32

Hagamos un nivel electrónico. [pausa] Un módulo muy común es el MPU-6050, que trae un acelerómetro y un giroscopio de tres ejes. Se conecta al ESP32 con solo cuatro cables: alimentación, tierra y dos líneas de datos por el bus I2C. [pausa] El sensor te entrega tres números, uno por eje, cientos de veces por segundo. Si el módulo está plano sobre la mesa, casi toda la gravedad cae en el eje Z. Si lo inclinas, una parte pasa al eje X o al Y. Con un poco de trigonometría, la función arcotangente, conviertes esos tres números en dos ángulos: cuánto está inclinado hacia adelante y cuánto hacia el lado. [pausa] Con eso puedes hacer un nivel de burbuja digital, una alarma que suena si alguien mueve tu bicicleta, un contador de repeticiones para el gimnasio o un detector de caídas. Y si pones el sensor sobre una máquina, puedes ver cómo vibra y detectar cuándo algo empieza a fallar.

## Los límites

El acelerómetro tiene una debilidad famosa. [pausa] Como no distingue gravedad de aceleración, cuando el celular se mueve y gira al mismo tiempo se confunde: no sabe qué parte es inclinación y qué parte es movimiento. Por eso casi siempre trabaja junto a un giroscopio, que veremos en el próximo episodio. [pausa] Y hay otra trampa: podrías pensar que integrando la aceleración obtienes la velocidad, e integrando otra vez, la posición. En teoría sí. En la práctica, cada pequeño error se acumula, y en pocos segundos la posición calculada se va a cualquier parte. Un acelerómetro solo no puede reemplazar al GPS.

## Tres datos

Tres datos para terminar. [pausa] Uno: cuando el teléfono cae libremente, el acelerómetro marca casi cero. En caída libre, la pesa y la caja caen juntas y el resorte no se estira. Los astronautas en órbita viven así todo el tiempo. [pausa] Dos: los acelerómetros de tu celular son tan sensibles que algunos estudios lograron reconstruir sonidos a partir de las diminutas vibraciones que el parlante provoca dentro del propio teléfono. [pausa] Tres: dentro de tu oído interno tienes tu propio acelerómetro biológico: pequeños cristales de carbonato de calcio sobre una capa gelatinosa con pelos sensibles. Cuando inclinas la cabeza, se desplazan un poquito, doblan esos pelos, y tu cerebro sabe hacia dónde está el suelo.

## Cierre

Recapitulemos. Una pesa de silicio, resortes más delgados que un cabello, dedos que forman condensadores y un circuito que mide cuánto se acercan. Con eso tu celular gira la pantalla, cuenta tus pasos, detecta caídas y hasta ayuda a avisar terremotos. [pausa] La próxima vez que tu pantalla gire sola, acuérdate de que dentro hay una máquina diminuta colgando de resortes. [pausa] En el próximo episodio: el sensor que siente los giros gracias a la misma fuerza que desvía los huracanes.
