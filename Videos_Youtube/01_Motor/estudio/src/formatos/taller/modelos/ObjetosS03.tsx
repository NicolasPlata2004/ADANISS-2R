// Objetos 3D para el S03 (sensor PIR) y el avance del S04 (efecto Hall).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {SensorPIR} from './ObjetosS02';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ paleta térmica (0 frío → 1 caliente)
export const colorTermico = (v: number) => {
  const c = new THREE.Color();
  const paradas: [number, string][] = [
    [0, '#0B0B3B'],
    [0.25, '#3F1A8C'],
    [0.5, '#C2185B'],
    [0.7, '#F57C00'],
    [0.88, '#FFD54F'],
    [1, '#FFFFF0'],
  ];
  for (let i = 1; i < paradas.length; i++) {
    if (v <= paradas[i][0]) {
      const [a, ca] = paradas[i - 1];
      const [b, cb] = paradas[i];
      return c.set(ca).lerp(new THREE.Color(cb), (v - a) / (b - a));
    }
  }
  return c.set('#FFFFF0');
};
const cacheTerm = new Map<number, THREE.Material>();
export const matTermico = (v: number) => {
  const k = Math.round(v * 40) / 40;
  if (!cacheTerm.has(k)) cacheTerm.set(k, new THREE.MeshBasicMaterial({color: colorTermico(k), toneMapped: false}));
  return cacheTerm.get(k)!;
};

