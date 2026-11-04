"""EP01 · Formato "Lámina técnica": rectificación de onda completa y filtrado.

Segmento de la narración: "Ya no retrocede, pero llega a empujones…" hasta "…altísima."
Se renderiza con:  python ../scripts/muestra_manim.py   (resuelve marcas, renderiza y une el audio)
"""
from __future__ import annotations

import numpy as np
from manim import (
    Axes,
    Circumscribe,
    Create,
    DashedVMobject,
    Dot,
    FadeIn,
    FadeOut,
    Indicate,
    Line,
    MathTex,
    Rectangle,
    UL,
    UR,
    VGroup,
    VMobject,
    Write,
)

from estilo_lamina import (
    ACENTO,
    DOWN,
    GRIS,
    LEFT,
    PLANTILLA,
    RIGHT,
    TINTA,
    UP,
    EscenaSincronizada,
    corchete_vertical,
    curva,
    ec,
    letra_circulada,
    linea_nivel,
    texto,
)


def simular_filtro(xs: np.ndarray, tau: float = 3.0) -> np.ndarray:
    """Tensión del condensador: sigue la onda rectificada al subir y se descarga exponencialmente."""
    v = np.zeros_like(xs)
    for k in range(1, len(xs)):
        decae = v[k - 1] * np.exp(-(xs[k] - xs[k - 1]) / tau)
        v[k] = max(abs(np.sin(np.pi * xs[k])), decae)
    return v


def esquema() -> VGroup:
    g = VGroup()
    caja = Rectangle(width=0.8, height=1.75, color=TINTA, stroke_width=2.5).move_to([3.3, 1.125, 0])
    g += caja
    g += texto("puente", 22, italica=True).next_to(caja, DOWN, buff=0.15)
    g += Line([3.7, 2.0, 0], [6.5, 2.0, 0], color=TINTA, stroke_width=2.5)
    g += Line([3.7, 0.25, 0], [6.5, 0.25, 0], color=TINTA, stroke_width=2.5)
    # condensador
    g += Line([4.7, 2.0, 0], [4.7, 1.2, 0], color=TINTA, stroke_width=2.5)
    g += Line([4.4, 1.2, 0], [5.0, 1.2, 0], color=TINTA, stroke_width=4)
    g += Line([4.4, 1.05, 0], [5.0, 1.05, 0], color=TINTA, stroke_width=4)
    g += Line([4.7, 1.05, 0], [4.7, 0.25, 0], color=TINTA, stroke_width=2.5)
    # resistencia de carga
    zig = [[5.9, 1.65, 0]]
    for k in range(6):
        y = 1.65 - (k + 0.5) * (1.05 / 6)
        zig.append([5.9 + (0.15 if k % 2 == 0 else -0.15), y, 0])
    zig.append([5.9, 0.6, 0])
    r = VMobject(color=TINTA, stroke_width=2.5)
    r.set_points_as_corners(zig)
    g += Line([5.9, 2.0, 0], [5.9, 1.65, 0], color=TINTA, stroke_width=2.5)
    g += r
    g += Line([5.9, 0.6, 0], [5.9, 0.25, 0], color=TINTA, stroke_width=2.5)
    for p in ([4.7, 2.0, 0], [4.7, 0.25, 0], [5.9, 2.0, 0], [5.9, 0.25, 0]):
        g += Dot(p, radius=0.05, color=TINTA)
    g += MathTex("C", tex_template=PLANTILLA, font_size=34, color=TINTA).move_to([4.25, 1.125, 0])
    g += MathTex("R_L", tex_template=PLANTILLA, font_size=34, color=TINTA).move_to([6.35, 1.125, 0])
    g += MathTex("v_C", tex_template=PLANTILLA, font_size=30, color=TINTA).move_to([6.85, 2.0, 0])
    return g


