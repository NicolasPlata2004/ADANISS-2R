# Videos_Youtube · estudio de curiosidades mecatrónicas

Copia esta carpeta en **`D:\Videos_Youtube`**. Todo lo que el estudio instala o descarga (programas, cachés y modelos) queda dentro de ella.

```
D:\Videos_Youtube
├─ producir.bat              ← un comando para producir un episodio (con su narración)
├─ render_serie.bat          ← renderiza la Serie Sensores 3D con la tarjeta gráfica
├─ 00_Programas\             ← Node, ffmpeg, Python, Manim, Whisper, cachés (lo llena el instalador)
│   ├─ instalar_windows.ps1
│   ├─ entorno.ps1
│   └─ requisitos.txt
├─ 01_Motor\
│   ├─ estudio\              ← Remotion + Three.js: formatos Pizarra y Neón 3D
│   ├─ manim\                ← formato Lámina técnica (Manim + LaTeX)
│   └─ scripts\              ← transcribir, sincronizar (plan), producir, muestras
├─ 02_Episodios\
│   └─ EP01\
│       ├─ audio\            ← la narración (WAV)
│       ├─ transcripcion\    ← palabra por palabra con tiempos (Whisper)
│       ├─ plan.yaml         ← guion visual: escenas y "marcas" ancladas a frases
│       ├─ correcciones.yaml ← arreglos a la transcripción (solo afectan subtítulos)
│       ├─ final\            ← videos terminados y miniatura
│       └─ youtube\          ← título, descripción con capítulos, etiquetas, subtítulos .srt
└─ 03_Referencias\           ← análisis de los reels de referencia
```

## Instalar (una vez)

En PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Videos_Youtube\00_Programas\instalar_windows.ps1
```

Descarga Node.js, ffmpeg, Python 3.12 (con uv), Manim, faster-whisper, Remotion con su navegador y la fuente Latin Modern. Si no tienes LaTeX te avisa: para las ecuaciones de Manim instala MiKTeX.

## Producir un episodio

```bat
D:\Videos_Youtube\producir.bat EP01
D:\Videos_Youtube\producir.bat EP02 C:\Users\nicao\Downloads\EP02_NARRACION.wav
```

1. **Transcribe** la narración palabra por palabra (Whisper `large-v3`; con GPU NVIDIA es mucho más rápido).
2. Si el episodio no tiene `plan.yaml`, crea un **borrador**: una escena `TextoClave` por frase. Ya sale un video sincronizado, que luego mejoras escena por escena.
3. **Sincroniza**: cada escena y cada marca del plan se ancla a una frase de la narración. Si regrabas el audio, el video se reajusta solo.
4. **Renderiza** con Remotion a `final\EPxx_pizarra_1080p.mp4` y deja capítulos y subtítulos en `youtube\`.

Para ver y ajustar en vivo: `cd D:\Videos_Youtube\01_Motor\estudio` y luego `npx remotion studio`.

### Cómo se sincroniza (plan.yaml)

```yaml
- id: flyback
  escena: Flyback                      # componente en 01_Motor/estudio/src/formatos/pizarra/escenas
  seccion: "FLYBACK"                   # rótulo superior
  desde: "En el diseño más común"      # la escena empieza cuando se dice esta frase
  marcas:
    conduce: "mientras el interruptor conduce"   # el interruptor se cierra justo aquí
    corta: "Al cortarse"                         # y se abre justo aquí