// ------------------------------------------------------------------ persona (maniquí) con pose y vista térmica
export const Persona: React.FC<{paso?: number; brazo?: number; termico?: number; ondea?: number; t?: number}> = ({paso = 0, brazo = 0, termico = 0, ondea = 0, t = 0}) => {
  const base = useMemo(() => new THREE.MeshStandardMaterial({color: '#CFCBC4', roughness: 0.55}), []);
  const term = termico > 0.5;
  const m = (v: number) => (term ? matTermico(v) : base);
  const piernaA = Math.sin(paso) * 0.45;
  const piernaB = -piernaA;
  const ola = ondea > 0 ? Math.sin(t * 10) * 0.5 * ondea : 0;
  const brazoD = -(brazo * 2.6 + ola);
  return (
    <group>
      {/* piernas */}
      {[[-0.38, piernaA], [0.38, piernaB]].map(([x, a], i) => (
        <group key={i} position={[x, 3.3, 0]} rotation={[a, 0, 0]}>
          <Cap r={0.3} largo={1.3} pos={[0, -0.85, 0]} mat={m(0.72)} />
          <group position={[0, -1.7, 0]} rotation={[Math.max(0, -a) * 0.8, 0, 0]}>
            <Cap r={0.25} largo={1.2} pos={[0, -0.8, 0]} mat={m(0.62)} />
            <Caja tam={[0.42, 0.25, 0.9]} pos={[0, -1.55, 0.22]} material={m(0.5)} radio={0.1} />
          </group>
        </group>
      ))}
      <Cap r={0.62} largo={0.5} pos={[0, 3.55, 0]} rot={[0, 0, Math.PI / 2]} mat={m(0.85)} />
      <Cap r={0.72} largo={1.5} pos={[0, 4.75, 0]} mat={m(0.93)} />
      <Cil r={0.2} h={0.5} pos={[0, 5.95, 0]} mat={m(0.9)} />
      <Esf r={0.52} pos={[0, 6.55, 0.02]} esc={[0.92, 1.1, 1]} mat={m(1)} />
      {/* brazo izquierdo (quieto) */}
      <group position={[-0.95, 5.45, 0]} rotation={[-Math.sin(paso) * 0.35, 0, 0.12]}>
        <Cap r={0.22} largo={1.0} pos={[0, -0.7, 0]} mat={m(0.7)} />
        <Cap r={0.19} largo={0.9} pos={[0, -1.75, 0.08]} mat={m(0.6)} />
      </group>
      {/* brazo derecho (puede levantarse y saludar) */}
      <group position={[0.95, 5.45, 0]} rotation={[Math.sin(paso) * 0.35, 0, -0.12 + brazoD * 0.0]}>
        <group rotation={[0, 0, brazoD > -0.01 ? 0 : brazoD]}>
          <Cap r={0.22} largo={1.0} pos={[0, -0.7, 0]} mat={m(0.7)} />
          <Cap r={0.19} largo={0.9} pos={[0, -1.75, 0.08]} mat={m(0.6)} />
        </group>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ baño con luz automática
const texturaBaldosa = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#E9E6E0';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#BDB8AF';
  g.lineWidth = 6;
  for (let i = 0; i <= 4; i++) {
    g.beginPath();
    g.moveTo(i * 128, 0);
    g.lineTo(i * 128, 512);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i * 128);
    g.lineTo(512, i * 128);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
export const Bano: React.FC<{luz: number; termico?: number}> = ({luz, termico = 0}) => {
  const baldosa = useMemo(() => new THREE.MeshStandardMaterial({map: texturaBaldosa(), roughness: 0.35}), []);
  const pared = useMemo(() => new THREE.MeshStandardMaterial({color: '#D8D2C6', roughness: 0.8}), []);
  const term = termico > 0.5;
  const frio = matTermico(0.18);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={term ? frio : baldosa} receiveShadow>
        <planeGeometry args={[16, 12]} />
      </mesh>
      <mesh position={[0, 5, -6]} material={term ? frio : pared} receiveShadow>
        <planeGeometry args={[16, 10]} />
      </mesh>
      <mesh position={[-8, 5, 0]} rotation={[0, Math.PI / 2, 0]} material={term ? frio : pared} receiveShadow>
        <planeGeometry args={[12, 10]} />
      </mesh>
      {/* lavamanos y espejo */}
      <Caja tam={[3.2, 0.5, 1.8]} pos={[2.5, 3.2, -5.1]} material={term ? matTermico(0.2) : M.plasticoBlanco()} radio={0.2} />
      <Caja tam={[0.8, 3.0, 0.8]} pos={[2.5, 1.5, -5.4]} material={term ? matTermico(0.2) : M.plasticoBlanco()} radio={0.1} />
      <Caja tam={[3.0, 3.0, 0.08]} pos={[2.5, 6.0, -5.95]} material={term ? matTermico(0.16) : M.color('#C9D6DD', 0.05, 0.9)} />
      {/* lámpara de pared y sensor en la esquina */}
      <Caja tam={[2.4, 0.4, 0.4]} pos={[2.5, 8.0, -5.8]} material={term ? matTermico(0.3 + 0.2 * luz) : M.emisivo('#FFF1D6', Math.round((0.15 + luz * 3) * 10) / 10)} radio={0.1} />
      {luz > 0.02 && !term && <pointLight position={[2.5, 7.4, -4.8]} intensity={luz * 160} distance={26} color="#FFE8C4" />}
      <group position={[-7.3, 8.8, -5.3]} rotation={[0.9, 0.6, 0]} scale={0.6}>
        <SensorPIR />
      </group>
      {/* puerta */}
      <Caja tam={[0.25, 7.2, 3.4]} pos={[-7.85, 3.6, 2.4]} material={term ? matTermico(0.17) : M.color('#8B5A2B', 0.5)} />
    </group>
  );
};

// ------------------------------------------------------------------ usos del PIR
export const AlarmaPIR: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 3, 0]} rotation={[0.35, 0, 0]}>
    <Caja tam={[2.4, 3.4, 1.6]} material={M.plasticoBlanco()} radio={0.35} />
    <Caja tam={[1.6, 1.2, 0.4]} pos={[0, 0.3, 0.75]} material={M.color('#EDEBE6', 0.6)} radio={0.25} />
    <Esf r={0.09} pos={[0.8, -1.2, 0.8]} mat={M.emisivo('#FF3B30', a > 0.01 && Math.sin(t * 8) > 0 ? 3 : 0.3)} seg={12} />
  </group>
);
export const CamaraBateria: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 2.2, 0]} rotation={[0, -0.3, 0]}>
    <Caja tam={[2.6, 2.2, 2.2]} material={M.plasticoBlanco()} radio={0.6} />
    <Cil r={0.65} h={0.3} pos={[0, 0.2, 1.1]} rot={[Math.PI / 2, 0, 0]} mat={M.plasticoNegro()} />
    <Esf r={0.38} pos={[0, 0.2, 1.22]} esc={[1, 1, 0.5]} mat={M.color('#0E1A2B', 0.05, 0.3)} />
    <Esf r={0.3} pos={[0, -0.6, 1.02]} esc={[1, 1, 0.4]} mat={M.color('#F3F1EA', 0.55)} />
    <Esf r={0.07} pos={[0.8, 0.8, 1.0]} mat={M.emisivo('#34D399', a > 0.01 ? 3 : 0.2)} seg={10} />
    <Cil r={0.3} h={1.6} pos={[0, -1.8, -0.4]} mat={M.plasticoBlanco()} />
  </group>
);
export const Reflector: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 2.5, 0]}>
    <Caja tam={[3.4, 2.2, 0.8]} rot={[0.5, 0, 0]} material={M.color('#2B2E33', 0.4, 0.5)} radio={0.15} />
    <mesh position={[0, 0.15, 0.42]} rotation={[0.5, 0, 0]}>
      <planeGeometry args={[3.0, 1.8]} />
      <meshBasicMaterial color={a > 0.01 ? '#FFF6DE' : '#3A3D42'} toneMapped={false} />
    </mesh>
    <group position={[0, -1.6, 0.2]} scale={0.45}>
      <SensorPIR />
    </group>
    {a > 0.01 && <pointLight position={[0, 0.5, 1.5]} intensity={30 * a} distance={12} color="#FFF3D6" />}
  </group>
);
export const Termostato: React.FC<Anim> = () => (
  <group position={[0, 2.4, 0]} rotation={[-0.1, 0, 0]}>
    <Cil r={1.7} h={0.6} rot={[Math.PI / 2, 0, 0]} mat={M.color('#C9CDD1', 0.3, 0.9)} seg={64} />
    <Cil r={1.45} h={0.62} rot={[Math.PI / 2, 0, 0]} mat={M.color('#0B0C0E', 0.1, 0.3)} seg={64} />
    <TextoPlano lineas={[{t: '21°', tam: 260, color: '#FFB547'}]} w={1.6} h={1.0} pos={[0, 0, 0.33]} />
  </group>
);

