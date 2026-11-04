# Análisis de las referencias (grabación `Referencias.mp4`, 4:37)

Instagram está bloqueado en el entorno donde se hizo este trabajo, así que el análisis se hizo sobre la grabación de pantalla, que es un montaje de Clideo con un clip por link, en el orden de la lista. Las dos PREFERIDAS se publicaron el **4 nov 2026**, con 10 minutos de diferencia (14:17 y 14:27 UTC, según el código de cada post).

| # | Link | Reel | Estilo | Cómo está hecho (probable) |
|---|---|---|---|---|
| 1 | DfUq3P0BxIH **PREFERIDO** | *lemma_lab* · "This chip can multiply a signal by a hundred thousand" (amplificador operacional) | 2D minimalista: papel claro, trazo negro fino, **un azul** (señal) y **un rojo** (límites, realimentación), rótulo de sección en versalitas con raya roja, subtítulos karaoke abajo (lo dicho en negro, lo que viene en gris), metáfora visual (la balanza), medidor de salida, fórmulas con subíndices, termina igual que empieza (loop) | Animación programada (SVG/HTML o Motion Canvas/Remotion generada con IA), voz IA, montaje en código |
| 2 | De94e7eCQ3x | Sensor piezoeléctrico (kit *Schematik*) | 3D fotorrealista: tapete de corte verde, protoboard, ESP32, cortes con cristal piezoeléctrico, fondo negro; subtítulo de **una palabra** al centro | Blender u otro motor 3D, posible apoyo de video IA; publicidad de un kit |
| 3 | DfISplxs0xU | **Efecto pelicular** (en español) | 3D estilizado neón: azul noche, conductor con borde cian luminoso, partículas, corrientes de Foucault punteadas, **píldoras de dato** ("50 Hz · a cámara lenta", "12 mm"), subtítulos **arriba** con la palabra clave enmarcada como selección de Figma; cierre "¿Lo sabías? ¡Cuéntamelo!" | Three.js/WebGL con bloom (o Blender estilizado) generado con IA |
| 4 | DfO_YgsCZYG | *Chiong Lab* · caja de música ("The note fades away…") | Lámina técnica: ilustración tipo manual con rótulos y líneas guía, osciloscopio y envolvente | Ilustración + diagramas generados con IA |
| 5 | DfUpt8MgyWB **PREFERIDO** | Oscilador con impacto (péndulo, resorte k₂, amortiguador d₂) | Figura de *paper*: blanco y negro, letras en círculo (A, B), retrato de fase que se dibuja, ecuaciones de movimiento en LaTeX | Simulación numérica + Manim/matplotlib, ecuaciones LaTeX |
| 6 | (el link 6 repite el 1) | "Build your own AirTag · Part 2" | Mapa ilustrado 2.5D, placa nRF52840, título grande amarillo/naranja, subtítulos con palabras en naranja | Motion graphics (After Effects/Remotion) |

## Lo que comparten las PREFERIDAS (y se aplicó al EP01)

1. **Fondo claro, trazo negro, dos acentos** (azul = lo que fluye o lo bueno, rojo = límite, peligro o realimentación).
2. **Una metáfora por concepto**, dibujada (balanza → op-amp). En el EP01: marea (alterna), puertas de un solo sentido (diodos), depósito (condensador), resorte (flyback), conversación (USB PD).
3. **El dibujo se construye al ritmo de la voz**: cada elemento aparece cuando se nombra. En el estudio, esto lo hacen las *marcas* del `plan.yaml`.
4. **Rótulo de sección arriba** y **subtítulos karaoke abajo**.
5. **Números grandes en color** como golpe visual ("×100,000" → "×30 a ×60", "100 veces por segundo").
6. **Ecuaciones solo cuando aportan** (el formato Lámina técnica las numera como en un libro).

## Ganchos (método de la skill `/ig-reel`)

La skill pide que el gancho diga algo concreto en los primeros ~3 s, plantee qué está en juego, cambie de imagen en cada idea y cierre volviendo al inicio (loop). El EP01 ya lo cumple:

- **Concreto**: "Son las 7 y media… la batería marca un 4%" (hora y número en los primeros 8 s).
- **Lo que está en juego**: "empuja decenas de veces más fuerte de lo que tu batería soportaría".
- **Loop**: el cierre vuelve a las 7:30 ("Volvamos a la 7 y media").

Las herramientas de puntaje de la skill (`hookscore.py`, `beats.py`) están calibradas para inglés y para reels de 15 a 45 s, así que sus números no aplican a una narración de 7 minutos en español. Se usaron sus criterios, no su puntaje.
