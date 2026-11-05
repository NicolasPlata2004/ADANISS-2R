# S09 · Tu piel no es un termómetro

## Gancho

Toca una mesa de metal y luego una de madera que lleven horas en la misma habitación. El metal se siente **más frío**. [pausa] Pero están exactamente a la misma temperatura. Tu piel no mide la temperatura de lo que tocas: siente qué tan rápido se enfría ella misma. El metal le roba calor mucho más rápido, y tu cerebro lo interpreta como frío. [pausa] Medir temperatura de verdad es más difícil de lo que parece. Y para lograrlo hay sensores escondidos en tu cocina, en tu carro, en tu celular y dentro de cada procesador.

## Promesa

En este video vas a ver qué es realmente la temperatura, y cuatro formas muy distintas de medirla: un metal que se dobla, una resistencia que cambia, dos metales que fabrican voltaje y un sensor que mide calor sin tocar. Y al final, cómo hacer con un ESP32 un termómetro que te avisa en el celular.

## Dónde está

Hay sensores de temperatura por todas partes. [pausa] Tu celular tiene varios: vigilan la batería y el procesador, y bajan la velocidad de carga si algo se calienta demasiado. Tu carro mide la del motor y la del aire que entra. La nevera, el horno, el aire acondicionado y la plancha se controlan midiendo temperatura. [pausa] Y hay uno muy escondido: si tu estufa de gas tiene una perilla que debes mantener apretada unos segundos al encenderla, estás esperando que un sensor se caliente con la llama. Si la llama se apaga, ese sensor se enfría y el gas se cierra solo. [pausa] Hay otros que casi nadie imagina: dentro de cada procesador hay sensores de temperatura hechos con transistores, que aprovechan que el voltaje de un transistor baja unas dos milésimas de voltio por cada grado que sube.

## La física

Primero, ¿qué es la temperatura? [pausa] Es una medida de qué tan agitados están los átomos y las moléculas de algo. Más agitación, más temperatura. El calor es otra cosa: es la energía que pasa de lo caliente a lo frío. [pausa] Volvamos a las mesas. La superficie de tu piel está a unos 33 grados, y las mesas, a unos 22. El metal conduce el calor cientos de veces mejor que la madera, así que se lleva el calor de tu piel a toda velocidad. La madera, en cambio, se calienta justo donde la tocas y desde ahí te roba muy poco. Tu piel siente qué tan rápido se enfría ella misma, no la temperatura de la mesa. [pausa] Ahora, la regla de oro de cualquier termómetro: **solo mide su propia temperatura**. Por eso hay que darle tiempo para que llegue al equilibrio con lo que quieres medir. [pausa] Y para medir, se aprovecha cualquier cosa que cambie con la temperatura: el tamaño de un metal, su resistencia eléctrica, un voltaje o la luz infrarroja que emite. Vamos una por una.

## El metal que se dobla

Los metales se dilatan con el calor. La torre Eiffel puede ser varios centímetros más alta en verano que en invierno. [pausa] Si pegas dos láminas de metales distintos y las calientas, una se estira más que la otra y la pareja se dobla. Eso es un **bimetal**. [pausa] Los termostatos antiguos lo usaban como interruptor, y todavía está en muchos hervidores eléctricos: un disco bimetálico que, cuando le llega el vapor, se voltea de golpe con un clic y corta la corriente. No necesita electricidad para medir: el metal mismo es el sensor y el interruptor.

## Resistencias y voltajes

En electrónica, el sensor más común es el **termistor**: una pequeña perla de cerámica semiconductora. Cuando se calienta, se liberan más cargas que pueden moverse, y su resistencia baja. Uno típico tiene diez mil ohmios a 25 grados, y menos de la mitad a 45. Está en los termómetros digitales de fiebre, en las baterías y en las impresoras 3D. [pausa] Para medidas de precisión se usa platino. Un sensor Pt100 tiene exactamente 100 ohmios a cero grados y sube unos 0,39 ohmios por cada grado. [pausa] Y luego está el **termopar**. En 1821, el físico Thomas Seebeck notó que si unía dos metales distintos y calentaba una de las uniones, aparecía una corriente: la aguja de una brújula cercana se movía. Es un voltaje pequeñísimo, de unas cuarenta millonésimas de voltio por grado en el tipo más común, pero aguanta más de mil grados. Por eso se usa en hornos, turbinas y en esa perilla de la estufa. Eso sí, el termopar mide la diferencia de temperatura entre sus extremos, así que el circuito también necesita saber la temperatura de su propia conexión.

