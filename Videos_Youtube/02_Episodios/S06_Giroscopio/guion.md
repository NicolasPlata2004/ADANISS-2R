# S06 · La fuerza de los huracanes en tu bolsillo

## Gancho

Los huracanes giran por una fuerza que aparece cuando algo se mueve sobre un planeta que da vueltas. [pausa] Esa misma fuerza aparece **dentro de tu celular** cada vez que lo giras, en un pedacito de silicio que vibra miles de veces por segundo. Gracias a ella, tu teléfono sabe que lo estás girando, un dron se mantiene quieto en el aire y unas gafas de realidad virtual te dejan mirar alrededor. [pausa] Y no, no es la fuerza que decide hacia dónde gira el agua de tu lavamanos. Eso es un mito, y hoy vas a entender por qué.

## Promesa

Se llama giroscopio MEMS. En este video vas a ver qué es la fuerza de Coriolis, cómo un chip la aprovecha con una masa que vibra, por qué un giroscopio solo se pierde con el tiempo, y cómo usarlo con un ESP32 para que un robot se mantenga en equilibrio.

## Dónde está

En tu celular, el giroscopio trabaja junto al acelerómetro del episodio anterior. [pausa] Cuando giras el teléfono para ver una foto panorámica, cuando apuntas en un juego moviendo el celular o cuando la cámara estabiliza el video de tu mano temblorosa. Las gafas de realidad virtual lo usan para que el mundo virtual gire exactamente cuando giras la cabeza; si se retrasa, te mareas. [pausa] Los drones dependen de él para no voltearse: cientos o miles de veces por segundo miden cómo están girando y corrigen la velocidad de cada motor. Los carros modernos tienen un sensor de giro que nota cuando el carro empieza a derrapar y frena una rueda para enderezarlo. Los patinetes que se equilibran solos y los cohetes también lo usan.

## El giroscopio clásico

Antes de los chips, un giroscopio era una rueda que giraba muy rápido. [pausa] Si alguna vez jugaste con un trompo, ya lo conoces: mientras gira, se resiste a caerse, y en vez de caer, su eje da vueltas despacio. Una rueda así, montada en aros que la dejan girar libre, mantiene su eje apuntando siempre en la misma dirección. Esa terquedad es el momento angular. [pausa] En 1852, el físico francés Léon Foucault usó una rueda así para demostrar que la Tierra gira, y le puso el nombre: giroscopio, que significa algo como "observar el giro". Un año antes había hecho lo mismo con su famoso péndulo en el Panteón de París. [pausa] Durante el siglo veinte, los giroscopios mecánicos guiaron barcos, aviones y misiles. Eran maravillas de precisión, pero pesadas, caras y llenas de piezas que se desgastan. El reto era meter esa capacidad en un chip.

## La física

Para eso hay que entender la fuerza de Coriolis. [pausa] Imagina que estás sobre un carrusel girando y le lanzas una pelota a un amigo que está en el borde. Desde afuera, la pelota viaja en línea recta. Pero para ti, que giras con el carrusel, la pelota se curva hacia un lado, como si una fuerza invisible la empujara. Esa fuerza aparente es la fuerza de Coriolis. [pausa] Aparece cuando algo se **mueve** dentro de algo que **gira**. Y tiene dos propiedades clave: empuja de lado, perpendicular al movimiento, y es más fuerte cuanto más rápido gira todo y cuanto más rápido se mueve el objeto. [pausa] La Tierra es un carrusel gigante. El aire que corre hacia un centro de baja presión se desvía de lado y termina girando: en el hemisferio norte, en contra de las agujas del reloj; en el sur, a favor. Así nacen los remolinos de los huracanes. [pausa] Pero en tu lavamanos la fuerza de Coriolis es diminuta comparada con la forma del recipiente, la manera en que lo llenaste o un pequeño remolino que quedó en el agua. El agua puede girar hacia cualquier lado en cualquier hemisferio.

## Por dentro

