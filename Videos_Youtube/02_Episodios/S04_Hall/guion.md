# S04 · El truco de 1879 que arregla tu control

## Gancho

Tu personaje camina solo hacia la izquierda. No estás tocando nada. [pausa] Millones de jugadores lo han sufrido: se llama **drift**, y aparece cuando el mecanismo dentro del joystick se desgasta. La solución no es nueva. Es un efecto que un estudiante descubrió en **1879**, que no necesita que nada se toque, y que hoy está en tu celular, en tu carro, en los ventiladores de tu computador y en muchos mandos nuevos. Solo necesita **un imán**.

## Promesa

Se llama efecto Hall. En este video vas a ver por qué un imán puede empujar a los electrones hacia un lado y crear un voltaje, dónde está escondido este sensor en tu vida diaria, y cómo hacer un velocímetro de bicicleta con un ESP32 y un imán.

## El drift

Empecemos por el problema. [pausa] Un joystick clásico tiene dos potenciómetros: pequeñas pistas de carbón sobre las que roza un contacto metálico. Cuando mueves la palanca, el contacto se desliza y la resistencia cambia. Así la consola sabe cuánto la moviste. [pausa] Pero todo lo que roza se gasta. Con miles de horas de juego, la pista se desgasta, entra polvo y el contacto empieza a leer valores falsos. La consola cree que la palanca está un poquito inclinada aunque la sueltes. Tu personaje camina solo. Algunas consolas permiten recalibrar el centro, pero eso solo esconde el problema por un tiempo. [pausa] Los joysticks de efecto Hall cambian el contacto por un imán pegado a la palanca y un sensor que mide su campo magnético a través del aire. En la medición nada roza, así que nada se gasta. Por eso los mandos que los usan prometen no tener drift.

## La física

¿Cómo se mide un imán sin tocarlo? [pausa] Imagina una lámina delgada de un material conductor por la que pasa una corriente: millones de electrones avanzando en fila, de un extremo al otro. Ahora acerca un imán por debajo. [pausa] Un campo magnético hace algo curioso con las cargas en movimiento: las empuja hacia un **costado**, perpendicular a su dirección. Es la fuerza de Lorentz, la misma que curva los electrones en los televisores antiguos. Los electrones siguen avanzando, pero se van recostando contra un borde de la lámina. [pausa] Entonces un borde se llena de electrones, queda negativo, y el borde opuesto se queda con menos, positivo. Entre los dos bordes aparece un voltaje. Ese es el **voltaje Hall**. [pausa] Y lo mejor: es proporcional al campo magnético. Más imán, más voltaje. Si das la vuelta al imán, los electrones se recuestan del otro lado y el voltaje cambia de signo. Así el sensor sabe no solo cuánto campo hay, sino hacia dónde apunta. [pausa] Hay un detalle importante. En un metal como el cobre hay tantísimos electrones libres que cada uno se mueve muy despacio, y el voltaje Hall es diminuto, de millonésimas de voltio. En un semiconductor hay muchos menos, se mueven más rápido, y el efecto es miles de veces mayor. Por eso este sensor se volvió práctico cuando llegaron los semiconductores.

## La historia

Edwin Hall era un estudiante de doctorado en la universidad Johns Hopkins, en Estados Unidos, cuando en 1879 se preguntó si un imán actuaba sobre la corriente o sobre el cable que la lleva. Puso una lámina de oro muy delgada entre los polos de un imán y midió un voltaje diminuto a los lados. Había descubierto que la corriente misma se desvía. [pausa] Durante casi un siglo fue un experimento de laboratorio, útil para estudiar materiales. Con los semiconductores y los circuitos integrados, a finales de los años sesenta, el sensor cupo en un chip del tamaño de un grano de arroz, junto con su amplificador. Uno de sus primeros usos comerciales fueron teclados sin contactos mecánicos.

## Por dentro

