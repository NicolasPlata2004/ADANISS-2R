// Íconos de línea (mismo grosor y estilo) centrados en (x, y). p = progreso del dibujo.
import React from 'react';
import {Ap, D, P, R, T, polar} from './kit';
import {clamp01} from '../../motor/tiempo';

type Base = {x: number; y: number; s?: number; p?: number; c?: string};

export const Reloj: React.FC<Base & {h?: number; min?: number}> = ({x, y, s = 1, p = 1, h = 7, min = 30, c = P.tinta}) => {
  const r = 150 * s;
  const marcas = [];
  for (let k = 0; k < 12; k++) {
    const [x1, y1] = polar(x, y, r * (k % 3 === 0 ? 0.78 : 0.86), k * 30 - 90);
    const [x2, y2] = polar(x, y, r * 0.93, k * 30 - 90);
    marcas.push(<D key={k} d={R.linea(x1, y1, x2, y2)} p={clamp01(p * 2 - 0.6 - k * 0.02)} w={k % 3 === 0 ? 5 : 3} c={c} />);
  }
  const aH = ((h % 12) + min / 60) * 30 - 90;
  const aM = min * 6 - 90;
  const [hx, hy] = polar(x, y, r * 0.5, aH);
  const [mx, my] = polar(x, y, r * 0.74, aM);
  const q = clamp01(p * 2 - 1);
  return (
    <g>
      <D d={R.circulo(x, y, r)} p={p} w={5} c={c} fill="#fff" />
      {marcas}
      <D d={R.linea(x, y, hx, hy)} p={q} w={9} c={c} />
      <D d={R.linea(x, y, mx, my)} p={q} w={6} c={c} />
      {q > 0 && <circle cx={x} cy={y} r={10 * s} fill={c} />}
    </g>
  );
};

/** Teléfono con indicador de batería. nivel∈[0,1]. */
export const Telefono: React.FC<Base & {nivel?: number; texto?: string; cargando?: boolean; colorNivel?: string; sinBateria?: boolean}> = ({
  x,
  y,
  s = 1,
  p = 1,
  nivel = 0.5,
  texto,
  cargando,
  colorNivel,
  sinBateria,
  c = P.tinta,
}) => {
  const w = 220 * s;
  const h = 440 * s;
  const q = clamp01(p * 1.6 - 0.6);
  const bw = 96 * s;
  const bh = 46 * s;
  const col = colorNivel ?? (nivel < 0.2 ? P.rojo : P.azul);
  return (
    <g>
      <D d={R.rect(x - w / 2, y - h / 2, w, h, 34 * s)} p={p} w={5} c={c} fill="#fff" />
      <D d={R.rect(x - 30 * s, y - h / 2 + 18 * s, 60 * s, 10 * s, 5 * s)} p={q} w={3} c={c} />
      {!sinBateria && q > 0 && (
        <g opacity={q}>
          <path d={R.rect(x - bw / 2, y - bh / 2 - 20 * s, bw, bh, 8 * s)} fill="none" stroke={c} strokeWidth={4} />
          <path d={R.rect(x + bw / 2 + 3 * s, y - 12 * s - 20 * s, 8 * s, 24 * s, 3 * s)} fill={c} />
          <path d={R.rect(x - bw / 2 + 6 * s, y - bh / 2 - 14 * s, Math.max(2, (bw - 12 * s) * clamp01(nivel)), bh - 12 * s, 4 * s)} fill={col} />
          {cargando && (
            <path
              d={R.poli([[x + 4 * s, y - 52 * s], [x - 12 * s, y - 16 * s], [x + 2 * s, y - 16 * s], [x - 4 * s, y + 12 * s], [x + 14 * s, y - 24 * s], [x, y - 24 * s]], true)}
              fill={P.tinta}
              stroke="#fff"
              strokeWidth={3}
            />
          )}
          {texto && (
            <T x={x} y={y + 50 * s} s={40 * s} pe={700} c={col} mono>
              {texto}
            </T>
          )}
        </g>
      )}
    </g>
  );
};

