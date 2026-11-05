# S03 · Por qué la luz del baño te deja a oscuras

## Gancho

Entras al baño y la luz se enciende sola. Te quedas quieto un minuto… y te deja **a oscuras**. Mueves el brazo como un loco y vuelve. [pausa] No es que el sensor se haya dormido. Es que nunca te estuvo viendo a ti. Ese sensor no ve formas ni colores. Ve **calor**. Y ni siquiera eso: solo ve cuando el calor **cambia**. Si te quedas quieto, para él dejas de existir.

## Promesa

Se llama sensor PIR, infrarrojo pasivo. En este video vas a ver qué hay detrás de esa cúpula blanca, por qué está llena de pequeñas lupas, qué cristal convierte tu calor en electricidad, y cómo usarlo con un ESP32 para que una cámara a batería solo despierte cuando pasa alguien.

## Dónde está

Lo ves en todas partes, aunque nunca le pongas atención. [pausa] En las luces de pasillos, baños y escaleras de edificios. En las alarmas de las casas, esa cajita en la esquina del techo con una lucecita roja que parpadea cuando pasas. En las cámaras de seguridad que funcionan con baterías: se mantienen dormidas para ahorrar energía, y un PIR las despierta cuando detecta movimiento. En algunas puertas automáticas, en reflectores de jardín y en termostatos que saben si hay alguien en la habitación. [pausa] Es uno de los sensores más baratos que existen. Un módulo completo cuesta menos que un almuerzo. Y casi siempre se reconoce por lo mismo: una pequeña cúpula blanca, con la superficie llena de facetas, como el ojo de una mosca.

## La física

Todo lo que tiene temperatura brilla. [pausa] No con luz que puedas ver, sino con luz infrarroja. Un objeto más caliente emite más, y en ondas más cortas. El sol brilla sobre todo en luz visible. La resistencia de una estufa al rojo vivo emite sobre todo infrarrojo, y solo una pequeña parte alcanza a ser rojo visible. Y tú, a unos 37 grados, brillas sobre todo en un infrarrojo lejano, con ondas de unas nueve o diez micras. [pausa] Las paredes, el piso y los muebles también brillan, pero un poco menos, porque están más fríos que tú. Así que, para un sensor de infrarrojo, eres una mancha brillante caminando sobre un fondo un poco más oscuro. Una cámara térmica convierte ese brillo en una imagen con miles de píxeles. El sensor PIR es mucho más humilde, y mucho más barato. [pausa] Ahora, ¿cómo se convierte ese brillo en electricidad? Con un material **piroeléctrico**: un cristal que genera cargas en sus caras cuando su temperatura **cambia**. Es primo del piezoeléctrico del primer episodio. De hecho, todos los cristales piroeléctricos también son piezoeléctricos. En los sensores PIR se usa, por ejemplo, tantalato de litio. [pausa] Fíjate en la palabra clave otra vez: cuando su temperatura cambia. Si el cristal se calienta y se queda caliente, las cargas se escapan poco a poco y la señal desaparece. Por eso el sensor no ve objetos calientes. Ve **cambios** de calor. Y por eso, cuando te quedas quieto, te vuelves invisible.

## Dos ojos

Dentro de la lata metálica del sensor no hay un cristal, hay dos. Y están conectados al revés. [pausa] ¿Por qué? Porque si la habitación entera se calienta poco a poco, los dos cristales reciben el mismo cambio al mismo tiempo, y sus señales se cancelan. El sensor no se dispara. [pausa] Pero cuando una persona cruza frente a él, su calor llega primero a un cristal y luego al otro. El primero da un pulso positivo, el segundo un pulso negativo. Esa pareja de pulsos es la firma de algo que se mueve. La lata metálica que los rodea los protege de interferencias eléctricas y de corrientes de aire. Es como una cámara térmica de solo dos píxeles, conectados para notar diferencias. [pausa] Encima de los cristales hay una ventana de silicio que deja pasar el infrarrojo lejano y bloquea la luz visible. Así una linterna o un bombillo no lo engañan.

## La cúpula

