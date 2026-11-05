// Objetos 3D para el S07 (ultrasonido) y el avance del S08 (tiempo de vuelo / LiDAR).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar, texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ módulo HC-SR04 (dos "ojos")
export const HCSR04: React.FC<Anim & {corte?: number; pulso?: number}> = ({t = 0, a = 0, corte = 0, pulso = 0}) => {
  const malla = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#B9BEC4';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#2B2E33';
    for (let y = 4; y < 128; y += 9) for (let x = (y / 9) % 2 ? 8 : 4; x < 128; x += 9) {
      g.beginPath();
      g.arc(x, y, 2.6, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({map: tex, metalness: 0.7, roughness: 0.4});
  }, []);
  const cuerpo = M.color('#C9CDD1', 0.32, 0.9);
  return (
    <group position={[0, 0.2, 0]}>
      <Caja tam={[4.5, 0.16, 2.0]} pos={[0, 1.0, 0]} rot={[Math.PI / 2, 0, 0]} material={M.color('#1E4FA8', 0.45)} radio={0.03} />
      {[-1.3, 1.3].map((x, i) => (
        <group key={x} position={[x, 1.0, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <Cil r={0.8} h={1.2} pos={[0, -0.6, 0]} mat={cuerpo} abierto={corte > 0.5} seg={40} />
          {corte < 0.5 && (
            <mesh position={[0, -1.21, 0]} rotation={[Math.PI / 2, 0, 0]} material={malla}>
              <circleGeometry args={[0.78, 40]} />
            </mesh>
          )}
          {corte > 0.01 && (
            <group position={[0, -0.7, 0]}>
              <Cil r={0.55} h={0.06} mat={M.color('#D9C9A3', 0.4)} />
              <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.5, 0.45, 32, 1, true]} />
                <meshStandardMaterial color="#C9A44C" side={THREE.DoubleSide} metalness={0.6} roughness={0.35} />
              </mesh>
              {i === 0 && pulso > 0.01 && <Cil r={0.56} h={0.08} pos={[0, 0.04 + Math.sin(t * 60) * 0.03 * pulso, 0]} mat={M.emisivo('#7CF0FF', 2)} />}
            </group>
          )}
        </group>
      ))}
      <TextoPlano lineas={[{t: 'T', tam: 200, color: '#FFFFFF'}]} w={0.3} h={0.3} pos={[-2.05, 1.75, 0.09]} />
      <TextoPlano lineas={[{t: 'R', tam: 200, color: '#FFFFFF'}]} w={0.3} h={0.3} pos={[2.05, 1.75, 0.09]} />
      <Caja tam={[0.6, 0.6, 0.15]} pos={[0, 0.55, -0.14]} material={M.color('#7C8085', 0.3, 0.9)} radio={0.05} />
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <Cil key={x} r={0.05} h={0.7} pos={[x, -0.15, -0.05]} mat={M.oro()} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ tanque con sensor de nivel
export const TanqueAgua: React.FC<Anim & {nivel?: number}> = ({t = 0, a = 0, nivel}) => {
  const n = nivel ?? 0.45 + 0.25 * Math.sin(t * 0.5);
  const agua = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#4FA3C7', transparent: true, opacity: 0.55, roughness: 0.05}), []);
  return (
    <group>
      <Cil r={2.2} h={5} pos={[0, 2.5, 0]} mat={M.vidrio()} abierto seg={48} />
      <Cil r={2.15} h={4.8 * n} pos={[0, 0.1 + 2.4 * n, 0]} mat={agua} seg={48} />
      <Cil r={2.3} h={0.3} pos={[0, 5.15, 0]} mat={M.color('#2B2E33', 0.5)} seg={48} />
      <group position={[0, 5.3, 0]} scale={0.35} rotation={[Math.PI / 2, 0, 0]}>
        <HCSR04 />
      </group>
      <Arcos origen={[0, 5.0, 0]} dir={0} apertura={0.5} t={t} t0={a > 0.01 ? 0 : 1e9} vel={4} n={3} cada={0.35} vida={(5 - 4.8 * n) / 4} rot={[Math.PI / 2, 0, 0]} color="#8FD3FF" />
    </group>
  );
};
export const Tuberia: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 1.4, 0]}>
    <Cil r={0.7} h={8} rot={[0, 0, Math.PI / 2]} mat={M.color('#9AA3AD', 0.35, 0.8)} />
    <Caja tam={[2.4, 1.6, 1.8]} pos={[0, 0.2, 0]} material={M.color('#1D4ED8', 0.4)} radio={0.15} />
    <TextoPlano lineas={[{t: a > 0.01 ? '12,4 L/min' : '0,0 L/min', tam: 110, color: '#7CFFB2', mono: true}]} w={1.9} h={0.5} pos={[0, 0.5, 0.92]} estilo={{fondo: '#06120C', radio: 20}} />
    {a > 0.01 && Array.from({length: 6}, (_, i) => <Esf key={i} r={0.12} pos={[((t * 2 + i * 1.3) % 8) - 4, -0.05, 0.75]} mat={M.emisivo('#8FD3FF', 1.6)} seg={8} />)}
  </group>
);
export const BarcoPesca: React.FC<Anim> = ({t = 0, a = 0}) => {
  const casco = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.6, 1.0);
    s.lineTo(3.4, 1.0);
    s.quadraticCurveTo(4.4, 0.9, 4.6, 1.4);
    s.lineTo(4.0, -0.4);
    s.quadraticCurveTo(3.4, -0.9, 2.4, -0.9);
    s.lineTo(-3.0, -0.9);
    s.quadraticCurveTo(-3.8, -0.8, -3.6, 1.0);
    const g = new THREE.ExtrudeGeometry(s, {depth: 2.2, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 2});
    g.translate(0, 0, -1.1);
    return g;
  }, []);
  return (
    <group position={[0, 1.0, 0]}>
      <mesh geometry={casco} material={pintura('#C62828', 0.4)} castShadow />
      <Caja tam={[2.0, 1.4, 1.6]} pos={[-0.6, 1.8, 0]} material={M.plasticoBlanco()} radio={0.1} />
      <Arcos origen={[0.5, -0.9, 0]} dir={0} apertura={0.8} t={t} t0={a > 0.01 ? 0 : 1e9} vel={3} n={4} cada={0.35} vida={1.0} rot={[-Math.PI / 2, 0, 0]} color="#8FD3FF" />
    </group>
  );
};
export const RobotEducativo: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0, 0]} rotation={[0, a > 0.01 ? Math.sin(t * 0.8) * 0.6 : 0, 0]}>
    {[-1.4, 1.4].map((z) => (
      <Cil key={z} r={0.8} h={0.4} pos={[0, 0.8, z]} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#1A1B1D')} />
    ))}
    <Caja tam={[3.6, 0.3, 2.4]} pos={[0, 1.2, 0]} material={M.color('#F2C230', 0.4)} radio={0.06} />
    <Caja tam={[1.6, 0.8, 1.2]} pos={[-0.8, 1.8, 0]} material={M.plasticoNegro()} radio={0.08} />
    <group position={[1.6, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.45}>
      <HCSR04 />
    </group>
  </group>
);
export const Theremin: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <Caja tam={[4.6, 1.0, 2.4]} pos={[0, 0.5, 0]} material={M.color('#5B3A1E', 0.5)} radio={0.1} />
    <group position={[0, 1.0, 0]} rotation={[0, 0, 0]} scale={0.4}>
      <HCSR04 />
    </group>
    {a > 0.01 && <Arcos origen={[0, 2.0, 0]} apertura={Math.PI * 2} t={t} t0={0} vel={2} n={4} cada={0.2 + 0.15 * Math.sin(t)} vida={0.8} color="#C88BFF" />}
  </group>
);