/** Enchufe de pared. */
export const Enchufe: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => {
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.rect(x - 75 * s, y - 95 * s, 150 * s, 190 * s, 26 * s)} p={p} w={5} c={c} fill="#fff" />
      <D d={R.rect(x - 34 * s, y - 50 * s, 14 * s, 50 * s, 6 * s)} p={q} w={4} c={c} />
      <D d={R.rect(x + 20 * s, y - 50 * s, 14 * s, 50 * s, 6 * s)} p={q} w={4} c={c} />
      <D d={R.arco(x, y + 44 * s, 15 * s, 180, 360) + `L${x + 15 * s} ${y + 54 * s}L${x - 15 * s} ${y + 54 * s}Z`} p={q} w={4} c={c} />
    </g>
  );
};

/** Cargador de pared (la "cajita"). */
export const Cargador: React.FC<Base & {relleno?: string; puerto?: boolean}> = ({x, y, s = 1, p = 1, c = P.tinta, relleno = '#fff', puerto = true}) => {
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.linea(x - 50 * s, y - 80 * s, x - 50 * s, y - 120 * s)} p={q} w={10 * s} c={c} cap="butt" />
      <D d={R.linea(x + 50 * s, y - 80 * s, x + 50 * s, y - 120 * s)} p={q} w={10 * s} c={c} cap="butt" />
      <D d={R.rect(x - 90 * s, y - 85 * s, 180 * s, 170 * s, 28 * s)} p={p} w={5} c={c} fill={relleno} />
      {puerto && <D d={R.rect(x - 22 * s, y + 52 * s, 44 * s, 14 * s, 7 * s)} p={q} w={4} c={c} />}
      <D
        d={R.poli([[x + 6 * s, y - 40 * s], [x - 16 * s, y + 4 * s], [x + 2 * s, y + 4 * s], [x - 6 * s, y + 34 * s], [x + 18 * s, y - 10 * s], [x, y - 10 * s]], true)}
        p={q}
        w={4}
        c={c}
      />
    </g>
  );
};

/** Batería (celda) horizontal. */
export const Bateria: React.FC<Base & {nivel?: number; colorNivel?: string; w?: number; h?: number}> = ({
  x,
  y,
  s = 1,
  p = 1,
  nivel = 0.6,
  colorNivel = P.azul,
  c = P.tinta,
  w = 200,
  h = 100,
}) => {
  const W = w * s;
  const Hh = h * s;
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.rect(x - W / 2, y - Hh / 2, W, Hh, 14 * s)} p={p} w={5} c={c} fill="#fff" />
      <D d={R.rect(x + W / 2 + 2 * s, y - Hh * 0.2, 14 * s, Hh * 0.4, 4 * s)} p={q} w={4} c={c} fill={c} />
      {q > 0 && nivel > 0.005 && (
        <path d={R.rect(x - W / 2 + 10 * s, y - Hh / 2 + 10 * s, (W - 20 * s) * clamp01(nivel), Hh - 20 * s, 7 * s)} fill={colorNivel} opacity={q} />
      )}
    </g>
  );
};

