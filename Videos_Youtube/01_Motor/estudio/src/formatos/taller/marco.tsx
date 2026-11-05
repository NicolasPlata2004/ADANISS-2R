// Marco del formato "taller" (mixto 3D realista + 2D): subtítulos en caja, rótulo de sección
// en píldora, pantalla final y escena de reserva.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANAL, FUENTES} from '../../config/marca';
import {ap, EscenaPlan, Frase, useEscena} from '../../motor/tiempo';

/** Subtítulos por frase (sin resaltar palabra: el audio todavía no existe). */
export const SubtitulosTaller: React.FC<{frases: Frase[]}> = ({frases}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let k = -1;
  for (let j = 0; j < frases.length; j++) {
    if (frases[j].i - 0.1 <= t) k = j;
    else break;
  }
  if (k < 0) return null;
  const fr = frases[k];
  const sig = frases[k + 1];
  const fin = Math.min(fr.f + 0.6, sig ? sig.i - 0.1 : fr.f + 0.6);
  if (t > fin + 0.15) return null;
  const op = ap(t, fr.i - 0.1, 0.12) * (t > fin ? 1 - ap(t, fin, 0.15) : 1);
  const texto = fr.palabras.map((w) => w.p).join(' ');
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64}}>
      <div
        style={{
          maxWidth: 1320,
          padding: '10px 26px 12px',
          borderRadius: 14,
          background: 'rgba(8,10,12,0.62)',
          color: '#F5F7F8',
          fontFamily: FUENTES.sans,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.28,
          textAlign: 'center',
          letterSpacing: '-0.005em',
          opacity: op,
          transform: `translateY(${(1 - op) * 6}px)`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

/** Rótulo de sección: píldora arriba a la izquierda (se lee sobre 3D y sobre papel). */
export const RotuloTaller: React.FC<{escenas: EscenaPlan[]; hasta: number}> = ({escenas, hasta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (t >= hasta) return null;
  let k = 0;
  for (let j = 0; j < escenas.length; j++) if (escenas[j].inicio <= t) k = j;
  let j = k;
  while (j > 0 && !escenas[j].seccion) j--;
  const seccion = escenas[j].seccion;
  if (!seccion) return null;
  const t0 = escenas[j].inicio;
  const op = ap(t - t0, 0.2, 0.4);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: 48,
        opacity: op,
        transform: `translateX(${(1 - op) * -16}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 18px 9px 14px',
        borderRadius: 999,
        background: 'rgba(8,10,12,0.55)',
        color: '#F2F4F5',
        fontFamily: FUENTES.sans,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '0.22em',
      }}
    >
      <span style={{width: 10, height: 10, borderRadius: 5, background: '#FF5A5F'}} />
      {seccion}
    </div>
  );
};

export const CierreTaller: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const op = ap(t, 0, 0.5);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 45%, #1F6B4C 0%, #0E2A20 55%, #07110D 100%)', opacity: op, fontFamily: FUENTES.sans}}>
      <div style={{position: 'absolute', left: 140, top: 330, color: '#fff', opacity: ap(t, 0.3, 0.6)}}>
        <div style={{fontSize: 26, letterSpacing: '0.3em', fontWeight: 700, opacity: 0.8}}>SERIE SENSORES</div>
        <div style={{fontSize: 64, fontWeight: 800, marginTop: 10}}>{CANAL.nombre}</div>
        <div style={{fontSize: 26, fontWeight: 500, opacity: 0.85, marginTop: 8}}>{CANAL.lema}</div>
        <div style={{marginTop: 34, display: 'inline-block', padding: '14px 34px', borderRadius: 40, background: '#FF5A5F', fontSize: 28, fontWeight: 800}}>
          Suscríbete
        </div>
      </div>
      {[300, 690].map((y, k) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            left: 1060,
            top: y - 158,
            width: 560,
            height: 316,
            borderRadius: 22,
            border: '3px dashed rgba(255,255,255,0.45)',
            color: 'rgba(255,255,255,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 600,
            opacity: ap(t, 0.6 + k * 0.2, 0.5),
          }}
        >
          {k === 0 ? 'siguiente episodio' : 'toda la serie'}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const FaltaTaller: React.FC = () => {
  const {t} = useEscena();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', color: '#FF5A5F', fontFamily: FUENTES.sans, fontSize: 40, opacity: ap(t, 0, 0.3)}}>
      (escena sin diseñar)
    </AbsoluteFill>
  );
};