// ------------------------------------------------------------------ límites: ventana, termómetro, perro
export const Ventana: React.FC<Anim> = () => (
  <group position={[0, 3, 0]}>
    <Caja tam={[4.6, 0.3, 0.4]} pos={[0, 2.2, 0]} material={M.color('#F3F1EA', 0.5)} />
    <Caja tam={[4.6, 0.3, 0.4]} pos={[0, -2.2, 0]} material={M.color('#F3F1EA', 0.5)} />
    <Caja tam={[0.3, 4.7, 0.4]} pos={[-2.15, 0, 0]} material={M.color('#F3F1EA', 0.5)} />
    <Caja tam={[0.3, 4.7, 0.4]} pos={[2.15, 0, 0]} material={M.color('#F3F1EA', 0.5)} />
    <Caja tam={[4.0, 4.1, 0.06]} material={M.vidrio()} />
  </group>
);
export const Termometro: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 0.2, 0]}>
    <Caja tam={[1.4, 6.0, 0.25]} pos={[0, 3.2, -0.2]} material={M.color('#F3F1EA', 0.5)} radio={0.15} />
    <Cil r={0.16} h={4.8} pos={[0, 3.6, 0.05]} mat={M.vidrio()} />
    <Esf r={0.38} pos={[0, 1.0, 0.05]} mat={M.emisivo('#E5484D', 1.2)} seg={20} />
    <Cil r={0.09} h={1.2 + 3.2 * (0.6 + 0.4 * a)} pos={[0, 1.2 + (1.2 + 3.2 * (0.6 + 0.4 * a)) / 2, 0.05]} mat={M.emisivo('#E5484D', 1.2)} />
  </group>
);
export const Perro: React.FC<Anim & {termico?: number; t?: number}> = ({termico = 0, t = 0}) => {
  const pelo = useMemo(() => new THREE.MeshStandardMaterial({color: '#B07A47', roughness: 0.9, roughnessMap: texturaRuido(71, 0.4, 0.8)}), []);
  const m = termico > 0.5 ? matTermico(0.9) : pelo;
  const p = Math.sin(t * 6) * 0.35;
  return (
    <group position={[0, 0, 0]} scale={0.9}>
      <Cap r={0.75} largo={2.6} pos={[0, 2.3, 0]} rot={[0, 0, Math.PI / 2]} mat={m} />
      {[[-1.1, 0.4, p], [-1.1, -0.4, -p], [1.1, 0.4, -p], [1.1, -0.4, p]].map(([x, z, a], i) => (
        <group key={i} position={[x, 1.9, z]} rotation={[0, 0, a]}>
          <Cap r={0.22} largo={1.2} pos={[0, -0.8, 0]} mat={m} />
        </group>
      ))}
      <Esf r={0.62} pos={[2.1, 3.2, 0]} mat={m} />
      <Cap r={0.3} largo={0.6} pos={[2.7, 3.0, 0]} rot={[0, 0, Math.PI / 2]} mat={m} />
      <Cap r={0.18} largo={0.6} pos={[1.95, 3.85, 0.38]} rot={[0.4, 0, 0.3]} mat={m} />
      <Cap r={0.18} largo={0.6} pos={[1.95, 3.85, -0.38]} rot={[-0.4, 0, 0.3]} mat={m} />
      <Cap r={0.12} largo={1.1} pos={[-2.05, 3.0, 0]} rot={[0, 0, -0.9 + Math.sin(t * 9) * 0.3]} mat={m} />
    </group>
  );
};

