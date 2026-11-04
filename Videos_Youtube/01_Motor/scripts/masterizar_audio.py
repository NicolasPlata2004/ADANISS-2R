"""Normaliza el audio de un video a -14 LUFS (lo que usa YouTube) sin tocar la imagen.

YouTube baja el volumen de lo que está por encima de -14 LUFS pero NO sube lo que está por
debajo: una narración a -20 LUFS se escucharía más baja que los demás videos.

Uso:  python masterizar_audio.py video.mp4 [salida.mp4]   (sin salida, reemplaza el archivo)
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

OBJETIVO = "I=-14:TP=-1.5:LRA=11"


def medir(video: Path) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-vn", "-af",
                        f"loudnorm={OBJETIVO}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, check=True)
    return json.loads(re.findall(r"\{[^{}]*\}", r.stderr, re.S)[-1])


def masterizar(video: Path, salida: Path | None = None) -> Path:
    m = medir(video)
    filtro = (f"loudnorm={OBJETIVO}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    tmp = video.with_name(video.stem + "_tmp" + video.suffix)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-map", "0:v", "-map", "0:a", "-c:v", "copy",
                    "-af", filtro, "-ar", "48000", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", str(tmp)],
                   check=True)
    destino = salida or video
    shutil.move(tmp, destino)
    print(f"[audio] {video.name}: {m['input_i']} LUFS -> -14 LUFS  ({destino})")
    return destino


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    masterizar(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else None)