// ------------------------------------------------------------------ historia: iceberg y polilla
export const Iceberg: React.FC<Anim> = () => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(2.6, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = azar(17);
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(i, p.getX(i) * (0.85 + r() * 0.3), p.getY(i) * (1.2 + r() * 0.2), p.getZ(i) * (0.85 + r() * 0.3));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} position={[0, 2.4, 0]} castShadow>
        <meshPhysicalMaterial color="#E3F2FA" roughness={0.35} clearcoat={0.5} flatShading />
      </mesh>
      <Caja tam={[8, 0.1, 6]} pos={[0, 0.6, 0]} material={new THREE.MeshPhysicalMaterial({color: '#1E5A7A', transparent: true, opacity: 0.6})} />
    </group>
  );
};
export const Polilla: React.FC<Anim> = ({t = 0, a = 0}) => {
  const ala = useMemo(() => new THREE.MeshStandardMaterial({color: '#8C7A5E', roughness: 0.9, side: THREE.DoubleSide, map: null}), []);
  const bat = Math.sin(t * 22) * 0.5;
  return (
    <group position={[0, 2.6 + (a > 0.01 ? -Math.max(0, Math.sin(t * 1.5)) * 1.5 : 0), 0]}>
      <Cap r={0.25} largo={1.2} rot={[0, 0, Math.PI / 2]} mat={M.color('#5E5242', 0.8)} />
      {[-1, 1].map((s) => (
        <group key={s} rotation={[s * bat, 0, 0]}>
          <mesh position={[0.1, 0, s * 1.1]} rotation={[-Math.PI / 2, 0, s * 0.2]} material={ala}>
            <circleGeometry args={[1.1, 24]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Tubo key={`a${s}`} puntos={[[0.7, 0.1, s * 0.1], [1.2, 0.5, s * 0.35], [1.5, 0.7, s * 0.6]]} radio={0.025} material={M.color('#5E5242', 0.8)} seg={10} />
      ))}
    </group>
  );
};
/** Persona que chasquea la lengua para ecolocalizar. */
export const Chasquido: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <Arcos origen={[0, 6.5, 0.6]} dir={0} apertura={1.4} t={t % 1.2} t0={a > 0.01 ? 0 : 1e9} vel={4} n={2} cada={0.15} vida={1.0} color="#FFD27A" />
  </group>
);

