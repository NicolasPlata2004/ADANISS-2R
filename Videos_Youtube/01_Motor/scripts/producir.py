"""Produce un episodio completo con un solo comando.

  python producir.py EP02 --audio "C:\\Users\\nicao\\Downloads\\EP02_NARRACION.wav"

Pasos (cada uno se salta si ya está hecho, salvo que pidas rehacerlo):
  1. Copia la narración a 02_Episodios/EP02/audio/
  2. Transcribe con Whisper (palabra por palabra)           -> transcripcion/
  3. Si no hay plan.yaml, crea un BORRADOR automático         -> plan.yaml
     (una escena "TextoClave" por frase: ya sale un video sincronizado;
      luego cambias escenas por animaciones a medida)
  4. Resuelve el plan contra la transcripción                 -> plan.json
     (Serie Sensores: el plan ya existe; se le añade la línea audio: y, como hay guion.md,
      los subtítulos usan el texto exacto del guion con los tiempos de la voz real)
  5. Renderiza el video con Remotion                          -> final/EP02_pizarra_1080p.mp4
                                                                 (o final/S03_PIR_3D_1080p.mp4 en la serie 3D)
  6. Normaliza el audio a -14 LUFS (estándar de YouTube) y deja capítulos y subtítulos -> youtube/

Opciones útiles:
  --modelo large-v3|medium|small   modelo de Whisper (large-v3 = mejor, necesita GPU para ir rápido)
  --solo-plan                      se detiene después del paso 4 (para revisar en Remotion Studio)
  --retranscribir                  fuerza el paso 2 aunque ya exista la transcripción
  --gpu                            renderiza con la GPU (más rápido en un PC con tarjeta gráfica)
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from masterizar_audio import masterizar  # noqa: E402
from resolver_plan import ESTUDIO, RAIZ, agrupar_frases, aplicar_correcciones, resolver  # noqa: E402

PROGRAMAS = RAIZ / "00_Programas"


def _npx() -> list[str]:
    node_dir = PROGRAMAS / "node"
    if (node_dir / "npx.cmd").exists():
        return [str(node_dir / "npx.cmd")]
    return [shutil.which("npx.cmd") or shutil.which("npx") or "npx"]


def borrador_plan(ep: str, carpeta: Path, audio_rel: str) -> None:
    """Plan automático: una escena TextoClave por cada 1-2 frases de la narración."""
    import yaml

    trans = json.loads((carpeta / "transcripcion" / "transcripcion.json").read_text(encoding="utf-8"))
    frases = agrupar_frases(aplicar_correcciones(trans["palabras"], {}), max_chars=90)
    escenas = []
    bloque: list[dict] = []
    for f in frases:
        bloque.append(f)
        texto = " ".join(w["p"] for b in bloque for w in b["palabras"])
        if texto.endswith((".", "?", "!")) or len(texto) > 110:
            primeras = " ".join(w["p"] for w in bloque[0]["palabras"][:4])
            escenas.append({
                "id": f"e{len(escenas) + 1:02d}",
                "escena": "TextoClave",
                "seccion": ep,
                "desde": "inicio" if not escenas else primeras,
                "props": {"texto": texto},
            })
            bloque = []
    plan = {
        "episodio": ep,
        "titulo": ep,
        "formato": "pizarra",
        "audio": audio_rel,
        "fps": 30,
        "cola": 10,
        "adelanto": 0.2,
        "subtitulos": True,
        "escenas": escenas,
    }
    texto = "# BORRADOR AUTOMÁTICO: cambia 'TextoClave' por escenas a medida y añade marcas.\n"
    texto += yaml.safe_dump(plan, allow_unicode=True, sort_keys=False, width=120)
    (carpeta / "plan.yaml").write_text(texto, encoding="utf-8")
    print(f"[plan] borrador creado con {len(escenas)} escenas -> {carpeta / 'plan.yaml'}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ep")
    ap.add_argument("--audio")
    ap.add_argument("--modelo", default=os.environ.get("WHISPER_MODELO", "large-v3"))
    ap.add_argument("--retranscribir", action="store_true")
    ap.add_argument("--solo-plan", action="store_true")
    ap.add_argument("--gpu", action="store_true")
    args = ap.parse_args()

    carpeta = RAIZ / "02_Episodios" / args.ep
    for sub in ("audio", "transcripcion", "render", "final", "youtube"):
        (carpeta / sub).mkdir(parents=True, exist_ok=True)

    # 1. audio
    if args.audio:
        origen = Path(args.audio)
        destino = carpeta / "audio" / origen.name
        if origen.resolve() != destino.resolve():
            shutil.copyfile(origen, destino)
        print(f"[audio] {destino}")
    audios = sorted((carpeta / "audio").glob("*.wav")) + sorted((carpeta / "audio").glob("*.mp3"))
    if not audios:
        raise SystemExit(f"No hay audio en {carpeta / 'audio'}. Usa --audio ruta\\al\\archivo.wav")
    audio = audios[0]

    # 2. transcripción (la provisional hecha desde el guion no cuenta: hay que oír la voz real)
    trans = carpeta / "transcripcion" / "transcripcion.json"
    provisional = trans.exists() and str(json.loads(trans.read_text(encoding="utf-8")).get("audio", "")).startswith("(provisional")
    if args.retranscribir or not trans.exists() or provisional:
        subprocess.run([sys.executable, str(Path(__file__).with_name("transcribir.py")), "--audio", str(audio),
                        "--salida", str(carpeta / "transcripcion"), "--modelo", args.modelo], check=True)
        if (carpeta / "guion.md").exists():
            shutil.copyfile(trans, carpeta / "transcripcion" / "whisper.json")
            subprocess.run([sys.executable, str(Path(__file__).with_name("alinear_guion.py")), args.ep], check=True)

    # 3. plan
    if not (carpeta / "plan.yaml").exists():
        borrador_plan(args.ep, carpeta, f"audio/{audio.name}")

    # 3b. el plan de la serie se escribió sin voz: se le indica cuál es la narración
    plan_yaml = carpeta / "plan.yaml"
    texto_plan = plan_yaml.read_text(encoding="utf-8")
    if not re.search(r"^audio\s*:", texto_plan, re.M):
        linea = f"audio: audio/{audio.name}"
        nuevo, n = re.subn(r"^(formato\s*:.*)$", lambda m: m.group(1) + "\n" + linea, texto_plan, count=1, flags=re.M)
        plan_yaml.write_text(nuevo if n else linea + "\n" + texto_plan, encoding="utf-8")
        texto_plan = plan_yaml.read_text(encoding="utf-8")
        print(f"[plan] añadida la línea  {linea}")
    tres_d = re.search(r"^formato\s*:\s*taller3d", texto_plan, re.M) is not None

    # 4. resolver
    resolver(args.ep)
    if args.solo_plan:
        print("[listo] Revisa el plan en Remotion Studio:  cd 01_Motor\\estudio  &&  npx remotion studio")
        return 0

    # 5. render
    salida = carpeta / "final" / (f"{args.ep}_3D_1080p.mp4" if tres_d else f"{args.ep}_pizarra_1080p.mp4")
    cmd = [*_npx(), "remotion", "render", "src/index.ts", "Episodio", str(salida),
           f"--props={json.dumps({'episodio': args.ep})}"]
    env = dict(os.environ)
    if args.gpu:
        env["REMOTION_GL"] = "angle"
    print("[render]", " ".join(cmd))
    subprocess.run(cmd, cwd=ESTUDIO, check=True, env=env)
    masterizar(salida)  # 6. audio a -14 LUFS para YouTube
    print(f"[listo] {salida}")
    print(f"        capítulos y subtítulos para YouTube en {carpeta / 'youtube'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