// ------------------------------------------------------------------ datos: turmalina, serpiente
export const Turmalina: React.FC<Anim & {ceniza?: number}> = ({t = 0, ceniza = 0}) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#2E8B57', roughness: 0.12, transparent: true, opacity: 0.85, clearcoat: 1}), []);
  const punta = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#E0607E', roughness: 0.12, transparent: true, opacity: 0.85, clearcoat: 1}), []);
  return (
    <group position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2 - 0.1]}>
      <mesh material={mat} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 3.8, 3]} />
      </mesh>
      <mesh position={[0, 2.35, 0]} material={punta} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.9, 3]} />
      </mesh>
      {ceniza > 0.01 &&
        Array.from({length: 26}, (_, i) => {
          const a = (i * 2.399) % (Math.PI * 2);
          const r = 2.2 - 1.2 * ceniza + Math.sin(i + t) * 0.1;
          return <Esf key={i} r={0.07} pos={[((i % 9) - 4) * 0.42, Math.cos(a) * r, Math.sin(a) * r]} mat={M.color('#8A8580', 0.9)} seg={6} />;
        })}
    </group>
  );
};
export const Serpiente: React.FC<Anim & {termico?: number}> = ({t = 0, a = 0}) => {
  const escamas = useMemo(() => new THREE.MeshStandardMaterial({color: '#8C7A4B', roughness: 0.55, roughnessMap: texturaRuido(83, 0.5, 0.6)}), []);
  const pts: V3[] = useMemo(() => Array.from({length: 14}, (_, i) => [Math.sin(i * 0.9) * 1.4 - 2, 0.45, -3 + i * 0.42] as V3), []);
  return (
    <group>
      <Tubo puntos={pts} radio={0.42} material={escamas} seg={120} />
      <group position={[pts[13][0] + 0.2, 0.75, pts[13][2] + 0.6]} rotation={[0.25, 0.3, 0]}>
        <Esf r={0.62} esc={[1, 0.7, 1.4]} mat={escamas} />
        {[-0.38, 0.38].map((x) => (
          <group key={x}>
            <Esf r={0.1} pos={[x, 0.12, 0.6]} mat={M.color('#0A0A0A', 0.1)} seg={10} />
            <Esf r={0.08} pos={[x * 0.9, -0.02, 0.85]} mat={M.emisivo('#FF7A2A', a > 0.01 ? 2.5 + Math.sin(t * 6) : 0.4)} seg={10} />
          </group>
        ))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ S04: control de videojuegos, sensor Hall e imán
export const Control: React.FC<Anim & {inclina?: number}> = ({inclina = 0}) => {
  const cuerpo = pintura('#2B2F36', 0.35);
  return (
    <group position={[0, 0.9, 0]}>
      <Caja tam={[5.6, 1.1, 3.2]} material={cuerpo} radio={0.5} />
      <Cap r={0.95} largo={1.4} pos={[-2.2, -0.15, 1.0]} rot={[Math.PI / 2 - 0.3, 0, 0.35]} mat={cuerpo} />
      <Cap r={0.95} largo={1.4} pos={[2.2, -0.15, 1.0]} rot={[Math.PI / 2 - 0.3, 0, -0.35]} mat={cuerpo} />
      {[[-1.35, -0.45], [0.8, 0.55]].map(([x, z], i) => (
        <group key={i} position={[x, 0.6, z]}>
          <Cil r={0.55} h={0.18} mat={M.color('#15171A', 0.6)} />
          <group rotation={[i === 0 ? inclina * 0.35 : 0, 0, i === 0 ? -inclina * 0.35 : 0]}>
            <Cil r={0.16} h={0.5} pos={[0, 0.3, 0]} mat={M.color('#15171A', 0.6)} />
            <Cil r={0.42} h={0.18} pos={[0, 0.6, 0]} mat={M.goma('#2A2D31')} />
          </group>
        </group>
      ))}
      {[[1.6, -0.55], [2.1, -0.95], [2.1, -0.15], [2.6, -0.55]].map(([x, z], i) => (
        <Cil key={i} r={0.2} h={0.16} pos={[x, 0.6, z]} mat={M.color(['#34D399', '#E5484D', '#3B82F6', '#FFB547'][i], 0.3)} />
      ))}
      <Caja tam={[0.9, 0.12, 0.9]} pos={[-1.5, 0.58, 0.55]} material={M.color('#15171A', 0.5)} radio={0.1} />
    </group>
  );
};
export const SensorHall: React.FC<Anim & {codigo?: string}> = ({codigo = '3144'}) => (
  <group position={[0, 0.2, 0]} scale={1.6}>
    <Caja tam={[1.4, 1.5, 0.55]} pos={[0, 2.25, 0]} material={M.plasticoNegro()} radio={0.08} />
    {[-0.45, 0, 0.45].map((x) => (
      <Caja key={x} tam={[0.12, 1.5, 0.06]} pos={[x, 0.75, 0]} material={M.estano()} />
    ))}
    <TextoPlano lineas={[{t: codigo, tam: 120, color: '#C9CDD1', peso: 600}]} w={1.0} h={0.35} pos={[0, 2.35, 0.29]} />
  </group>
);
export const Iman: React.FC<Anim> = () => (
  <group position={[0, 1.2, 0]} rotation={[0, 0.3, 0]}>
    <Caja tam={[1.6, 1.6, 1.6]} pos={[-0.8, 0, 0]} material={pintura('#C62828', 0.4)} radio={0.08} />
    <Caja tam={[1.6, 1.6, 1.6]} pos={[0.8, 0, 0]} material={pintura('#1E4FD8', 0.4)} radio={0.08} />
    <TextoPlano lineas={[{t: 'N', tam: 300}]} w={0.9} h={0.9} pos={[-0.8, 0, 0.81]} />
    <TextoPlano lineas={[{t: 'S', tam: 300}]} w={0.9} h={0.9} pos={[0.8, 0, 0.81]} />
  </group>
);

export const CATALOGO_S03 = {
  persona: {C: Persona as React.FC<Anim>, alto: 7.2, escala: 0.8},
  alarma: {C: AlarmaPIR, alto: 4.8},
  camara: {C: CamaraBateria, alto: 3.4},
  reflector: {C: Reflector, alto: 3.8},
  termostato: {C: Termostato, alto: 4.2},
  ventana: {C: Ventana, alto: 5.4},
  termometro: {C: Termometro, alto: 6.3},
  perro: {C: Perro as React.FC<Anim>, alto: 4.0},
  turmalina: {C: Turmalina as React.FC<Anim>, alto: 2.2},
  serpiente: {C: Serpiente as React.FC<Anim>, alto: 1.6},
  control: {C: Control as React.FC<Anim>, alto: 2.2},
  hall: {C: SensorHall, alto: 4.4},
  iman: {C: Iman, alto: 2.2},
};