## Sin tocar

¿Y los termómetros de frente, los de pistola? [pausa] ¿Te acuerdas del episodio del sensor de movimiento? Todo lo que tiene temperatura brilla en infrarrojo. Estos termómetros miden ese brillo con una **termopila**: decenas de termopares diminutos en serie que se calientan con la luz infrarroja que llega. Más brillo, más voltaje. [pausa] Pero hay una trampa: no todo brilla igual. La piel y la mayoría de las pinturas emiten casi como un emisor ideal, pero un metal pulido emite muy poco y además refleja el calor de lo que tiene alrededor. Apunta un termómetro infrarrojo a una olla de acero brillante y te va a mentir.

## La historia

Medir temperatura con números es más reciente de lo que crees. [pausa] Hacia 1600, Galileo usó un termoscopio: un tubo de vidrio con aire que subía o bajaba una columna de agua, sin ninguna escala. En 1714, Daniel Fahrenheit fabricó termómetros de mercurio confiables, y años después propuso su escala. [pausa] Y en 1742, el astrónomo sueco Anders Celsius propuso una escala de cien grados… **al revés**: el agua hervía a cero y se congelaba a cien. Poco después de su muerte la invirtieron, y quedó como la conocemos.

## Con un ESP32

Para tu proyecto, uno de los sensores más prácticos es el DS18B20. [pausa] Viene en una sonda metálica a prueba de agua y entrega la temperatura ya convertida en número, con un error máximo de medio grado entre menos diez y 85 grados. Se conecta con tres cables: alimentación, tierra y datos, con una resistencia de 4,7 kilohmios entre datos y alimentación. [pausa] Su truco es que cada sensor trae un número de serie único grabado de fábrica, así que puedes colgar varios en el mismo cable y leerlos uno por uno. [pausa] Con eso puedes vigilar la nevera y recibir un mensaje si alguien deja la puerta abierta, controlar la temperatura de una pecera o de una incubadora, o hacer un termómetro de cocina que te avisa en el celular cuando la comida está lista.

## Los límites

Medir temperatura tiene trampas sutiles. [pausa] La primera: el sol. Un termómetro al sol mide su propio calentamiento, no el del aire. Por eso las estaciones meteorológicas los guardan a la sombra, en casetas blancas con rendijas para que circule el aire. [pausa] La segunda: el tiempo de respuesta. Una sonda gruesa tarda en alcanzar la temperatura de lo que mide. La tercera: la corriente que pasa por un sensor para medirlo también lo calienta un poquito. Y la cuarta: dónde lo pones. Junto a la ventana o cerca del techo, la misma habitación tiene temperaturas distintas.

## Tres datos

Tres datos para cerrar. [pausa] Uno: los famosos 37 grados vienen de un médico alemán del siglo diecinueve, Carl Wunderlich, que tomó la temperatura de miles de pacientes. Estudios recientes, con decenas de miles de personas, encuentran promedios un poco más bajos, cerca de 36,6, y cada persona tiene su propio normal. [pausa] Dos: el termómetro de Galileo, el decorativo con bolitas de colores flotando en un tubo, no lo inventó Galileo: lo desarrollaron científicos de Florencia años después de su muerte. [pausa] Tres: el cero absoluto, menos 273,15 grados, es el punto en que la agitación sería la mínima posible. Nunca se puede alcanzar, pero en laboratorios se ha llegado a menos de una milmillonésima de grado por encima de él.

## Cierre

Recapitulemos. Un metal que se dobla, una cerámica que cambia su resistencia, dos metales que fabrican voltaje y un sensor que mide el brillo infrarrojo. Cuatro formas de responder la misma pregunta: ¿qué tan agitados están los átomos? [pausa] La próxima vez que una mesa de metal se sienta helada, acuérdate: no está más fría que la de madera; solo te roba calor más rápido. [pausa] En el próximo episodio: cómo sabe tu báscula cuánto pesas… con un metal que se estira mucho menos que el grosor de un cabello.