Ahora, el chip. [pausa] Dentro hay una pequeña masa de silicio colgada de resortes, parecida a la del acelerómetro, pero con una diferencia: no está quieta. Un circuito la hace **vibrar** sin parar, de un lado a otro, miles de veces por segundo, como un columpio diminuto. [pausa] Mientras el celular no gira, la masa solo vibra en esa dirección. Pero cuando lo giras, aparece la fuerza de Coriolis: la masa se está moviendo dentro de algo que gira, así que la empuja de lado. Como la masa va y viene, ese empujón también va y viene, al mismo ritmo de la vibración. [pausa] A los lados hay dedos que forman condensadores, como en el acelerómetro. Miden ese pequeño movimiento lateral. Cuanto más rápido giras, más grande es. Así el chip mide la velocidad de giro en grados por segundo. [pausa] Con tres estructuras así, o diseños más ingeniosos, mide el giro en los tres ejes: cuando cabeceas, cuando giras y cuando ladeas el teléfono.

## La deriva

Aquí viene el gran problema. [pausa] El giroscopio no te dice en qué ángulo estás. Te dice qué tan rápido estás girando. Para saber el ángulo, hay que sumar esos giros a lo largo del tiempo. Y en esa suma, cualquier pequeño error se acumula. [pausa] Si el sensor marca un grado por segundo de más, después de un minuto el teléfono cree que giró sesenta grados que nunca giró. A eso se le llama **deriva**. [pausa] La solución es combinar sensores. El acelerómetro sabe dónde está el suelo, pero es ruidoso y se confunde con los movimientos rápidos. El giroscopio es preciso a corto plazo, pero se deriva a largo plazo. Si los mezclas, confiando sobre todo en el giroscopio y corrigiendo poco a poco con el acelerómetro, obtienes lo mejor de los dos. A eso se le llama fusión de sensores, y la versión más sencilla se llama filtro complementario.

## Con un ESP32

El mismo módulo MPU-6050 del episodio anterior trae un giroscopio. [pausa] Cada lectura te da tres velocidades de giro. Para calcular un ángulo, multiplicas la velocidad por el tiempo que pasó desde la lectura anterior y lo vas sumando. Luego, en cada paso, mezclas: noventa y ocho por ciento del ángulo del giroscopio y dos por ciento del ángulo que calcula el acelerómetro. Esa sola línea de código elimina casi toda la deriva de la inclinación. El giro horizontal, como el de una brújula, necesita otra referencia: un magnetómetro. [pausa] Con eso puedes construir un robot que se equilibra sobre dos ruedas, como un péndulo invertido. El ESP32 lee el ángulo cientos de veces por segundo y un controlador PID mueve los motores hacia donde el robot se está cayendo, justo a tiempo para atraparlo.

## Los límites

Los giroscopios MEMS de un celular son baratos y pequeños, pero no son perfectos. [pausa] Su deriva cambia con la temperatura y con el tiempo, así que los teléfonos se recalibran solos cuando detectan que están quietos. Las vibraciones fuertes pueden confundirlos, porque la masa ya está vibrando y otra vibración la perturba, sobre todo si coincide con su frecuencia. En 2015, unos investigadores de Corea del Sur hicieron caer un dron con un parlante pegado a él, sonando justo a la frecuencia de su giroscopio. [pausa] Por eso los aviones y los cohetes usan giroscopios mucho más precisos, que miden el giro con luz: unos la hacen recorrer kilómetros de fibra óptica enrollada; otros, dar vueltas en un anillo de espejos. Cuestan miles de veces más.

## Tres datos

Tres datos para el camino. [pausa] Uno: las moscas tienen giroscopios. Detrás de las alas tienen dos órganos diminutos con forma de maza, llamados halterios, que vibran durante el vuelo. Cuando la mosca gira, la fuerza de Coriolis los desvía y la mosca lo siente. Es el mismo principio que el chip de tu celular, millones de años antes. [pausa] Dos: el primer iPhone no tenía giroscopio. Llegó en 2010, con el iPhone 4, y con él se popularizaron los juegos en los que apuntas girando el teléfono. [pausa] Tres: con un giroscopio de altísima precisión se puede medir la rotación de la Tierra, una vuelta cada día, desde un laboratorio cerrado sin ventanas.

## Cierre

Recapitulemos. Una masa de silicio que vibra sin parar, una fuerza que aparece cuando algo se mueve dentro de algo que gira, y unos condensadores que miden el empujón lateral. Con eso giran las fotos, se estabilizan los drones y se equilibran los robots. [pausa] La próxima vez que veas un huracán girando en el mapa del clima, acuérdate de que la misma fuerza aparece en tu bolsillo cada vez que giras el celular. [pausa] En el próximo episodio: cómo tu carro ve la pared de tu garaje con sonido… como un murciélago.