// ------------------------------------------------------------------ límites: espuma, rampa, cable
export const Espuma: React.FC<Anim> = () => (
  <group position={[0, 0, 0]}>
    {Array.from({length: 25}, (_, i) => (
      <mesh key={i} position={[-2 + (i % 5) * 1.0, 2.2, -2 + Math.floor(i / 5) * 1.0]}>
        <coneGeometry args={[0.5, 1.2, 4]} />
        <meshStandardMaterial color="#3A3D42" roughness={1} />
      </mesh>
    ))}
    <Caja tam={[5.2, 1.6, 5.2]} pos={[0, 0.8, 0]} material={M.color('#2B2E33', 1)} />
  </group>
);
export const Rampa: React.FC<Anim> = () => (
  <group position={[0, 2.0, 0]} rotation={[0, 0, 0.6]}>
    <Caja tam={[5, 0.3, 3.6]} material={M.color('#8D8A84', 0.8)} radio={0.05} />
  </group>
);

// ------------------------------------------------------------------ S08: aspiradora robot con LiDAR y celular con LiDAR
export const Aspiradora: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0.2, 0]}>
    <Cil r={2.6} h={0.8} pos={[0, 0.5, 0]} mat={M.color('#F2F2EE', 0.35)} seg={64} />
    <Cil r={2.62} h={0.12} pos={[0, 0.85, 0]} mat={M.color('#2B2E33', 0.4)} seg={64} />
    <group position={[0.6, 1.1, 0]} rotation={[0, a > 0.01 ? t * 6 : 0, 0]}>
      <Cil r={0.7} h={0.5} mat={M.color('#2B2E33', 0.3)} seg={32} />
      <Caja tam={[0.3, 0.2, 0.3]} pos={[0.55, 0.05, 0]} material={M.color('#0E1A2B', 0.05, 0.4)} />
    </group>
    {a > 0.01 && (
      <mesh position={[0.6, 1.15, 0]} rotation={[-Math.PI / 2, 0, -t * 6]}>
        <ringGeometry args={[0.9, 9, 48, 1, 0, 0.05]} />
        <meshBasicMaterial color="#FF3B30" transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    )}
  </group>
);
export const CelularLidar: React.FC<Anim> = () => (
  <group position={[0, 0.2, 0]} rotation={[0, 0.4, 0]}>
    <Caja tam={[3.0, 0.32, 6.2]} material={M.color('#5B636B', 0.3, 0.9)} radio={0.15} />
    <Caja tam={[1.5, 0.14, 1.5]} pos={[-0.55, 0.2, -2.1]} material={M.color('#4A5058', 0.25, 0.9)} radio={0.2} />
    {[[-0.9, -2.45], [-0.2, -2.45], [-0.9, -1.75]].map(([x, z], i) => (
      <Cil key={i} r={0.24} h={0.08} pos={[x, 0.3, z]} mat={M.color('#0B0C0E', 0.05, 0.5)} />
    ))}
    <Cil r={0.12} h={0.08} pos={[-0.2, 0.3, -1.75]} mat={M.color('#1B1B1D', 0.2)} />
  </group>
);

export const CATALOGO_S07 = {
  hcsr04: {C: HCSR04 as React.FC<Anim>, alto: 2.0, escala: 1.4},
  tanque: {C: TanqueAgua as React.FC<Anim>, alto: 5.6},
  tuberia: {C: Tuberia, alto: 2.6},
  barco: {C: BarcoPesca, alto: 3.4},
  roboteduc: {C: RobotEducativo, alto: 2.4},
  theremin: {C: Theremin, alto: 2.2},
  iceberg: {C: Iceberg, alto: 5.0},
  polilla: {C: Polilla, alto: 3.2},
  espuma: {C: Espuma, alto: 3.0},
  rampa: {C: Rampa, alto: 3.6},
  aspiradora: {C: Aspiradora, alto: 1.6},
  celularLidar: {C: CelularLidar, alto: 0.8},
};
