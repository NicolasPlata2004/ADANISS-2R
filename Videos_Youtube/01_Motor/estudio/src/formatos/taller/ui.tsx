// Interfaz 2D que flota sobre las escenas 3D: osciloscopio, etiquetas con línea guía,
// píldoras de datos y voltímetro. Todo en coordenadas de pantalla (1920×1080).
import React from 'react';
import * as THREE from 'three';
import {FUENTES} from '../../config/marca';
import {clamp01} from '../../motor/tiempo';
import type {Camara, V3} from './Estudio';

/** Proyecta un punto 3D a la pantalla con la misma cámara que usa la escena. */
export const proyectar = (p: V3, cam: Camara, w = 1920, h = 1080) => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 30, w / h, 0.05, 400);
  c.position.set(...cam.pos);
  c.lookAt(...cam.obj);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

/** Panel de osciloscopio con rejilla y una señal (muestras en [-1, 1]). */
export const Osciloscopio: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  muestras: number[];
  p?: number;
  color?: string;
  titulo?: string;
  umbral?: number;
  recorte?: number;
}> = ({x, y, w = 420, h = 200, muestras, p = 1, color = '#C88BFF', titulo, umbral, recorte}) => {
  if (p <= 0.01) return null;
  const n = muestras.length;
  const pts = muestras.map((v, i) => `${(i / (n - 1)) * w},${h / 2 - (v * h * 0.42)}`).join(' ');
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp01(p), transform: `scale(${0.92 + 0.08 * clamp01(p)})`, transformOrigin: 'top left'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(10,12,18,0.86)', border: '1.5px solid rgba(190,170,255,0.35)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)'}} />
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 9}, (_, i) => (
          <line key={`v${i}`} x1={(i * w) / 8} y1={0} x2={(i * w) / 8} y2={h} stroke="rgba(255,255,255,0.07)" />
        ))}
        {Array.from({length: 5}, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i * h) / 4} x2={w} y2={(i * h) / 4} stroke="rgba(255,255,255,0.07)" />
        ))}
        {umbral !== undefined && <line x1={0} x2={w} y1={h / 2 - umbral * h * 0.42} y2={h / 2 - umbral * h * 0.42} stroke="#FFB547" strokeWidth={2} strokeDasharray="8 6" />}
        {recorte !== undefined && <line x1={0} x2={w} y1={h / 2 - recorte * h * 0.42} y2={h / 2 - recorte * h * 0.42} stroke="#FF5A5F" strokeWidth={2} />}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={6} opacity={0.25} strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" />
      </svg>
      {titulo && (
        <div style={{position: 'absolute', left: 14, top: 10, fontFamily: FUENTES.mono, fontSize: 16, color: 'rgba(230,230,255,0.75)'}}>{titulo}</div>
      )}
    </div>
  );
};

/** Señal de un golpe en un piezo: pico y oscilación amortiguada, desde el instante t0. */
export const senalGolpe = (t: number, t0: number, n = 220, ventana = 1.2, amp = 0.9) =>
  Array.from({length: n}, (_, i) => {
    const tt = t - ventana + (i / (n - 1)) * ventana;
    const q = tt - t0;
    if (q < 0) return 0.015 * Math.sin(i * 1.7);
    return amp * Math.exp(-q / 0.12) * Math.cos(2 * Math.PI * 9 * q) + 0.015 * Math.sin(i * 1.7);
  });

/** Etiqueta con línea guía desde un punto (estilo lámina técnica de Chiong Lab). */
export const EtiquetaGuia: React.FC<{
  desde: {x: number; y: number};
  hacia: {x: number; y: number};
  texto: string;
  sub?: string;
  p: number;
  color?: string;
  lado?: 'izq' | 'der';
}> = ({desde, hacia, texto, sub, p, color = '#FFFFFF', lado = 'der'}) => {
  if (p <= 0.01) return null;
  const q = clamp01(p);
  const x2 = desde.x + (hacia.x - desde.x) * clamp01(q * 1.6);
  const y2 = desde.y + (hacia.y - desde.y) * clamp01(q * 1.6);
  return (
    <>
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={1920} height={1080}>
        <circle cx={desde.x} cy={desde.y} r={6} fill={color} opacity={q} />
        <line x1={desde.x} y1={desde.y} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} opacity={q} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: lado === 'der' ? hacia.x + 12 : undefined,
          right: lado === 'izq' ? 1920 - hacia.x + 12 : undefined,
          top: hacia.y - 22,
          opacity: clamp01(q * 1.6 - 0.6),
          fontFamily: FUENTES.sans,
          color,
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          textAlign: lado === 'der' ? 'left' : 'right',
        }}
      >
        <div style={{fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap'}}>{texto}</div>
        {sub && <div style={{fontSize: 21, fontWeight: 500, opacity: 0.85, whiteSpace: 'nowrap'}}>{sub}</div>}
      </div>
    </>
  );
};