class RectificadoYFiltrado(EscenaSincronizada):
    def construct(self):
        cap = texto("Fig. 3   Rectificación de onda completa y filtrado", 28, italica=True).to_corner(UL, buff=0.55)
        ejes = Axes(
            x_range=[0, 4.25, 1],
            y_range=[0, 1.3, 0.5],
            x_length=8.2,
            y_length=3.4,
            tips=True,
            axis_config={"color": TINTA, "stroke_width": 2, "include_ticks": False, "tip_length": 0.18, "tip_width": 0.14},
        ).move_to([-1.9, 0.95, 0])
        et = VGroup(
            MathTex("t", tex_template=PLANTILLA, font_size=32, color=TINTA).next_to(ejes.x_axis.get_end(), DOWN, buff=0.15),
            MathTex("v", tex_template=PLANTILLA, font_size=32, color=TINTA).next_to(ejes.y_axis.get_end(), LEFT, buff=0.15),
        )
        self.play(FadeIn(cap), Create(ejes), FadeIn(et), run_time=1.0)

        vr = ejes.plot(lambda x: abs(np.sin(np.pi * x)), x_range=[0, 4.0, 0.004], color=TINTA, stroke_width=3)
        self.play(Create(vr), run_time=self.dur_hasta("colinas", 2.2))

        def numerada(s: str, n: int):
            e = ec(s, 40)
            num = MathTex(f"({n})", tex_template=PLANTILLA, font_size=34, color=TINTA)
            return e, num

        e1, n1 = numerada(r"v_r(t) = V_p\,\lvert \sin \omega t \rvert", 1)
        e1.move_to([-3.9, -2.2, 0]).align_to([-6.2, 0, 0], LEFT)
        n1.move_to([-0.6, -2.2, 0])
        etq_vr = MathTex("v_r", tex_template=PLANTILLA, font_size=32, color=TINTA).next_to(ejes.c2p(3.5, 1.0), UR, buff=0.08)
        self.play(Write(e1), FadeIn(n1), FadeIn(etq_vr), run_time=self.dur_hasta("colinas", 1.2))

        self.hasta("colinas", adelanto=0.2)
        a = letra_circulada("A", ejes.c2p(1.5, 1.0), UP + RIGHT * 0.6, 0.75)
        b = letra_circulada("B", ejes.c2p(2.0, 0.0), UP + RIGHT * 1.4, 0.95)
        t_cima = texto("cima", 24, italica=True).next_to(a[1], RIGHT, buff=0.12)
        t_valle = texto("valle", 24, italica=True).next_to(b[1], RIGHT, buff=0.12)
        self.play(Create(a), FadeIn(t_cima), run_time=0.7)
        self.play(Create(b), FadeIn(t_valle), run_time=0.7)

        self.hasta("alisar", adelanto=0.2)
        inset = esquema()
        self.play(Create(inset), run_time=self.dur_hasta("cimas", 2.0))

        xs = np.linspace(0, 4.0, 1600)
        vc = simular_filtro(xs)
        vr_x = np.abs(np.sin(np.pi * xs))
        cargando = vr_x >= vc - 1e-6
        mitad = xs <= 2.25

        def tramos(mascara):
            grupos, actual = [], []
            for k, ok in enumerate(mascara):
                if ok:
                    actual.append(k)
                elif actual:
                    grupos.append(actual)
                    actual = []
            if actual:
                grupos.append(actual)
            return [curva(ejes, xs[g], vc[g], ACENTO, 6) for g in grupos if len(g) > 2]

        self.hasta("cimas", adelanto=0.2)
        carga = VGroup(*tramos(cargando & mitad & (xs > 0.05)))
        t_carga = texto("se carga", 22, italica=True, color=ACENTO).next_to(ejes.c2p(0.5, 1.0), UP, buff=0.12)
        self.play(Create(carga), FadeIn(t_carga), run_time=1.0)

        self.hasta("valles", adelanto=0.2)
        descarga = VGroup(*[DashedVMobject(m, num_dashes=10) for m in tramos(~cargando & mitad)])
        t_desc = texto("se descarga", 22, italica=True, color=ACENTO).next_to(ejes.c2p(1.05, 0.93), UP, buff=0.12)
        self.play(Create(descarga), FadeIn(t_desc), run_time=1.0)

        self.hasta("condensador", adelanto=0.2)
        e2, n2 = numerada(r"v_C(t) \approx V_p\, e^{-t/R_L C}", 2)
        e2.move_to([-3.9, -3.1, 0]).align_to([-6.2, 0, 0], LEFT)
        n2.move_to([-0.6, -3.1, 0])
        self.play(Write(e2), FadeIn(n2), Indicate(inset[-3], color=ACENTO, scale_factor=1.4), run_time=1.6)

        self.hasta("resultado", adelanto=0.2)
        vc_total = curva(ejes, xs, vc, TINTA, 5)
        self.play(
            vr.animate.set_stroke(color=GRIS, width=2),
            etq_vr.animate.set_color(GRIS),
            FadeOut(carga), FadeOut(descarga), FadeOut(t_carga), FadeOut(t_desc),
            Create(vc_total),
            run_time=self.dur_hasta("continua", 2.4),
        )

        self.hasta("continua", adelanto=0.2)
        media = float(np.mean(vc[xs > 1.0]))
        dc = linea_nivel(ejes, media, 0, 4.15, color=TINTA)
        t_dc = MathTex(r"V_{\mathrm{DC}}", tex_template=PLANTILLA, font_size=34, color=TINTA).next_to(ejes.c2p(4.15, media), RIGHT, buff=0.12)
        self.play(Create(dc), FadeIn(t_dc), run_time=1.0)

        self.hasta("ondulacion", adelanto=0.2)
        sel = (xs > 2.4) & (xs < 3.45)
        x_max = xs[sel][np.argmax(vc[sel])]
        x_min = xs[sel][np.argmin(vc[sel])]
        y_max = float(vc[sel].max())
        y_min = float(vc[sel].min())
        br = corchete_vertical(ejes.c2p(x_min, y_max), ejes.c2p(x_min, y_min))
        t_dv = MathTex(r"\Delta V", tex_template=PLANTILLA, font_size=32, color=ACENTO).next_to(br, DOWN, buff=0.12)
        guias = VGroup(
            linea_nivel(ejes, y_max, x_max, x_min, color=ACENTO),
        )
        e3, n3 = numerada(r"\Delta V \approx \dfrac{I}{2 f C}", 3)
        e3.move_to([2.6, -2.2, 0]).align_to([0.6, 0, 0], LEFT)
        n3.move_to([6.4, -2.2, 0])
        self.play(Create(br), Create(guias), FadeIn(t_dv), Write(e3), FadeIn(n3), run_time=1.6)

        self.hasta("presion", adelanto=0.2)
        vp = linea_nivel(ejes, 1.0, 0, 4.15)
        t_vp = MathTex("V_p", tex_template=PLANTILLA, font_size=32, color=TINTA).next_to(ejes.c2p(0, 1.0), LEFT, buff=0.15)
        e4, n4 = numerada(r"V_p = \sqrt{2}\,V_{\mathrm{rms}} \approx 170\text{--}325\ \mathrm{V}", 4)
        e4.move_to([2.6, -3.1, 0]).align_to([0.6, 0, 0], LEFT)
        n4.move_to([6.4, -3.1, 0])
        self.play(Create(vp), FadeIn(t_vp), Write(e4), FadeIn(n4), run_time=self.dur_hasta("altisima", 2.0))

        self.hasta("altisima", adelanto=0.2)
        self.play(Circumscribe(e4, color=ACENTO, buff=0.12, run_time=1.4))
        self.cerrar()
