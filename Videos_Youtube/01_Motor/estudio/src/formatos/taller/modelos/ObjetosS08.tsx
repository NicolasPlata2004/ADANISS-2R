// Objetos 3D para el S08 (tiempo de vuelo y LiDAR) y el avance del S09 (temperatura).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar, texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ módulo VL53L0X (sensor de tiempo de vuelo)
export const VL53L0X: React.FC<Anim & {laser?: number}> = ({laser = 0}) => (
  <group>
    <Caja tam={[2.2, 0.14, 1.8]} pos={[0, 0.07, 0]} material={M.color('#5B2A86', 0.45)} radio={0.03} />
    <Caja tam={[0.6, 0.18, 0.32]} pos={[0, 0.23, 0.2]} material={M.plasticoNegro()} radio={0.02} />
    <Cil r={0.06} h={0.02} pos={[-0.13, 0.33, 0.2]} mat={M.emisivo('#FF3B30', laser > 0.01 ? 2.5 : 0.1)} seg={12} />
    <Cil r={0.06} h={0.02} pos={[0.13, 0.33, 0.2]} mat={M.color('#141518', 0.05)} seg={12} />
    {Array.from({length: 6}, (_, i) => (
      <Cil key={i} r={0.04} h={0.4} pos={[-0.62 + i * 0.25, -0.14, -0.7]} mat={M.oro()} />
    ))}
    <TextoPlano lineas={[{t: 'VL53L0X', tam: 90, color: '#E8EAED', peso: 600}]} w={1.1} h={0.25} pos={[0, 0.15, -0.45]} rot={[-Math.PI / 2, 0, 0]} />
  </group>
);

