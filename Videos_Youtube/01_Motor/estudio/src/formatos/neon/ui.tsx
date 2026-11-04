// Capa 2D del formato Neón: subtítulos arriba con palabra clave "seleccionada",
// píldoras de datos y etiquetas.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FUENTES} from '../../config/marca';
import {ap, Frase} from '../../motor/tiempo';
import {NEON} from './tema';

const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w%]/g, '');

const Seleccion: React.FC<{children: React.ReactNode}> = ({children}) => {
  const h = 9;
  const esquina = (pos: React.CSSProperties) => (
    <span style={{position: 'absolute', width: h, height: h, background: '#fff', border: `2px solid ${NEON.seleccion}`, ...pos}} />
  );
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: '0 6px', margin: '0 -6px', outline: `2.5px solid ${NEON.seleccion}`, background: 'rgba(76,141,255,0.16)'}}>
      {children}
      {esquina({left: -h / 2 - 1, top: -h / 2 - 1})}
      {esquina({right: -h / 2 - 1, top: -h / 2 - 1})}
      {esquina({left: -h / 2 - 1, bottom: -h / 2 - 1})}
      {esquina({right: -h / 2 - 1, bottom: -h / 2 - 1})}
    </span>
  );
};

/** Subtítulos superiores: lo dicho en blanco, lo que viene en gris, claves enmarcadas. */
export const SubtitulosNeon: React.FC<{frases: Frase[]; desfase?: number; resaltar?: string[]}> = ({frases, desfase = 0, resaltar = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps + desfase;
  const claves = new Set(resaltar.map(normal));
  let k = -1;
  for (let j = 0; j < frases.length; j++) {
    if (frases[j].i - 0.15 <= t) k = j;
    else break;
  }
  if (k < 0) return null;
  const fr = frases[k];
  const sig = frases[k + 1];
  const fin = Math.min(fr.f + 0.9, sig ? sig.i - 0.15 : fr.f + 0.9);
  if (t > fin + 0.2) return null;
  const op = ap(t, fr.i - 0.15, 0.15) * (t > fin ? 1 - ap(t, fin, 0.2) : 1);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 82}}>
      <div style={{maxWidth: 1250, textAlign: 'center', fontFamily: FUENTES.sans, fontWeight: 700, fontSize: 50, lineHeight: 1.34, opacity: op, textShadow: '0 2px 18px rgba(0,0,0,0.55)'}}>
        {fr.palabras.map((w, j) => {
          const dicha = t >= w.i - 0.04;
          const txt = (
            <span style={{color: dicha ? NEON.blanco : 'rgba(170,180,210,0.55)', fontWeight: dicha ? 700 : 500}}>{w.p}</span>
          );
          return (
            <React.Fragment key={j}>
              {claves.has(normal(w.p)) && dicha ? <Seleccion>{txt}</Seleccion> : txt}
              {j < fr.palabras.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Píldora de dato (número grande + unidad) con subetiqueta opcional. */
export const PildoraNeon: React.FC<{x: number; y: number; valor: string; unidad?: string; sub?: string; p: number; color?: string}> = ({
  x,
  y,
  valor,
  unidad,
  sub,
  p,
  color = NEON.blanco,
}) => {
  if (p <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * p})`,
        opacity: p,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        fontFamily: FUENTES.sans,
      }}
    >
      <div style={{background: NEON.vidrio, border: '1.5px solid rgba(150,180,255,0.35)', borderRadius: 22, padding: '10px 26px', display: 'flex', alignItems: 'baseline', gap: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.45)'}}>
        <span style={{fontSize: 68, fontWeight: 800, color, letterSpacing: '-0.02em'}}>{valor}</span>
        {unidad && <span style={{fontSize: 30, fontWeight: 700, color: NEON.cian}}>{unidad}</span>}
      </div>
      {sub && (
        <div style={{background: 'rgba(12,18,44,0.75)', border: '1px solid rgba(150,180,255,0.3)', borderRadius: 12, padding: '4px 14px', fontSize: 24, fontWeight: 600, color: NEON.blanco}}>
          {sub}
        </div>
      )}
    </div>
  );
};

export const EtiquetaNeon: React.FC<{x: number; y: number; texto: string; p: number; color?: string; tam?: number}> = ({x, y, texto, p, color = NEON.blanco, tam = 28}) =>
  p <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: p, whiteSpace: 'nowrap', fontFamily: FUENTES.sans, fontWeight: 700, fontSize: tam, color, textShadow: `0 0 18px ${color}88`}}>
      {texto}
    </div>
  );
