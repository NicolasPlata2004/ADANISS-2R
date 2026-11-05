// Objetos cotidianos en 3D para las vitrinas ("dónde está"), las listas y los datos curiosos.
// Escala de vitrina: cada objeto cabe en una caja de ~6 unidades y se apoya en y = 0.
// Todos reciben `t` (segundos de la escena) y `a` (0→1, cuánto está "activo" o resaltado).
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar, texturaRuido} from '../texturas';
import type {V3} from '../Estudio';
import {Caja, CristalCuarzo, Pila, Tubo} from './Piezas';
import {PiezoDisco} from './Piezo';
import {TextoPlano, useLienzo} from '../texto3d';

export type Anim = {t?: number; a?: number};

// ------------------------------------------------------------------ primitivas
export const Cil: React.FC<{r: number; r2?: number; h: number; pos?: V3; rot?: V3; mat: THREE.Material; seg?: number; abierto?: boolean}> = ({r, r2, h, pos = [0, 0, 0], rot = [0, 0, 0], mat, seg = 40, abierto = false}) => (
  <mesh position={pos} rotation={rot} material={mat} castShadow receiveShadow>
    <cylinderGeometry args={[r, r2 ?? r, h, seg, 1, abierto]} />
  </mesh>
);
export const Esf: React.FC<{r: number; pos?: V3; esc?: V3; mat: THREE.Material; seg?: number}> = ({r, pos = [0, 0, 0], esc = [1, 1, 1], mat, seg = 32}) => (
  <mesh position={pos} scale={esc} material={mat} castShadow receiveShadow>
    <sphereGeometry args={[r, seg, Math.round(seg * 0.75)]} />
  </mesh>
);
export const Cap: React.FC<{r: number; largo: number; pos?: V3; rot?: V3; mat: THREE.Material}> = ({r, largo, pos = [0, 0, 0], rot = [0, 0, 0], mat}) => (
  <mesh position={pos} rotation={rot} material={mat} castShadow receiveShadow>
    <capsuleGeometry args={[r, largo, 8, 20]} />
  </mesh>
);
export const Toro: React.FC<{r: number; tubo: number; pos?: V3; rot?: V3; mat: THREE.Material; arco?: number}> = ({r, tubo, pos = [0, 0, 0], rot = [Math.PI / 2, 0, 0], mat, arco = Math.PI * 2}) => (
  <mesh position={pos} rotation={rot} material={mat} castShadow>
    <torusGeometry args={[r, tubo, 16, 64, arco]} />
  </mesh>
);

const pinturas = new Map<string, THREE.Material>();
/** Pintura de carro / plástico brillante con barniz. */
export const pintura = (color: string, rough = 0.32) => {
  const k = `${color}${rough}`;
  if (!pinturas.has(k)) pinturas.set(k, new THREE.MeshPhysicalMaterial({color, roughness: rough, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08}));
  return pinturas.get(k)!;
};
const brillo = (color: string, k: number) => M.emisivo(color, Math.max(0.05, Math.round(k * 20) / 10));

/**
 * Arcos de onda (ultrasonido, luz, eco) que viajan desde un punto. En el plano XZ del grupo,
 * `dir` es el ángulo desde +z hacia +x (0 = hacia la cámara, π/2 = hacia +x).
 */
