"""Renderiza una escena de Manim sincronizada con un tramo de la narración y le pega el audio.

1) Busca en la transcripción las frases "marca" del tramo (mismo motor que resolver_plan.py).
2) Renderiza la escena de Manim con esas marcas (la escena espera a cada frase).
3) Une video + audio del tramo con ffmpeg.

Uso (desde 01_Motor/scripts):
  python muestra_manim.py EP01 --escena ep01_lamina.py:RectificadoYFiltrado \
      --desde "Ya no retrocede" --hasta "Ojo" \
      --marca empujones="llega a empujones" --marca colinas="en colinas" ...
  Añade --calidad baja para una prueba rápida (480p).
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from resolver_plan import RAIZ, Buscador, aplicar_correcciones  # noqa: E402

MANIM_DIR = RAIZ / "01_Motor" / "manim"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    ap.add_argument("--escena", required=True, help="archivo.py:Clase dentro de 01_Motor/manim")
    ap.add_argument("--desde", required=True)
    ap.add_argument("--hasta", required=True)
    ap.add_argument("--marca", action="append", default=[], help='nombre="frase ancla"')
    ap.add_argument("--salida", default=None)
    ap.add_argument("--calidad", default="alta", choices=["baja", "alta"])
    ap.add_argument("--adelanto", type=float, default=0.3)
    args = ap.parse_args()

    carpeta = RAIZ / "02_Episodios" / args.ep
    trans = json.loads((carpeta / "transcripcion" / "transcripcion.json").read_text(encoding="utf-8"))
    cf = carpeta / "correcciones.yaml"
    corr = yaml.safe_load(cf.read_text(encoding="utf-8")) if cf.exists() else {}
    b = Buscador(aplicar_correcciones(trans["palabras"], corr or {}))

    _, t0 = b.buscar(args.desde, 0)
    t0 = max(0.0, t0 - args.adelanto)
    _, t1 = b.buscar(args.hasta, t0 + 0.5)
    t1 = t1 - 0.15
    marcas = {}
    for m in args.marca:
        nombre, frase = m.split("=", 1)
        marcas[nombre] = round(b.buscar(frase.strip('"'), t0)[1] - t0, 3)
    datos = {"duracion": round(t1 - t0, 3), "marcas": marcas, "inicio_audio": round(t0, 3)}
    print(json.dumps(datos, ensure_ascii=False, indent=1))

    trabajo = carpeta / "render" / "manim"
    trabajo.mkdir(parents=True, exist_ok=True)
    marcas_json = trabajo / "marcas.json"
    marcas_json.write_text(json.dumps(datos, ensure_ascii=False), encoding="utf-8")

    archivo, clase = args.escena.split(":")
    calidad = ["-ql"] if args.calidad == "baja" else ["-r", "1920,1080", "--fps", "30"]
    env = {**os.environ, "MARCAS_JSON": str(marcas_json)}
    cmd = [sys.executable, "-m", "manim", "render", *calidad, "--media_dir", str(trabajo / "media"),
           "-o", clase, archivo, clase]
    print("[manim]", " ".join(cmd))
    subprocess.run(cmd, cwd=MANIM_DIR, env=env, check=True)
    videos = sorted((trabajo / "media").rglob(f"{clase}.mp4"), key=lambda p: p.stat().st_mtime)
    if not videos:
        raise SystemExit("Manim no generó el video")
    video = videos[-1]

    audio = carpeta / yaml.safe_load((carpeta / "plan.yaml").read_text(encoding="utf-8"))["audio"]
    salida = Path(args.salida) if args.salida else carpeta / "final" / f"{args.ep}_muestra_{clase}.mp4"
    salida.parent.mkdir(parents=True, exist_ok=True)
    cmd = [shutil.which("ffmpeg") or "ffmpeg", "-y", "-v", "error", "-i", str(video), "-ss", f"{t0:.3f}",
           "-t", f"{t1 - t0:.3f}", "-i", str(audio), "-map", "0:v", "-map", "1:a", "-c:v", "libx264",
           "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "320k", "-shortest", str(salida)]
    subprocess.run(cmd, check=True)
    from masterizar_audio import masterizar

    masterizar(salida)
    print(f"[listo] {salida}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
