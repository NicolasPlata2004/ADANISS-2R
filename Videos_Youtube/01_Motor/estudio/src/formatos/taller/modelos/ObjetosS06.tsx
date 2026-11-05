// Objetos 3D para el S06 (giroscopio) y el avance del S07 (ultrasonido).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar, texturaRuido} from '../texturas';
import {Caja, ESP32, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {MPU6050} from './ObjetosS05';
import {TextoPlano, useLienzo} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ la Tierra (estilizada: océanos y manchas de continente)
let texTierra: THREE.CanvasTexture | null = null;
const texturaTierra = () => {
  if (texTierra) return texTierra;
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#DDEBF5');
  gr.addColorStop(0.1, '#1E5A9A');
  gr.addColorStop(0.5, '#1A6FB5');
  gr.addColorStop(0.9, '#1E5A9A');
  gr.addColorStop(1, '#DDEBF5');
  g.fillStyle = gr;
  g.fillRect(0, 0, 1024, 512);
  const r = azar(31);
  for (let k = 0; k < 9; k++) {
    const cx = r() * 1024;
    const cy = 120 + r() * 280;
    g.fillStyle = k % 3 ? '#3F8F4A' : '#A68A55';
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      g.ellipse(cx + (r() - 0.5) * 160, cy + (r() - 0.5) * 110, 20 + r() * 50, 14 + r() * 36, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  texTierra = new THREE.CanvasTexture(c);
  texTierra.colorSpace = THREE.SRGBColorSpace;
  return texTierra;
};
export const Tierra: React.FC<Anim & {r?: number; giro?: number}> = ({t = 0, r = 3.0, giro}) => (
  <group position={[0, r + 0.2, 0]} rotation={[0.41, 0, 0]}>
    <mesh rotation={[0, giro ?? t * 0.3, 0]} castShadow>
      <sphereGeometry args={[r, 64, 48]} />
      <meshStandardMaterial map={texturaTierra()} roughness={0.6} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 1.04, 48, 32]} />
      <meshBasicMaterial color="#7CC4FF" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  </group>
);

// ------------------------------------------------------------------ gafas de realidad virtual, patinete, cohete, carro
export const GafasVR: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 1.6, 0]} rotation={[0, a > 0.01 ? Math.sin(t * 1.2) * 0.5 : 0.3, 0]}>
    <Caja tam={[4.2, 2.2, 2.0]} material={M.plasticoBlanco()} radio={0.6} />
    <Caja tam={[3.8, 1.8, 0.5]} pos={[0, 0, -1.1]} material={M.color('#2B2E33', 0.8)} radio={0.4} />
    <Toro r={2.4} tubo={0.18} pos={[0, 0, -2.0]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#2B2E33', 0.8)} arco={Math.PI} />
  </group>
);
export const Patinete: React.FC<Anim> = ({t = 0, a = 0}) => {
  const balanceo = a > 0.01 ? Math.sin(t * 2.2) * 0.08 : 0;
  return (
    <group position={[0, 0.9, 0]} rotation={[0, 0, balanceo]}>
      {[-2.6, 2.6].map((x) => (
        <Cil key={x} r={0.9} h={0.7} pos={[x, 0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.goma('#151617')} seg={32} />
      ))}
      <Caja tam={[4.6, 0.6, 2.0]} pos={[0, 0.2, 0]} material={pintura('#1D4ED8', 0.3)} radio={0.28} />
      {[-1.1, 1.1].map((x) => (
        <Caja key={x} tam={[1.6, 0.08, 1.4]} pos={[x, 0.52, 0]} material={M.goma('#2A2D31')} radio={0.05} />
      ))}
    </group>
  );
};
export const Cohete: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0.2, 0]}>
    <Cil r={0.9} h={5.0} pos={[0, 3.2, 0]} mat={M.plasticoBlanco()} />
    <mesh position={[0, 6.4, 0]}>
      <coneGeometry args={[0.9, 1.6, 40]} />
      <meshStandardMaterial color="#E5484D" roughness={0.35} />
    </mesh>
    {[0, 2.1, 4.2].map((ang) => (
      <Caja key={ang} tam={[0.12, 1.4, 1.0]} pos={[Math.sin(ang) * 1.1, 1.2, Math.cos(ang) * 1.1]} rot={[0, ang, 0]} material={M.color('#E5484D', 0.35)} />
    ))}
    {a > 0.01 && (
      <mesh position={[0, 0.0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.6, 1.6 + Math.sin(t * 30) * 0.2, 24]} />
        <meshBasicMaterial color="#FFB547" toneMapped={false} transparent opacity={0.85} />
      </mesh>
    )}
  </group>
);
export const CarroSimple: React.FC<Anim & {color?: string}> = ({color = '#2D5BE3'}) => {
  const pint = pintura(color, 0.3);
  return (
    <group scale={0.62}>
      <Caja tam={[8.0, 1.6, 3.6]} pos={[0, 1.4, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.2, 1.4, 3.2]} pos={[-1.2, 2.8, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.0, 1.1, 3.25]} pos={[-1.2, 2.85, 0]} material={M.color('#0E1A2B', 0.05, 0.4)} radio={0.3} />
      {[[-2.6, 1.8], [-2.6, -1.8], [2.4, 1.8], [2.4, -1.8]].map(([x, z], i) => (
        <Cil key={i} r={0.75} h={0.5} pos={[x, 0.75, z]} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#151617')} seg={28} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ trompo que precesa
export const Trompo: React.FC<Anim> = ({t = 0}) => {
  const prec = t * 1.2;
  return (
    <group position={[0, 0, 0]} rotation={[0, prec, 0]}>
      <group rotation={[0.3, 0, 0]}>
        <group rotation={[0, t * 25, 0]}>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[1.4, 2.2, 48]} />
            <meshStandardMaterial color="#C0392B" roughness={0.35} />
          </mesh>
          <Cil r={1.42} h={0.5} pos={[0, 2.5, 0]} mat={pintura('#F2C230', 0.35)} seg={48} />
          <Cil r={0.15} h={1.2} pos={[0, 3.3, 0]} mat={M.color('#5B3A1E', 0.5)} />
        </group>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ mosca con halterios
export const Mosca: React.FC<Anim> = ({t = 0, a = 0}) => {
  const ala = Math.sin(t * 60) * 0.5;
  const halt = Math.sin(t * 60 + Math.PI) * 0.6;
  const ojo = M.color('#8E1B1B', 0.25);
  const cuerpo = M.color('#2E2B26', 0.6);
  const alaMat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#DDE6EE', transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide}), []);
  return (
    <group position={[0, 2.0, 0]} scale={1.1}>
      <Esf r={0.75} pos={[1.3, 0.1, 0]} esc={[0.9, 0.9, 1]} mat={cuerpo} />
      <Esf r={0.45} pos={[1.55, 0.25, 0.5]} mat={ojo} />
      <Esf r={0.45} pos={[1.55, 0.25, -0.5]} mat={ojo} />
      <Esf r={0.9} pos={[0, 0, 0]} esc={[1.1, 0.9, 0.9]} mat={cuerpo} />
      <Esf r={1.0} pos={[-1.6, -0.1, 0]} esc={[1.4, 0.8, 0.85]} mat={M.color('#3A3527', 0.55)} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <group position={[0, 0.6, s * 0.5]} rotation={[s * (0.2 + ala), 0, 0]}>
            <mesh position={[-1.2, 0, s * 1.6]} rotation={[-Math.PI / 2, 0, 0.3]} material={alaMat}>
              <circleGeometry args={[1.6, 32]} />
            </mesh>
          </group>
          <group position={[-0.7, 0.4, s * 0.75]} rotation={[s * halt, 0, 0]}>
            <Cil r={0.04} h={0.6} pos={[0, 0.3, s * 0.05]} mat={cuerpo} />
            <Esf r={0.14} pos={[0, 0.65, s * 0.08]} mat={M.emisivo('#FFB547', a > 0.01 ? 2.2 : 0.6)} seg={12} />
          </group>
        </group>
      ))}
      {[-0.4, 0, 0.4].map((x) =>
        [-1, 1].map((s) => (
          <Tubo key={`${x}${s}`} puntos={[[x, -0.5, s * 0.4], [x - 0.2, -1.2, s * 1.0], [x - 0.4, -2.0, s * 1.2]]} radio={0.05} material={cuerpo} seg={10} />
        )),
      )}
    </group>
  );
};

// ------------------------------------------------------------------ giroscopio de fibra óptica y láser de anillo
export const BobinaFibra: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0.6, 0]}>
    <Cil r={2.6} h={1.2} pos={[0, 0.6, 0]} mat={M.color('#F2C230', 0.5)} seg={64} />
    <Cil r={1.4} h={1.25} pos={[0, 0.6, 0]} mat={M.color('#1E2024', 0.6)} seg={48} />
    {Array.from({length: 10}, (_, i) => (
      <Toro key={i} r={2.62} tubo={0.04} pos={[0, 0.06 + i * 0.12, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#E2B931', 0.4)} />
    ))}
    {a > 0.01 && (
      <>
        <mesh position={[0, 1.24, 0]} rotation={[-Math.PI / 2, 0, t * 4]}>
          <ringGeometry args={[2.0, 2.2, 64, 1, 0, 0.6]} />
          <meshBasicMaterial color="#FF3B30" toneMapped={false} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 1.24, 0]} rotation={[-Math.PI / 2, 0, -t * 4]}>
          <ringGeometry args={[1.7, 1.9, 64, 1, 0, 0.6]} />
          <meshBasicMaterial color="#7CF0FF" toneMapped={false} transparent opacity={0.9} />
        </mesh>
      </>
    )}
  </group>
);
export const AnilloLaser: React.FC<Anim> = ({t = 0, a = 0}) => {
  const esquinas: V3[] = [
    [0, 4.4, 0],
    [-2.4, 0.6, 0],
    [2.4, 0.6, 0],
  ];
  const q = (t * 0.8) % 1;
  return (
    <group>
      <mesh position={[0, 1.9, -0.3]}>
        <cylinderGeometry args={[3.2, 3.2, 0.5, 3]} />
        <meshPhysicalMaterial color="#C7D7E3" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      {esquinas.map((p, i) => (
        <Caja key={i} tam={[0.7, 0.7, 0.3]} pos={p} material={M.acero()} radio={0.05} />
      ))}
      <Tubo puntos={[esquinas[0], esquinas[1], esquinas[2], esquinas[0]]} radio={0.05} material={M.emisivo('#FF3B30', a > 0.01 ? 2.5 : 0.8)} seg={60} />
      {a > 0.01 && <Esf r={0.16} pos={[mix3(esquinas, q)[0], mix3(esquinas, q)[1], 0]} mat={M.emisivo('#FFFFFF', 3)} seg={10} />}
    </group>
  );
};
const mix3 = (p: V3[], q: number): V3 => {
  const k = Math.floor(q * 3);
  const u = q * 3 - k;
  const a = p[k % 3];
  const b = p[(k + 1) % 3];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0];
};