Ahora sí, esa cúpula blanca. [pausa] Parece un plástico opaco, pero deja pasar buena parte del infrarrojo lejano. Y no es una sola lente: es un mosaico de lentes de Fresnel, pequeñas lupas planas talladas en el plástico. Cada lupa enfoca una franja distinta de la habitación sobre los dos cristales. [pausa] El resultado es que el sensor divide el espacio en zonas, como los dedos de una mano abierta, con huecos entre ellas. Cuando caminas, entras y sales de esas zonas una y otra vez, y cada entrada genera una nueva pareja de pulsos. Más zonas, más sensibilidad. [pausa] Eso explica algo curioso: es más fácil que te detecte si caminas **cruzando** frente a él que si caminas directo hacia él. De frente te quedas en la misma zona y el cambio es pequeño. Cruzando, saltas de zona en zona.

## La electrónica

Las señales del cristal son diminutas, así que el módulo más común, el HC-SR501, trae un chip que las amplifica, las filtra y las compara con un umbral. Cuando ve la firma de movimiento, pone su salida en alto. [pausa] Tiene dos perillas. Una ajusta la sensibilidad, que equivale a la distancia: de unos tres a siete metros. La otra ajusta cuánto tiempo se queda encendida la salida después del último movimiento: de unos segundos a varios minutos. Y un puente que decide si cada nuevo movimiento reinicia ese tiempo o no. [pausa] Ese temporizador es el que te deja a oscuras en el baño: si durante ese tiempo no hay ningún cambio de calor, la salida se apaga, y con ella la luz.

## Con un ESP32

Conectarlo es de lo más fácil. [pausa] Alimenta el módulo con cinco voltios, une las tierras y lleva su salida a un pin del ESP32: la salida ya es de 3,3 voltios, no necesitas nada más. Al encenderlo, espera un minuto: el sensor se tiene que acostumbrar a la temperatura de la habitación. [pausa] Lo interesante es combinarlo con el modo de sueño profundo del ESP32. El microcontrolador se apaga casi por completo y deja vigilando un solo pin. Cuando el PIR detecta movimiento, ese pin lo despierta, el ESP32 toma una foto o manda un mensaje, y se vuelve a dormir. Así funcionan muchas cámaras de seguridad a batería, que duran meses sin recargarse. También puedes contar cuántas veces pasa alguien por un pasillo y verlo en una gráfica desde el celular. [pausa] Un consejo: el aire caliente de un calentador o de un aire acondicionado puede dispararlo. Apúntalo lejos de esas fuentes.

## Los límites

El PIR tiene puntos ciegos claros. [pausa] No te ve a través de una ventana, porque el vidrio común bloquea el infrarrojo lejano. Le cuesta en días muy calurosos, cuando el ambiente está casi a la temperatura de tu cuerpo. Y como reacciona a calor en movimiento, un perro grande o una cortina movida por aire caliente pueden engañarlo. Además, no puede contar personas ni saber quién eres: solo sabe que algo caliente se movió. Para eso se combinan con radares de microondas, cámaras o sensores de tiempo de vuelo, como el que veremos en esta serie.

## Tres datos

Tres datos para cerrar. [pausa] Uno: la piroelectricidad se conoce hace siglos. Los comerciantes holandeses que traían turmalinas de Sri Lanka notaron que, al calentarlas, atraían cenizas, y por eso las llamaban "sacadoras de ceniza". [pausa] Dos: algunas serpientes, como las de cascabel, tienen unas fosetas en la cara que detectan el calor de sus presas en la oscuridad. Es un sensor de infrarrojo biológico. [pausa] Tres: hay detectores con inmunidad a mascotas. Sus lentes y su electrónica ignoran las manchas de calor pequeñas que se mueven cerca del piso, para que el gato no dispare la alarma a las tres de la mañana.

## Cierre

Recapitulemos. Tu cuerpo brilla en infrarrojo, una cúpula de pequeñas lupas lo reparte en zonas, dos cristales piroeléctricos conectados al revés detectan cuándo cambias de zona, y un temporizador decide cuándo apagar. [pausa] La próxima vez que la luz del baño te deje a oscuras, no te enojes con el sensor: muévete. Para él, quedarte quieto es desaparecer. [pausa] En el próximo episodio: por qué tu control de videojuegos empieza a moverse solo… y el truco de 1879 que lo arregla.