export const Arcos: React.FC<{
  origen: V3;
  dir?: number;
  apertura?: number;
  t: number;
  t0: number;
  color?: string;
  vel?: number;
  n?: number;
  cada?: number;
  vida?: number;
  rot?: V3;
  r0?: number;
  max?: number;
}> = ({origen, dir = 0, apertura = 0.8, t, t0, color = '#8FD3FF', vel = 4, n = 4, cada = 0.3, vida = 1.6, rot = [0, 0, 0], r0 = 0.2, max = 99}) => {
  if (t < t0) return null;
  return (
    <group position={origen} rotation={rot}>
      {Array.from({length: n}, (_, k) => {
        const q = t - t0 - k * cada;
        if (q < 0 || q > vida) return null;
        const r = Math.min(max, r0 + q * vel);
        const op = Math.max(0, 1 - q / vida) * (r >= max ? 0.4 : 1);
        return (
          <mesh key={k} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.09, 48, 1, dir - Math.PI / 2 - apertura / 2, apertura]} />
            <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------ reloj de pulsera (acostado)
export const Reloj: React.FC<Anim> = ({t = 0, a = 0}) => {
  const cuero = M.color('#4A2E1C', 0.7);
  const dial = M.color('#16233A', 0.35, 0.2);
  const marcas = Array.from({length: 12}, (_, i) => {
    const ang = (i / 12) * Math.PI * 2;
    return <Caja key={i} tam={[0.09, 0.03, i % 3 === 0 ? 0.32 : 0.18]} pos={[Math.sin(ang) * 1.12, 0.74, Math.cos(ang) * 1.12]} rot={[0, ang, 0]} material={M.color('#F1EEE6', 0.4)} />;
  });
  const seg = (t * Math.PI * 2) / 60;
  return (
    <group>
      <Caja tam={[1.5, 0.22, 3.4]} pos={[0, 0.16, 3.1]} material={cuero} radio={0.09} />
      <Caja tam={[1.5, 0.22, 3.4]} pos={[0, 0.16, -3.1]} material={cuero} radio={0.09} />
      <Toro r={0.42} tubo={0.06} pos={[0, 0.2, -4.7]} rot={[0, 0, 0]} mat={M.acero()} />
      <Cil r={1.55} h={0.55} pos={[0, 0.45, 0]} mat={M.acero()} seg={64} />
      <Toro r={1.5} tubo={0.13} pos={[0, 0.72, 0]} mat={M.acero()} />
      <Cil r={1.38} h={0.04} pos={[0, 0.72, 0]} mat={dial} seg={64} />
      {marcas}
      <Caja tam={[0.1, 0.03, 0.72]} pos={[0, 0.77, 0.3]} rot={[0, 0.9, 0]} material={M.color('#F1EEE6', 0.4)} />
      <Caja tam={[0.08, 0.03, 1.05]} pos={[0, 0.79, 0.45]} rot={[0, -0.6, 0]} material={M.color('#F1EEE6', 0.4)} />
      <group rotation={[0, -seg, 0]} position={[0, 0.81, 0]}>
        <Caja tam={[0.035, 0.02, 1.2]} pos={[0, 0, 0.45]} material={M.color('#E5484D', 0.4)} />
      </group>
      <Cil r={0.08} h={0.12} pos={[0, 0.8, 0]} mat={M.acero()} />
      <Cil r={1.4} h={0.05} pos={[0, 0.86, 0]} mat={M.vidrio()} seg={64} />
      <Cil r={0.16} h={0.3} pos={[1.7, 0.45, 0]} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
      {a > 0.01 && <TextoPlano lineas={[{t: '32.768 Hz', tam: 120, color: '#9BE7FF'}]} w={2.4} h={0.5} pos={[0, 0.9, -0.7]} rot={[-Math.PI / 2, 0, 0]} op={a} />}
    </group>
  );
};

// ------------------------------------------------------------------ sonda de ecografía (acostada, apunta a +x)
export const SondaEco: React.FC<Anim> = ({t = 0, a = 0}) => {
  const blanco = M.plasticoBlanco();
  return (
    <group position={[-1.2, 0.75, 0]}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        <Caja tam={[2.0, 1.1, 0.95]} pos={[0, 1.1, 0]} material={blanco} radio={0.38} />
        <Caja tam={[1.8, 0.16, 0.72]} pos={[0, 1.7, 0]} material={M.color('#2B3036', 0.3)} radio={0.06} />
        <Cil r={0.42} r2={0.62} h={2.4} pos={[0, -0.6, 0]} mat={blanco} />
        <Cil r={0.24} h={0.8} pos={[0, -2.2, 0]} mat={M.plasticoGris()} />
      </group>
      <Tubo puntos={[[-2.6, 0, 0], [-3.6, -0.3, 0.4], [-4.4, -0.65, 1.6], [-4.8, -0.7, 3.2]]} radio={0.16} material={M.plasticoGris()} seg={40} />
      <Arcos origen={[1.8, 0, 0]} dir={Math.PI / 2} apertura={0.9} t={t} t0={a > 0.01 ? 0 : 1e9} vel={3.2} n={6} cada={0.28} vida={1.5} color="#8FD3FF" />
    </group>
  );
};

// ------------------------------------------------------------------ bloque de motor con sensor de detonación
export const Motor: React.FC<Anim> = ({t = 0, a = 0}) => {
  const alu = M.color('#A7ADB3', 0.42, 0.85);
  const golpe = a > 0.01 ? Math.max(0, Math.sin(t * 9)) : 0;
  return (
    <group position={[0, 0, 0]} scale={0.95}>
      <Caja tam={[4.8, 0.55, 2.6]} pos={[0, 0.3, 0]} material={M.color('#2A2C2F', 0.45, 0.4)} radio={0.12} />
      <Caja tam={[5.2, 2.5, 3.0]} pos={[0, 1.8, 0]} material={alu} radio={0.14} />
      <Caja tam={[5.0, 0.85, 2.8]} pos={[0, 3.45, 0]} material={M.color('#BFC4C9', 0.38, 0.85)} radio={0.1} />
      <Caja tam={[4.6, 0.7, 2.1]} pos={[0, 4.2, 0]} material={pintura('#B3261E')} radio={0.28} />
      {[-1.65, -0.55, 0.55, 1.65].map((x) => (
        <Cil key={x} r={0.24} h={0.55} pos={[x, 4.7, 0]} mat={M.plasticoNegro()} />
      ))}
      {[-1.65, -0.55, 0.55, 1.65].map((x) => (
        <Tubo key={`i${x}`} puntos={[[x, 3.4, -1.4], [x, 3.4, -2.2], [x * 0.8, 4.4, -2.7]]} radio={0.26} material={alu} seg={20} />
      ))}
      <Cil r={0.95} h={0.4} pos={[-2.8, 1.6, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#2A2C2F', 0.5, 0.6)} />
      {/* sensor de detonación (piezo) atornillado al bloque */}
      <group position={[0.6, 1.7, 1.52]} rotation={[Math.PI / 2, 0, 0]}>
        <Cil r={0.42} h={0.38} pos={[0, 0.19, 0]} mat={M.plasticoNegro()} />
        <Cil r={0.14} h={0.3} pos={[0, 0.5, 0]} mat={M.acero()} seg={6} />
        <Caja tam={[0.35, 0.3, 0.5]} pos={[0.5, 0.2, 0]} material={M.color('#3A3D41', 0.5)} radio={0.05} />
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={brillo('#7CF0FF', 0.4 + 2.2 * a * (0.3 + 0.7 * golpe))}>
          <torusGeometry args={[0.5, 0.05, 12, 48]} />
        </mesh>
      </group>
      <Tubo puntos={[[1.1, 1.9, 1.75], [1.8, 2.4, 2.0], [2.4, 3.3, 1.8]]} radio={0.06} material={M.plasticoNegro()} seg={20} />
    </group>
  );
};

// ------------------------------------------------------------------ microondas
export const Microondas: React.FC<Anim> = ({t = 0, a = 0}) => {
  const inox = M.color('#C9CDD1', 0.32, 0.9);
  const encendido = a > 0.01 ? 1 : 0;
  return (
    <group position={[0, 0.15, 0]}>
      {[-2.8, 2.8].map((x) => [-1.7, 1.7].map((z) => <Cil key={`${x}${z}`} r={0.2} h={0.15} pos={[x, 0, z]} mat={M.plasticoNegro()} />))}
      <Caja tam={[6.4, 3.8, 4.2]} pos={[0, 1.95, 0]} material={inox} radio={0.16} />
      <Caja tam={[4.7, 3.4, 0.14]} pos={[-0.75, 1.95, 2.12]} material={M.color('#121416', 0.12, 0.3)} radio={0.06} />
      <mesh position={[-0.9, 1.95, 2.2]}>
        <planeGeometry args={[3.7, 2.4]} />
        <meshStandardMaterial color="#000000" emissive="#FFB35C" emissiveIntensity={0.05 + encendido * 0.9} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <Caja tam={[0.16, 2.6, 0.22]} pos={[1.45, 1.95, 2.3]} material={M.acero()} radio={0.05} />
      <Caja tam={[1.3, 3.4, 0.1]} pos={[2.45, 1.95, 2.12]} material={M.plasticoNegro()} radio={0.04} />
      <TextoPlano lineas={[{t: a > 0.01 ? `0:${String(30 - (Math.floor(t) % 30)).padStart(2, '0')}` : '12:00', tam: 150, color: '#7CFFB2', mono: true}]} w={1.0} h={0.42} pos={[2.45, 3.25, 2.19]} estilo={{fondo: '#06120C', radio: 20}} />
      {Array.from({length: 9}, (_, i) => (
        <Caja key={i} tam={[0.3, 0.22, 0.08]} pos={[2.1 + (i % 3) * 0.35, 2.4 - Math.floor(i / 3) * 0.36, 2.2]} material={M.color('#2D3034', 0.4)} radio={0.03} />
      ))}
      <Arcos origen={[2.45, 1.0, 2.3]} dir={0} apertura={Math.PI * 2} t={t} t0={encendido ? 0.2 : 1e9} vel={2.6} n={4} cada={0.45} vida={1.6} color="#FFD27A" rot={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

// ------------------------------------------------------------------ detector de humo (cara hacia arriba)
export const DetectorHumo: React.FC<Anim> = ({t = 0, a = 0}) => {
  const led = a > 0.01 ? (Math.sin(t * 9) > 0 ? 1 : 0.15) : 0.15;
  return (
    <group position={[0, 0.25, 0]}>
      <Cil r={2.4} h={0.35} pos={[0, 0, 0]} mat={M.plasticoBlanco()} seg={64} />
      <Esf r={2.25} pos={[0, 0.1, 0]} esc={[1, 0.3, 1]} mat={M.plasticoBlanco()} seg={64} />
      {[1.25, 1.6, 1.95].map((r) => (
        <Toro key={r} r={r} tubo={0.045} pos={[0, 0.48 - (r - 1.25) * 0.28, 0]} mat={M.color('#9EA2A6', 0.5)} />
      ))}
      <Cil r={0.48} h={0.16} pos={[0, 0.74, 0]} mat={M.color('#E4E2DC', 0.4)} />
      <Esf r={0.11} pos={[0.85, 0.66, 0.2]} mat={brillo('#FF3B30', 0.4 + led * 2.6)} seg={16} />
      <Arcos origen={[0, 0.9, 0]} dir={0} apertura={Math.PI * 2} t={t} t0={a > 0.01 ? 0.15 : 1e9} vel={3} n={5} cada={0.32} vida={1.4} color="#FF8A80" />
    </group>
  );
};

// ------------------------------------------------------------------ celular (acostado, pantalla arriba)
export const Celular: React.FC<Anim & {pantalla?: 'bloqueo' | 'apagada'}> = ({a = 0, pantalla = 'bloqueo'}) => {
  const tex = useLienzo(
    560,
    1160,
    (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#1C3D6E');
      gr.addColorStop(0.55, '#6B3FA0');
      gr.addColorStop(1, '#E0607E');
      g.fillStyle = pantalla === 'apagada' ? '#050607' : gr;
      g.fillRect(0, 0, w, h);
      if (pantalla === 'apagada') return;
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.textAlign = 'center';
      g.font = '700 150px Inter, Arial';
      g.fillText('10:24', w / 2, 330);
      g.font = '600 40px Inter, Arial';
      g.fillText('jueves 5 de noviembre', w / 2, 400);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      g.beginPath();
      g.roundRect(w / 2 - 70, h - 50, 140, 10, 5);
      g.fill();
    },
    [pantalla],
  );
  return (
    <group position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
      <Caja tam={[3.0, 0.32, 6.2]} pos={[0, 0, 0]} material={M.color('#2A2D31', 0.3, 0.8)} radio={0.15} />
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 5.98]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.55 + a * 0.3} roughness={0.08} metalness={0} />
      </mesh>
      <Cil r={0.07} h={0.02} pos={[0, 0.18, -2.75]} mat={M.plasticoNegro()} />
    </group>
  );
};

// ------------------------------------------------------------------ parachoques con sensores de parqueo y pared
export const Parachoques: React.FC<Anim & {pared?: boolean}> = ({t = 0, a = 0, pared = false}) => {
  const rojo = pintura('#A31B22');
  const sensores = [-2.2, 0, 2.2];
  const t0 = a > 0.01 ? 0 : 1e9;
  return (
    <group position={[0, 0, -1.8]}>
      <Caja tam={[7.6, 1.7, 1.5]} pos={[0, 1.55, 0]} material={rojo} radio={0.6} />
      <Caja tam={[7.0, 0.45, 1.25]} pos={[0, 0.45, 0.05]} material={M.plasticoNegro()} radio={0.18} />
      <Caja tam={[2.4, 0.9, 0.12]} pos={[0, 1.55, 0.74]} material={M.color('#E9E7DF', 0.5)} radio={0.05} />
      {sensores.map((x) => (
        <group key={x} position={[x === 0 ? 3.2 : x, 1.2, 0.76]}>
          <Cil r={0.26} h={0.08} rot={[Math.PI / 2, 0, 0]} mat={pintura('#8E1A20')} />
          <Toro r={0.27} tubo={0.03} pos={[0, 0, 0.03]} rot={[0, 0, 0]} mat={M.plasticoNegro()} />
        </group>
      ))}
      {pared && <Caja tam={[9, 4.6, 0.5]} pos={[0, 2.3, 6.2]} material={M.color('#8D8A84', 0.9)} />}
      {sensores.map((x, i) => (
        <group key={`o${x}`}>
          <Arcos origen={[x === 0 ? 3.2 : x, 1.2, 0.85]} dir={0} apertura={0.7} t={t} t0={t0 + i * 0.12} vel={4.2} n={3} cada={0.5} vida={1.35} max={5.3} color="#8FD3FF" rot={[0, 0, 0]} />
          {pared && <Arcos origen={[x === 0 ? 3.2 : x, 1.2, 5.9]} dir={Math.PI} apertura={0.7} t={t} t0={t0 + 1.25 + i * 0.12} vel={4.2} n={3} cada={0.5} vida={1.35} max={5.0} color="#FFC46B" />}
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ impresora de tinta
export const Impresora: React.FC<Anim> = ({t = 0, a = 0}) => {
  const q = a > 0.01 ? (t * 0.25) % 1 : 0;
  const carro = a > 0.01 ? Math.sin(t * 5) * 2.1 : 0;
  return (
    <group>
      <Caja tam={[6.2, 2.0, 4.0]} pos={[0, 1.0, 0]} material={M.color('#2B2E33', 0.4)} radio={0.25} />
      <Caja tam={[6.0, 0.22, 3.7]} pos={[0, 2.08, -0.05]} material={M.color('#3A3E44', 0.35)} radio={0.1} />
      <Caja tam={[4.6, 0.08, 2.4]} pos={[0, 2.9, -2.4]} rot={[0.75, 0, 0]} material={M.color('#F4F3EF', 0.8)} />
      <Caja tam={[4.8, 0.1, 2.6]} pos={[0, 0.35, 2.6]} material={M.color('#3A3E44', 0.4)} radio={0.04} />
      <Caja tam={[4.4, 0.03, 3.0 * q + 0.01]} pos={[0, 0.45, 1.9 + 1.5 * q]} material={M.color('#FAFAF7', 0.85)} />
      <Caja tam={[5.4, 0.35, 0.1]} pos={[0, 1.35, 2.01]} material={M.color('#0B0C0E', 0.3)} />
      <Caja tam={[0.7, 0.3, 0.2]} pos={[carro, 1.35, 2.0]} material={M.color('#5C6BC0', 0.35)} radio={0.04} />
      <mesh position={[carro, 1.2, 2.12]} material={brillo('#7CF0FF', 0.3 + a * 2)}>
        <boxGeometry args={[0.5, 0.04, 0.04]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ guitarra electroacústica (acostada)
export const Guitarra: React.FC<Anim> = ({t = 0, a = 0}) => {
  const geo = useMemo(() => {
    const p: [number, number][] = [
      [-3.1, 0], [-2.85, 1.25], [-2.1, 2.05], [-1.0, 2.2], [0.0, 1.8], [0.55, 1.4], [1.2, 1.55], [2.05, 1.72], [2.8, 1.25], [3.1, 0],
    ];
    const pts = [...p, ...p.slice(1, -1).reverse().map(([x, y]) => [x, -y] as [number, number])].map(([x, y]) => new THREE.Vector2(x, y));
    const s = new THREE.Shape();
    s.moveTo(pts[0].x, pts[0].y);
    s.splineThru([...pts.slice(1), pts[0]]);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.9, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 48});
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const tapa = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#D8AE6E', roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15, roughnessMap: texturaRuido(9, 0.3, 0.6)}), []);
  const aros = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#5B2C17', roughness: 0.35, clearcoat: 0.8}), []);
  const vib = a > 0.01 ? 0.015 * Math.sin(t * 90) : 0;
  return (
    <group scale={0.62} position={[-2.2, 0.1, 0]}>
      <mesh geometry={geo} material={[tapa, aros]} castShadow receiveShadow />
      <Cil r={0.78} h={0.02} pos={[1.25, 1.0, 0]} mat={M.color('#0D0A08', 0.9)} seg={48} />
      <Toro r={0.95} tubo={0.05} pos={[1.25, 1.0, 0]} mat={M.color('#2B1A10', 0.4)} />
      <Caja tam={[0.45, 0.18, 1.9]} pos={[-1.65, 1.06, 0]} material={M.color('#2B160C', 0.4)} radio={0.06} />
      <Caja tam={[0.09, 0.14, 1.55]} pos={[-1.55, 1.2, 0]} material={M.color('#F3EFE4', 0.35)} />
      <mesh position={[-1.55, 1.11, 0]} material={brillo('#7CF0FF', 0.2 + a * 2.2)}>
        <boxGeometry args={[0.1, 0.04, 1.6]} />
      </mesh>
      <Caja tam={[6.6, 0.4, 0.95]} pos={[6.2, 1.05, 0]} material={M.color('#3A2416', 0.45)} radio={0.08} />
      {Array.from({length: 12}, (_, i) => (
        <Caja key={i} tam={[0.04, 0.05, 0.9]} pos={[3.3 + i * 0.5 * Math.pow(0.95, i), 1.27, 0]} material={M.acero()} />
      ))}
      <Caja tam={[1.8, 0.3, 1.4]} pos={[10.3, 0.95, 0]} rot={[0, 0, 0.12]} material={M.color('#2B160C', 0.4)} radio={0.08} />
      {Array.from({length: 6}, (_, i) => (
        <mesh key={`c${i}`} position={[2.4, 1.32 + vib * (i % 2 ? 1 : -1), -0.42 + i * 0.17]} rotation={[0, 0, Math.PI / 2]} material={M.acero()}>
          <cylinderGeometry args={[0.012 + i * 0.002, 0.012 + i * 0.002, 7.9, 6]} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ pad de batería electrónica con baqueta
export const PadBateria: React.FC<Anim> = ({t = 0, a = 0}) => {
  const ciclo = a > 0.01 ? (t * 1.6) % 1 : 0.5;
  const ang = a > 0.01 ? 0.15 + 0.75 * Math.abs(Math.cos(ciclo * Math.PI)) : 0.8;
  const golpe = a > 0.01 ? Math.exp(-((ciclo < 0.5 ? ciclo : ciclo - 1) ** 2) * 220) : 0;
  return (
    <group>
      <Cil r={0.9} r2={1.3} h={0.8} pos={[0, 0.4, 0]} mat={M.color('#202225', 0.4, 0.6)} />
      <Cil r={2.3} h={0.45} pos={[0, 1.0, 0]} mat={M.color('#1A1B1D', 0.5, 0.5)} seg={64} />
      <Cil r={2.05} h={0.08} pos={[0, 1.25, 0]} mat={M.goma('#3C3F44')} seg={64} />
      <mesh position={[0, 1.3, 0]} rotation={[-Math.PI / 2, 0, 0]} material={brillo('#7CF0FF', 0.15 + golpe * 3)}>
        <ringGeometry args={[1.9, 2.05, 64]} />
      </mesh>
      <group position={[2.2, 1.4, 0.6]} rotation={[0, 0.3, ang]}>
        <Cil r={0.1} r2={0.16} h={5.2} pos={[-2.6, 0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#D7B98A', 0.55)} />
        <Esf r={0.16} pos={[-5.2, 0, 0]} mat={M.color('#E3CDA6', 0.5)} />
      </group>
      <Arcos origen={[0, 1.4, 0]} dir={0} apertura={Math.PI * 2} t={t} t0={a > 0.01 ? Math.floor(t * 1.6) / 1.6 + 0.3 / 1.6 : 1e9} vel={4} n={2} cada={0.15} vida={0.6} color="#7CF0FF" />
    </group>
  );
};

// ------------------------------------------------------------------ escalera con piezo bajo un peldaño
export const Escalera: React.FC<Anim> = ({t = 0, a = 0}) => {
  const madera = M.color('#9C6B3F', 0.55);
  const fase = a > 0.01 ? (t * 0.7) % 1 : 0;
  const pisa = a > 0.01 ? Math.max(0, Math.sin(fase * Math.PI * 2)) : 0;
  const cuenta = a > 0.01 ? 11 + Math.floor(t * 0.7) : 11;
  return (
    <group position={[0, 0, 0.5]}>
      {[0, 1, 2].map((i) => (
        <Caja key={i} tam={[5, 0.9, 1.8]} pos={[0, 0.45 + i * 0.9, -i * 1.8]} material={madera} radio={0.05} />
      ))}
      {[0, 1].map((i) => (
        <Caja key={`r${i}`} tam={[5, 0.9 * (i + 1), 1.8]} pos={[0, 0.45 * (i + 1), -(i + 1) * 1.8]} material={madera} />
      ))}
      <group position={[0, 1.36, 0.2]} scale={0.55}>
        <PiezoDisco cables={false} />
      </group>
      <mesh position={[0, 1.37, 0.2]} rotation={[-Math.PI / 2, 0, 0]} material={brillo('#7CF0FF', 0.2 + pisa * 2.6)}>
        <ringGeometry args={[0.8, 0.9, 48]} />
      </mesh>
      <group position={[0.4, 1.95 + 1.6 * (1 - pisa), 0.1]}>
        <Caja tam={[1.3, 0.3, 3.0]} pos={[0, 0, 0]} material={M.color('#F2F2EE', 0.6)} radio={0.14} />
        <Caja tam={[1.2, 0.8, 2.3]} pos={[0, 0.5, -0.2]} material={pintura('#2D5BE3', 0.4)} radio={0.32} />
      </group>
      <TextoPlano lineas={[{t: `pasos: ${cuenta}`, tam: 110, color: '#7CFFB2', mono: true}]} w={2.6} h={0.7} pos={[-1.2, 3.6, -3.6]} estilo={{fondo: '#06120C', radio: 30}} />
    </group>
  );
};

// ------------------------------------------------------------------ puerta con cerradura de golpes
export const Puerta: React.FC<Anim> = ({t = 0, a = 0}) => {
  const madera = M.color('#8B5A2B', 0.5);
  const ritmo = [0, 0.35, 0.55, 1.2, 1.45];
  const tc = a > 0.01 ? t % 3.2 : -1;
  const ok = a > 0.01 && tc > 1.8;
  return (
    <group scale={0.78}>
      <Caja tam={[0.5, 7.6, 0.6]} pos={[-2.1, 3.8, 0]} material={M.color('#5E3B1E', 0.5)} />
      <Caja tam={[0.5, 7.6, 0.6]} pos={[2.1, 3.8, 0]} material={M.color('#5E3B1E', 0.5)} />
      <Caja tam={[4.7, 0.5, 0.6]} pos={[0, 7.85, 0]} material={M.color('#5E3B1E', 0.5)} />
      <Caja tam={[3.7, 7.3, 0.3]} pos={[0, 3.68, 0]} material={madera} radio={0.04} />
      {[[0, 5.4], [0, 2.1]].map(([x, y]) => (
        <Caja key={y} tam={[2.6, 2.4, 0.06]} pos={[x, y, 0.17]} material={M.color('#7A4E25', 0.45)} radio={0.03} />
      ))}
      <Cil r={0.16} h={0.3} pos={[1.4, 3.6, 0.3]} rot={[Math.PI / 2, 0, 0]} mat={M.laton()} />
      <Caja tam={[0.8, 0.14, 0.14]} pos={[1.1, 3.6, 0.45]} material={M.laton()} radio={0.05} />
      <Caja tam={[0.7, 1.0, 0.25]} pos={[1.4, 4.6, 0.27]} material={M.plasticoNegro()} radio={0.06} />
      <Esf r={0.08} pos={[1.4, 4.85, 0.42]} mat={brillo(ok ? '#34D399' : '#FF3B30', ok ? 3 : 1.2)} seg={12} />
      {ritmo.map((r, i) => (
        <Arcos key={i} origen={[-0.3, 4.3, 0.2]} dir={0} apertura={Math.PI * 2} t={tc} t0={r} vel={2.2} n={1} vida={0.5} color="#FFD27A" rot={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ pesa de laboratorio sobre un piezo
export const PesaSobrePiezo: React.FC<Anim & {alto?: number}> = ({alto = 0}) => (
  <group>
    <PiezoDisco />
    <group position={[0, 0.1 + alto, 0]}>
      <Cil r={1.15} h={1.9} pos={[0, 0.95, 0]} mat={M.color('#9AA1A8', 0.25, 1)} seg={56} />
      <Cil r={0.42} h={0.45} pos={[0, 2.12, 0]} mat={M.color('#9AA1A8', 0.25, 1)} />
      <Esf r={0.62} pos={[0, 2.7, 0]} mat={M.color('#9AA1A8', 0.25, 1)} />
      <TextoPlano lineas={[{t: '1 kg', tam: 120, color: '#1D2024'}]} w={1.4} h={0.5} pos={[0, 1.0, 1.16]} />
    </group>
  </group>
);

// ------------------------------------------------------------------ hornilla al rojo con un piezo encima
export const Hornilla: React.FC<Anim> = ({t = 0, a = 0}) => {
  const espiral = useMemo(() => {
    const pts: V3[] = [];
    for (let i = 0; i <= 160; i++) {
      const u = i / 160;
      const r = 0.4 + u * 1.6;
      const ang = u * Math.PI * 2 * 3.5;
      pts.push([r * Math.cos(ang), 0, r * Math.sin(ang)]);
    }
    return pts;
  }, []);
  const calor = 0.4 + 0.6 * a;
  return (
    <group>
      <Cil r={2.6} h={0.7} pos={[0, 0.35, 0]} mat={M.color('#1B1C1E', 0.4, 0.5)} seg={64} />
      <group position={[0, 0.78, 0]}>
        <Tubo puntos={espiral} radio={0.09} material={M.emisivo('#FF5A1F', Math.round(calor * 30) / 10)} seg={260} />
      </group>
      <group position={[0, 1.0, 0]} scale={0.7}>
        <PiezoDisco cables={false} />
      </group>
      <pointLight position={[0, 1.3, 0]} color="#FF6A2A" intensity={3 + 8 * a + Math.sin(t * 7) * 0.5} distance={9} />
    </group>
  );
};

// ------------------------------------------------------------------ casilla de la tabla periódica
export const Elemento: React.FC<Anim & {numero?: string; simbolo?: string; nombre?: string; color?: string}> = ({numero = '82', simbolo = 'Pb', nombre = 'plomo', color = '#6E7B8C'}) => (
  <group position={[0, 2.0, 0]} rotation={[-0.12, 0, 0]}>
    <Caja tam={[3.4, 3.4, 0.5]} pos={[0, 0, 0]} material={M.color(color, 0.35, 0.8)} radio={0.22} />
    <TextoPlano
      lineas={[
        {t: numero, tam: 90, peso: 700, color: '#E8EEF5'},
        {t: simbolo, tam: 300, peso: 800, color: '#FFFFFF'},
        {t: nombre, tam: 90, peso: 600, color: '#E8EEF5'},
      ]}
      w={3.0}
      h={3.0}
      pos={[0, 0, 0.27]}
    />
  </group>
);

// ------------------------------------------------------------------ película piezoeléctrica flexible que se dobla
export const Pelicula: React.FC<Anim> = ({t = 0}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(5, 3, 40, 8), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const flex = 1.0 * Math.sin(t * 2.2);
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      pos.setZ(i, flex * (1 - (x / 2.5) ** 2) * 1.2);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#C9D3DC', metalness: 0.6, roughness: 0.25, side: THREE.DoubleSide, clearcoat: 0.6, transparent: true, opacity: 0.92}), []);
  return (
    <group position={[0, 2.0, 0]} rotation={[-Math.PI / 2 + 0.9, 0, 0]}>
      <mesh geometry={geo} material={mat} castShadow />
      <Caja tam={[0.2, 3.0, 0.06]} pos={[-2.5, 0, 0]} material={M.cobre()} />
      <Caja tam={[0.2, 3.0, 0.06]} pos={[2.5, 0, 0]} material={M.cobre()} />
    </group>
  );
};

// ------------------------------------------------------------------ guante de lana
export const Guante: React.FC<Anim> = () => {
  const lana = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#A8322C';
    g.fillRect(0, 0, 256, 256);
    const r = azar(5);
    for (let y = 0; y < 256; y += 8) {
      for (let x = 0; x < 256; x += 8) {
        g.fillStyle = `rgba(${r() > 0.5 ? '255,210,190' : '60,10,8'},${0.08 + r() * 0.12})`;
        g.beginPath();
        g.ellipse(x + 4, y + 4, 3, 4.5, (x / 8) % 2 ? 0.5 : -0.5, 0, Math.PI * 2);
        g.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({map: tex, roughness: 1, metalness: 0});
  }, []);
  const dedos: [number, number, number][] = [
    [-0.95, 2.05, 0.18], [-0.32, 2.35, 0.05], [0.32, 2.25, -0.05], [0.92, 1.85, -0.18],
  ];
  return (
    <group position={[0, 0.45, 0.3]} rotation={[0, 0.4, 0]}>
      <Caja tam={[2.7, 0.75, 2.9]} pos={[0, 0, 0]} material={lana} radio={0.36} />
      {dedos.map(([x, largo, ang], i) => (
        <Cap key={i} r={0.33} largo={largo} pos={[x + Math.sin(ang) * largo * 0.5, 0, -1.45 - largo * 0.5]} rot={[Math.PI / 2, 0, ang]} mat={lana} />
      ))}
      <Cap r={0.36} largo={1.4} pos={[1.75, 0, -0.2]} rot={[Math.PI / 2, 0, -0.9]} mat={lana} />
      <Cil r={1.35} h={1.4} pos={[0, 0, 1.9]} rot={[Math.PI / 2, 0, 0]} mat={lana} />
      {[1.4, 1.8, 2.2].map((z) => (
        <Toro key={z} r={1.36} tubo={0.06} pos={[0, 0, z]} rot={[0, 0, 0]} mat={lana} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ salchicha
export const Salchicha: React.FC<Anim> = () => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#B5532F', roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.3, roughnessMap: texturaRuido(21, 0.4, 0.55)}), []);
  const pts: V3[] = useMemo(() => Array.from({length: 9}, (_, i) => {
    const u = i / 8 - 0.5;
    return [u * 6, 0.62, -Math.cos(u * 1.4) * 1.1 + 1.1] as V3;
  }), []);
  return (
    <group>
      <Tubo puntos={pts} radio={0.6} material={mat} seg={60} />
      <Esf r={0.6} pos={pts[0]} mat={mat} />
      <Esf r={0.6} pos={pts[8]} mat={mat} />
      <mesh position={[pts[0][0] - 0.62, 0.62, pts[0][2]]} rotation={[0, 0, Math.PI / 2]} material={mat}>
        <coneGeometry args={[0.12, 0.3, 10]} />
      </mesh>
      <mesh position={[pts[8][0] + 0.62, 0.62, pts[8][2]]} rotation={[0, 0, -Math.PI / 2]} material={mat}>
        <coneGeometry args={[0.12, 0.3, 10]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ bombillo (brillo 0→1)
export const Bombillo: React.FC<Anim & {luz?: number}> = ({luz = 0}) => {
  const fil: V3[] = useMemo(() => Array.from({length: 13}, (_, i) => [-0.45 + i * 0.075, 2.55 + (i % 2 ? 0.12 : -0.12), 0] as V3), []);
  return (
    <group>
      <Cil r={0.55} h={1.0} pos={[0, 0.5, 0]} mat={M.aceroMate()} />
      {[0.2, 0.45, 0.7].map((y) => (
        <Toro key={y} r={0.56} tubo={0.05} pos={[0, y, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.aceroMate()} />
      ))}
      <Cil r={0.85} r2={0.58} h={0.9} pos={[0, 1.4, 0]} mat={M.vidrio()} />
      <Esf r={1.45} pos={[0, 2.7, 0]} mat={M.vidrio()} seg={48} />
      <Tubo puntos={fil} radio={0.03} material={M.emisivo('#FFC27A', Math.round((0.2 + luz * 6) * 10) / 10)} seg={60} />
      {luz > 0.02 && <pointLight position={[0, 2.6, 0]} color="#FFC27A" intensity={luz * 40} distance={14} />}
    </group>
  );
};

// ------------------------------------------------------------------ hueso (fémur estilizado, acostado)
export const Hueso: React.FC<Anim> = () => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#E8DCC2', roughness: 0.62, roughnessMap: texturaRuido(33, 0.35, 0.6)}), []);
  const cuerpo = useMemo(() => {
    const perfil: THREE.Vector2[] = [];
    for (let i = 0; i <= 30; i++) {
      const u = i / 30;
      perfil.push(new THREE.Vector2(0.5 + 0.18 * (Math.abs(u - 0.5) * 2) ** 3, -3 + u * 6));
    }
    const g = new THREE.LatheGeometry(perfil, 40);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  return (
    <group position={[0, 1.1, 0]}>
      <mesh geometry={cuerpo} material={mat} castShadow receiveShadow />
      <Esf r={0.78} pos={[3.1, 0.15, 0.42]} mat={mat} />
      <Esf r={0.78} pos={[3.1, 0.15, -0.42]} mat={mat} />
      <Esf r={0.62} pos={[-3.0, 0.05, 0]} esc={[1, 0.9, 1.2]} mat={mat} />
      <Cap r={0.38} largo={0.9} pos={[-3.5, 0.55, 0.3]} rot={[0.4, 0, 0.9]} mat={mat} />
      <Esf r={0.72} pos={[-3.9, 1.05, 0.5]} mat={mat} />
    </group>
  );
};

// ------------------------------------------------------------------ historia del piezo
/** Cristal de cuarzo (Curie, 1880). */
export const Cuarzo: React.FC<Anim> = ({a = 0}) => <CristalCuarzo pos={[0, 0, 0]} brillo={a * 0.6} />;

/** Cristal conectado a una pila: el efecto inverso (Lippmann, 1881). */
export const CuarzoPila: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <group scale={[1, 1 + 0.03 * a * Math.sin(t * 30), 1]}>
      <CristalCuarzo pos={[-0.9, 0, 0]} brillo={a * 0.4} s={0.8} />
    </group>
    <Pila pos={[2.2, 0.7, 0.4]} rot={[0, 0, Math.PI / 2]} />
    <Tubo puntos={[[0.0, 2.6, 0.3], [0.8, 3.0, 0.4], [1.8, 1.6, 0.4], [2.0, 0.75, 0.4]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={24} />
    <Tubo puntos={[[-0.9, 0.2, 0.9], [0.6, 0.15, 1.4], [4.2, 0.4, 1.0], [4.4, 0.75, 0.4]]} radio={0.05} material={M.color('#1A1A1A', 0.4)} seg={24} />
  </group>
);

/** Transductor de Langevin: cuarzo entre dos discos de acero, emite ultrasonido. */
export const Transductor: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0.1, 0]}>
    <Cil r={1.7} h={0.9} pos={[0, 0.45, 0]} mat={M.aceroMate()} seg={56} />
    <Cil r={1.62} h={0.22} pos={[0, 1.01, 0]} mat={M.vidrio()} seg={56} />
    {Array.from({length: 7}, (_, i) => (
      <Caja key={i} tam={[0.8, 0.2, 0.8]} pos={[Math.cos(i) * (i ? 0.95 : 0), 1.01, Math.sin(i) * (i ? 0.95 : 0)]} material={M.color('#EAF3F8', 0.1)} />
    ))}
    <Cil r={1.7} h={0.9} pos={[0, 1.57, 0]} mat={M.aceroMate()} seg={56} />
    <Cil r={0.25} h={0.5} pos={[0, 2.25, 0]} mat={M.acero()} seg={6} />
    <Tubo puntos={[[0, 2.4, 0], [0.4, 3.2, 0], [1.8, 3.4, -0.6], [3.0, 2.2, -1.0]]} radio={0.08} material={M.plasticoNegro()} seg={30} />
    <Arcos origen={[0, 1.0, 0]} dir={0} apertura={Math.PI * 2} t={t} t0={a > 0.01 ? 0.2 : 1e9} vel={3} n={5} cada={0.35} vida={1.6} r0={1.9} color="#8FD3FF" />
  </group>
);

// ------------------------------------------------------------------ catálogo para las vitrinas
export type Ficha = {C: React.FC<Anim & Record<string, unknown>>; alto: number; escala?: number};
export const OBJETOS: Record<string, Ficha> = {
  reloj: {C: Reloj, alto: 1.2},
  ecografia: {C: SondaEco, alto: 2.0},
  motor: {C: Motor, alto: 5.0},
  microondas: {C: Microondas, alto: 4.3},
  humo: {C: DetectorHumo, alto: 1.4},
  celular: {C: Celular as Ficha['C'], alto: 0.6},
  parqueo: {C: Parachoques as Ficha['C'], alto: 4.8, escala: 0.8},
  impresora: {C: Impresora, alto: 3.2},
  guitarra: {C: Guitarra, alto: 1.2},
  bateria: {C: PadBateria, alto: 2.0},
  escalera: {C: Escalera, alto: 4.5},
  puerta: {C: Puerta, alto: 6.4},
  pesa: {C: PesaSobrePiezo as Ficha['C'], alto: 3.6},
  calor: {C: Hornilla, alto: 1.8},
  plomo: {C: Elemento as Ficha['C'], alto: 4.0},
  pelicula: {C: Pelicula, alto: 3.0},
  guante: {C: Guante, alto: 1.3},
  salchicha: {C: Salchicha, alto: 1.4},
  bombillo: {C: Bombillo as Ficha['C'], alto: 4.3},
  hueso: {C: Hueso, alto: 2.6},
  piezo: {C: (() => <PiezoDisco />) as Ficha['C'], alto: 0.6, escala: 1.6},
  cuarzo: {C: Cuarzo, alto: 4.2},
  cuarzoPila: {C: CuarzoPila, alto: 3.6},
  transductor: {C: Transductor, alto: 3.4},
};
