// Objetos 3D para el S09 (temperatura) y el avance del S10 (galgas y básculas).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar, texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ sensores de temperatura
/** Termistor NTC: una perla de cerámica con dos patas. */
export const Termistor: React.FC<Anim & {calor?: number}> = ({calor = 0}) => (
  <group>
    <Esf r={0.55} pos={[0, 3.2, 0]} esc={[1, 1.2, 0.8]} mat={new THREE.MeshPhysicalMaterial({color: new THREE.Color('#2B6CB0').lerp(new THREE.Color('#E5484D'), calor), roughness: 0.3, clearcoat: 0.8})} />
    {[-0.18, 0.18].map((x) => (
      <Tubo key={x} puntos={[[x, 2.7, 0], [x * 1.4, 1.5, 0], [x * 2.2, 0.1, 0]]} radio={0.035} material={M.estano()} seg={12} />
    ))}
  </group>
);
/** Sonda Pt100 de acero con cabezal. */
export const SondaPt100: React.FC<Anim> = () => (
  <group position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2 - 0.15]}>
    <Cil r={0.18} h={5.0} pos={[0, 2.5, 0]} mat={M.acero()} />
    <Cil r={0.55} h={1.0} pos={[0, 5.4, 0]} mat={M.color('#2B2E33', 0.4, 0.4)} />
    <Tubo puntos={[[0, 5.9, 0], [0.3, 7.0, 0.4], [1.0, 7.6, 1.2]]} radio={0.08} material={M.color('#C62828', 0.5)} seg={16} />
  </group>
);
/** Termopar: dos alambres de metales distintos unidos en la punta. */
export const Termopar: React.FC<Anim & {calor?: number}> = ({calor = 0}) => (
  <group>
    <Tubo puntos={[[0, 0.6, 0], [-0.6, 1.8, 0], [-1.6, 2.6, 0], [-3.0, 2.8, 0]]} radio={0.06} material={M.color('#D4AF37', 0.3, 1)} seg={24} />
    <Tubo puntos={[[0, 0.6, 0], [0.6, 1.8, 0], [1.6, 2.6, 0], [3.0, 2.8, 0]]} radio={0.06} material={M.color('#9AA3AD', 0.3, 1)} seg={24} />
    <Esf r={0.16} pos={[0, 0.58, 0]} mat={calor > 0.01 ? M.emisivo('#FF6A2A', 1 + calor * 2) : M.color('#8E7A55', 0.3, 1)} seg={12} />
    <Caja tam={[1.4, 0.8, 0.8]} pos={[-3.6, 2.8, 0]} material={M.color('#F2C230', 0.4)} radio={0.1} />
    <Caja tam={[1.4, 0.8, 0.8]} pos={[3.6, 2.8, 0]} material={M.color('#F2C230', 0.4)} radio={0.1} />
  </group>
);
/** Sonda impermeable DS18B20. */
export const DS18B20: React.FC<Anim> = () => (
  <group position={[0, 0.4, 0]} rotation={[0, 0.4, Math.PI / 2 - 0.1]}>
    <Cil r={0.32} h={2.4} pos={[0, 1.2, 0]} mat={M.acero()} />
    <Esf r={0.32} pos={[0, 0, 0]} mat={M.acero()} />
    <Tubo puntos={[[0, 2.4, 0], [0.4, 4.4, 0.6], [1.4, 6.0, 1.6], [2.6, 6.6, 3.0]]} radio={0.14} material={M.plasticoNegro()} seg={30} />
  </group>
);
/** Termómetro de frente (pistola infrarroja). */
export const PistolaIR: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 2.4, 0]} rotation={[0, -0.4, 0]}>
    <Caja tam={[3.6, 1.3, 1.1]} material={M.plasticoBlanco()} radio={0.45} />
    <Caja tam={[1.0, 2.6, 0.9]} pos={[-0.9, -1.6, 0]} rot={[0, 0, -0.25]} material={M.plasticoBlanco()} radio={0.35} />
    <Cil r={0.3} h={0.2} pos={[1.85, 0.05, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#0B0C0E', 0.05, 0.5)} />
    <Caja tam={[1.0, 0.6, 0.05]} pos={[-1.1, 0.25, 0.56]} material={M.color('#0F2A1B', 0.2)} />
    <TextoPlano lineas={[{t: a > 0.01 ? '36,6°' : '--,-°', tam: 120, color: '#7CFFB2', mono: true}]} w={0.9} h={0.42} pos={[-1.1, 0.25, 0.59]} />
  </group>
);
/** Hervidor eléctrico (con su disco bimetálico). */
export const Hervidor: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <Cil r={1.5} h={0.4} pos={[0, 0.2, 0]} mat={M.plasticoNegro()} seg={48} />
    <Cil r={1.35} r2={1.6} h={3.2} pos={[0, 2.0, 0]} mat={M.color('#C9CDD1', 0.25, 0.95)} seg={48} />
    <Cil r={1.1} h={0.3} pos={[0, 3.7, 0]} mat={M.plasticoNegro()} seg={40} />
    <Caja tam={[0.5, 2.6, 0.5]} pos={[-1.9, 2.1, 0]} material={M.plasticoNegro()} radio={0.2} />
    <mesh position={[1.6, 3.2, 0]} rotation={[0, 0, -0.9]}>
      <coneGeometry args={[0.3, 0.9, 16]} />
      <meshStandardMaterial color="#B9BEC4" metalness={0.9} roughness={0.25} />
    </mesh>
    {a > 0.01 && Array.from({length: 6}, (_, i) => <Esf key={i} r={0.18 + (i % 3) * 0.06} pos={[1.9 + i * 0.12, 3.6 + ((t * 1.2 + i * 0.35) % 2.2), 0]} mat={new THREE.MeshBasicMaterial({color: '#FFFFFF', transparent: true, opacity: 0.25})} seg={10} />)}
  </group>
);
/** Estufa de gas con la llama y el termopar de seguridad. */
export const EstufaGas: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <Caja tam={[5, 0.5, 4]} pos={[0, 0.25, 0]} material={M.color('#1E2024', 0.3, 0.5)} radio={0.1} />
    <Cil r={1.0} h={0.3} pos={[0, 0.65, 0]} mat={M.color('#2B2E33', 0.4, 0.6)} seg={40} />
    {a > 0.01 &&
      Array.from({length: 16}, (_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(ang) * 0.95, 1.0, Math.sin(ang) * 0.95]} rotation={[0, 0, Math.cos(ang) * 0.3]}>
            <coneGeometry args={[0.1, 0.6 + 0.08 * Math.sin(t * 20 + i), 8]} />
            <meshBasicMaterial color="#5AA9FF" toneMapped={false} transparent opacity={0.85} />
          </mesh>
        );
      })}
    <Cil r={0.06} h={0.9} pos={[1.15, 1.0, 0.3]} rot={[0, 0, -0.3]} mat={M.acero()} />
    <Cil r={0.55} h={0.5} pos={[1.6, 0.6, 1.95]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} />
  </group>
);
/** Torre Eiffel estilizada. */
export const TorreEiffel: React.FC<Anim> = () => {
  const hierro = M.color('#7A5A3C', 0.6, 0.6);
  const patas: V3[] = [[-1.6, 0, -1.6], [1.6, 0, -1.6], [-1.6, 0, 1.6], [1.6, 0, 1.6]];
  return (
    <group>
      {patas.map((p, i) => (
        <Tubo key={i} puntos={[p, [p[0] * 0.55, 2.0, p[2] * 0.55], [p[0] * 0.25, 4.6, p[2] * 0.25], [p[0] * 0.08, 7.0, p[2] * 0.08]]} radio={0.16} material={hierro} seg={30} />
      ))}
      <Caja tam={[2.4, 0.2, 2.4]} pos={[0, 2.0, 0]} material={hierro} />
      <Caja tam={[1.3, 0.18, 1.3]} pos={[0, 4.6, 0]} material={hierro} />
      <Cil r={0.08} r2={0.2} h={1.6} pos={[0, 7.8, 0]} mat={hierro} />
    </group>
  );
};
/** Caseta meteorológica (con rendijas). */
export const Caseta: React.FC<Anim> = () => (
  <group>
    {[[-1.0, -0.8], [1.0, -0.8], [-1.0, 0.8], [1.0, 0.8]].map(([x, z], i) => (
      <Caja key={i} tam={[0.2, 3.0, 0.2]} pos={[x, 1.5, z]} material={M.plasticoBlanco()} />
    ))}
    <Caja tam={[2.6, 2.4, 2.0]} pos={[0, 4.2, 0]} material={M.plasticoBlanco()} />
    {Array.from({length: 7}, (_, i) => (
      <Caja key={i} tam={[2.2, 0.06, 0.05]} pos={[0, 3.3 + i * 0.3, 1.02]} rot={[0.5, 0, 0]} material={M.color('#BFC4C9', 0.6)} />
    ))}
    <Caja tam={[2.9, 0.2, 2.3]} pos={[0, 5.5, 0]} material={M.plasticoBlanco()} />
  </group>
);
/** Termómetro de Galileo (bolitas de colores en un tubo). */
export const TermometroGalileo: React.FC<Anim> = ({t = 0}) => {
  const liquido = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#DDEBF2', transparent: true, opacity: 0.3, roughness: 0.05}), []);
  const colores = ['#E5484D', '#F2C230', '#34D399', '#3B82F6', '#C88BFF'];
  return (
    <group>
      <Cil r={0.9} h={0.4} pos={[0, 0.2, 0]} mat={M.laton()} />
      <Cil r={0.65} h={6.4} pos={[0, 3.6, 0]} mat={liquido} />
      <Cil r={0.9} h={0.4} pos={[0, 6.9, 0]} mat={M.laton()} />
      {colores.map((c, i) => (
        <Esf key={i} r={0.38} pos={[i % 2 ? 0.15 : -0.15, i < 2 ? 1.0 + i * 0.8 + Math.sin(t + i) * 0.05 : 4.2 + (i - 2) * 0.85, 0]} mat={new THREE.MeshPhysicalMaterial({color: c, roughness: 0.05, transparent: true, opacity: 0.85, clearcoat: 1})} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ S10: básculas y celda de carga
export const BasculaBano: React.FC<Anim & {peso?: number}> = ({peso = 0}) => (
  <group>
    <Caja tam={[5.2, 0.6, 5.2]} pos={[0, 0.35, 0]} material={new THREE.MeshPhysicalMaterial({color: '#E9EEF2', roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.92})} radio={0.3} />
    <Caja tam={[1.8, 0.05, 0.7]} pos={[0, 0.66, -1.7]} material={M.color('#0B0F14', 0.2)} />
    <TextoPlano lineas={[{t: peso > 0 ? `${peso.toFixed(1).replace('.', ',')} kg` : '0,0 kg', tam: 120, color: '#7CF0FF', mono: true}]} w={1.6} h={0.5} pos={[0, 0.69, -1.7]} rot={[-Math.PI / 2, 0, 0]} />
    {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
      <Cil key={i} r={0.3} h={0.15} pos={[x, 0.05, z]} mat={M.plasticoGris()} />
    ))}
  </group>
);
/** Celda de carga de barra (con el agujero doble y las galgas). */
export const CeldaCarga: React.FC<Anim & {flexion?: number; galgas?: number}> = ({flexion = 0, galgas = 1}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-4, -0.7);
    s.lineTo(4, -0.7);
    s.lineTo(4, 0.7);
    s.lineTo(-4, 0.7);
    s.lineTo(-4, -0.7);
    const hueco = new THREE.Path();
    hueco.absarc(-0.9, 0, 0.5, Math.PI / 2, (3 * Math.PI) / 2, false);
    hueco.lineTo(0.9, -0.5);
    hueco.absarc(0.9, 0, 0.5, -Math.PI / 2, Math.PI / 2, false);
    hueco.lineTo(-0.9, 0.5);
    s.holes.push(hueco);
    const g = new THREE.ExtrudeGeometry(s, {depth: 1.3, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 32});
    g.translate(0, 0, -0.65);
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const u = (x + 4) / 8;
    pos.setY(i, base[i * 3 + 1] - flexion * (u * u * (3 - 2 * u)) * 0.6);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const alu = useMemo(() => new THREE.MeshStandardMaterial({color: '#C4C9CE', metalness: 0.9, roughness: 0.32, roughnessMap: texturaRuido(101, 0.4, 0.5)}), []);
  const tension = flexion * 1.6;
  const puntos: [number, number, boolean][] = [
    [-0.9, 0.62, true],
    [0.9, 0.62, false],
    [-0.9, -0.62, false],
    [0.9, -0.62, true],
  ];
  return (
    <group position={[0, 1.6, 0]}>
      <mesh geometry={geo} material={alu} castShadow receiveShadow />
      {galgas > 0.01 &&
        puntos.map(([x, y, estira], i) => {
          const u = (x + 4) / 8;
          const dy = -flexion * (u * u * (3 - 2 * u)) * 0.6;
          return (
            <mesh key={i} position={[x, y + dy + (y > 0 ? 0.06 : -0.06), 0]} rotation={[y > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.6, 0.9]} />
              <meshBasicMaterial color={tension > 0.05 ? (estira ? '#FF8A3D' : '#4F8DFF') : '#C9A44C'} toneMapped={false} />
            </mesh>
          );
        })}
      {['#C62828', '#1A1A1A', '#2E7D32', '#F2F2EE'].map((c, i) => (
        <Tubo key={c} puntos={[[-4, 0.2 - i * 0.12, 0.2], [-5, 0.3 - i * 0.15, 0.6], [-6.4, 0.1 - i * 0.2, 1.2]]} radio={0.05} material={M.color(c, 0.4)} seg={16} />
      ))}
    </group>
  );
};
export const Camion: React.FC<Anim> = () => (
  <group scale={0.6}>
    <Caja tam={[3.2, 3.4, 3.4]} pos={[5.2, 2.6, 0]} material={pintura('#C62828', 0.35)} radio={0.3} />
    <Caja tam={[8.6, 3.8, 3.6]} pos={[-1.2, 3.0, 0]} material={M.color('#D9DDE1', 0.5, 0.4)} radio={0.15} />
    {[[-4.4, 1.9], [-4.4, -1.9], [-2.2, 1.9], [-2.2, -1.9], [5.0, 1.9], [5.0, -1.9]].map(([x, z], i) => (
      <Cil key={i} r={0.95} h={0.6} pos={[x, 0.95, z]} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#151617')} seg={28} />
    ))}
  </group>
);
export const Grua: React.FC<Anim> = ({t = 0}) => (
  <group>
    <Caja tam={[0.6, 8, 0.6]} pos={[0, 4, 0]} material={pintura('#F2C230', 0.4)} />
    <Caja tam={[7, 0.5, 0.5]} pos={[1.8, 8.1, 0]} material={pintura('#F2C230', 0.4)} />
    <Caja tam={[1.4, 1.2, 1.2]} pos={[-1.6, 7.6, 0]} material={M.color('#5B6470', 0.5)} />
    <Cil r={0.03} h={3.6} pos={[4.6, 6.2, 0]} mat={M.acero()} />
    <Caja tam={[1.4, 1.0, 1.4]} pos={[4.6, 3.9 + Math.sin(t) * 0.2, 0]} material={M.color('#8D8A84', 0.8)} />
  </group>
);
export const Puente: React.FC<Anim> = () => (
  <group>
    <Caja tam={[12, 0.5, 3]} pos={[0, 3.2, 0]} material={M.color('#8D8A84', 0.8)} />
    {[-4.5, 0, 4.5].map((x) => (
      <Caja key={x} tam={[0.8, 3.0, 2.4]} pos={[x, 1.5, 0]} material={M.color('#7A776F', 0.85)} />
    ))}
    {Array.from({length: 5}, (_, i) => (
      <Caja key={i} tam={[0.3, 0.05, 0.12]} pos={[-4 + i * 2, 2.94, 1.51]} material={M.color('#C9A44C', 0.3, 1)} />
    ))}
  </group>
);
export const AlaAvion: React.FC<Anim & {flexion?: number}> = ({t = 0, a = 0, flexion}) => {
  const f = flexion ?? (a > 0.01 ? 0.6 + 0.4 * Math.sin(t * 0.6) : 0.2);
  const geo = useMemo(() => new THREE.BoxGeometry(12, 0.3, 2.4, 40, 1, 1), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3] + 6;
    pos.setY(i, base[i * 3 + 1] + f * (x / 12) ** 2 * 3.0);
    pos.setZ(i, base[i * 3 + 2] * (1 - (x / 12) * 0.5));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group position={[-4, 2.0, 0]}>
      <Cil r={1.4} h={5} pos={[-6.2, 0, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.plasticoBlanco()} />
      <mesh geometry={geo} position={[0, 0, 0]} material={M.color('#D9DDE1', 0.4, 0.5)} castShadow />
    </group>
  );
};

export const CATALOGO_S09 = {
  termistor: {C: Termistor as React.FC<Anim>, alto: 4.0},
  pt100: {C: SondaPt100, alto: 2.0},
  termopar: {C: Termopar as React.FC<Anim>, alto: 3.4},
  ds18b20: {C: DS18B20, alto: 2.4},
  pistola: {C: PistolaIR, alto: 3.6},
  hervidor: {C: Hervidor, alto: 4.2},
  estufagas: {C: EstufaGas, alto: 1.8},
  eiffel: {C: TorreEiffel, alto: 8.6, escala: 0.7},
  caseta: {C: Caseta, alto: 5.8, escala: 0.85},
  galileo: {C: TermometroGalileo, alto: 7.2, escala: 0.75},
  bascula: {C: BasculaBano as React.FC<Anim>, alto: 0.8},
  celda: {C: CeldaCarga as React.FC<Anim>, alto: 2.4, escala: 0.55},
  camion: {C: Camion, alto: 3.4},
  grua: {C: Grua, alto: 8.4, escala: 0.75},
  puente: {C: Puente, alto: 3.6, escala: 0.7},
  ala: {C: AlaAvion as React.FC<Anim>, alto: 4.0, escala: 0.55},
};
