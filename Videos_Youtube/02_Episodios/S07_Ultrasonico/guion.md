# S07 · El grito que tu carro lanza y tú no oyes

## Gancho

Cada vez que un carro retrocede hacia una pared, está **gritando**. [pausa] Grita en un tono tan agudo que tus oídos no lo pueden oír: decenas de miles de vibraciones por segundo. Luego se calla y escucha. Cuando vuelve el eco, cronometra cuánto tardó, y con ese tiempo sabe a qué distancia está la pared. [pausa] Los murciélagos hacen lo mismo desde hace unos cincuenta millones de años, y cazan insectos en la oscuridad total. Los delfines también. Y tú puedes hacerlo con un sensor que cuesta menos que un helado y que tiene dos ojos… que no son ojos.

## Promesa

Se llama sensor ultrasónico. En este video vas a ver qué es el ultrasonido, cómo un eco se convierte en una distancia, por qué la temperatura del aire cambia la medida, qué hay dentro de esos dos cilindros plateados, y cómo hacer con un ESP32 un medidor de distancia que no toca nada.

## Dónde está

Los sensores de parqueo son los más conocidos: esos círculos pequeños en el parachoques. [pausa] Cada uno lanza pulsos de ultrasonido y escucha el eco, y el carro convierte la distancia en pitidos cada vez más rápidos. Pero hay muchos más. Algunos celulares leen tu huella dactilar con ultrasonido, a través del vidrio de la pantalla, midiendo los ecos de las crestas y los valles de tu dedo. En fábricas y tanques se mide el nivel de líquidos sin tocarlos, y muchos medidores de agua y de gas calculan el flujo con ultrasonido. [pausa] Los barcos miden la profundidad del fondo con ecosondas, y los pescadores encuentran cardúmenes con sonar. Muchos robots educativos usan uno para no chocar. [pausa] Y en los hospitales, la ecografía usa el mismo principio, pero con millones de vibraciones por segundo, para ver órganos y bebés.

## La física

El sonido es una onda de presión: las moléculas del aire se empujan unas a otras y ese empujón viaja, como cuando una fila de personas se pasa un empujón de hombro en hombro. Lo que llamamos tono es cuántas veces por segundo se repite el empujón: la frecuencia. [pausa] Tus oídos captan, como mucho, unas veinte mil vibraciones por segundo, y con la edad, menos. Todo lo que está por encima es **ultrasonido**. No es un sonido distinto: es sonido demasiado agudo para nosotros. [pausa] En el aire, el sonido viaja a unos 343 metros por segundo cuando hace 20 grados. Comparado con la luz es una tortuga, y eso lo hace útil: un eco tarda lo suficiente para cronometrarlo con calma. [pausa] El truco es sencillo. El sensor lanza un pulso corto, el pulso viaja hasta un objeto, rebota y vuelve. El tiempo medido es el del viaje de ida y vuelta, así que la distancia es la velocidad del sonido por el tiempo, **dividido entre dos**. [pausa] Un ejemplo: si el eco tarda seis milésimas de segundo, el sonido recorrió algo más de dos metros en total, y la pared está a poco más de un metro. [pausa] ¿Y por qué ultrasonido y no un pitido normal? Porque no molesta a nadie, y porque las ondas cortas forman un haz más angosto y detectan objetos más pequeños. A cuarenta mil vibraciones por segundo, cada onda mide menos de un centímetro.

## La historia

La idea la inventó la naturaleza, y nos costó siglos entenderla. [pausa] En 1793, el italiano Lazzaro Spallanzani comprobó que los murciélagos esquivaban obstáculos en la oscuridad aunque no pudieran ver. Al año siguiente, el cirujano suizo Louis Jurine les tapó los oídos… y empezaron a chocar con todo. Algo hacían con el oído, pero nadie sabía qué. [pausa] La respuesta llegó en 1938. Donald Griffin, un estudiante de Harvard, llevó murciélagos al laboratorio de un físico que tenía un detector de ultrasonido, y descubrió que gritaban todo el tiempo en tonos que ningún humano oye. Años después le puso nombre: **ecolocalización**. [pausa] Para entonces, los humanos ya hacíamos algo parecido bajo el agua. Después del hundimiento del Titanic, en 1912, se buscaron formas de detectar icebergs con ecos, y durante la Primera Guerra Mundial nació el sonar para encontrar submarinos, con los transductores de cuarzo de Paul Langevin, el mismo del episodio del piezo.