// ------------------------------------------------------------------ carro con LiDAR giratorio en el techo
export const CarroLidar: React.FC<Anim> = ({t = 0, a = 0}) => {
  const pint = pintura('#F2F2EE', 0.3);
  return (
    <group scale={0.62}>
      <Caja tam={[8.0, 1.6, 3.6]} pos={[0, 1.4, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.2, 1.4, 3.2]} pos={[-0.6, 2.8, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.0, 1.1, 3.25]} pos={[-0.6, 2.85, 0]} material={M.color('#0E1A2B', 0.05, 0.4)} radio={0.3} />
      {[[-2.6, 1.8], [-2.6, -1.8], [2.4, 1.8], [2.4, -1.8]].map(([x, z], i) => (
        <Cil key={i} r={0.75} h={0.5} pos={[x, 0.75, z]} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#151617')} seg={28} />
      ))}
      <Cil r={0.7} h={0.3} pos={[-0.6, 3.65, 0]} mat={M.color('#1E2024', 0.4)} />
      <group position={[-0.6, 4.2, 0]} rotation={[0, a > 0.01 ? t * 8 : 0, 0]}>
        <Cil r={0.6} h={0.8} mat={M.color('#2B2E33', 0.25, 0.5)} seg={32} />
        <Caja tam={[0.5, 0.4, 0.2]} pos={[0, 0, 0.55]} material={M.color('#0E1A2B', 0.05, 0.4)} />
      </group>
      {a > 0.01 && (
        <mesh position={[-0.6, 4.2, 0]} rotation={[-Math.PI / 2, 0, -t * 8]}>
          <ringGeometry args={[0.8, 14, 64, 1, 0, 0.06]} />
          <meshBasicMaterial color="#FF3B30" transparent opacity={0.45} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

/** Barra de profundidad tipo Kinect (cámara de tiempo de vuelo). */
export const BarraKinect: React.FC<Anim> = () => (
  <group position={[0, 1.2, 0]}>
    <Caja tam={[6.0, 1.2, 1.4]} material={pintura('#1B1C1E', 0.35)} radio={0.5} />
    <Cil r={0.32} h={0.1} pos={[-1.2, 0, 0.71]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#0B0C0E', 0.05, 0.5)} />
    <Caja tam={[1.2, 0.5, 0.06]} pos={[0.6, 0, 0.72]} material={M.color('#2A0B0B', 0.1)} radio={0.1} />
    <Caja tam={[1.6, 0.4, 1.0]} pos={[0, -0.85, 0]} material={pintura('#1B1C1E', 0.35)} radio={0.1} />
  </group>
);

/** Selva vista desde arriba con una pirámide escondida bajo los árboles. */
export const SelvaPiramide: React.FC<Anim & {revela?: number}> = ({revela = 0}) => {
  const arboles = useMemo(() => {
    const r = azar(63);
    return Array.from({length: 70}, () => [(r() - 0.5) * 11, (r() - 0.5) * 8, 0.8 + r() * 0.6] as V3);
  }, []);
  return (
    <group>
      <Caja tam={[12, 0.3, 9]} pos={[0, 0.15, 0]} material={M.color('#4B3A28', 0.9)} />
      <group position={[0.5, 0.3, 0.2]}>
        {[0, 1, 2, 3].map((i) => (
          <Caja key={i} tam={[4.2 - i * 0.9, 0.55, 4.2 - i * 0.9]} pos={[0, 0.28 + i * 0.55, 0]} material={M.color('#B7A383', 0.85)} />
        ))}
        <Caja tam={[0.9, 0.7, 0.9]} pos={[0, 2.6, 0]} material={M.color('#B7A383', 0.85)} />
      </group>
      {revela < 0.99 &&
        arboles.map(([x, z, h], i) => (
          <group key={i} position={[x, 0.3, z]} scale={1 - revela}>
            <Cil r={0.1} h={h * 1.5} pos={[0, h * 0.75, 0]} mat={M.color('#4A3A22', 0.8)} seg={6} />
            <Esf r={h * 0.75} pos={[0, h * 1.6, 0]} mat={M.color(i % 3 ? '#2E6B32' : '#3E8A3A', 0.85)} seg={10} />
          </group>
        ))}
    </group>
  );
};

/** La Luna con el panel de reflectores del Apolo 11. */
export const LunaReflector: React.FC<Anim> = ({t = 0}) => {
  const tex = useMemo(() => texturaRuido(77, 0.7, 0.55), []);
  return (
    <group>
      <mesh position={[0, 3.2, 0]} rotation={[0, t * 0.05, 0]}>
        <sphereGeometry args={[3.0, 64, 48]} />
        <meshStandardMaterial color="#BDBAB3" roughness={0.95} roughnessMap={tex} bumpMap={tex} bumpScale={0.05} />
      </mesh>
      <group position={[0, 6.15, 0.6]} rotation={[-0.2, 0, 0]}>
        <Caja tam={[1.4, 0.12, 1.0]} material={M.color('#8E8A80', 0.5, 0.6)} />
        {Array.from({length: 20}, (_, i) => (
          <Cil key={i} r={0.09} h={0.06} pos={[-0.55 + (i % 5) * 0.27, 0.08, -0.36 + Math.floor(i / 5) * 0.24]} mat={M.color('#DDEBF2', 0.05, 1)} seg={10} />
        ))}
      </group>
    </group>
  );
};

/** Proyector de puntos (desbloqueo facial): una cabeza con la cuadrícula infrarroja. */
export const CaraPuntos: React.FC<Anim> = () => {
  const puntos = useMemo(() => {
    const out: V3[] = [];
    for (let i = 0; i < 260; i++) {
      const u = (i * 0.618) % 1;
      const v = (i * 0.137) % 1;
      const ang = -1.2 + u * 2.4;
      const el = -0.9 + v * 1.8;
      out.push([Math.sin(ang) * Math.cos(el) * 1.62, 3.4 + Math.sin(el) * 1.95, Math.cos(ang) * Math.cos(el) * 1.62]);
    }
    return out;
  }, []);
  return (
    <group>
      <Esf r={1.6} pos={[0, 3.4, 0]} esc={[1, 1.22, 1]} mat={M.color('#CFCBC4', 0.55)} seg={40} />
      <Cil r={0.6} h={1.2} pos={[0, 1.6, 0]} mat={M.color('#CFCBC4', 0.55)} />
      {puntos.map((p, i) => (
        <Esf key={i} r={0.035} pos={p} mat={M.emisivo('#FF3B30', 2.4)} seg={4} />
      ))}
    </group>
  );
};

/** Contador de personas en una puerta. */
export const PuertaContador: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group>
    <Caja tam={[0.4, 6, 0.6]} pos={[-2, 3, 0]} material={M.color('#5E3B1E', 0.5)} />
    <Caja tam={[0.4, 6, 0.6]} pos={[2, 3, 0]} material={M.color('#5E3B1E', 0.5)} />
    <Caja tam={[4.4, 0.4, 0.6]} pos={[0, 6.2, 0]} material={M.color('#5E3B1E', 0.5)} />
    <group position={[0, 5.98, 0.1]} rotation={[Math.PI, 0, 0]} scale={0.8}>
      <VL53L0X laser={1} />
    </group>
    {a > 0.01 && (
      <mesh position={[0, 3, 0.1]}>
        <cylinderGeometry args={[0.05, 0.5, 5.8, 16, 1, true]} />
        <meshBasicMaterial color="#FF3B30" transparent opacity={0.15} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    )}
    <TextoPlano lineas={[{t: `personas: ${a > 0.01 ? 17 + Math.floor(t * 0.8) : 17}`, tam: 110, color: '#7CFFB2', mono: true}]} w={3.4} h={0.8} pos={[0, 7.2, 0]} estilo={{fondo: '#0B0F14', radio: 30}} />
  </group>
);

// ------------------------------------------------------------------ S09: mesa de metal y mesa de madera (avance)
export const MesasMetalMadera: React.FC<Anim> = () => {
  const madera = useMemo(() => new THREE.MeshStandardMaterial({color: '#9C6B3F', roughness: 0.6, roughnessMap: texturaRuido(5, 0.4, 0.6)}), []);
  return (
    <group>
      <group position={[-2.2, 0, 0]}>
        <Caja tam={[3.6, 0.25, 2.6]} pos={[0, 2.6, 0]} material={M.color('#C9CDD1', 0.25, 1)} radio={0.05} />
        {[[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]].map(([x, z], i) => (
          <Cil key={i} r={0.08} h={2.5} pos={[x, 1.25, z]} mat={M.aceroMate()} />
        ))}
      </group>
      <group position={[2.2, 0, 0]}>
        <Caja tam={[3.6, 0.35, 2.6]} pos={[0, 2.6, 0]} material={madera} radio={0.05} />
        {[[-1.5, -1.0], [1.5, -1.0], [-1.5, 1.0], [1.5, 1.0]].map(([x, z], i) => (
          <Caja key={i} tam={[0.25, 2.5, 0.25]} pos={[x, 1.25, z]} material={madera} />
        ))}
      </group>
    </group>
  );
};

export const CATALOGO_S08 = {
  vl53: {C: VL53L0X as React.FC<Anim>, alto: 0.6, escala: 2.4},
  carroLidar: {C: CarroLidar, alto: 3.2},
  kinect: {C: BarraKinect, alto: 2.2},
  selva: {C: SelvaPiramide as React.FC<Anim>, alto: 2.8, escala: 0.6},
  luna: {C: LunaReflector, alto: 6.4, escala: 0.8},
  cara: {C: CaraPuntos, alto: 5.6, escala: 0.9},
  contador: {C: PuertaContador, alto: 7.6, escala: 0.75},
  mesas: {C: MesasMetalMadera, alto: 2.8},
};
