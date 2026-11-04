"""Transcribe una narración con marcas de tiempo por palabra (faster-whisper).

Salidas en la carpeta indicada:
  transcripcion.json   segmentos + palabras con inicio/fin en segundos (lo usa el motor)
  subtitulos.srt       subtítulos listos para subir a YouTube (CC)
  guion_con_tiempos.txt  el texto con [mm:ss] por frase, para escribir el plan

Uso:
  python transcribir.py --audio EP01.wav --salida ../../02_Episodios/EP01/transcripcion
  python transcribir.py --audio EP01.wav --salida ... --modelo large-v3   (mejor precisión, PC con GPU)
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path


def _dispositivo(pedido: str) -> tuple[str, str]:
    if pedido != "auto":
        return pedido, ("float16" if pedido == "cuda" else "int8")
    try:
        import ctranslate2

        if ctranslate2.get_cuda_device_count() > 0:
            return "cuda", "float16"
    except Exception:
        pass
    return "cpu", "int8"


def cargar_audio_16k(ruta: Path):
    """Decodifica cualquier audio a mono 16 kHz float32 con ffmpeg (lo que espera Whisper)."""
    import subprocess

    import numpy as np

    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", str(ruta), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]
    datos = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(datos, dtype=np.float32).copy()


def _ts_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _ts_corto(t: float) -> str:
    m, s = divmod(t, 60)
    return f"{int(m):02d}:{s:04.1f}"


def _lineas_srt(palabras: list[dict], max_chars: int = 42, max_dur: float = 4.5) -> list[dict]:
    """Agrupa palabras en líneas de subtítulo legibles (corta en pausas y puntuación)."""
    lineas, actual = [], []
    for k, w in enumerate(palabras):
        actual.append(w)
        texto = " ".join(x["p"] for x in actual)
        sig = palabras[k + 1] if k + 1 < len(palabras) else None
        pausa = (sig["i"] - w["f"]) if sig else 99
        fin_frase = w["p"].endswith((".", "?", "!", "…", ":", ";"))
        if (
            sig is None
            or fin_frase
            or pausa > 0.45
            or len(texto) + 1 + len(sig["p"]) > max_chars
            or sig["f"] - actual[0]["i"] > max_dur
        ):
            lineas.append({"i": actual[0]["i"], "f": w["f"], "texto": texto})
            actual = []
    return lineas


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--salida", required=True)
    ap.add_argument("--modelo", default=os.environ.get("WHISPER_MODELO", "large-v3"),
                    help="nombre (large-v3, medium, small) o carpeta de un modelo CTranslate2")
    ap.add_argument("--idioma", default="es")
    ap.add_argument("--dispositivo", default="auto", choices=["auto", "cpu", "cuda"])
    ap.add_argument("--prompt", default="",
                    help="vocabulario técnico para ayudar al modelo (p. ej. 'servomotor, PID, ESP32')")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    audio = Path(args.audio)
    salida = Path(args.salida)
    salida.mkdir(parents=True, exist_ok=True)
    disp, tipo = _dispositivo(args.dispositivo)
    print(f"[transcribir] modelo={args.modelo} dispositivo={disp}/{tipo}")
    t0 = time.time()
    modelo = WhisperModel(args.modelo, device=disp, compute_type=tipo)
    segs, info = modelo.transcribe(
        cargar_audio_16k(audio),
        language=args.idioma,
        word_timestamps=True,
        beam_size=5,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
        condition_on_previous_text=False,
        initial_prompt=args.prompt or None,
    )

    segmentos, palabras = [], []
    for s in segs:
        ws = [
            {"p": w.word.strip(), "i": round(w.start, 3), "f": round(w.end, 3), "prob": round(w.probability, 3)}
            for w in (s.words or [])
            if w.word.strip()
        ]
        segmentos.append({"i": round(s.start, 3), "f": round(s.end, 3), "texto": s.text.strip(), "palabras": ws})
        palabras.extend(ws)
        print(f"  [{_ts_corto(s.start)}] {s.text.strip()}")

    datos = {
        "audio": audio.name,
        "idioma": info.language,
        "duracion": round(info.duration, 3),
        "modelo": str(args.modelo),
        "segmentos": segmentos,
        "palabras": palabras,
    }
    (salida / "transcripcion.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")

    srt = []
    for n, l in enumerate(_lineas_srt(palabras), 1):
        srt.append(f"{n}\n{_ts_srt(l['i'])} --> {_ts_srt(l['f'])}\n{l['texto']}\n")
    (salida / "subtitulos.srt").write_text("\n".join(srt), encoding="utf-8")

    guion = [f"[{_ts_corto(s['i'])} - {_ts_corto(s['f'])}] {s['texto']}" for s in segmentos]
    (salida / "guion_con_tiempos.txt").write_text("\n".join(guion) + "\n", encoding="utf-8")

    dudosas = [w for w in palabras if w["prob"] < 0.5]
    print(f"[transcribir] {len(segmentos)} segmentos, {len(palabras)} palabras, "
          f"{len(dudosas)} palabras de baja confianza, {time.time() - t0:.0f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
