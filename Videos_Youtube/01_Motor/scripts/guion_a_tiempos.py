"""Convierte un guion (guion.md) en una línea de tiempo provisional palabra por palabra.

Sirve para producir el video ANTES de que exista la narración: estima cuánto tarda cada
palabra a ritmo de narrador (~150 palabras/min) más las pausas de la puntuación y de [pausa].
Genera transcripcion/transcripcion.json con el mismo formato que Whisper, así que el plan,
los subtítulos y el render funcionan igual. Cuando llegue la voz real, se transcribe y el
video se re-sincroniza con ella (producir.py --retranscribir).

Uso:  python guion_a_tiempos.py S01_Piezo  [--ppm 150]
Imprime los tiempos de cada bloque (para poner en el guion del narrador).
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from resolver_plan import RAIZ  # noqa: E402

PAUSA_COMA = 0.22
PAUSA_PUNTO = 0.45
PAUSA_MARCA = 0.85  # [pausa]
PAUSA_BLOQUE = 0.9
INICIO = 0.6


def leer_guion(ruta: Path) -> tuple[str, list[dict]]:
    titulo = ""
    bloques: list[dict] = []
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        if linea.startswith("# "):
            titulo = linea[2:].strip()
        elif linea.startswith("## "):
            bloques.append({"nombre": linea[3:].strip(), "texto": ""})
        elif linea.strip() and bloques:
            bloques[-1]["texto"] += (" " if bloques[-1]["texto"] else "") + linea.strip()
    return titulo, bloques


def dur_palabra(p: str, ppm: float) -> float:
    """Duración hablada aproximada: proporcional a las letras, calibrada a ppm palabras/minuto."""
    letras = len(re.sub(r"[^\wáéíóúüñ]", "", p.lower())) or 1
    if any(c.isdigit() for c in p):  # los números se dicen más largos ("treinta y dos mil…")
        letras = max(letras * 3, 6)
    base = 60.0 / ppm  # segundos por palabra media (~5 letras)
    return base * (0.45 + 0.11 * letras)


def tiempos(bloques: list[dict], ppm: float):
    t = INICIO
    palabras = []
    resumen = []
    for b in bloques:
        t0 = t
        fichas = re.findall(r"\[pausa\]|[^\s]+", b["texto"])
        for f in fichas:
            if f == "[pausa]":
                t += PAUSA_MARCA
                continue
            limpio = f.replace("**", "")
            d = dur_palabra(limpio, ppm)
            palabras.append({"p": limpio, "i": round(t, 3), "f": round(t + d, 3), "prob": 1.0})
            t += d
            if limpio.endswith((".", "?", "!", "…", ":")):
                t += PAUSA_PUNTO
            elif limpio.endswith((",", ";")):
                t += PAUSA_COMA
        t += PAUSA_BLOQUE
        resumen.append({"bloque": b["nombre"], "inicio": round(t0, 2), "fin": round(t, 2),
                        "palabras": len([f for f in fichas if f != "[pausa]"])})
    return palabras, resumen, t


def mmss(s: float) -> str:
    return f"{int(s // 60)}:{int(s % 60):02d}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    ap.add_argument("--ppm", type=float, default=150.0)
    args = ap.parse_args()
    carpeta = RAIZ / "02_Episodios" / args.ep
    titulo, bloques = leer_guion(carpeta / "guion.md")
    palabras, resumen, total = tiempos(bloques, args.ppm)
    (carpeta / "transcripcion").mkdir(parents=True, exist_ok=True)
    datos = {"audio": "(provisional: sin narración)", "idioma": "es", "duracion": round(total + 0.5, 3),
             "modelo": f"guion a {args.ppm:.0f} ppm", "segmentos": [], "palabras": palabras}
    (carpeta / "transcripcion" / "transcripcion.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    (carpeta / "transcripcion" / "bloques.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{titulo}\n{len(palabras)} palabras, duración estimada {mmss(total)} a {args.ppm:.0f} ppm")
    for r in resumen:
        print(f"  {mmss(r['inicio'])}–{mmss(r['fin'])}  {r['bloque']:<22} {r['palabras']:>4} palabras")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
