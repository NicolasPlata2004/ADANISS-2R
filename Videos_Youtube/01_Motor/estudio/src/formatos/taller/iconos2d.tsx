// Íconos de línea para los insertos 2D (estilo Pizarra). Cada ícono ocupa ~200×200 centrado en (x, y).
import React from 'react';
import {D, P, R, T} from '../pizarra/kit';
import {Chip, Reloj} from '../pizarra/iconos';
import {clamp01} from '../../motor/tiempo';

type Props = {x: number; y: number; s?: number; p?: number; c?: string};
const pts = (x: number, y: number, s: number, lista: [number, number][]) => lista.map(([a, b]) => [x + a * s, y + b * s] as [number, number]);

export const ICONOS: Record<string, React.FC<Props>> = {
  reloj: ({x, y, s = 1, p = 1, c}) => <Reloj x={x} y={y} s={0.55 * s} p={p} c={c} />,
  chip: ({x, y, s = 1, p = 1, c}) => <Chip x={x} y={y} s={s} w={150} h={110} texto="32 kHz" p={p} c={c} />,
  ecografia: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.poli(pts(x, y, s, [[-30, -90], [30, -90], [38, -20], [-38, -20]]), true)} p={p} c={c} w={5} fill="#fff" />
      <D d={R.rect(x - 44 * s, y - 22 * s, 88 * s, 22 * s, 6 * s)} p={p} c={c} w={5} fill={P.azulSuave} />
      {[30, 58, 86].map((r, i) => (
        <D key={r} d={R.arco(x, y - 2 * s, r * s, 55, 125)} p={clamp01(p * 2 - 0.6 - i * 0.15)} c={P.azul} w={5} />
      ))}
    </g>
  ),
  motor: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.poli(pts(x, y, s, [[-45, -95], [-45, 30], [45, 30], [45, -95]]))} p={p} c={c} w={6} />
      <D d={R.rect(x - 40 * s, y - 50 * s, 80 * s, 40 * s, 6 * s)} p={p} c={c} w={5} fill={P.grisClaro} />
      <D d={R.linea(x, y - 10 * s, x + 18 * s, y + 55 * s)} p={p} c={c} w={7} />
      <D d={R.circulo(x, y + 70 * s, 26 * s)} p={p} c={c} w={5} />
      <D d={R.zigzag(x + 50 * s, y - 75 * s, x + 95 * s, 3, 10 * s)} p={clamp01(p * 2 - 1)} c={P.rojo} w={5} />
    </g>
  ),
  microondas: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.rect(x - 95 * s, y - 60 * s, 190 * s, 120 * s, 12 * s)} p={p} c={c} w={6} fill="#fff" />
      <D d={R.rect(x - 80 * s, y - 45 * s, 120 * s, 90 * s, 8 * s)} p={p} c={c} w={5} fill={P.azulSuave} />
      {[-30, 0, 30].map((dy) => (
        <D key={dy} d={R.circulo(x + 68 * s, y + dy * s, 7 * s)} p={p} c={c} w={4} />
      ))}
    </g>
  ),
  humo: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.circulo(x, y + 30 * s, 70 * s)} p={p} c={c} w={6} fill="#fff" />
      <D d={R.circulo(x, y + 30 * s, 30 * s)} p={p} c={c} w={5} />
      {[-45, -25, 25, 45].map((dx) => (
        <D key={dx} d={R.linea(x + dx * s, y + 70 * s, x + dx * s, y + 82 * s)} p={p} c={c} w={4} />
      ))}
      {[-30, 0, 30].map((dx, i) => (
        <path key={dx} d={`M${x + dx * s} ${y - 50 * s} q 12 -16 0 -32 q -12 -16 0 -32`} stroke={P.tinta2} strokeWidth={4} fill="none" strokeLinecap="round" opacity={clamp01(p * 2 - 1 - i * 0.1)} />
      ))}
    </g>
  ),
  parqueo: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.poli(pts(x, y, s, [[-100, 30], [-100, -10], [-60, -45], [10, -45], [40, -10], [40, 30]]), true)} p={p} c={c} w={6} fill="#fff" />
      <D d={R.circulo(x - 70 * s, y + 35 * s, 16 * s)} p={p} c={c} w={5} fill="#fff" />
      <D d={R.circulo(x + 10 * s, y + 35 * s, 16 * s)} p={p} c={c} w={5} fill="#fff" />
      <D d={R.linea(x + 100 * s, y - 80 * s, x + 100 * s, y + 55 * s)} p={p} c={c} w={8} />
      {[20, 40, 60].map((r, i) => (
        <D key={r} d={R.arco(x + 42 * s, y - 5 * s, r * s, -40, 40)} p={clamp01(p * 2 - 0.8 - i * 0.12)} c={P.azul} w={5} />
      ))}
    </g>
  ),
  impresora: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.rect(x - 60 * s, y - 95 * s, 120 * s, 60 * s, 4 * s)} p={p} c={c} w={5} fill="#fff" />
      <D d={R.rect(x - 95 * s, y - 40 * s, 190 * s, 80 * s, 12 * s)} p={p} c={c} w={6} fill={P.grisClaro} />
      <D d={R.rect(x - 60 * s, y + 25 * s, 120 * s, 60 * s, 4 * s)} p={p} c={c} w={5} fill="#fff" />
      {[-20, 0, 20].map((dx) => (
        <circle key={dx} cx={x + dx * s} cy={y + 55 * s} r={6 * s} fill={P.azul} opacity={clamp01(p * 2 - 1)} />
      ))}
    </g>
  ),
  guitarra: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 10 * s} ${y + 10 * s}C${x - 90 * s} ${y - 10 * s} ${x - 90 * s} ${y + 110 * s} ${x} ${y + 95 * s}C${x + 90 * s} ${y + 110 * s} ${x + 90 * s} ${y - 10 * s} ${x + 10 * s} ${y + 10 * s}C${x + 50 * s} ${y - 30 * s} ${x + 40 * s} ${y - 70 * s} ${x} ${y - 55 * s}C${x - 40 * s} ${y - 70 * s} ${x - 50 * s} ${y - 30 * s} ${x - 10 * s} ${y + 10 * s}Z`} p={p} c={c} w={6} fill="#F6E7CF" />
      <D d={R.circulo(x, y + 20 * s, 18 * s)} p={p} c={c} w={5} />
      <D d={R.rect(x - 9 * s, y - 150 * s, 18 * s, 100 * s, 3 * s)} p={p} c={c} w={5} fill="#fff" />
      <D d={R.rect(x - 25 * s, y + 55 * s, 50 * s, 10 * s, 3 * s)} p={clamp01(p * 2 - 1)} c={P.rojo} w={4} fill={P.rojoSuave} />
    </g>
  ),
  bateria: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 90 * s} ${y - 10 * s}A${90 * s} ${30 * s} 0 0 0 ${x + 90 * s} ${y - 10 * s}A${90 * s} ${30 * s} 0 0 0 ${x - 90 * s} ${y - 10 * s}Z`} p={p} c={c} w={6} fill="#fff" />
      <D d={R.poli(pts(x, y, s, [[-90, -10], [-90, 40], [90, 40], [90, -10]]))} p={p} c={c} w={6} />
      <D d={R.linea(x - 40 * s, y - 110 * s, x - 5 * s, y - 25 * s)} p={clamp01(p * 2 - 1)} c={c} w={7} />
      <D d={R.linea(x + 60 * s, y - 115 * s, x + 20 * s, y - 25 * s)} p={clamp01(p * 2 - 1)} c={c} w={7} />
    </g>
  ),
  escalera: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.poli(pts(x, y, s, [[-100, 70], [-50, 70], [-50, 30], [0, 30], [0, -10], [50, -10], [50, -50], [100, -50]]))} p={p} c={c} w={6} />
      <D d={R.circulo(x - 25 * s, y + 18 * s, 10 * s)} p={clamp01(p * 2 - 1)} c={P.azul} w={4} fill={P.azul} />
      <D d={R.circulo(x + 25 * s, y - 22 * s, 10 * s)} p={clamp01(p * 2 - 1)} c={P.azul} w={4} fill={P.azul} />
    </g>
  ),
  candado: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 45 * s} ${y - 10 * s}V${y - 50 * s}A${45 * s} ${45 * s} 0 0 1 ${x + 45 * s} ${y - 50 * s}V${y - 10 * s}`} p={p} c={c} w={8} />
      <D d={R.rect(x - 70 * s, y - 15 * s, 140 * s, 110 * s, 14 * s)} p={p} c={c} w={6} fill="#fff" />
      <D d={R.circulo(x, y + 30 * s, 12 * s)} p={p} c={c} w={5} fill={c} />
      <D d={R.linea(x, y + 40 * s, x, y + 65 * s)} p={p} c={c} w={7} />
    </g>
  ),
  grafica: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.poli(pts(x, y, s, [[-90, -80], [-90, 70], [100, 70]]))} p={p} c={c} w={5} />
      <D d={R.poli(pts(x, y, s, [[-90, 50], [-60, 50], [-55, -60], [-30, 10], [0, 40], [90, 50]]))} p={clamp01(p * 2 - 0.5)} c={P.azul} w={5} />
    </g>
  ),
  termometro: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 16 * s} ${y + 40 * s}V${y - 90 * s}A${16 * s} ${16 * s} 0 0 1 ${x + 16 * s} ${y - 90 * s}V${y + 40 * s}A${34 * s} ${34 * s} 0 1 1 ${x - 16 * s} ${y + 40 * s}Z`} p={p} c={c} w={6} fill="#fff" />
      <D d={R.linea(x, y + 60 * s, x, y - 60 * s)} p={clamp01(p * 2 - 1)} c={P.rojo} w={12} />
      <circle cx={x} cy={y + 68 * s} r={22 * s} fill={P.rojo} opacity={clamp01(p * 2 - 1)} />
    </g>
  ),
  plomo: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.rect(x - 75 * s, y - 85 * s, 150 * s, 170 * s, 10 * s)} p={p} c={c} w={6} fill="#fff" />
      <T x={x} y={y - 55 * s} s={30 * s} pe={600} c={P.tinta2} op={p}>
        82
      </T>
      <T x={x} y={y + 10 * s} s={84 * s} pe={800} op={p}>
        Pb
      </T>
      <T x={x} y={y + 62 * s} s={24 * s} pe={500} c={P.tinta2} op={p}>
        plomo
      </T>
    </g>
  ),
  pelicula: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 100 * s} ${y - 30 * s}C${x - 50 * s} ${y - 80 * s} ${x + 0} ${y + 20 * s} ${x + 100 * s} ${y - 40 * s}L${x + 100 * s} ${y + 20 * s}C${x} ${y + 80 * s} ${x - 50 * s} ${y - 20 * s} ${x - 100 * s} ${y + 30 * s}Z`} p={p} c={c} w={6} fill={P.azulSuave} />
    </g>
  ),
  dedo: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 28 * s} ${y + 100 * s}V${y - 70 * s}A${28 * s} ${28 * s} 0 0 1 ${x + 28 * s} ${y - 70 * s}V${y + 100 * s}`} p={p} c={c} w={6} fill="#F6DCC4" />
      <D d={R.rect(x - 16 * s, y - 86 * s, 32 * s, 30 * s, 10 * s)} p={p} c={c} w={4} fill="#fff" />
    </g>
  ),
  guante: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={`M${x - 60 * s} ${y + 90 * s}V${y - 20 * s}C${x - 60 * s} ${y - 110 * s} ${x + 60 * s} ${y - 110 * s} ${x + 60 * s} ${y - 20 * s}V${y + 90 * s}Z`} p={p} c={c} w={6} fill="#BFD3F2" />
      <D d={`M${x - 60 * s} ${y + 10 * s}C${x - 100 * s} ${y} ${x - 105 * s} ${y - 50 * s} ${x - 80 * s} ${y - 55 * s}`} p={p} c={c} w={6} />
      <D d={R.linea(x - 60 * s, y + 70 * s, x + 60 * s, y + 70 * s)} p={p} c={c} w={5} />
    </g>
  ),
  salchicha: ({x, y, s = 1, p = 1, c = P.tinta}) => (
    <g>
      <D d={R.rect(x - 105 * s, y - 32 * s, 210 * s, 64 * s, 32 * s)} p={p} c={c} w={6} fill="#E8957A" />
      <D d={R.linea(x - 116 * s, y, x - 104 * s, y)} p={p} c={c} w={6} />
      <D d={R.linea(x + 104 * s, y, x + 116 * s, y)} p={p} c={c} w={6} />
    </g>
  ),
};

export const Icono2D: React.FC<Props & {nombre: string}> = ({nombre, ...rest}) => {
  const C = ICONOS[nombre];
  if (!C) return <T x={rest.x} y={rest.y} s={40} c={P.rojo}>{nombre}</T>;
  return <C {...rest} />;
};