Si abres uno de estos sensores, encuentras un chip diminuto con tres patas: alimentación, tierra y salida. [pausa] En el centro está la placa Hall, un cuadradito de semiconductor por el que pasa una corriente constante. A su lado, un amplificador que agranda ese voltaje de apenas milivoltios. Luego, según el tipo, viene un comparador con histéresis: si el campo supera un umbral, la salida se activa, y no se desactiva hasta que el campo baja bastante más. Esa diferencia evita que la salida tiemble cuando el imán está justo en el límite. [pausa] Los sensores lineales se saltan el comparador y entregan directamente un voltaje proporcional al campo. Los más modernos incluso traen un convertidor digital y se comunican por un bus de datos con el microcontrolador.

## Dónde está

Hoy está en todas partes. [pausa] Tu celular sabe que cerraste la funda porque hay un imán en la tapa y un sensor Hall en el teléfono; tu portátil sabe que bajaste la pantalla de la misma forma, y los celulares plegables saben si están abiertos o cerrados. La brújula del celular usa sensores magnéticos para medir el campo de la Tierra, que es unas cien veces más débil que el de un imán de nevera. [pausa] Los motores sin escobillas de muchas patinetas eléctricas y de los ventiladores de computador usan sensores Hall para saber en qué posición está el rotor y encender la bobina correcta en el momento exacto. Los de los drones, curiosamente, casi nunca: lo deducen del voltaje que el propio motor genera al girar. [pausa] En el carro, sensores de este tipo miden la posición del cigüeñal, la velocidad de las ruedas para los frenos ABS y cuánto pisas el acelerador. Y hay sensores de corriente que miden el campo magnético alrededor de un cable para saber cuánta corriente pasa, sin cortarlo ni tocarlo.

## Con un ESP32

Hagamos un velocímetro de bicicleta. [pausa] Necesitas un sensor Hall tipo interruptor, como el A3144, y un imán pequeño. Pega el imán en un rayo de la rueda y el sensor en la horquilla, a menos de un centímetro del paso del imán. Alimenta el sensor con cinco voltios, pon una resistencia de diez kilohmios entre su salida y los 3,3 voltios, y conecta la salida a un pin del ESP32. Si no reacciona, dale la vuelta al imán: este sensor solo responde a uno de los polos. [pausa] Cada vez que el imán pasa frente al sensor, la salida cae a cero por un instante. El ESP32 cuenta esos pulsos con una interrupción y mide el tiempo entre uno y otro. Si sabes cuánto mide la circunferencia de la rueda, divides esa distancia entre el tiempo y tienes la velocidad. Sumando vueltas, tienes la distancia recorrida. [pausa] Si en vez de un interruptor usas un sensor lineal, como el 49E, la salida no es cero o uno, sino un voltaje que sube y baja con el campo. Con eso puedes medir qué tan cerca está un imán, hacer un joystick casero o un pedal analógico.

## Los límites

El sensor Hall tiene sus trampas. [pausa] Es sensible a cualquier imán cercano, no solo al tuyo, así que los parlantes, los motores y hasta un destornillador magnetizado pueden molestarlo. Su lectura cambia un poco con la temperatura, y por eso los buenos sensores la compensan. Y el campo de un imán cae muy rápido con la distancia: a pocos centímetros, la señal casi desaparece.

## Tres datos

Tres datos para presumir. [pausa] Uno: en algunos materiales el voltaje Hall sale con el signo **contrario** al esperado, como si la corriente la llevaran cargas positivas. Ese misterio se explicó con los huecos: ausencias de electrones que se comportan como cargas positivas, y que hoy son clave en todos los semiconductores. [pausa] Dos: los teclados de efecto Hall para juegos permiten elegir a qué profundidad se activa cada tecla, porque miden la posición del imán de forma continua, no solo si la tecla tocó fondo. [pausa] Tres: en física hay versiones extremas de este efecto, a temperaturas cercanas al cero absoluto, que valieron premios Nobel en 1985 y 1998.

## Cierre

Recapitulemos. Una corriente, un imán y una fuerza que empuja a los electrones hacia un lado. Con eso se mide un campo sin tocarlo: la funda del celular, la rueda del carro, el motor de la patineta y la palanca de tu control. [pausa] La próxima vez que tu personaje camine solo, ya sabes que la solución existe desde 1879. [pausa] En el próximo episodio: el sensor que sabe hacia dónde está el suelo… y que tiene un resorte más delgado que un cabello dentro de tu celular.
