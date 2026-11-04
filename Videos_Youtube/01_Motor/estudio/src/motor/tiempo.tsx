import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type Palabra = {p: string; i: number; f: number};
export type Frase = {i: number; f: number; palabras: Palabra[]};
export type EscenaPlan = {
  id: string;
  escena: string;
  seccion?: string | null;
  capitulo?: string | null;
  inicio: number;
  fin: number;
  marcas: Record<string, number>;
  props?: Record<string, unknown>;
};
export type Plan = {
  episodio: string;
  titulo: string;
  formato: string;
  fps: number;
  ancho: number;
  alto: number;
  audio: string;
  duracionAudio: number;
  cola: number;
  subtitulos: {activo: boolean; frases: Frase[]};
  escenas: EscenaPlan[];
};

// ------------------------------------------------------------------ curvas de animación
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const v = clamp01(x);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
export const easeOutBack = (x: number) => {
  const v = clamp01(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
};
/** Progreso 0→1 que empieza en t0 y dura d segundos. */
export const ap = (t: number, t0: number, d = 0.6, f: (x: number) => number = easeOut) => f((t - t0) / d);
/** 1 hasta t0 y luego se desvanece a 0 en d segundos. */
export const sal = (t: number, t0: number, d = 0.4) => 1 - ap(t, t0, d, easeInOut);
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// ------------------------------------------------------------------ contexto de escena
type Ctx = {dur: number; m: Record<string, number>; props?: Record<string, unknown>};
export const EscenaCtx = createContext<Ctx>({dur: 10, m: {}});

/** Tiempo de la escena en segundos, su duración y sus marcas (anclas en la narración). */
export const useEscena = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {dur, m} = useContext(EscenaCtx);
  const M = (k: string, def: number) => (m[k] ?? def);
  return {t: frame / fps, frame, fps, dur, M};
};

export const Fundido: React.FC<{dur: number; children: React.ReactNode; entrada?: number; salida?: number}> = ({
  dur,
  children,
  entrada = 0.35,
  salida = 0.35,
}) => {
  const {t} = useEscena();
  const op = (entrada > 0 ? ap(t, 0, entrada, easeInOut) : 1) * (t > dur ? 1 - ap(t, dur, salida, easeInOut) : 1);
  return <div style={{position: 'absolute', inset: 0, opacity: op}}>{children}</div>;
};
