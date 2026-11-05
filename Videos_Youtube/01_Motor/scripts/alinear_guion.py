"""Alinea el guion con la transcripción de Whisper: texto exacto del guion, tiempos de la voz real.

Cuando el narrador lee un guion escrito, Whisper acierta los tiempos pero a veces se equivoca en
el texto (números, nombres, tildes). Este paso toma las palabras del guion.md y les pone los
tiempos de las palabras que Whisper oyó; las que no encuentra (p. ej. "0,7" dicho "cero coma
siete") se reparten entre las vecinas que sí encontró. Así los subtítulos quedan perfectos y
las escenas caen donde las dice la voz.

Uso:  python alinear_guion.py S03_PIR
  lee  02_Episodios/S03_PIR/transcripcion/whisper.json   (o transcripcion.json si aún es de Whisper)
  y    02_Episodios/S03_PIR/guion.md
  deja 02_Episodios/S03_PIR/transcripcion/transcripcion.json   (formato de siempre)
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from guion_a_tiempos import leer_guion  # noqa: E402
from resolver_plan import RAIZ  # noqa: E402


def normal(p: str) -> str:
    s = unicodedata.normalize("NFD", p.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", s)


def palabras_guion(guion: Path) -> list[str]:
    _, bloques = leer_guion(guion)
    out: list[str] = []
    for b in bloques:
        for f in re.findall(r"\[pausa\]|[^\s]+", b["texto"]):
            if f != "[pausa]":
                out.append(f.replace("**", ""))
    return out


def alinear(guion: list[str], oidas: list[dict]) -> list[dict]:
    a = [normal(p) for p in guion]
    b = [normal(w["p"]) for w in oidas]
    tiempos: list[tuple[float, float] | None] = [None] * len(guion)
    for m in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(m.size):
            w = oidas[m.b + k]
            tiempos[m.a + k] = (float(w["i"]), float(w["f"]))
    # Huecos: se reparten entre la última palabra encontrada y la siguiente, según sus letras.
    n = len(guion)
    i = 0
    fin_audio = float(oidas[-1]["f"]) if oidas else 0.0
    while i < n:
        if tiempos[i] is not None:
            i += 1
            continue
        j = i
        while j < n and tiempos[j] is None:
            j += 1
        t0 = tiempos[i - 1][1] if i > 0 and tiempos[i - 1] else 0.0
        t1 = tiempos[j][0] if j < n and tiempos[j] else fin_audio
        pesos = [max(1, len(normal(guion[k]))) for k in range(i, j)]
        total = sum(pesos)
        # Si el hueco es mucho más largo de lo que tardan esas palabras, hay una pausa: se pegan a la
        # palabra siguiente (o a la anterior si terminan una frase) en vez de estirarse por la pausa.
        esperado = sum(0.1 + 0.06 * pz for pz in pesos)
        if t1 - t0 > 1.5 * esperado:
            if guion[j - 1].endswith((".", "?", "!", "…", ":")):
                t1 = t0 + esperado
            else:
                t0 = t1 - esperado
        t = t0
        for k, pz in zip(range(i, j), pesos):
            d = (t1 - t0) * pz / total
            tiempos[k] = (round(t, 3), round(t + d, 3))
            t += d
        i = j
    return [{"p": p, "i": round(tt[0], 3), "f": round(tt[1], 3), "prob": 1.0} for p, tt in zip(guion, tiempos)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    args = ap.parse_args()
    carpeta = RAIZ / "02_Episodios" / args.ep
    trans = carpeta / "transcripcion"
    whisper = trans / "whisper.json"
    if not whisper.exists():
        actual = json.loads((trans / "transcripcion.json").read_text(encoding="utf-8"))
        if str(actual.get("audio", "")).startswith("(provisional") or str(actual.get("modelo", "")).startswith("guion alineado"):
            raise SystemExit("No hay transcripción de Whisper (whisper.json): primero transcribe la narración.")
        shutil.copyfile(trans / "transcripcion.json", whisper)
    datos = json.loads(whisper.read_text(encoding="utf-8"))
    guion = palabras_guion(carpeta / "guion.md")
    palabras = alinear(guion, datos["palabras"])
    encontradas = sum(1 for g in guion if normal(g) in {normal(w["p"]) for w in datos["palabras"]})
    datos = {**datos, "modelo": f"guion alineado con {datos.get('modelo', 'whisper')}", "palabras": palabras}
    (trans / "transcripcion.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[alinear] {len(guion)} palabras del guion; {encontradas} reconocidas en la voz; el resto, repartidas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