// ------------------------------------------------------------------ robot que se equilibra sobre dos ruedas
export const RobotEquilibrio: React.FC<Anim & {inclina?: number}> = ({t = 0, a = 0, inclina}) => {
  const ang = inclina ?? (a > 0.01 ? Math.sin(t * 2.6) * 0.12 * Math.exp(-((t % 4) * 0.4)) : 0.05);
  return (
    <group>
      {[-1.7, 1.7].map((z) => (
        <group key={z} position={[0, 1.1, z]}>
          <Cil r={1.1} h={0.5} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#1A1B1D')} seg={32} />
          <Cil r={0.55} h={0.55} rot={[Math.PI / 2, 0, 0]} mat={M.color('#F2C230', 0.4)} />
        </group>
      ))}
      <group position={[0, 1.1, 0]} rotation={[0, 0, ang]}>
        <Caja tam={[1.4, 5.2, 3.0]} pos={[0, 2.5, 0]} material={M.color('#E9E7E1', 0.5)} radio={0.15} />
        <Caja tam={[1.5, 0.15, 3.1]} pos={[0, 1.2, 0]} material={M.color('#20242A', 0.4)} />
        <Caja tam={[1.5, 0.15, 3.1]} pos={[0, 3.2, 0]} material={M.color('#20242A', 0.4)} />
        <group position={[0, 5.2, 0]} scale={0.55}>
          <ESP32 pos={[0, 0, 0]} />
        </group>
        <group position={[0, 3.35, 0.4]} scale={0.8}>
          <MPU6050 />
        </group>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ S07: murciélago (avance)
export const Murcielago: React.FC<Anim> = ({t = 0, a = 0}) => {
  const aleteo = Math.sin(t * 9) * 0.6;
  const piel = M.color('#3A2E2A', 0.7);
  const membrana = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.2, 0.9);
    s.lineTo(2.6, 1.0);
    s.lineTo(3.8, 0.4);
    s.lineTo(3.2, -0.2);
    s.lineTo(2.4, 0.1);
    s.lineTo(1.6, -0.4);
    s.lineTo(0.9, -0.1);
    s.lineTo(0, -0.6);
    return new THREE.ShapeGeometry(s);
  }, []);
  const mem = useMemo(() => new THREE.MeshStandardMaterial({color: '#4A3A34', roughness: 0.8, side: THREE.DoubleSide}), []);
  return (
    <group position={[0, 3.0 + Math.sin(t * 2) * 0.2, 0]}>
      <Esf r={0.7} esc={[1.4, 0.8, 0.8]} mat={piel} />
      <Esf r={0.45} pos={[0.95, 0.25, 0]} mat={piel} />
      <mesh position={[1.1, 0.75, 0.2]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color="#3A2E2A" />
      </mesh>
      <mesh position={[1.1, 0.75, -0.2]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color="#3A2E2A" />
      </mesh>
      <group rotation={[aleteo, 0, 0]}>
        <mesh geometry={membrana} material={mem} position={[-0.6, 0, 0.3]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      </group>
      <group rotation={[-aleteo, 0, 0]}>
        <mesh geometry={membrana} material={mem} position={[-0.6, 0, -0.3]} rotation={[Math.PI / 2, 0, Math.PI / 2]} />
      </group>
      <Arcos origen={[1.4, 0.2, 0]} dir={Math.PI / 2} apertura={0.9} t={t} t0={a > 0.01 ? 0 : 1e9} vel={3} n={5} cada={0.25} vida={1.2} color="#8FD3FF" />
    </group>
  );
};

/** Lavamanos con remolino (gira hacia cualquier lado). */
export const Lavamanos: React.FC<Anim & {sentido?: number}> = ({t = 0, sentido = 1}) => {
  const agua = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#9FD3EA', transparent: true, opacity: 0.55, roughness: 0.05}), []);
  return (
    <group>
      <Caja tam={[6, 3.2, 4.4]} pos={[0, 1.6, 0]} material={M.color('#D9D4CA', 0.6)} radio={0.15} />
      <mesh position={[0, 3.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 48]} />
        <meshStandardMaterial color="#F3F1EA" roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.25, 0]} rotation={[-Math.PI / 2, 0, sentido * t * 3]} material={agua}>
        <ringGeometry args={[0.2, 1.7, 48, 1, 0, Math.PI * 1.6]} />
      </mesh>
      <Cil r={0.2} h={0.05} pos={[0, 3.26, 0]} mat={M.acero()} />
      <Cil r={0.15} h={1.6} pos={[0, 4.0, -1.8]} mat={M.acero()} />
      <Cil r={0.12} h={1.2} pos={[0, 4.75, -1.25]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} />
    </group>
  );
};

export const CATALOGO_S06 = {
  tierra: {C: Tierra as React.FC<Anim>, alto: 6.4, escala: 0.8},
  vr: {C: GafasVR, alto: 2.8},
  patinete: {C: Patinete, alto: 1.8},
  cohete: {C: Cohete, alto: 7.2},
  carro3d: {C: CarroSimple as React.FC<Anim>, alto: 2.6},
  trompo: {C: Trompo, alto: 3.6},
  mosca: {C: Mosca, alto: 3.4},
  fibra: {C: BobinaFibra, alto: 1.8},
  anillo: {C: AnilloLaser, alto: 4.8},
  robot: {C: RobotEquilibrio as React.FC<Anim>, alto: 6.8, escala: 0.8},
  murcielago: {C: Murcielago, alto: 3.8},
  lavamanos: {C: Lavamanos as React.FC<Anim>, alto: 5.0, escala: 0.8},
};
