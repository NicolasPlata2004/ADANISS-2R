// Elementos fijos del formato Pizarra: subtítulos karaoke, rótulo de sección,
// tarjeta de capítulo con la "ruta de la energía" y pantalla final.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANAL, FUENTES, PIZARRA as P} from '../../config/marca';
import {ap, clamp01, easeInOut, easeOutBack, EscenaPlan, Frase, useEscena} from '../../motor/tiempo';
import {Ap, D, Lienzo, polar, R, T} from './kit';

// ------------------------------------------------------------------ subtítulos karaoke
export const Subtitulos: React.FC<{frases: Frase[]}> = ({frases}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let k = -1;
  for (let j = 0; j < frases.length; j++) {
    if (frases[j].i - 0.15 <= t) k = j;
    else break;
  }
  if (k < 0) return null;
  const fr = frases[k];
  const sig = frases[k + 1];
  const finVis = Math.min(fr.f + 1.0, sig ? sig.i - 0.15 : fr.f + 1.0);
  if (t > finVis + 0.2) return null;
  const op = ap(t, fr.i - 0.15, 0.15) * (t > finVis ? 1 - ap(t, finVis, 0.2) : 1);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 74}}>
      <div
        style={{
          maxWidth: 1380,
          textAlign: 'center',
          fontFamily: FUENTES.sans,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.32,
          letterSpacing: '-0.01em',
          opacity: op,
        }}
      >
        {fr.palabras.map((w, j) => (
          <span key={j} style={{color: t >= w.i - 0.04 ? P.tinta : P.gris}}>
            {w.p}
            {j < fr.palabras.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ rótulo de sección
export const Rotulo: React.FC<{escenas: EscenaPlan[]; hasta: number}> = ({escenas, hasta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (t >= hasta) return null;
  let k = 0;
  for (let j = 0; j < escenas.length; j++) if (escenas[j].inicio <= t) k = j;
  const actual = escenas[k].seccion ?? '';
  let j = k;
  while (j > 0 && (escenas[j - 1].seccion ?? '') === actual) j--;
  const t0 = escenas[j].inicio;
  const previo = j > 0 ? escenas[j - 1].seccion ?? '' : '';
  const q = t - t0;
  const entra = j === 0 ? 1 : ap(q, 0.1, 0.45);
  const sale = j === 0 ? 0 : 1 - ap(q, 0, 0.25);
  const estilo = (op: number, dy: number): React.CSSProperties => ({
    position: 'absolute',
    top: 54 + dy,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FUENTES.sans,
    fontWeight: 600,
    fontSize: 22,
    letterSpacing: '0.32em',
    color: P.tinta,
    opacity: op,
  });
  const raya = 36 * ap(q, 0.25, 0.5);
  return (
    <AbsoluteFill>
      {sale > 0.01 && previo && <div style={estilo(sale * 0.85, -8 * (1 - sale))}>{previo}</div>}
      {actual && (
        <>
          <div style={estilo(entra * 0.85, 8 * (1 - entra))}>{actual}</div>
          <div style={{position: 'absolute', top: 96, left: 960 - raya / 2, width: raya, height: 3, background: P.rojo, opacity: entra}} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ruta de la energía
export const ESTACIONES = ['el sentido', 'la presión', 'el control', 'la potencia', 'el teléfono'];

export const Ruta: React.FC<{
  y: number;
  x1?: number;
  x2?: number;
  p: number;
  actual?: number;
  t: number;
  viajero?: number; // 0..1 posición del punto de energía (-1 = oculto)
  extremos?: boolean;
  pEtiquetas?: number;
}> = ({y, x1 = 420, x2 = 1500, p, actual = -1, t, viajero = -1, extremos = true, pEtiquetas = 1}) => {
  const n = ESTACIONES.length;
  const xs = ESTACIONES.map((_, k) => x1 + ((x2 - x1) * (k + 0.5)) / n);
  const xa = x1 - 150;
  const xb = x2 + 150;
  return (
    <g>
      <D d={R.linea(xa, y, xb, y)} p={p} w={4} c={P.grisClaro} />
      {actual >= 0 && <D d={R.linea(xa, y, xs[actual], y)} p={p} w={5} c={P.tinta} />}
      {extremos && (
        <>
          <Ap p={ap(p, 0.1, 0.5)}>
            <T x={xa - 20} y={y} s={26} pe={600} a="end">
              enchufe
            </T>
          </Ap>
          <Ap p={ap(p, 0.7, 0.3)}>
            <T x={xb + 20} y={y} s={26} pe={600} a="start">
              batería
            </T>
          </Ap>
        </>
      )}
      {xs.map((x, k) => {
        const pk = clamp01(p * 1.4 - (k / n) * 0.6);
        const esActual = k === actual;
        const hecho = actual >= 0 && k < actual;
        const r = esActual ? 24 + 4 * Math.sin(t * 4) * ap(t, 0.6, 0.4) : 16;
        return (
          <g key={k} opacity={pk}>
            <circle cx={x} cy={y} r={r} fill={esActual ? P.azul : hecho ? P.tinta : P.papel} stroke={esActual ? P.azul : P.tinta} strokeWidth={4} />
            <T x={x} y={y} s={esActual ? 24 : 18} pe={700} c={esActual || hecho ? '#fff' : P.tinta}>
              {k + 1}
            </T>
            <T x={x} y={y + 52} s={22} pe={esActual ? 700 : 500} c={esActual ? P.tinta : P.tinta2} op={pEtiquetas}>
              {ESTACIONES[k]}
            </T>
          </g>
        );
      })}
      {viajero >= 0 && <circle cx={xa + (xb - xa) * clamp01(viajero)} cy={y} r={11} fill={P.azul} />}
    </g>
  );
};

// ------------------------------------------------------------------ tarjeta de capítulo
export const Capitulo: React.FC<{numero: number; titulo: string; subtitulo?: string; estacion?: number}> = ({numero, titulo, subtitulo, estacion = 0}) => {
  const {t, M} = useEscena();
  const pRuta = ap(t, 0, 0.9, easeInOut);
  return (
    <Lienzo>
      <Ruta y={300} p={pRuta} actual={estacion} t={t} />
      <Ap p={ap(t, 0.35, 0.5)} s={0.7} ox={960} oy={520}>
        <T x={960} y={515} s={170} pe={800} c={P.azul}>
          {numero}
        </T>
      </Ap>
      <Ap p={ap(t, 0.55, 0.5)}>
        <T x={960} y={665} s={88} pe={700} ls={-1}>
          {titulo}
        </T>
      </Ap>
      {subtitulo && (
        <Ap p={ap(t, M('sub', 1.2) - 0.1, 0.5)}>
          <T x={960} y={752} s={38} pe={500} c={P.tinta2} it>
            {subtitulo}
          </T>
        </Ap>
      )}
    </Lienzo>
  );
};

// ------------------------------------------------------------------ logo y pantalla final
export const Logo: React.FC<{x: number; y: number; r?: number; p?: number; t?: number}> = ({x, y, r = 100, p = 1, t = 0}) => {
  const dientes = 10;
  const pts: [number, number][] = [];
  for (let k = 0; k < dientes; k++) {
    const a0 = (k * 360) / dientes + t * 6;
    const paso = 360 / dientes;
    pts.push(polar(x, y, r * 0.86, a0) as [number, number]);
    pts.push(polar(x, y, r, a0 + paso * 0.12) as [number, number]);
    pts.push(polar(x, y, r, a0 + paso * 0.38) as [number, number]);
    pts.push(polar(x, y, r * 0.86, a0 + paso * 0.5) as [number, number]);
  }
  return (
    <g>
      <D d={R.poli(pts, true)} p={p} w={6} fill="#fff" />
      <D d={R.circulo(x, y, r * 0.58)} p={clamp01(p * 1.3 - 0.3)} w={4} c={P.tinta} />
      <D d={R.funcion(x - r * 0.42, y, r * 0.84, r * 0.22, (u) => Math.sin(u * Math.PI * 2 + t * 3))} p={clamp01(p * 1.6 - 0.6)} w={7} c={P.azul} />
    </g>
  );
};

export const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const op = ap(t, 0, 0.5);
  return (
    <AbsoluteFill style={{background: P.papel, opacity: op}}>
      <Lienzo>
        <Logo x={560} y={430} r={120} p={ap(t, 0.1, 1.2, easeInOut)} t={t} />
        <Ap p={ap(t, 0.6, 0.6)}>
          <T x={560} y={630} s={60} pe={800} ls={-1}>
            {CANAL.nombre}
          </T>
          <T x={560} y={690} s={26} pe={500} c={P.tinta2}>
            {CANAL.lema}
          </T>
        </Ap>
        <Ap p={ap(t, 1.0, 0.5, easeOutBack)} s={0.8} ox={560} oy={790}>
          <path d={R.rect(410, 758, 300, 64, 32)} fill={P.azul} />
          <T x={560} y={791} s={28} pe={700} c="#fff">
            Suscríbete
          </T>
        </Ap>
        {[300, 690].map((y, k) => (
          <Ap key={y} p={ap(t, 0.8 + k * 0.2, 0.6)}>
            <path d={R.rect(1060, y - 158, 560, 316, 22)} fill="#fff" stroke={P.gris} strokeWidth={3} strokeDasharray="12 10" />
            <T x={1340} y={y} s={26} pe={600} c={P.tinta2}>
              {k === 0 ? 'siguiente video' : 'también te puede gustar'}
            </T>
          </Ap>
        ))}
      </Lienzo>
    </AbsoluteFill>
  );
};

export const Falta: React.FC = () => {
  const {t} = useEscena();
  return (
    <Lienzo>
      <T x={960} y={480} s={40} c={P.rojo} op={ap(t, 0, 0.4)}>
        (escena sin diseñar)
      </T>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ escena genérica (borradores automáticos)
const normalizar = (s: string) => s.replace(/[¿?¡!.,;:"()]/g, '');
/** Muestra 1–3 palabras clave de la frase (números y palabras largas). Sirve de borrador
 *  sincronizado hasta que se diseñe una animación a medida para esa parte. */
export const TextoClave: React.FC<{texto?: string; titulo?: string}> = ({texto = '', titulo}) => {
  const {t} = useEscena();
  const claves = titulo
    ? [titulo]
    : Array.from(new Set(texto.split(/\s+/).map(normalizar).filter((w) => /\d/.test(w) || w.length >= 8))).slice(0, 3);
  return (
    <Lienzo>
      {claves.map((w, k) => (
        <Ap key={k} p={ap(t, 0.15 + k * 0.35, 0.5)}>
          <T x={960} y={440 - (claves.length - 1) * 60 + k * 120} s={k === 0 ? 96 : 72} pe={800} c={k === 0 ? P.azul : P.tinta}>
            {w}
          </T>
        </Ap>
      ))}
    </Lienzo>
  );
};
