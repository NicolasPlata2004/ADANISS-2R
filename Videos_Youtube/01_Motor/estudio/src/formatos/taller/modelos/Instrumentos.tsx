// Instrumentos 3D con pantalla viva: osciloscopio de banco y portátil con código.
import React from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import type {V3} from '../Estudio';
import {useLienzo} from '../texto3d';
import {Caja} from './Piezas';
import {Cil} from './Objetos';

/** Osciloscopio de banco. `muestras` en [-1, 1]; líneas opcionales de umbral y de recorte. */
export const Osciloscopio3D: React.FC<{
  pos?: V3;
  rotY?: number;
  escala?: number;
  muestras: number[];
  color?: string;
  umbral?: number;
  recorte?: number;
  titulo?: string;
  etiquetaUmbral?: string;
  etiquetaRecorte?: string;
  encendido?: number;
}> = ({pos = [0, 0, 0], rotY = 0, escala = 1, muestras, color = '#FFD54A', umbral, recorte, titulo, etiquetaUmbral, etiquetaRecorte, encendido = 1}) => {
  const clave = muestras.map((v) => Math.round(v * 400)).join(',');
  const tex = useLienzo(
    1024,
    760,
    (g, w, h) => {
      g.fillStyle = '#04110C';
      g.fillRect(0, 0, w, h);
      if (encendido < 0.05) return;
      g.globalAlpha = encendido;
      g.strokeStyle = 'rgba(120,255,190,0.14)';
      g.lineWidth = 2;
      for (let i = 0; i <= 10; i++) {
        g.beginPath();
        g.moveTo((i * w) / 10, 0);
        g.lineTo((i * w) / 10, h);
        g.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        g.beginPath();
        g.moveTo(0, (i * h) / 8);
        g.lineTo(w, (i * h) / 8);
        g.stroke();
      }
      g.strokeStyle = 'rgba(120,255,190,0.35)';
      g.beginPath();
      g.moveTo(0, h / 2);
      g.lineTo(w, h / 2);
      g.stroke();
      const y = (v: number) => h / 2 - v * h * 0.4;
      const raya = (v: number, c: string, texto?: string) => {
        g.setLineDash([22, 14]);
        g.strokeStyle = c;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(0, y(v));
        g.lineTo(w, y(v));
        g.stroke();
        g.setLineDash([]);
        if (texto) {
          g.fillStyle = c;
          g.font = '700 40px Inter, Arial';
          g.textAlign = 'right';
          g.fillText(texto, w - 24, y(v) - 18);
        }
      };
      if (umbral !== undefined) raya(umbral, '#FFB547', etiquetaUmbral);
      if (recorte !== undefined) raya(recorte, '#FF5A5F', etiquetaRecorte);
      const n = muestras.length;
      g.lineJoin = 'round';
      g.shadowColor = color;
      g.shadowBlur = 24;
      g.strokeStyle = color;
      g.lineWidth = 7;
      g.beginPath();
      muestras.forEach((v, i) => (i ? g.lineTo((i / (n - 1)) * w, y(v)) : g.moveTo(0, y(v))));
      g.stroke();
      g.shadowBlur = 0;
      if (titulo) {
        g.fillStyle = 'rgba(200,255,225,0.85)';
        g.font = '600 38px "JetBrains Mono", monospace';
        g.textAlign = 'left';
        g.fillText(titulo, 28, 56);
      }
      g.globalAlpha = 1;
    },
    [clave, umbral, recorte, titulo, encendido, color],
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={escala}>
      <Caja tam={[7.2, 4.4, 3.4]} pos={[0, 2.35, 0]} material={M.color('#323A46', 0.45, 0.3)} radio={0.28} />
      <Caja tam={[6.9, 4.1, 0.1]} pos={[0, 2.35, 1.71]} material={M.color('#1A1E24', 0.4)} radio={0.06} />
      <mesh position={[-0.95, 2.45, 1.77]}>
        <planeGeometry args={[4.5, 3.34]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {[[2.0, 3.6, 0.36], [3.0, 3.6, 0.36], [2.0, 2.55, 0.28], [3.0, 2.55, 0.28], [2.5, 1.55, 0.42]].map(([x, y, r], i) => (
        <Cil key={i} r={r} h={0.32} pos={[x, y, 1.86]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#B9BEC5', 0.35, 0.6)} seg={28} />
      ))}
      {[1.7, 2.3, 2.9].map((x) => (
        <Cil key={x} r={0.16} h={0.3} pos={[x, 0.75, 1.86]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} seg={20} />
      ))}
      {[-3.0, 3.0].map((x) => [-1.2, 1.2].map((z) => <Cil key={`${x}${z}`} r={0.22} h={0.2} pos={[x, 0.1, z]} mat={M.plasticoNegro()} />))}
    </group>
  );
};

/** Portátil abierto con código en pantalla. `escritas` = cuántas líneas se ven (puede ser fracción). */
export const Portatil: React.FC<{pos?: V3; rotY?: number; lineas: string[]; resaltada?: number; escritas?: number; titulo?: string}> = ({
  pos = [0, 0, 0],
  rotY = 0,
  lineas,
  resaltada = -1,
  escritas = 99,
  titulo = 'sketch_piezo.ino',
}) => {
  const tex = useLienzo(
    1600,
    1000,
    (g, w, h) => {
      g.fillStyle = '#14171C';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#1E232B';
      g.fillRect(0, 0, w, 70);
      g.fillStyle = '#9BA5B1';
      g.font = '600 32px Inter, Arial';
      g.textAlign = 'left';
      g.fillText(titulo, 30, 46);
      const n = Math.floor(escritas);
      const parcial = escritas - n;
      g.font = '500 40px "JetBrains Mono", monospace';
      lineas.forEach((l, i) => {
        if (i > n) return;
        const yy = 130 + i * 62;
        if (i === resaltada) {
          g.fillStyle = 'rgba(76,141,255,0.28)';
          g.fillRect(20, yy - 44, w - 40, 60);
        }
        g.fillStyle = '#5C6370';
        g.fillText(String(i + 1).padStart(2, ' '), 26, yy);
        const texto = i === n ? l.slice(0, Math.floor(l.length * parcial)) : l;
        const c = texto.indexOf('//');
        const codigo = c >= 0 ? texto.slice(0, c) : texto;
        g.fillStyle = i === resaltada ? '#FFFFFF' : '#C8D1DB';
        g.fillText(codigo, 100, yy);
        if (c >= 0) {
          g.fillStyle = '#7FB37A';
          g.fillText(texto.slice(c), 100 + g.measureText(codigo).width, yy);
        }
      });
    },
    [lineas.join('\n'), resaltada, Math.round(escritas * 40), titulo],
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Caja tam={[9.0, 0.36, 6.0]} pos={[0, 0.18, 0]} material={M.color('#AEB4BA', 0.32, 0.85)} radio={0.16} />
      <Caja tam={[7.8, 0.02, 2.9]} pos={[0, 0.37, -0.75]} material={M.color('#1B1D21', 0.6)} />
      <Caja tam={[3.0, 0.02, 1.9]} pos={[0, 0.37, 1.85]} material={M.color('#A4AAB0', 0.25, 0.8)} radio={0.01} />
      <group position={[0, 0.3, -2.95]} rotation={[-0.32, 0, 0]}>
        <Caja tam={[9.0, 6.0, 0.22]} pos={[0, 3.0, 0]} material={M.color('#AEB4BA', 0.32, 0.85)} radio={0.14} />
        <mesh position={[0, 3.05, 0.12]}>
          <planeGeometry args={[8.3, 5.2]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/** Pedestal redondo de vitrina con aro de luz (0→1). */
export const Pedestal: React.FC<{pos?: V3; r?: number; luz?: number; color?: string}> = ({pos = [0, 0, 0], r = 3.4, luz = 0, color = '#7CF0FF'}) => (
  <group position={pos}>
    <Cil r={r} h={0.5} pos={[0, 0.25, 0]} mat={M.color('#15171A', 0.32, 0.35)} seg={72} />
    <mesh position={[0, 0.505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.18, r - 0.06, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0.08 + 0.85 * luz} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  </group>
);
