# Verificación científica · Serie Sensores (S01–S10)

Cada guion se revisó dato por dato. Aquí quedan las correcciones que se hicieron y las
fuentes de los datos menos obvios. Los guiones (`S0x_*/guion.md`) y el documento que lee
el narrador tienen exactamente el mismo texto.

## Correcciones aplicadas en la revisión

| Episodio | Antes | Ahora | Motivo |
|---|---|---|---|
| S01 | "el cristal solo produce voltaje mientras cambia la presión" | la carga aparece al apretar y se escapa por el circuito; en la práctica solo nota cambios | Un piezo sí genera carga con fuerza estática; lo que pasa es que se fuga. |
| S01 | "los positivos se desplazan a un lado y los negativos al otro" | se separan el centro de cargas positivas y el de negativas | Descripción correcta: el cristal no tiene centro de simetría. |
| S01 | "Fue el origen del sonar" | llegó casi al final de la guerra, pero fue la base del sonar | Prioridad discutida (ASDIC británico, Fessenden). |
| S01 | "pierde el efecto para siempre" | pierde el efecto; habría que volver a polarizarlo | Se puede re-polarizar. |
| S01 | baldosas de Japón sin cifra | Tokio 2008: un bombillo de 100 W algo más de una hora al día | Dato oficial de JR East. |
| S02 | "Siente tu electricidad" | "Siente el agua salada que llevas por dentro" | El dedo no aporta electricidad: es un conductor que desvía el campo. |
| S02 | guante "aislado, el campo no se desvía" | la lana es gruesa: el dedo queda lejos y el cambio es mínimo | El campo atraviesa aislantes delgados (por eso funciona con papel encima). |
| S02 | touchRead "baja al acercar el dedo" | aclarado: en el ESP32 clásico | En ESP32-S2/S3 el valor sube. |
| S03 | "una plancha brilla en infrarrojo cercano" | una resistencia al rojo vivo emite sobre todo infrarrojo | Una plancha (~200 °C) emite en infrarrojo medio (~6 µm). |
| S03 | "primo del piezoeléctrico del episodio anterior" | "del primer episodio" | El episodio anterior es el de pantallas táctiles. |
| S04 | "los motores de los drones usan sensores Hall" | casi nunca: deducen la posición del voltaje del motor | Los ESC de drones son "sensorless" (fuerza contraelectromotriz). |
| S04 | A3144 "a un par de centímetros", sin voltaje | a menos de 1 cm, alimentado a 5 V, polo correcto | Hoja de datos: 4,5–24 V, unipolar, umbral de decenas de mT. |
| S05 | "los teléfonos empezaron a girar la pantalla en 2007" | llegaron al gran público | Hubo teléfonos con acelerómetro antes. |
| S06 | "giroscopios con luz láser recorriendo fibra óptica" | fibra óptica enrollada o anillo de espejos | Los de fibra no suelen usar láser; los de anillo sí, pero sin fibra. |
| S06 | "esa sola línea elimina casi toda la deriva" | elimina la deriva de la inclinación; el rumbo necesita magnetómetro | El acelerómetro no ve el giro horizontal. |
| S06 | trompo "mantiene su eje apuntando igual" | el trompo precesa; el giroscopio en aros sí mantiene el eje | Precesión por el torque de la gravedad. |

## Fuentes de los datos menos obvios

- **S01** Tokio 2008: [JR East (comunicado)](https://www.jreast.co.jp/e/development/press/20080111.pdf), [CleanTechnica](https://cleantechnica.com/2008/12/04/tokyo-train-station-testing-power-generating-floor/). Langevin 1917: [Physics Today](https://physicstoday.aip.org/features/paul-langevin-u-boats-and-ultrasonics), [Wikipedia: Sonar](https://en.wikipedia.org/wiki/Sonar).
- **S04** Teclado Hall de Micro Switch (1968): [Deskthority](https://deskthority.net/wiki/Micro_Switch_SW_Series), [Electronics, sept. 1968](https://bitsavers.mirrorservice.org/magazines/Electronics/Electronics_V41_N19_19680916_Microswitch_Key.pdf).
- **S06** Dron derribado con sonido (KAIST, 2015): [USENIX Security 2015](https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/son), [Defense One](https://defenseone.com/defense-systems/2015/08/researchers-show-how-to-take-out-drones-with-loud-noises/191144).
- **S07** Spallanzani (1793) y Jurine (1794): [Britannica 1797](https://jimclifford.ca/early_encyclopedia_britannica/articles/1797/eb_3rd_1797_020932.html); Griffin acuña "ecolocalización" en 1944. HC-SR04: 40 kHz, 2–400 cm, 15°, disparo de 10 µs (hoja de datos del módulo).
- **S08** Velodyne HDL-64E en 5 de 6 finalistas del DARPA Urban Challenge 2007 y precio de 75.000 USD: [LiDAR Magazine](https://lidarmag.com/?p=3404), [Robohub](https://robohub.org/robots-cornell-racing-team-and-velodynes-lidar-sensor/). Fotones de la telemetría lunar (~10¹⁷ por pulso, ~1 detectado): [arXiv 2403.00899](https://ar5iv.labs.arxiv.org/html/2403.00899), [arXiv 0710.0890](https://arxiv.org/pdf/0710.0890).
- **S09** Wunderlich y el promedio actual (~36,6 °C en 35.000 pacientes, 2017): [IFLScience](https://www.iflscience.com/average-body-temperature-in-the-us-has-dropped-since-19th-century-claims-study-54624). Termómetro "de Galileo" de la Accademia del Cimento: [phys.org](https://phys.org/news/2012-09-galileo-didnt-thermometer.amp), [Wikipedia](https://en.wikipedia.org/wiki/Galileo_thermometer).
- **S10** Ruge (MIT, tanques de agua y terremotos, 1938) y Simmons (Caltech): [Wikipedia: Strain gauge](https://en.wikipedia.org/wiki/Strain_gauge), [MIT Museum](https://mitmuseum.mit.edu/collections/object/2011.020.002). Prueba de ala del 787 (150 %, ~7,6 m): [AIN Online](https://ainonline.com/aviation-news/air-transport/2010-03-29/boeing-completes-ultimate-load-wing-test-787).

Datos de libro de texto que no necesitan fuente especial: velocidad del sonido (343 m/s a 20 °C,
+0,6 m/s por °C), velocidad de la luz, 32.768 = 2¹⁵, Pt100 (100 Ω a 0 °C, 0,385 Ω/°C), termopar
tipo K (~41 µV/°C), factor de galga ~2, HX711 de 24 bits con ganancia 128, diferencia de gravedad
polo–ecuador (~0,5 %), redefinición del kilogramo (2019).