## Por dentro

Ahora, el sensor más popular para hacer esto en casa: el HC-SR04. [pausa] Esos dos "ojos" son dos transductores ultrasónicos. Uno habla y el otro escucha. Dentro de cada cilindro hay un elemento piezoeléctrico unido a un pequeño cono, como en el primer episodio: si le aplicas voltaje, vibra; si una onda lo hace vibrar, genera voltaje. La malla metálica de encima solo lo protege. [pausa] Funciona así. El microcontrolador le manda un pulso de diez millonésimas de segundo por el pin llamado Trigger. El módulo responde lanzando una ráfaga de ocho ciclos de ultrasonido, a cuarenta mil vibraciones por segundo, y pone en alto su pin Echo. [pausa] El sonido sale, rebota y vuelve. El receptor capta una señal diminuta. Un amplificador la agranda, un comparador decide cuándo llegó el eco, y en ese instante el pin Echo vuelve a bajar. [pausa] Así que el ancho de ese pulso corresponde al tiempo de ida y vuelta. Según su fabricante, el módulo mide desde unos dos centímetros hasta unos cuatro metros, dentro de un cono de unos quince grados. [pausa] Los sensores de parqueo usan una sola pieza sellada que grita y luego escucha.

## Con un ESP32

Conectarlo es fácil, con un cuidado importante. [pausa] El HC-SR04 clásico se alimenta con cinco voltios, y su pin Echo también responde con cinco. El ESP32 trabaja a 3,3, así que pon un divisor de voltaje con dos resistencias, por ejemplo de mil y dos mil ohmios, para bajar esa señal. El pin Trigger normalmente acepta los 3,3 voltios del ESP32 sin problema. [pausa] En el programa, mandas el pulso de disparo, mides cuántos microsegundos dura el pulso de eco con la función pulseIn, y divides entre unos 58 para obtener centímetros. ¿De dónde sale ese número? El sonido tarda unos 29 microsegundos en recorrer un centímetro, y hay que contar la ida y la vuelta. [pausa] Con eso puedes hacer un sensor de parqueo para tu garaje con un LED que cambia de color, un medidor del nivel del tanque de agua, un robot que esquiva obstáculos o un instrumento musical que suena más agudo cuando acercas la mano.

## Los límites

El ultrasonido tiene sus trampas. [pausa] La velocidad del sonido cambia con la temperatura: sube unos 0,6 metros por segundo por cada grado. Entre una mañana helada y una tarde de calor, la medida puede cambiar varios centímetros por cada metro. Por eso los medidores serios llevan un termómetro para corregirla. [pausa] Las superficies blandas, como cortinas, espuma o ropa, absorben el sonido y casi no devuelven eco. Las superficies inclinadas lo desvían hacia otro lado, como un espejo. Los objetos muy delgados pueden pasar desapercibidos. Muy cerca, el sensor queda ciego, porque después de gritar sigue vibrando un instante y no alcanza a escuchar. Y si dos sensores trabajan juntos, uno puede oír el grito del otro y confundirse.

## Tres datos

Tres datos para tu próxima conversación. [pausa] Uno: algunas polillas se defienden del sonar de los murciélagos. Muchas oyen su ultrasonido y se lanzan en picada. Otras responden con chasquidos que lo confunden, como una interferencia. [pausa] Dos: en el agua, el sonido viaja unas cuatro veces más rápido que en el aire, cerca de 1.500 metros por segundo. Por eso un sonar marino tiene que hacer sus cuentas con otra velocidad. [pausa] Tres: hay personas ciegas que aprendieron a ecolocalizar. Chasquean la lengua y, por el eco, reconocen paredes, carros y árboles a su alrededor. Estudios con resonancia magnética muestran que en sus cerebros el eco activa zonas que normalmente procesan la vista.

## Cierre

Recapitulemos. Un piezo que grita, un pulso que viaja a 343 metros por segundo, un eco que vuelve y un cronómetro que divide entre dos. Con eso se estaciona un carro, se mide un tanque, se ve un bebé y caza un murciélago. [pausa] La próxima vez que tu carro pite al acercarse a la pared, acuérdate: lleva rato gritando, y tú no lo oías. [pausa] En el próximo episodio: el sensor que mide distancias con luz, cronometrando un viaje que dura unas pocas milmillonésimas de segundo.