```

Las frases se buscan en la transcripción sin importar tildes, mayúsculas ni signos, y toleran pequeños errores de Whisper.

## Formatos

| Formato | Basado en | Herramienta | Uso |
|---|---|---|---|
| **Pizarra** (principal) | reels PREFERIDOS de lemma_lab (amplificador operacional) | Remotion (SVG) | episodios completos: diagramas de línea, metáforas, subtítulos karaoke |
| **Lámina técnica** | reel PREFERIDO del mecanismo con ecuaciones | Manim + LaTeX | partes muy técnicas: gráficas, ecuaciones numeradas, figura de libro |
| **Neón 3D** | reel del efecto pelicular | Remotion + Three.js (bloom) | ganchos y momentos "wow": conductores que brillan, partículas, datos en píldoras |

Muestras del EP01 en `02_Episodios\EP01\final\`.

```bat
REM Muestra Neón 3D (tramo 0:14–0:46)
cd D:\Videos_Youtube\01_Motor\estudio
npx remotion render src/index.ts Muestra-Neon-EP01 ..\..\02_Episodios\EP01\final\EP01_muestra_neon3d.mp4

REM Muestra Lámina técnica (tramo 1:54–2:26)
cd D:\Videos_Youtube\01_Motor\scripts
python muestra_manim.py EP01 --escena ep01_lamina.py:RectificadoYFiltrado --desde "Ya no retrocede" --hasta "Ojo" --marca empujones="llega a empujones" --marca colinas="en colinas" --marca alisar="Para alisarlo" --marca cimas="en las cimas" --marca valles="en los valles" --marca condensador="el condensador de filtrado" --marca resultado="el resultado" --marca continua="corriente continua" --marca ondulacion="leve ondulación" --marca presion="la presión sigue" --marca altisima="altísima"
```

En un PC con tarjeta gráfica, renderiza con `set REMOTION_GL=angle` para que Three.js use la GPU.

## Serie Sensores (S01–S10) · videos 3D

Diez episodios de ~10 minutos, todo en 3D (formato `taller3d`), con subtítulos y **sin audio** hasta que llegue la narración.

```
02_Episodios\S03_PIR\
├─ guion.md        ← el guion verificado (el mismo del documento compartido)
├─ plan.yaml       ← escenas 3D ancladas a frases del guion
├─ transcripcion\  ← tiempos provisionales calculados del guion (150 palabras/min)
├─ youtube\        ← capítulos y subtítulos .srt
└─ final\          ← S03_PIR_3D_1080p_sin_audio.mp4
```

Versiones anteriores que se conservan: `S01_Piezo\final\S01_piezo_MIXTO_anterior_1080p_sin_audio.mp4` (3D con insertos 2D) y las tres de `EP01\final\` (Pizarra, Lámina técnica, Neón 3D). La verificación científica de los guiones, con correcciones y fuentes, está en `02_Episodios\VERIFICACION.md`.

**Renderizar con la tarjeta gráfica** (mucho más rápido que en un servidor sin GPU):

```bat
D:\Videos_Youtube\render_serie.bat
D:\Videos_Youtube\render_serie.bat S03_PIR S07_Ultrasonico
```

**Cuando tu amigo grabe la voz** (un WAV por episodio, leyendo el guion tal cual; las marcas `[pausa]` son pausas cortas):

```bat
D:\Videos_Youtube\producir.bat S03_PIR C:\ruta\S03_NARRACION.wav
```

Eso copia el audio, lo transcribe con Whisper, **alinea el texto exacto del guion con los tiempos de la voz** (los subtítulos no heredan errores de Whisper), añade `audio:` al `plan.yaml`, re-sincroniza cada escena con lo que dice la voz y renderiza `final\S03_PIR_3D_1080p.mp4` con el audio normalizado a −14 LUFS. Añade `--gpu` al final para renderizar con la tarjeta gráfica.

Para cambiar una escena: `cd D:\Videos_Youtube\01_Motor\estudio` y `npx remotion studio` (composiciones `S01-3D` … `S10-3D`). Las escenas están en `01_Motor\estudio\src\formatos\taller\escenas\` y los objetos en `...\taller\modelos\`.

## Nombre del canal

Cámbialo en `01_Motor\estudio\src\config\marca.ts` (`CANAL.nombre`, `usuario` y `lema`). Aparece en la pantalla final.
