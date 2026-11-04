// Kit de dibujo del formato "Pizarra": trazos que se dibujan solos, texto, ondas,
// partículas de flujo y medidores. Todo en un lienzo SVG de 1920×1080.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FUENTES, PIZARRA as P} from '../../config/marca';
import {ap, clamp01, easeInOut} from '../../motor/tiempo';

export const W = 1920;
export const H = 1080;
export {P};

export const Lienzo: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ geometría (rutas SVG)
type Pt = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

export const R = {
  linea: (x1: number, y1: number, x2: number, y2: number) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`,
  poli: (pts: Pt[], cerrar = false) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}${cerrar ? 'Z' : ''}`,
  rect: (x: number, y: number, w: number, h: number, r = 0) => {
    const q = Math.min(r, w / 2, h / 2);
    if (q <= 0) return `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
    return (
      `M${f(x + q)} ${f(y)}H${f(x + w - q)}A${q} ${q} 0 0 1 ${f(x + w)} ${f(y + q)}V${f(y + h - q)}` +
      `A${q} ${q} 0 0 1 ${f(x + w - q)} ${f(y + h)}H${f(x + q)}A${q} ${q} 0 0 1 ${f(x)} ${f(y + h - q)}` +
      `V${f(y + q)}A${q} ${q} 0 0 1 ${f(x + q)} ${f(y)}Z`
    );
  },
  circulo: (cx: number, cy: number, r: number) =>
    `M${f(cx - r)} ${f(cy)}A${r} ${r} 0 1 1 ${f(cx + r)} ${f(cy)}A${r} ${r} 0 1 1 ${f(cx - r)} ${f(cy)}Z`,
  /** Arco en grados (0° = derecha, sentido horario en pantalla). */
  arco: (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    const grande = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const barrido = a1 > a0 ? 1 : 0;
    return `M${f(p0[0])} ${f(p0[1])}A${r} ${r} 0 ${grande} ${barrido} ${f(p1[0])} ${f(p1[1])}`;
  },
  /** y = y0 − h·fn(u), u∈[0,1], dibujada de x0 a x0+w. */
  funcion: (x0: number, y0: number, w: number, h: number, fn: (u: number) => number, n = 240) => {
    const pts: Pt[] = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      pts.push([x0 + w * u, y0 - h * fn(u)]);
    }
    return R.poli(pts);
  },
  /** Zig-zag horizontal (resistencia o resorte). */
  zigzag: (x1: number, y: number, x2: number, n: number, amp: number, puntas = 0) => {
    const pts: Pt[] = [[x1, y]];
    const a = x1 + puntas;
    const b = x2 - puntas;
    pts.push([a, y]);
    for (let k = 0; k < n; k++) {
      const u0 = a + ((b - a) * (k + 0.25)) / n;
      const u1 = a + ((b - a) * (k + 0.75)) / n;
      pts.push([u0, y - amp], [u1, y + amp]);
    }
    pts.push([b, y], [x2, y]);
    return R.poli(pts);
  },
  /** Bobina: lazos (medias vueltas) a lo largo de un eje vertical. */
  bobina: (x: number, y1: number, y2: number, vueltas: number, r: number, haciaDerecha = true) => {
    const paso = (y2 - y1) / vueltas;
    let d = `M${f(x)} ${f(y1)}`;
    for (let k = 0; k < vueltas; k++) {
      const ya = y1 + paso * (k + 1);
      d += `A${r} ${paso / 2} 0 0 ${haciaDerecha ? 1 : 0} ${f(x)} ${f(ya)}`;
    }
    return d;
  },
};

export const polar = (cx: number, cy: number, r: number, grados: number): Pt => {
  const a = (grados * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

// ------------------------------------------------------------------ trazo que se dibuja
type DProps = {
  d: string;
  p?: number;
  c?: string;
  w?: number;
  fill?: string;
  fillOp?: number;
  op?: number;
  dash?: string;
  cap?: 'round' | 'butt' | 'square';
};
/** Trazo SVG. p∈[0,1] controla cuánto del trazo está dibujado. */
export const D: React.FC<DProps> = ({d, p = 1, c = P.tinta, w = 4, fill = 'none', fillOp = 1, op = 1, dash, cap = 'round'}) => {
  if (p <= 0.002 || op <= 0.002) return null;
  if (dash) {
    return (
      <path d={d} stroke={c} strokeWidth={w} fill={fill} fillOpacity={fillOp * p} opacity={op * clamp01(p * 1.5)}
        strokeDasharray={dash} strokeLinecap={cap} strokeLinejoin="round" />
    );
  }
  const lleno = p >= 0.999;
  return (
    <path d={d} pathLength={1} stroke={c} strokeWidth={w} fill={fill} fillOpacity={fillOp * clamp01((p - 0.6) / 0.4)}
      opacity={op} strokeDasharray={lleno ? undefined : '1 1'} strokeDashoffset={lleno ? undefined : 1 - p}
      strokeLinecap={cap} strokeLinejoin="round" />
  );
};

// ------------------------------------------------------------------ texto
type TProps = {
  x: number;
  y: number;
  children: React.ReactNode;
  s?: number;
  c?: string;
  pe?: number;
  a?: 'start' | 'middle' | 'end';
  op?: number;
  mono?: boolean;
  it?: boolean;
  ls?: number;
  dy?: number;
};
export const T: React.FC<TProps> = ({x, y, children, s = 32, c = P.tinta, pe = 600, a = 'middle', op = 1, mono, it, ls = 0, dy = 0}) => {
  if (op <= 0.002) return null;
  return (
    <text x={x} y={y + dy} fontSize={s} fill={c} fontWeight={pe} textAnchor={a} opacity={clamp01(op)}
      fontFamily={mono ? FUENTES.mono : FUENTES.sans} fontStyle={it ? 'italic' : 'normal'} letterSpacing={ls}
      dominantBaseline="central">
      {children}
    </text>
  );
};

/** Grupo que aparece (opacidad + leve subida). s opcional: escala desde (ox, oy). */
export const Ap: React.FC<{p: number; children: React.ReactNode; dy?: number; s?: number; ox?: number; oy?: number}> = ({
  p,
  children,
  dy = 12,
  s,
  ox = 0,
  oy = 0,
}) => {
  if (p <= 0.002) return null;
  const q = clamp01(p);
  const esc = s === undefined ? '' : ` translate(${ox} ${oy}) scale(${s + (1 - s) * q}) translate(${-ox} ${-oy})`;
  return (
    <g opacity={q} transform={`translate(0 ${(1 - q) * dy})${esc}`}>
      {children}
    </g>
  );
};

/** Desplaza/escala un grupo (para reacomodar la composición). */
export const Mover: React.FC<{x?: number; y?: number; s?: number; ox?: number; oy?: number; children: React.ReactNode; op?: number}> = ({
  x = 0,
  y = 0,
  s = 1,
  ox = 0,
  oy = 0,
  children,
  op = 1,
}) =>
  op <= 0.002 ? null : (
    <g opacity={op} transform={`translate(${x} ${y}) translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`}>{children}</g>
  );

// ------------------------------------------------------------------ flechas y marcas
export const Flecha: React.FC<{x1: number; y1: number; x2: number; y2: number; p?: number; c?: string; w?: number; cabeza?: number; op?: number}> = ({
  x1,
  y1,
  x2,
  y2,
  p = 1,
  c = P.tinta,
  w = 4,
  cabeza = 16,
  op = 1,
}) => {
  if (p <= 0.002) return null;
  const xe = x1 + (x2 - x1) * clamp01(p);
  const ye = y1 + (y2 - y1) * clamp01(p);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a1: Pt = [xe - cabeza * Math.cos(ang - 0.45), ye - cabeza * Math.sin(ang - 0.45)];
  const a2: Pt = [xe - cabeza * Math.cos(ang + 0.45), ye - cabeza * Math.sin(ang + 0.45)];
  return (
    <g opacity={op}>
      <path d={R.linea(x1, y1, xe, ye)} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />
      <path d={R.poli([a1, [xe, ye], a2])} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
};

export const Check: React.FC<{x: number; y: number; s?: number; p?: number; c?: string}> = ({x, y, s = 1, p = 1, c = P.azul}) => (
  <D d={R.poli([[x - 14 * s, y], [x - 4 * s, y + 11 * s], [x + 16 * s, y - 12 * s]])} p={p} c={c} w={5 * Math.max(0.7, s)} />
);

export const Cruz: React.FC<{x: number; y: number; s?: number; p?: number; c?: string; w?: number}> = ({x, y, s = 1, p = 1, c = P.rojo, w = 6}) => (
  <g>
    <D d={R.linea(x - 18 * s, y - 18 * s, x + 18 * s, y + 18 * s)} p={clamp01(p * 2)} c={c} w={w} />
    <D d={R.linea(x + 18 * s, y - 18 * s, x - 18 * s, y + 18 * s)} p={clamp01(p * 2 - 1)} c={c} w={w} />
  </g>
);

/** Etiqueta pequeña con raya (como los rótulos de los diagramas de referencia). */
export const Etiqueta: React.FC<{x: number; y: number; texto: string; p?: number; c?: string; s?: number; a?: 'start' | 'middle' | 'end'}> = ({
  x,
  y,
  texto,
  p = 1,
  c = P.tinta2,
  s = 26,
  a = 'middle',
}) => (
  <T x={x} y={y} s={s} c={c} pe={500} a={a} op={p} dy={(1 - clamp01(p)) * 8}>
    {texto}
  </T>
);

/** Píldora (badge) con texto. */
export const Pildora: React.FC<{x: number; y: number; texto: string; p?: number; c?: string; fondo?: string; s?: number; w?: number}> = ({
  x,
  y,
  texto,
  p = 1,
  c = '#fff',
  fondo = P.azul,
  s = 26,
  w,
}) => {
  if (p <= 0.002) return null;
  const ancho = w ?? texto.length * s * 0.6 + s * 1.4;
  const alto = s * 1.7;
  return (
    <Ap p={p} s={0.9} ox={x} oy={y}>
      <path d={R.rect(x - ancho / 2, y - alto / 2, ancho, alto, alto / 2)} fill={fondo} />
      <T x={x} y={y + 1} s={s} c={c} pe={600}>
        {texto}
      </T>
    </Ap>
  );
};

// ------------------------------------------------------------------ partículas de flujo
type FlujoProps = {
  pts: Pt[];
  t: number;
  vel?: number; // px/s (negativo = al revés)
  n?: number;
  r?: number;
  c?: string;
  op?: number;
  vaiven?: number; // amplitud en px: las partículas van y vienen
  frec?: number; // Hz del vaivén
  desfase?: number; // radianes (vaivén) o píxeles (avance)
  resaltarX?: number; // las partículas que cruzan esta x se resaltan
  tope?: number; // x máxima a la que pueden llegar (se apilan contra una "puerta")
};
const largo = (pts: Pt[]) => {
  let L = 0;
  for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  return L;
};
export const puntoEn = (pts: Pt[], s: number): Pt => {
  let resto = s;
  for (let k = 1; k < pts.length; k++) {
    const seg = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (resto <= seg || k === pts.length - 1) {
      const u = seg === 0 ? 0 : clamp01(resto / seg);
      return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * u, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * u];
    }
    resto -= seg;
  }
  return pts[pts.length - 1];
};
/** Puntos que recorren una polilínea (corriente, agua, energía). */
export const Flujo: React.FC<FlujoProps> = ({
  pts,
  t,
  vel = 160,
  n = 16,
  r = 7,
  c = P.azul,
  op = 1,
  vaiven = 0,
  frec = 0.5,
  desfase = 0,
  resaltarX,
  tope,
}) => {
  if (op <= 0.002) return null;
  const L = largo(pts);
  const out: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    let s = (k / n) * L;
    if (vaiven > 0) s += vaiven * Math.sin(2 * Math.PI * frec * t + desfase);
    else s += vel * t + desfase;
    s = ((s % L) + L) % L;
    let [x, y] = puntoEn(pts, s);
    if (tope !== undefined && x > tope) x = tope - (k % 4) * r * 2.2;
    const borde = vaiven > 0 ? 30 : Math.min(s, L - s);
    const fade = clamp01(borde / 30);
    const cerca = resaltarX !== undefined && Math.abs(x - resaltarX) < 18;
    out.push(<circle key={k} cx={x} cy={y} r={cerca ? r * 1.45 : r} fill={cerca ? P.tinta : c} opacity={op * fade} />);
  }
  return <g>{out}</g>;
};

// ------------------------------------------------------------------ medidores
/** Barra vertical tipo "salida" de las referencias. nivel∈[0,1]. */
export const Medidor: React.FC<{
  x: number;
  y: number;
  h?: number;
  w?: number;
  nivel: number;
  c?: string;
  p?: number;
  valor?: string;
  etiqueta?: string;
  limite?: number;
  colorValor?: string;
}> = ({x, y, h = 320, w = 40, nivel, c = P.azul, p = 1, valor, etiqueta, limite, colorValor}) => {
  if (p <= 0.002) return null;
  const top = y - h;
  const alto = h * clamp01(nivel);
  return (
    <g opacity={clamp01(p * 1.4)}>
      <path d={R.rect(x - w / 2, top, w, h, w / 2)} fill="#fff" stroke={P.tinta} strokeWidth={3} />
      {alto > 1 && (
        <path d={R.rect(x - w / 2 + 6, y - 6 - Math.max(0, alto - 12), w - 12, Math.max(4, alto - 12), (w - 12) / 2)} fill={c} />
      )}
      {limite !== undefined && (
        <g>
          <path d={R.linea(x - w / 2 - 14, y - h * limite, x + w / 2 + 14, y - h * limite)} stroke={P.rojo} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {valor && (
        <T x={x} y={y + 36} s={30} pe={700} c={colorValor ?? P.tinta}>
          {valor}
        </T>
      )}
      {etiqueta && (
        <T x={x} y={y + (valor ? 72 : 36)} s={22} pe={500} c={P.tinta2}>
          {etiqueta}
        </T>
      )}
    </g>
  );
};

/** Manómetro (presión): semicírculo con aguja. valor∈[0,1]. */
export const Manometro: React.FC<{x: number; y: number; r?: number; valor: number; p?: number; c?: string}> = ({x, y, r = 70, valor, p = 1, c = P.azul}) => {
  if (p <= 0.002) return null;
  const ang = 180 + 180 * clamp01(valor);
  const [nx, ny] = polar(x, y, r * 0.78, ang);
  const ticks = [];
  for (let k = 0; k <= 6; k++) {
    const a = 180 + k * 30;
    const [x1, y1] = polar(x, y, r * 0.86, a);
    const [x2, y2] = polar(x, y, r, a);
    ticks.push(<path key={k} d={R.linea(x1, y1, x2, y2)} stroke={P.tinta} strokeWidth={3} strokeLinecap="round" />);
  }
  return (
    <g opacity={clamp01(p * 1.4)}>
      <D d={R.arco(x, y, r + 10, 180, 360) + `L${x + r + 10} ${y + 14}L${x - r - 10} ${y + 14}Z`} p={p} fill="#fff" />
      <D d={R.arco(x, y, r * 0.93, 180, 180 + 180 * clamp01(valor))} c={c} w={8} p={p} cap="butt" />
      {ticks}
      <path d={R.linea(x, y, nx, ny)} stroke={P.tinta} strokeWidth={5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={8} fill={P.tinta} />
    </g>
  );
};

/** Ejes simples para gráficas. */
export const Ejes: React.FC<{x: number; y: number; w: number; hArriba: number; hAbajo?: number; p?: number; etiquetaX?: string; etiquetaY?: string}> = ({
  x,
  y,
  w,
  hArriba,
  hAbajo = 0,
  p = 1,
  etiquetaX,
  etiquetaY,
}) => (
  <g>
    <D d={R.linea(x, y + hAbajo, x, y - hArriba)} p={p} w={3} />
    <D d={R.linea(x, y, x + w, y)} p={p} w={3} />
    {etiquetaX && <Etiqueta x={x + w} y={y + 30} texto={etiquetaX} a="end" p={ap(p, 0.6, 0.4)} s={22} />}
    {etiquetaY && <Etiqueta x={x - 14} y={y - hArriba} texto={etiquetaY} a="end" p={ap(p, 0.6, 0.4)} s={22} />}
  </g>
);

/** Onda senoidal con fase móvil. */
export const ondaSeno = (x0: number, y0: number, w: number, amp: number, ciclos: number, fase: number) =>
  R.funcion(x0, y0, w, amp, (u) => Math.sin(2 * Math.PI * ciclos * u + fase), 320);

/** Sacudida determinista (para cosas que "sufren"). */
export const temblor = (t: number, fuerza: number) => [
  Math.sin(t * 61.3) * fuerza + Math.sin(t * 23.1) * fuerza * 0.6,
  Math.cos(t * 53.7) * fuerza * 0.7,
];

export const latido = (t: number, t0: number) => {
  const q = t - t0;
  if (q < 0 || q > 0.6) return 1;
  return 1 + 0.12 * Math.sin((q / 0.6) * Math.PI);
};

export {ap, easeInOut};
