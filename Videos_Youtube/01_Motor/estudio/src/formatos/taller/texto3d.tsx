// Texto dentro de la escena 3D (placas con año, número, símbolo químico, pantallas):
// se dibuja en un canvas con las fuentes del canal y se usa como textura.
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import * as THREE from 'three';
import {cargarFuentes} from '../../config/fuentes';
import type {V3} from './Estudio';

let fuentesOk = false;

/** true cuando las fuentes ya cargaron; mientras tanto detiene el render del cuadro. */
export const useFuentesListas = () => {
  const [listo, setListo] = useState(fuentesOk);
  const [h] = useState(() => (fuentesOk ? null : delayRender('Fuentes para texto 3D')));
  useEffect(() => {
    if (listo) return;
    cargarFuentes()
      .catch(() => undefined)
      .then(() => {
        fuentesOk = true;
        setListo(true);
        if (h !== null) continueRender(h);
      });
  }, [listo, h]);
  return listo;
};

export type Linea = {t: string; tam: number; peso?: number; color?: string; mono?: boolean};
export type EstiloPlaca = {fondo?: string; borde?: string; radio?: number; alinear?: 'center' | 'left'; relleno?: number};

const cache = new Map<string, THREE.CanvasTexture>();

/** Textura con varias líneas de texto (px sobre un lienzo de ancho×alto). */
export const texturaTexto = (lineas: Linea[], ancho: number, alto: number, estilo: EstiloPlaca = {}, listo = true) => {
  const clave = JSON.stringify([lineas, ancho, alto, estilo, listo]);
  const hit = cache.get(clave);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const g = c.getContext('2d')!;
  const r = estilo.radio ?? 0;
  if (estilo.fondo) {
    g.fillStyle = estilo.fondo;
    g.beginPath();
    g.roundRect(0, 0, ancho, alto, r);
    g.fill();
  }
  if (estilo.borde) {
    g.strokeStyle = estilo.borde;
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(3, 3, ancho - 6, alto - 6, Math.max(0, r - 3));
    g.stroke();
  }
  const total = lineas.reduce((s, l) => s + l.tam * 1.18, 0);
  let y = (alto - total) / 2;
  const izq = estilo.alinear === 'left';
  const x = izq ? (estilo.relleno ?? 40) : ancho / 2;
  g.textAlign = izq ? 'left' : 'center';
  g.textBaseline = 'middle';
  // Si una línea no cabe en la placa, se achica (nunca se recorta).
  const margen = estilo.relleno ?? (estilo.fondo ? 34 : 6);
  const disponible = izq ? ancho - x - margen : ancho - 2 * margen;
  for (const l of lineas) {
    const fam = l.mono ? '"JetBrains Mono", Consolas, monospace' : 'Inter, "Segoe UI", Arial, sans-serif';
    g.font = `${l.peso ?? 800} ${l.tam}px ${fam}`;
    const medida = g.measureText(l.t).width;
    if (medida > disponible) g.font = `${l.peso ?? 800} ${Math.floor((l.tam * disponible) / medida)}px ${fam}`;
    g.fillStyle = l.color ?? '#FFFFFF';
    g.fillText(l.t, x, y + (l.tam * 1.18) / 2);
    y += l.tam * 1.18;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(clave, tex);
  return tex;
};

/** Plano con texto. `w` y `h` en unidades de escena; el lienzo mantiene la proporción. */
export const TextoPlano: React.FC<{
  lineas: Linea[];
  w: number;
  h: number;
  pos?: V3;
  rot?: V3;
  estilo?: EstiloPlaca;
  op?: number;
  brillo?: number;
  px?: number;
}> = ({lineas, w, h, pos = [0, 0, 0], rot = [0, 0, 0], estilo = {}, op = 1, brillo = 1, px = 1024}) => {
  const listo = useFuentesListas();
  const alto = Math.round((px * h) / w);
  const tex = useMemo(() => texturaTexto(lineas, px, alto, estilo, listo), [JSON.stringify(lineas), px, alto, JSON.stringify(estilo), listo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (op <= 0.01) return null;
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent opacity={op} color={new THREE.Color(brillo, brillo, brillo)} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

/** Textura de lienzo que se redibuja en cada cuadro (pantallas de osciloscopio, código que se escribe). */
export const useLienzo = (ancho: number, alto: number, dibujar: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) => {
  const listo = useFuentesListas();
  const {c, tex} = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = ancho;
    cv.height = alto;
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return {c: cv, tex: tx};
  }, [ancho, alto]);
  useMemo(() => {
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, ancho, alto);
    dibujar(g, ancho, alto);
    tex.needsUpdate = true;
  }, [...deps, listo]); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
};
