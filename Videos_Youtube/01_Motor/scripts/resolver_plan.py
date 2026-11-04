"""Convierte el plan de un episodio (plan.yaml) en tiempos exactos usando la transcripción.

Cada escena y cada "marca" (evento visual dentro de la escena) se ancla a una FRASE de la
narración. Si regrabas el audio, vuelves a transcribir y el video se re-sincroniza solo.

Entrada  (02_Episodios/EPxx/):
  plan.yaml                        escenas, secciones, marcas, capítulos
  correcciones.yaml  (opcional)    arreglos de palabras mal transcritas (solo afecta subtítulos)
  transcripcion/transcripcion.json salida de transcribir.py
  audio/<narración>.wav

Salida:
  01_Motor/estudio/public/episodios/EPxx/plan.json   (lo lee Remotion)
  01_Motor/estudio/public/episodios/EPxx/audio.wav
  02_Episodios/EPxx/youtube/capitulos.txt            (pegar en la descripción de YouTube)
  02_Episodios/EPxx/youtube/subtitulos.srt           (subtítulos corregidos para YouTube)

Uso:  python resolver_plan.py EP01
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[2]          # .../Videos_Youtube
ESTUDIO = RAIZ / "01_Motor" / "estudio"


# ----------------------------------------------------------------------------- texto
def normalizar(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]+", " ", s).strip()


def aplicar_correcciones(palabras: list[dict], corr: dict) -> list[dict]:
    """Corrige palabras sueltas y frases (p. ej. '4 %' -> '4%'), conservando los tiempos."""
    out = [dict(w) for w in palabras]
    for k, w in enumerate(out):
        nuevo = (corr.get("palabras") or {}).get(w["p"])
        if nuevo is not None:
            out[k]["p"] = str(nuevo)
    for buscar, reemplazo in corr.get("frases") or []:
        b = buscar.split()
        r = reemplazo.split()
        k = 0
        while k <= len(out) - len(b):
            if [x["p"] for x in out[k:k + len(b)]] == b:
                bloque = out[k:k + len(b)]
                i0, f0 = bloque[0]["i"], bloque[-1]["f"]
                nuevos = []
                for j, txt in enumerate(r):
                    if len(r) == len(b):
                        nuevos.append({**bloque[j], "p": txt})
                    else:  # fusiona o reparte tiempos
                        a = i0 + (f0 - i0) * j / len(r)
                        z = i0 + (f0 - i0) * (j + 1) / len(r)
                        nuevos.append({"p": txt, "i": round(a, 3), "f": round(z, 3)})
                out[k:k + len(b)] = nuevos
                k += len(r)
            else:
                k += 1
    return out


class Buscador:
    """Encuentra frases ancla dentro de la transcripción (exacto y, si falla, aproximado)."""

    def __init__(self, palabras: list[dict]):
        self.w = palabras
        self.tok = [normalizar(x["p"]) for x in palabras]
        # índices de palabras con contenido (descarta '%' y signos sueltos)
        self.idx = [k for k, t in enumerate(self.tok) if t]

    def buscar(self, frase: str, desde: float, hasta: float | None = None) -> tuple[int, float]:
        objetivo = normalizar(frase).split()
        if not objetivo:
            raise ValueError(f"Ancla vacía: {frase!r}")
        cand = [k for k in self.idx if self.w[k]["i"] >= desde - 0.05 and (hasta is None or self.w[k]["i"] < hasta)]
        toks = [self.tok[k] for k in cand]
        n = len(objetivo)
        for j in range(len(toks) - n + 1):
            if toks[j:j + n] == objetivo:
                k = cand[j]
                return k, self.w[k]["i"]
        # búsqueda aproximada (errores de transcripción)
        from rapidfuzz import fuzz

        mejor, mejor_j = 0.0, -1
        meta = " ".join(objetivo)
        for j in range(len(toks) - n + 1):
            r = fuzz.ratio(" ".join(toks[j:j + n]), meta)
            if r > mejor:
                mejor, mejor_j = r, j
        if mejor >= 80:
            k = cand[mejor_j]
            print(f"   ~ ancla aproximada ({mejor:.0f}%): {frase!r} -> "
                  f"{' '.join(self.w[x]['p'] for x in cand[mejor_j:mejor_j + n])!r}")
            return k, self.w[k]["i"]
        contexto = " ".join(self.w[k]["p"] for k in cand[:25])
        raise ValueError(f"No encuentro la frase ancla {frase!r} después de {desde:.1f}s.\n"
                         f"   Texto que sigue: {contexto} ...")


def tiempo(valor, buscador: Buscador, desde: float, hasta: float | None = None) -> float:
    """Un ancla puede ser una frase (str) o segundos absolutos (número)."""
    if isinstance(valor, (int, float)):
        return float(valor)
    return buscador.buscar(str(valor), desde, hasta)[1]


# ----------------------------------------------------------------------------- frases de subtítulo
def agrupar_frases(palabras: list[dict], max_chars: int = 64) -> list[dict]:
    """Agrupa palabras en frases cortas de subtítulo (máx. 2 líneas), cortando en
    puntos, pausas, comas largas y mayúsculas tras una pausa (frase nueva sin punto)."""
    frases, actual = [], []
    for k, w in enumerate(palabras):
        actual.append(w)
        sig = palabras[k + 1] if k + 1 < len(palabras) else None
        texto = " ".join(x["p"] for x in actual)
        pausa = (sig["i"] - w["f"]) if sig else 99
        fin = w["p"].endswith((".", "?", "!", "…"))
        coma = w["p"].endswith((",", ";", ":"))
        nueva = bool(sig) and sig["p"][:1].isupper() and pausa > 0.25
        corta = (
            sig is None
            or fin
            or nueva
            or pausa > 0.55
            or (coma and len(texto) > 26)
            or len(texto) + 1 + len(sig["p"]) > max_chars
        )
        if corta:
            frases.append({"i": actual[0]["i"], "f": w["f"],
                           "palabras": [{"p": x["p"], "i": x["i"], "f": x["f"]} for x in actual]})
            actual = []
    return frases


def ts(t: float, srt: bool = False) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    if srt:
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


# ----------------------------------------------------------------------------- principal
def resolver(ep: str) -> Path:
    carpeta = RAIZ / "02_Episodios" / ep
    plan = yaml.safe_load((carpeta / "plan.yaml").read_text(encoding="utf-8"))
    trans = json.loads((carpeta / "transcripcion" / "transcripcion.json").read_text(encoding="utf-8"))
    corr_f = carpeta / "correcciones.yaml"
    corr = yaml.safe_load(corr_f.read_text(encoding="utf-8")) if corr_f.exists() else {}
    palabras = aplicar_correcciones(trans["palabras"], corr or {})
    b = Buscador(palabras)

    fps = int(plan.get("fps", 30))
    adelanto = float(plan.get("adelanto", 0.2))     # la imagen llega un poco antes que la palabra
    dur_audio = float(trans["duracion"])
    cola = float(plan.get("cola", 10))

    escenas = []
    cursor = 0.0
    for n, e in enumerate(plan["escenas"]):
        desde = e.get("desde", "inicio")
        t0 = 0.0 if desde == "inicio" else max(0.0, tiempo(desde, b, cursor) - adelanto)
        if escenas and t0 <= escenas[-1]["inicio"]:
            raise ValueError(f"La escena {e['id']} empieza antes que la anterior: revisa su 'desde'.")
        escenas.append({"id": e["id"], "escena": e["escena"], "inicio": round(t0, 3),
                        "seccion": e.get("seccion"), "capitulo": e.get("capitulo"),
                        "props": e.get("props") or {}, "_marcas": e.get("marcas") or {}})
        cursor = t0 + adelanto
    for k, e in enumerate(escenas):
        e["fin"] = escenas[k + 1]["inicio"] if k + 1 < len(escenas) else round(dur_audio, 3)
        marcas = {}
        for nombre, ancla in e.pop("_marcas").items():
            try:
                t = tiempo(ancla, b, e["inicio"])
            except ValueError as err:
                raise ValueError(f"[{e['id']}] marca '{nombre}': {err}") from None
            marcas[nombre] = round(max(0.0, t - adelanto * 0.5 - e["inicio"]), 3)
        e["marcas"] = marcas
        print(f"  {ts(e['inicio'])}  {e['id']:<16} {e['fin'] - e['inicio']:5.1f}s  "
              f"marcas: {', '.join(f'{k}@{v:.1f}' for k, v in marcas.items())}")

    frases = agrupar_frases(palabras)
    salida_pub = ESTUDIO / "public" / "episodios" / ep
    salida_pub.mkdir(parents=True, exist_ok=True)
    audio_src = carpeta / plan["audio"]
    shutil.copyfile(audio_src, salida_pub / "audio.wav")

    resuelto = {
        "episodio": ep,
        "titulo": plan.get("titulo", ep),
        "formato": plan.get("formato", "pizarra"),
        "fps": fps,
        "ancho": int(plan.get("ancho", 1920)),
        "alto": int(plan.get("alto", 1080)),
        "audio": f"episodios/{ep}/audio.wav",
        "duracionAudio": round(dur_audio, 3),
        "cola": cola,
        "subtitulos": {"activo": bool(plan.get("subtitulos", True)), "frases": frases},
        "escenas": escenas,
    }
    (salida_pub / "plan.json").write_text(json.dumps(resuelto, ensure_ascii=False, indent=1), encoding="utf-8")

    yt = carpeta / "youtube"
    yt.mkdir(exist_ok=True)
    caps = [f"{ts(e['inicio'] if k else 0)} {e['capitulo']}" for k, e in enumerate(escenas) if e.get("capitulo")]
    (yt / "capitulos.txt").write_text("\n".join(caps) + "\n", encoding="utf-8")
    srt = [f"{n}\n{ts(f['i'], True)} --> {ts(f['f'], True)}\n{' '.join(w['p'] for w in f['palabras'])}\n"
           for n, f in enumerate(frases, 1)]
    (yt / "subtitulos.srt").write_text("\n".join(srt), encoding="utf-8")
    print(f"[plan] {len(escenas)} escenas, {len(frases)} frases de subtítulo -> {salida_pub / 'plan.json'}")
    return salida_pub / "plan.json"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    resolver(sys.argv[1])