/** Píldora de dato grande (número + unidad + subetiqueta). */
export const Dato: React.FC<{x: number; y: number; valor: string; unidad?: string; sub?: string; p: number; color?: string}> = ({x, y, valor, unidad, sub, p, color = '#FFFFFF'}) => {
  if (p <= 0.01) return null;
  const q = clamp01(p);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * q})`, opacity: q, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: FUENTES.sans}}>
      <div style={{background: 'rgba(8,10,12,0.78)', borderRadius: 20, padding: '8px 26px', display: 'flex', alignItems: 'baseline', gap: 10, boxShadow: '0 10px 36px rgba(0,0,0,0.4)'}}>
        <span style={{fontSize: 70, fontWeight: 800, color, letterSpacing: '-0.02em'}}>{valor}</span>
        {unidad && <span style={{fontSize: 30, fontWeight: 700, color: '#C88BFF'}}>{unidad}</span>}
      </div>
      {sub && <div style={{background: 'rgba(8,10,12,0.6)', borderRadius: 10, padding: '4px 14px', fontSize: 24, fontWeight: 600, color: '#F2F4F5'}}>{sub}</div>}
    </div>
  );
};

/** Título grande sobre una escena 3D. */
export const TituloGrande: React.FC<{texto: string; sub?: string; p: number; y?: number}> = ({texto, sub, p, y = 200}) => {
  if (p <= 0.01) return null;
  const q = clamp01(p);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: q, transform: `translateY(${(1 - q) * 16}px)`, fontFamily: FUENTES.sans, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.55)'}}>
      <div style={{fontSize: texto.length > 34 ? Math.max(62, Math.round((92 * 34) / texto.length)) : 92, fontWeight: 800, letterSpacing: '-0.02em', padding: '0 60px'}}>{texto}</div>
      {sub && <div style={{fontSize: 32, fontWeight: 600, opacity: 0.85, marginTop: 6}}>{sub}</div>}
    </div>
  );
};

/** Medidor analógico (aguja) para mostrar que aparece un voltaje, sin inventar cifras. */
export const Medidor: React.FC<{x: number; y: number; valor: number; p: number; etiqueta?: string; s?: number}> = ({x, y, valor, p, etiqueta = 'voltaje', s = 1}) => {
  if (p <= 0.01) return null;
  const q = clamp01(p);
  const ang = -60 + 120 * clamp01(valor);
  const W = 260 * s;
  const Hh = 170 * s;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: W, height: Hh, opacity: q, transform: `scale(${0.9 + 0.1 * q})`, transformOrigin: 'top left'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 18 * s, background: 'rgba(240,238,232,0.95)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)'}} />
      <svg width={W} height={Hh} viewBox="0 0 260 170" style={{position: 'absolute', inset: 0}}>
        <path d="M40 130 A90 90 0 0 1 220 130" fill="none" stroke="#1A1A1A" strokeWidth={4} />
        {Array.from({length: 9}, (_, i) => {
          const a = ((-60 + i * 15 - 90) * Math.PI) / 180;
          return <line key={i} x1={130 + 80 * Math.cos(a)} y1={130 + 80 * Math.sin(a)} x2={130 + 92 * Math.cos(a)} y2={130 + 92 * Math.sin(a)} stroke="#1A1A1A" strokeWidth={3} />;
        })}
        <path d="M168 69 A90 90 0 0 1 220 130" fill="none" stroke="#E5484D" strokeWidth={8} />
        <line x1={130} y1={130} x2={130 + 84 * Math.cos(((ang - 90) * Math.PI) / 180)} y2={130 + 84 * Math.sin(((ang - 90) * Math.PI) / 180)} stroke="#E5484D" strokeWidth={5} strokeLinecap="round" />
        <circle cx={130} cy={130} r={9} fill="#1A1A1A" />
        <text x={130} y={160} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={20} fill="#1A1A1A">{etiqueta}</text>
      </svg>
    </div>
  );
};

/** Signo + o − grande flotando sobre una cara del cristal. */
export const Signo: React.FC<{x: number; y: number; signo: '+' | '−'; p: number}> = ({x, y, signo, p}) =>
  p <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * clamp01(p)})`, opacity: clamp01(p), width: 78, height: 78, borderRadius: 39, background: signo === '+' ? '#FF5C8A' : '#4F8DFF', color: '#fff', fontFamily: FUENTES.sans, fontWeight: 800, fontSize: 60, lineHeight: '74px', textAlign: 'center', boxShadow: `0 0 40px ${signo === '+' ? '#FF5C8A' : '#4F8DFF'}`}}>
      {signo}
    </div>
  );

/** Leyenda de colores (punto + texto). */
export const Leyenda: React.FC<{x: number; y: number; items: {color: string; texto: string}[]; p: number}> = ({x, y, items, p}) =>
  p <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, opacity: clamp01(p), display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 24px', borderRadius: 18, background: 'rgba(8,10,12,0.6)', fontFamily: FUENTES.sans}}>
      {items.map((it) => (
        <div key={it.texto} style={{display: 'flex', alignItems: 'center', gap: 14, color: '#F3F4F5', fontSize: 30, fontWeight: 700}}>
          <span style={{width: 26, height: 26, borderRadius: 13, background: it.color, boxShadow: `0 0 18px ${it.color}`}} />
          {it.texto}
        </div>
      ))}
    </div>
  );
