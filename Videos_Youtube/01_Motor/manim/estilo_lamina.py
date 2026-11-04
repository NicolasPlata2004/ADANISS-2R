"""Formato "Lámina técnica" para Manim: figura de libro/paper, trazo negro sobre blanco,
tipografía Latin Modern (la de LaTeX) y ecuaciones numeradas.

Incluye EscenaSincronizada: las animaciones esperan a las "marcas" de la narración
(frases ancladas en la transcripción), así el video calza exacto con el audio.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
from manim import (
    BLACK,
    DOWN,
    LEFT,
    RIGHT,
    UP,
    WHITE,
    Circle,
    DashedLine,
    Line,
    MathTex,
    Scene,
    TexTemplate,
    Text,
    VGroup,
    VMobject,
    config,
)

TINTA = "#141414"
GRIS = "#9A9A9A"
ACENTO = "#B3261E"  # rojo de anotación, como en las láminas de referencia
PAPEL = "#FFFFFF"
SERIF = "Latin Modern Roman"

PLANTILLA = TexTemplate()
# (plantilla LaTeX por defecto de Manim: Computer Modern, igual que un paper)

config.background_color = PAPEL


def texto(s: str, tam: float = 30, color: str = TINTA, italica: bool = False, **kw) -> Text:
    return Text(s, font=SERIF, font_size=tam, color=color, slant="ITALIC" if italica else "NORMAL", **kw)


def ec(s: str, tam: float = 40, color: str = TINTA) -> MathTex:
    return MathTex(s, tex_template=PLANTILLA, font_size=tam, color=color)


def letra_circulada(letra: str, punto, hacia=UP + RIGHT, dist: float = 0.9, color: str = TINTA) -> VGroup:
    """Letra en un círculo con línea guía, como en las figuras técnicas: (A), (B)…"""
    centro = np.array(punto) + dist * np.array(hacia) / np.linalg.norm(hacia)
    circ = Circle(radius=0.2, color=color, stroke_width=2).move_to(centro)
    l = MathTex(rf"\mathrm{{{letra}}}", tex_template=PLANTILLA, font_size=28, color=color).move_to(centro)
    guia = Line(punto, circ.point_at_angle(np.arctan2(*(np.array(punto) - centro)[[1, 0]])), color=color, stroke_width=1.5)
    return VGroup(guia, circ, l)


def curva(ejes, xs, ys, color: str = TINTA, ancho: float = 3) -> VMobject:
    m = VMobject(color=color, stroke_width=ancho)
    m.set_points_as_corners([ejes.c2p(x, y) for x, y in zip(xs, ys)])
    return m


def corchete_vertical(p_arriba, p_abajo, color: str = ACENTO, ancho_tic: float = 0.12) -> VGroup:
    a = np.array(p_arriba)
    b = np.array(p_abajo)
    return VGroup(
        Line(a, b, color=color, stroke_width=2.5),
        Line(a + LEFT * ancho_tic, a + RIGHT * ancho_tic, color=color, stroke_width=2.5),
        Line(b + LEFT * ancho_tic, b + RIGHT * ancho_tic, color=color, stroke_width=2.5),
    )


def linea_nivel(ejes, y, x0, x1, color: str = GRIS) -> DashedLine:
    return DashedLine(ejes.c2p(x0, y), ejes.c2p(x1, y), color=color, stroke_width=2, dash_length=0.1)


class EscenaSincronizada(Scene):
    """Escena que sabe en qué segundo de la narración está.

    Lee MARCAS_JSON = {"duracion": s, "marcas": {"nombre": segundos_desde_inicio}}.
    - self.hasta("nombre"): espera hasta que la narración llegue a esa marca.
    - self.dur_hasta("nombre", deseado): duración de animación que no se pasa de la marca.
    - self.cerrar(): rellena hasta la duración exacta del segmento.
    """

    def setup(self):
        ruta = os.environ.get("MARCAS_JSON")
        datos = json.loads(Path(ruta).read_text(encoding="utf-8")) if ruta else {"duracion": 30, "marcas": {}}
        self.marcas: dict[str, float] = datos["marcas"]
        self.duracion: float = float(datos["duracion"])

    @property
    def ahora(self) -> float:
        return float(self.renderer.time)

    def marca(self, nombre: str, defecto: float = 0.0) -> float:
        return float(self.marcas.get(nombre, defecto))

    def hasta(self, nombre: str, adelanto: float = 0.0, defecto: float | None = None):
        objetivo = self.marca(nombre, self.ahora if defecto is None else defecto) - adelanto
        falta = objetivo - self.ahora
        if falta > 1 / config.frame_rate:
            self.wait(falta)

    def dur_hasta(self, nombre: str, deseado: float, minimo: float = 0.4) -> float:
        libre = self.marca(nombre, self.ahora + deseado) - self.ahora
        return max(minimo, min(deseado, libre))

    def cerrar(self):
        falta = self.duracion - self.ahora
        if falta > 1 / config.frame_rate:
            self.wait(falta)


__all__ = [
    "ACENTO", "BLACK", "DOWN", "GRIS", "LEFT", "PAPEL", "PLANTILLA", "RIGHT", "SERIF", "TINTA", "UP", "WHITE",
    "EscenaSincronizada", "corchete_vertical", "curva", "ec", "letra_circulada", "linea_nivel", "texto",
]