/** Diodo: triángulo + barra, en la dirección (x1,y1)→(x2,y2). */
export const Diodo: React.FC<{x1: number; y1: number; x2: number; y2: number; p?: number; c?: string; tam?: number; relleno?: string; w?: number}> = ({
  x1,
  y1,
  x2,
  y2,
  p = 1,
  c = P.tinta,
  tam = 30,
  relleno = '#fff',
  w = 4,
}) => {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const q = clamp01(p * 1.5 - 0.3);
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${ang})`}>
      <D d={R.linea(-L / 2, 0, -tam * 0.6, 0)} p={p} w={w} c={c} />
      <D d={R.linea(tam * 0.6, 0, L / 2, 0)} p={p} w={w} c={c} />
      <D d={R.poli([[-tam * 0.6, -tam * 0.7], [tam * 0.6, 0], [-tam * 0.6, tam * 0.7]], true)} p={q} w={w} c={c} fill={relleno} />
      <D d={R.linea(tam * 0.6, -tam * 0.7, tam * 0.6, tam * 0.7)} p={q} w={w + 1} c={c} />
    </g>
  );
};

/** Condensador (dos placas) vertical u horizontal, centrado. */
export const Condensador: React.FC<Base & {vertical?: boolean; patas?: number}> = ({x, y, s = 1, p = 1, c = P.tinta, vertical = true, patas = 60}) => {
  const a = 46 * s;
  const g = 12 * s;
  if (vertical) {
    return (
      <g>
        <D d={R.linea(x, y - patas * s - g, x, y - g)} p={p} w={4} c={c} />
        <D d={R.linea(x - a, y - g, x + a, y - g)} p={p} w={6} c={c} />
        <D d={R.linea(x - a, y + g, x + a, y + g)} p={p} w={6} c={c} />
        <D d={R.linea(x, y + g, x, y + patas * s + g)} p={p} w={4} c={c} />
      </g>
    );
  }
  return (
    <g>
      <D d={R.linea(x - patas * s - g, y, x - g, y)} p={p} w={4} c={c} />
      <D d={R.linea(x - g, y - a, x - g, y + a)} p={p} w={6} c={c} />
      <D d={R.linea(x + g, y - a, x + g, y + a)} p={p} w={6} c={c} />
      <D d={R.linea(x + g, y, x + patas * s + g, y)} p={p} w={4} c={c} />
    </g>
  );
};

/** Tanque/depósito con nivel de agua. */
export const Tanque: React.FC<Base & {nivel: number; w?: number; h?: number; t?: number}> = ({x, y, s = 1, p = 1, nivel, w = 200, h = 300, t = 0, c = P.tinta}) => {
  const W = w * s;
  const Hh = h * s;
  const top = y - Hh / 2;
  const yAgua = y + Hh / 2 - (Hh - 16) * clamp01(nivel);
  const q = clamp01(p * 1.5 - 0.5);
  const ola = (u: number) => Math.sin(u * Math.PI * 4 + t * 4) * 5 * s;
  const pts: [number, number][] = [];
  for (let k = 0; k <= 30; k++) {
    const u = k / 30;
    pts.push([x - W / 2 + 8 + (W - 16) * u, yAgua + ola(u)]);
  }
  const agua = R.poli([...pts, [x + W / 2 - 8, y + Hh / 2 - 8], [x - W / 2 + 8, y + Hh / 2 - 8]], true);
  return (
    <g>
      {q > 0 && <path d={agua} fill={P.azul} opacity={0.85 * q} />}
      <D d={R.poli([[x - W / 2, top], [x - W / 2, y + Hh / 2], [x + W / 2, y + Hh / 2], [x + W / 2, top]])} p={p} w={5} c={c} />
    </g>
  );
};

/** Interruptor de palanca. cerrado∈[0,1]. */
export const Interruptor: React.FC<Base & {cerrado: number}> = ({x, y, s = 1, p = 1, cerrado, c = P.tinta}) => {
  const L = 120 * s;
  const ang = -32 * (1 - clamp01(cerrado));
  const [ex, ey] = polar(x - L / 2, y, L, ang);
  return (
    <g>
      <D d={R.linea(x - L / 2 - 70 * s, y, x - L / 2, y)} p={p} w={4} c={c} />
      <D d={R.linea(x + L / 2, y, x + L / 2 + 70 * s, y)} p={p} w={4} c={c} />
      <D d={R.circulo(x - L / 2, y, 9 * s)} p={p} w={4} c={c} fill="#fff" />
      <D d={R.circulo(x + L / 2, y, 9 * s)} p={p} w={4} c={c} fill="#fff" />
      <D d={R.linea(x - L / 2, y, ex, ey)} p={p} w={6} c={c} />
    </g>
  );
};

/** Transistor en encapsulado TO-220 (vista frontal). */
export const TransistorPieza: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => {
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.rect(x - 70 * s, y - 150 * s, 140 * s, 70 * s, 8 * s)} p={p} w={4} c={c} fill={P.grisClaro} />
      <D d={R.circulo(x, y - 115 * s, 18 * s)} p={q} w={4} c={c} fill={P.papel} />
      <D d={R.rect(x - 70 * s, y - 80 * s, 140 * s, 120 * s, 6 * s)} p={p} w={5} c={c} fill="#fff" />
      {[-40, 0, 40].map((dx) => (
        <D key={dx} d={R.linea(x + dx * s, y + 40 * s, x + dx * s, y + 140 * s)} p={q} w={9 * s} c={c} cap="butt" />
      ))}
    </g>
  );
};

/** Símbolo de MOSFET simplificado como interruptor. on∈[0,1]. */
export const Mosfet: React.FC<Base & {on: number}> = ({x, y, s = 1, p = 1, on, c = P.tinta}) => {
  const colCanal = on > 0.5 ? P.azul : P.gris;
  return (
    <g>
      <D d={R.linea(x - 110 * s, y + 40 * s, x - 40 * s, y + 40 * s)} p={p} w={4} c={c} />
      <D d={R.linea(x - 40 * s, y - 50 * s, x - 40 * s, y + 50 * s)} p={p} w={5} c={c} />
      <D d={R.linea(x - 20 * s, y - 60 * s, x - 20 * s, y + 60 * s)} p={p} w={7} c={colCanal} dash={on > 0.5 ? undefined : '14 10'} />
      <D d={R.poli([[x - 20 * s, y - 45 * s], [x + 40 * s, y - 45 * s], [x + 40 * s, y - 110 * s]])} p={p} w={4} c={c} />
      <D d={R.poli([[x - 20 * s, y + 45 * s], [x + 40 * s, y + 45 * s], [x + 40 * s, y + 110 * s]])} p={p} w={4} c={c} />
      <T x={x - 120 * s} y={y + 40 * s - 30 * s} s={22 * s} pe={600} c={P.tinta2} a="start" op={p}>
        G
      </T>
    </g>
  );
};

/** Resorte horizontal entre x1 y x2. */
export const Resorte: React.FC<{x1: number; x2: number; y: number; p?: number; c?: string; n?: number; amp?: number; dash?: string; w?: number}> = ({
  x1,
  x2,
  y,
  p = 1,
  c = P.tinta,
  n = 9,
  amp = 30,
  dash,
  w = 4,
}) => <D d={R.zigzag(x1, y, x2, n, amp, 18)} p={p} c={c} w={w} dash={dash} />;

/** Resistencia con calor opcional (ondas que suben). */
export const Resistencia: React.FC<{x1: number; x2: number; y: number; p?: number; c?: string; calor?: number; t?: number}> = ({
  x1,
  x2,
  y,
  p = 1,
  c = P.tinta,
  calor = 0,
  t = 0,
}) => {
  const ondas = [];
  if (calor > 0.01) {
    for (let k = 0; k < 4; k++) {
      const cx = x1 + ((x2 - x1) * (k + 0.5)) / 4;
      const sube = ((t * 0.8 + k * 0.27) % 1) * 60;
      const d = R.funcion(cx - 12, y - 50 - sube, 24, 1, () => 0);
      const ola = `M${cx} ${y - 40 - sube}` + Array.from({length: 4}, (_, j) => `q ${j % 2 ? -10 : 10} -8 0 -16`).join(' ');
      ondas.push(<path key={k} d={ola} stroke={P.rojo} strokeWidth={4} fill="none" strokeLinecap="round" opacity={calor * (1 - sube / 70)} />);
      void d;
    }
  }
  return (
    <g>
      <D d={R.zigzag(x1, y, x2, 6, 22, 30)} p={p} c={calor > 0.5 ? P.rojo : c} w={5} />
      {ondas}
    </g>
  );
};

/** Coche de perfil (línea), centrado en la base. */
export const Coche: React.FC<Base & {freno?: number}> = ({x, y, s = 1, p = 1, c = P.tinta, freno = 0}) => {
  const q = clamp01(p * 1.5 - 0.5);
  const cuerpo = R.poli(
    [[-110, -20], [-100, -50], [-50, -55], [-20, -88], [50, -88], [80, -55], [110, -48], [115, -20], [-110, -20]].map(([a, b]) => [x + a * s, y + b * s] as [number, number]),
  );
  return (
    <g>
      <D d={cuerpo} p={p} w={5} c={c} fill="#fff" />
      <D d={R.poli([[-36, -55], [-12, -80], [20, -80], [20, -55]].map(([a, b]) => [x + a * s, y + b * s] as [number, number]), true)} p={q} w={4} c={c} />
      {[-62, 66].map((dx) => (
        <g key={dx}>
          <D d={R.circulo(x + dx * s, y - 14 * s, 24 * s)} p={q} w={5} c={c} fill="#fff" />
          {freno > 0.01 && <circle cx={x + dx * s} cy={y - 14 * s} r={14 * s} fill={P.rojo} opacity={freno} />}
        </g>
      ))}
    </g>
  );
};

/** Ladrillo. */
export const Ladrillo: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => {
  const w = 240 * s;
  const h = 110 * s;
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.rect(x - w / 2, y - h / 2, w, h, 6 * s)} p={p} w={5} c={c} fill={P.rojoSuave} />
      <D d={R.linea(x - w / 2, y, x + w / 2, y)} p={q} w={3} c={c} />
      <D d={R.linea(x - w / 6, y - h / 2, x - w / 6, y)} p={q} w={3} c={c} />
      <D d={R.linea(x + w / 4, y, x + w / 4, y + h / 2)} p={q} w={3} c={c} />
      <D d={R.linea(x - w / 3, y, x - w / 3, y + h / 2)} p={q} w={3} c={c} />
    </g>
  );
};

/** Transformador "antiguo": núcleo de hierro con dos bobinados. */
export const TransformadorGrande: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => {
  const q = clamp01(p * 1.5 - 0.5);
  const w = 260 * s;
  const h = 220 * s;
  return (
    <g>
      <D d={R.rect(x - w / 2, y - h / 2, w, h, 6 * s)} p={p} w={5} c={c} fill={P.grisClaro} />
      <D d={R.rect(x - w / 2 + 50 * s, y - h / 2 + 45 * s, w - 100 * s, h - 90 * s, 4 * s)} p={p} w={5} c={c} fill={P.papel} />
      {[-1, 1].map((lado) => (
        <D
          key={lado}
          d={R.rect(x + lado * (w / 2 - 25 * s) - 38 * s, y - 70 * s, 76 * s, 140 * s, 10 * s)}
          p={q}
          w={4}
          c={c}
          fill={lado < 0 ? P.azulSuave : P.rojoSuave}
        />
      ))}
      {[-1, 1].map((lado) =>
        [0, 1, 2, 3, 4].map((k) => (
          <D
            key={`${lado}${k}`}
            d={R.linea(x + lado * (w / 2 - 25 * s) - 38 * s, y - 50 * s + k * 25 * s, x + lado * (w / 2 - 25 * s) + 38 * s, y - 50 * s + k * 25 * s)}
            p={q}
            w={2}
            c={c}
          />
        )),
      )}
    </g>
  );
};

/** Transformador pequeño de ferrita (alta frecuencia). */
export const TransformadorFerrita: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => {
  const q = clamp01(p * 1.5 - 0.5);
  return (
    <g>
      <D d={R.rect(x - 60 * s, y - 50 * s, 120 * s, 100 * s, 8 * s)} p={p} w={4} c={c} fill={P.grisClaro} />
      <D d={R.rect(x - 34 * s, y - 34 * s, 68 * s, 68 * s, 6 * s)} p={q} w={4} c={c} fill={P.azulSuave} />
      {[-1, 0, 1].map((k) => (
        <D key={k} d={R.linea(x - 34 * s, y + k * 20 * s, x + 34 * s, y + k * 20 * s)} p={q} w={2} c={c} />
      ))}
      {[-30, -10, 10, 30].map((dx) => (
        <D key={dx} d={R.linea(x + dx * s, y + 50 * s, x + dx * s, y + 78 * s)} p={q} w={4} c={c} />
      ))}
    </g>
  );
};

/** Escudo con check. */
export const Escudo: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.azul}) => (
  <g>
    <D
      d={`M${x} ${y - 80 * s}L${x + 64 * s} ${y - 56 * s}V${y - 4 * s}C${x + 64 * s} ${y + 44 * s} ${x + 30 * s} ${y + 70 * s} ${x} ${y + 84 * s}C${x - 30 * s} ${y + 70 * s} ${x - 64 * s} ${y + 44 * s} ${x - 64 * s} ${y - 4 * s}V${y - 56 * s}Z`}
      p={p}
      w={5}
      c={c}
      fill={P.azulSuave}
    />
    <D d={R.poli([[x - 26 * s, y], [x - 6 * s, y + 22 * s], [x + 30 * s, y - 22 * s]])} p={clamp01(p * 2 - 1)} w={7} c={c} />
  </g>
);

/** Triángulo de advertencia. */
export const Alerta: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.rojo}) => (
  <g>
    <D d={R.poli([[x, y - 70 * s], [x + 78 * s, y + 60 * s], [x - 78 * s, y + 60 * s]], true)} p={p} w={6} c={c} fill={P.rojoSuave} />
    <D d={R.linea(x, y - 22 * s, x, y + 16 * s)} p={clamp01(p * 2 - 1)} w={8} c={c} />
    {p > 0.8 && <circle cx={x} cy={y + 38 * s} r={6 * s} fill={c} />}
  </g>
);

/** Rayo. */
export const Rayo: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.rojo}) => (
  <D
    d={R.poli([[x + 20 * s, y - 70 * s], [x - 30 * s, y + 6 * s], [x + 2 * s, y + 6 * s], [x - 16 * s, y + 70 * s], [x + 36 * s, y - 12 * s], [x + 4 * s, y - 12 * s]], true)}
    p={p}
    w={5}
    c={c}
    fill={c}
    fillOp={0.9}
  />
);

/** Gota de agua. */
export const Gota: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.azul}) => (
  <D
    d={`M${x} ${y - 60 * s}C${x + 20 * s} ${y - 28 * s} ${x + 44 * s} ${y} ${x + 44 * s} ${y + 22 * s}A${44 * s} ${44 * s} 0 0 1 ${x - 44 * s} ${y + 22 * s}C${x - 44 * s} ${y} ${x - 20 * s} ${y - 28 * s} ${x} ${y - 60 * s}Z`}
    p={p}
    w={5}
    c={c}
    fill={P.azulSuave}
  />
);

/** Burbuja de chat. cola: 'izq' | 'der'. */
export const Burbuja: React.FC<Base & {w: number; h: number; cola?: 'izq' | 'der'; children?: React.ReactNode; relleno?: string}> = ({
  x,
  y,
  w,
  h,
  p = 1,
  cola = 'izq',
  children,
  c = P.tinta,
  relleno = '#fff',
}) => {
  const bx = x - w / 2;
  const by = y - h / 2;
  const tx = cola === 'izq' ? bx + 40 : bx + w - 40;
  const dir = cola === 'izq' ? -1 : 1;
  return (
    <Ap p={p} s={0.85} ox={tx} oy={by + h}>
      <path d={R.rect(bx, by, w, h, 26)} fill={relleno} stroke={c} strokeWidth={4} />
      <path d={`M${tx - 14} ${by + h - 2}L${tx + dir * 22} ${by + h + 26}L${tx + 16} ${by + h - 2}`} fill={relleno} stroke={c} strokeWidth={4} strokeLinejoin="round" />
      <path d={R.linea(tx - 12, by + h - 2, tx + 14, by + h - 2)} stroke={relleno} strokeWidth={6} />
      {children}
    </Ap>
  );
};

/** Chip (circuito integrado) con patas. */
export const Chip: React.FC<Base & {w?: number; h?: number; texto?: string; relleno?: string}> = ({x, y, s = 1, p = 1, w = 200, h = 120, texto, c = P.tinta, relleno = '#fff'}) => {
  const W = w * s;
  const Hh = h * s;
  const q = clamp01(p * 1.5 - 0.5);
  const patas = [];
  const n = Math.max(2, Math.round(W / (34 * s)));
  for (let k = 0; k < n; k++) {
    const px = x - W / 2 + ((k + 0.5) * W) / n;
    patas.push(<D key={`a${k}`} d={R.linea(px, y - Hh / 2 - 16 * s, px, y - Hh / 2)} p={q} w={5} c={c} cap="butt" />);
    patas.push(<D key={`b${k}`} d={R.linea(px, y + Hh / 2, px, y + Hh / 2 + 16 * s)} p={q} w={5} c={c} cap="butt" />);
  }
  return (
    <g>
      {patas}
      <D d={R.rect(x - W / 2, y - Hh / 2, W, Hh, 10 * s)} p={p} w={5} c={c} fill={relleno} />
      {texto && (
        <T x={x} y={y} s={26 * s} pe={600} op={q}>
          {texto}
        </T>
      )}
    </g>
  );
};

/** Fuente de alterna (círculo con senoide). */
export const FuenteAlterna: React.FC<Base> = ({x, y, s = 1, p = 1, c = P.tinta}) => (
  <g>
    <D d={R.circulo(x, y, 48 * s)} p={p} w={5} c={c} fill="#fff" />
    <D d={R.funcion(x - 28 * s, y, 56 * s, 16 * s, (u) => Math.sin(u * Math.PI * 2))} p={clamp01(p * 1.5 - 0.5)} w={4} c={c} />
  </g>
);

/** Lupa (círculo de aumento con mango). */
export const Lupa: React.FC<Base & {r?: number}> = ({x, y, r = 140, p = 1, c = P.tinta}) => {
  const [hx, hy] = polar(x, y, r, 45);
  const [ex, ey] = polar(x, y, r + 90, 45);
  return (
    <g>
      <D d={R.circulo(x, y, r)} p={p} w={6} c={c} />
      <D d={R.linea(hx, hy, ex, ey)} p={clamp01(p * 1.5 - 0.5)} w={14} c={c} />
    </g>
  );
};
