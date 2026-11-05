// Objetos 3D para el S04 (efecto Hall) y el avance del S05 (acelerómetro MEMS).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {Iman, SensorHall} from './ObjetosS03';
import {TextoPlano, useLienzo} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ monitor con un juego: el personaje camina solo
export const MonitorJuego: React.FC<{t: number; deriva: number; joyX?: number; joyY?: number}> = ({t, deriva, joyX = 0, joyY = 0}) => {
  const tex = useLienzo(
    960,
    560,
    (g, w, h) => {
      const cielo = g.createLinearGradient(0, 0, 0, h);
      cielo.addColorStop(0, '#5EC2FF');
      cielo.addColorStop(1, '#BDE8FF');
      g.fillStyle = cielo;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#4CAF50';
      g.fillRect(0, h * 0.78, w, h * 0.22);
      const x = ((w * 0.62 - deriva * 140 * t) % (w + 80) + w + 80) % (w + 80) - 40;
      const y = h * 0.78;
      const p = Math.sin(t * 9) * 10;
      g.fillStyle = '#E5484D';
      g.fillRect(x - 18, y - 92, 36, 50);
      g.fillStyle = '#FFD7B5';
      g.beginPath();
      g.arc(x, y - 110, 20, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#1D4ED8';
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(x - 8, y - 42);
      g.lineTo(x - 8 - p, y);
      g.moveTo(x + 8, y - 42);
      g.lineTo(x + 8 + p, y);
      g.stroke();
      // indicador del joystick
      g.fillStyle = 'rgba(10,14,20,0.75)';
      g.beginPath();
      g.arc(w - 90, 90, 64, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.4)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(w - 154, 90);
      g.lineTo(w - 26, 90);
      g.moveTo(w - 90, 26);
      g.lineTo(w - 90, 154);
      g.stroke();
      g.fillStyle = deriva > 0.05 ? '#FF5A5F' : '#7CFFB2';
      g.beginPath();
      g.arc(w - 90 + joyX * 50, 90 - joyY * 50, 13, 0, Math.PI * 2);
      g.fill();
    },
    [Math.round(t * 24), deriva, joyX, joyY],
  );
  return (
    <group>
      <Caja tam={[10.4, 6.4, 0.5]} pos={[0, 4.4, 0]} material={M.color('#16181B', 0.3, 0.5)} radio={0.15} />
      <mesh position={[0, 4.4, 0.27]}>
        <planeGeometry args={[9.8, 5.75]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <Cil r={0.3} h={1.2} pos={[0, 0.9, -0.3]} mat={M.color('#16181B', 0.4, 0.5)} />
      <Caja tam={[3.4, 0.25, 2.2]} pos={[0, 0.13, -0.3]} material={M.color('#16181B', 0.4, 0.5)} radio={0.1} />
    </group>
  );
};

// ------------------------------------------------------------------ potenciómetro de joystick en corte (pista de carbón + cursor)
export const PotenciometroCorte: React.FC<{ang: number; desgaste?: number; t?: number}> = ({ang, desgaste = 0, t = 0}) => {
  const pista = useMemo(() => {
    const g = new THREE.RingGeometry(1.6, 2.4, 64, 1, Math.PI * 0.15, Math.PI * 1.7);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const carbon = useMemo(() => new THREE.MeshStandardMaterial({color: '#1B1B1D', roughness: 0.9, roughnessMap: texturaRuido(91, 0.6, 0.7)}), []);
  return (
    <group>
      <Cil r={3.0} h={0.4} pos={[0, 0.2, 0]} mat={M.color('#2E5F8A', 0.5)} seg={56} />
      <mesh geometry={pista} position={[0, 0.42, 0]} material={carbon} />
      {desgaste > 0.01 &&
        Array.from({length: 18}, (_, i) => {
          const a = Math.PI * 0.2 + i * 0.09;
          return <Caja key={i} tam={[0.5 * desgaste, 0.02, 0.04]} pos={[Math.cos(a) * 2.0, 0.44, -Math.sin(a) * 2.0]} rot={[0, a + 0.4, 0]} material={M.color('#6B6B6B', 0.9)} />;
        })}
      {desgaste > 0.01 &&
        Array.from({length: 24}, (_, i) => (
          <Esf key={`p${i}`} r={0.05 + (i % 3) * 0.02} pos={[Math.cos(i * 1.7) * (1.8 + (i % 5) * 0.1), 0.5 + Math.sin(t * 2 + i) * 0.05, Math.sin(i * 1.7) * (1.8 + (i % 5) * 0.1)]} mat={M.color('#8D7B66', 0.95)} seg={6} />
        ))}
      <group rotation={[0, ang, 0]} position={[0, 0.45, 0]}>
        <Cil r={0.45} h={0.3} pos={[0, 0.15, 0]} mat={M.plasticoNegro()} />
        <Caja tam={[2.2, 0.06, 0.25]} pos={[1.1, 0.12, 0]} material={M.cobre()} />
        <Caja tam={[0.25, 0.06, 0.25]} pos={[2.05, 0.05, 0]} material={M.cobre()} />
      </group>
      {[-2.4, 0, 2.4].map((x, i) => (
        <Caja key={i} tam={[0.3, 0.1, 1.2]} pos={[x * 0.6, 0.25, 3.3]} material={M.estano()} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ lámina de oro entre los polos (Hall, 1879)
export const HallOro: React.FC<Anim> = () => (
  <group>
    <Caja tam={[1.4, 3.4, 1.8]} pos={[-2.4, 1.7, 0]} material={pintura('#C62828', 0.4)} radio={0.1} />
    <Caja tam={[1.4, 3.4, 1.8]} pos={[2.4, 1.7, 0]} material={pintura('#1E4FD8', 0.4)} radio={0.1} />
    <Caja tam={[2.6, 0.04, 2.2]} pos={[0, 1.7, 0]} material={M.vidrio()} />
    <Caja tam={[2.0, 0.02, 1.4]} pos={[0, 1.73, 0]} material={M.oro()} />
    {[[-1.0, 0], [1.0, 0], [0, -0.7], [0, 0.7]].map(([x, z], i) => (
      <Tubo key={i} puntos={[[x, 1.75, z], [x * 1.3, 2.6, z * 1.6], [x * 1.6, 3.4, z * 2.2 + 1.2]]} radio={0.03} material={M.cobre()} seg={20} />
    ))}
  </group>
);

/** Teclado (los primeros teclados sin contactos y los teclados Hall de hoy). */
export const Teclado: React.FC<Anim & {profundidad?: number}> = ({t = 0, a = 0, profundidad = 0}) => (
  <group position={[0, 0.3, 0]} rotation={[0.18, 0, 0]}>
    <Caja tam={[8.4, 0.5, 3.2]} material={M.color('#2B2E33', 0.4, 0.4)} radio={0.15} />
    {Array.from({length: 40}, (_, i) => {
      const fila = Math.floor(i / 10);
      const col = i % 10;
      const pulsada = a > 0.01 && i === 14 + (Math.floor(t * 1.5) % 4);
      return (
        <Caja key={i} tam={[0.66, 0.35, 0.62]} pos={[-3.6 + col * 0.8 + fila * 0.12, 0.4 - (pulsada ? 0.15 + 0.1 * profundidad : 0), -1.15 + fila * 0.76]} material={pulsada ? M.color('#7CF0FF', 0.4) : M.color('#E9E7E1', 0.45)} radio={0.07} />
      );
    })}
  </group>
);

// ------------------------------------------------------------------ dónde está: funda, plegable, brújula
export const CelularFunda: React.FC<Anim> = ({t = 0, a = 0}) => {
  const tapa = a > 0.01 ? Math.max(0, Math.sin(t * 1.2)) * 2.6 : 2.4;
  return (
    <group position={[0, 0.2, 0]}>
      <Caja tam={[3.2, 0.36, 6.4]} material={M.color('#2A2D31', 0.4, 0.6)} radio={0.15} />
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 6.1]} />
        <meshBasicMaterial color={tapa > 0.3 ? '#3B5BDB' : '#08090A'} toneMapped={false} />
      </mesh>
      <group position={[-1.6, 0.25, 0]} rotation={[0, 0, tapa]}>
        <Caja tam={[3.2, 0.15, 6.4]} pos={[1.6, 0, 0]} material={M.color('#7A4A2A', 0.7)} radio={0.06} />
        <Caja tam={[0.6, 0.1, 0.8]} pos={[2.7, -0.05, 2.4]} material={M.color('#9AA1A8', 0.3, 0.9)} />
      </group>
      <Esf r={0.12} pos={[1.0, 0.2, 2.4]} mat={M.emisivo('#7CF0FF', a > 0.01 ? 2.5 : 0.4)} seg={10} />
    </group>
  );
};
export const Plegable: React.FC<Anim> = ({t = 0, a = 0}) => {
  const ang = a > 0.01 ? 0.3 + Math.abs(Math.sin(t * 0.8)) * 2.4 : 1.4;
  return (
    <group position={[0, 0.15, 0]}>
      <Caja tam={[3.0, 0.2, 3.2]} pos={[0, 0, 1.6]} material={M.color('#3A3D42', 0.3, 0.8)} radio={0.08} />
      <group position={[0, 0.1, 0]} rotation={[-ang, 0, 0]}>
        <Caja tam={[3.0, 0.2, 3.2]} pos={[0, 0.1, -1.6]} material={M.color('#3A3D42', 0.3, 0.8)} radio={0.08} />
        <mesh position={[0, 0.21, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 3.0]} />
          <meshBasicMaterial color="#6B3FA0" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0.11, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 3.0]} />
        <meshBasicMaterial color="#1C3D6E" toneMapped={false} />
      </mesh>
    </group>
  );
};
export const Brujula: React.FC<Anim> = ({t = 0}) => (
  <group position={[0, 0.3, 0]}>
    <Cil r={2.4} h={0.6} mat={M.laton()} seg={64} />
    <Cil r={2.15} h={0.62} mat={M.color('#F4EFE4', 0.6)} seg={64} />
    {['N', 'E', 'S', 'O'].map((l, i) => (
      <TextoPlano key={l} lineas={[{t: l, tam: 200, color: l === 'N' ? '#C62828' : '#1D2024'}]} w={0.6} h={0.6} pos={[Math.sin((i * Math.PI) / 2) * 1.65, 0.33, -Math.cos((i * Math.PI) / 2) * 1.65]} rot={[-Math.PI / 2, 0, 0]} />
    ))}
    <group position={[0, 0.36, 0]} rotation={[0, Math.sin(t * 1.3) * 0.25, 0]}>
      <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 1.5, 4]} />
        <meshStandardMaterial color="#C62828" />
      </mesh>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 1.5, 4]} />
        <meshStandardMaterial color="#D9DDE1" />
      </mesh>
      <Cil r={0.12} h={0.12} mat={M.laton()} />
    </group>
    <Cil r={2.2} h={0.05} pos={[0, 0.38, 0]} mat={M.vidrio()} seg={64} />
  </group>
);

// ------------------------------------------------------------------ carro: rueda dentada, ABS, pedal, pinza amperimétrica
export const RuedaDentada: React.FC<Anim & {dientes?: number; r?: number}> = ({t = 0, a = 0, dientes = 30, r = 2.4}) => (
  <group position={[0, 2.8, 0]}>
    <group rotation={[Math.PI / 2, 0, a > 0.01 ? t * 2 : 0]}>
      <Cil r={r - 0.3} h={0.5} mat={M.aceroMate()} seg={64} />
      {Array.from({length: dientes}, (_, i) => {
        const ang = (i / dientes) * Math.PI * 2;
        return <Caja key={i} tam={[0.3, 0.5, 0.45]} pos={[Math.cos(ang) * (r - 0.05), 0, Math.sin(ang) * (r - 0.05)]} rot={[0, -ang, 0]} material={M.aceroMate()} />;
      })}
      <Cil r={0.5} h={0.8} mat={M.acero()} />
    </group>
    <group position={[0, -r - 0.9, 0]}>
      <Caja tam={[0.9, 1.0, 0.9]} material={M.plasticoNegro()} radio={0.12} />
      <Esf r={0.1} pos={[0.5, 0.3, 0.46]} mat={M.emisivo('#7CF0FF', a > 0.01 && Math.sin(t * 2 * dientes / 2) > 0 ? 3 : 0.3)} seg={10} />
      <Tubo puntos={[[0, -0.5, 0], [0.3, -1.4, 0.4], [1.4, -2.0, 0.6]]} radio={0.06} material={M.plasticoNegro()} seg={16} />
    </group>
  </group>
);
export const Pedal: React.FC<Anim> = ({t = 0, a = 0}) => {
  const pisa = a > 0.01 ? 0.15 + Math.abs(Math.sin(t * 1.4)) * 0.35 : 0.2;
  return (
    <group>
      <Caja tam={[3.0, 0.3, 3.0]} pos={[0, 0.15, 0]} material={M.color('#1E2024', 0.6)} radio={0.06} />
      <group position={[0, 4.6, -0.8]} rotation={[pisa, 0, 0]}>
        <Caja tam={[0.25, 4.2, 0.25]} pos={[0, -2.1, 0]} material={M.color('#2B2E33', 0.4, 0.6)} />
        <Caja tam={[2.0, 3.0, 0.3]} pos={[0, -3.8, 0.25]} material={M.goma('#1A1B1D')} radio={0.15} />
      </group>
      <Caja tam={[1.2, 0.9, 0.9]} pos={[0, 4.6, -1.3]} material={M.plasticoNegro()} radio={0.1} />
    </group>
  );
};
export const Pinza: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 0, 0]}>
    <Caja tam={[2.2, 4.6, 1.0]} pos={[0, 2.3, 0]} material={pintura('#F2C230', 0.4)} radio={0.3} />
    <mesh position={[0, 0.6 + 4.6 + 0.7, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[1.0, 0.32, 16, 48, Math.PI * 1.85]} />
      <meshStandardMaterial color="#1E2024" roughness={0.5} />
    </mesh>
    <Cil r={0.22} h={8} pos={[0, 5.9, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#C62828', 0.4)} />
    <Caja tam={[1.6, 0.9, 0.1]} pos={[0, 3.4, 0.51]} material={M.color('#9FB4A3', 0.3)} />
    <TextoPlano lineas={[{t: a > 0.01 ? '12.4 A' : '0.0 A', tam: 120, color: '#1D2024', mono: true}]} w={1.4} h={0.5} pos={[0, 3.4, 0.57]} />
  </group>
);

// ------------------------------------------------------------------ límites y datos: parlante, destornillador, medalla, hueco
export const Parlante: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 2.6, 0]}>
    <Caja tam={[3.6, 5.2, 3.0]} material={M.color('#2B2116', 0.6)} radio={0.15} />
    <Cil r={1.25} h={0.2} pos={[0, -0.8, 1.45]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#1A1A1A', 0.5)} />
    <Cil r={0.5} r2={1.15} h={0.4} pos={[0, -0.8, 1.45 + (a > 0.01 ? Math.sin(t * 40) * 0.04 : 0)]} rot={[-Math.PI / 2, 0, 0]} mat={M.color('#2E2E2E', 0.7)} />
    <Cil r={0.6} h={0.15} pos={[0, 1.4, 1.45]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#1A1A1A', 0.5)} />
  </group>
);
export const Destornillador: React.FC<Anim> = () => (
  <group position={[0, 0.5, 0]} rotation={[0, 0.5, Math.PI / 2]}>
    <Cap r={0.55} largo={2.4} pos={[0, 4.2, 0]} mat={pintura('#E5484D', 0.35)} />
    <Cil r={0.14} h={3.6} pos={[0, 1.4, 0]} mat={M.acero()} />
    <Caja tam={[0.32, 0.5, 0.08]} pos={[0, -0.45, 0]} material={M.acero()} />
  </group>
);
export const Medalla: React.FC<Anim> = () => (
  <group position={[0, 2.6, 0]} rotation={[0.1, 0, 0]}>
    <Cil r={2.0} h={0.3} rot={[Math.PI / 2, 0, 0]} mat={M.oro()} seg={64} />
    <TextoPlano lineas={[{t: 'Nobel', tam: 130, color: '#5C4416'}, {t: '1985 · 1998', tam: 100, color: '#5C4416'}]} w={2.6} h={1.4} pos={[0, 0, 0.17]} />
    <Caja tam={[0.7, 2.6, 0.06]} pos={[0, 2.8, -0.1]} material={M.color('#1D4ED8', 0.6)} />
  </group>
);
export const Hueco: React.FC<Anim> = ({t = 0}) => (
  <group position={[0, 1.6, 0]}>
    <Caja tam={[5, 2.4, 2.4]} material={M.color('#5B6470', 0.3, 0.6)} radio={0.15} />
    {Array.from({length: 6}, (_, i) => (
      <Esf key={i} r={0.3} pos={[-2 + ((i * 0.8 + t * 0.6) % 4), 1.4, (i % 2) * 0.8 - 0.4]} mat={M.emisivo('#FF5C8A', 2.4)} seg={14} />
    ))}
  </group>
);

// ------------------------------------------------------------------ S05: chip MEMS (avance)
export const ChipMEMS: React.FC<Anim> = () => (
  <group position={[0, 0.4, 0]}>
    <Caja tam={[3.0, 0.8, 3.0]} material={M.plasticoNegro()} radio={0.1} />
    <TextoPlano lineas={[{t: 'MEMS', tam: 150, color: '#C9CDD1', peso: 700}]} w={1.8} h={0.6} pos={[0, 0.41, 0]} rot={[-Math.PI / 2, 0, 0]} />
    {Array.from({length: 8}, (_, i) => (
      <group key={i}>
        <Caja tam={[0.18, 0.1, 0.35]} pos={[-1.2 + (i % 4) * 0.8, -0.35, (i < 4 ? 1 : -1) * 1.6]} material={M.estano()} />
      </group>
    ))}
  </group>
);

export const CATALOGO_S04 = {
  potenciometro: {C: ((p: Anim) => <PotenciometroCorte ang={Math.sin((p.t ?? 0) * 1.2) * 0.8} desgaste={0.6} t={p.t} />) as React.FC<Anim>, alto: 1.2},
  halloro: {C: HallOro, alto: 3.6},
  teclado: {C: Teclado as React.FC<Anim>, alto: 1.4},
  funda: {C: CelularFunda, alto: 3.4},
  plegable: {C: Plegable, alto: 3.4},
  brujula: {C: Brujula, alto: 1.2},
  ciguenal: {C: RuedaDentada as React.FC<Anim>, alto: 5.6},
  abs: {C: ((p: Anim) => <RuedaDentada {...p} dientes={48} r={2.6} />) as React.FC<Anim>, alto: 5.8},
  pedal: {C: Pedal, alto: 5.0},
  pinza: {C: Pinza, alto: 7.4},
  parlante: {C: Parlante, alto: 5.4},
  destornillador: {C: Destornillador, alto: 1.4},
  medalla: {C: Medalla, alto: 5.8},
  hueco: {C: Hueco, alto: 3.4},
  mems: {C: ChipMEMS, alto: 1.4, escala: 1.4},
};
export {Iman, SensorHall};
