// Objetos 3D para el S05 (acelerómetro) y el avance del S06 (giroscopio).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {texturaRuido} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ control de movimiento, dron, volante con airbag, disco duro
export const ControlMovimiento: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 1.2, 0]} rotation={[0.2 + (a > 0.01 ? Math.sin(t * 3) * 0.4 : 0), 0.5, 0.15]}>
    <Caja tam={[1.3, 0.9, 5.8]} material={M.plasticoBlanco()} radio={0.4} />
    <Cil r={0.35} h={0.12} pos={[0, 0.48, -1.6]} mat={M.color('#2D5BE3', 0.4)} />
    <Caja tam={[0.7, 0.1, 0.7]} pos={[0, 0.47, -2.3]} material={M.color('#3A3D42', 0.4)} radio={0.08} />
    <Cil r={0.16} h={0.1} pos={[0, 0.47, 0.6]} mat={M.color('#3A3D42', 0.4)} />
    <Cil r={0.16} h={0.1} pos={[0, 0.47, 1.1]} mat={M.color('#3A3D42', 0.4)} />
  </group>
);
export const Dron: React.FC<Anim> = ({t = 0}) => {
  const brazos = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  return (
    <group position={[0, 2.2 + Math.sin(t * 2) * 0.15, 0]}>
      <Caja tam={[2.0, 0.6, 2.6]} material={M.color('#2B2E33', 0.35, 0.4)} radio={0.25} />
      <Caja tam={[0.8, 0.5, 0.6]} pos={[0, -0.35, 1.2]} material={M.plasticoNegro()} radio={0.1} />
      {brazos.map((b, i) => (
        <group key={i} rotation={[0, b, 0]}>
          <Caja tam={[3.2, 0.2, 0.3]} pos={[1.7, 0, 0]} material={M.color('#2B2E33', 0.35, 0.4)} radio={0.06} />
          <Cil r={0.32} h={0.4} pos={[3.2, 0.2, 0]} mat={M.aceroMate()} />
          <group position={[3.2, 0.45, 0]} rotation={[0, t * 40 + i, 0]}>
            <Caja tam={[2.6, 0.03, 0.25]} material={M.color('#9AA1A8', 0.4)} />
          </group>
        </group>
      ))}
    </group>
  );
};
export const Volante: React.FC<Anim & {inflado?: number}> = ({inflado = 0}) => (
  <group position={[0, 3.2, 0]} rotation={[-0.35, 0, 0]}>
    <Toro r={2.4} tubo={0.28} rot={[0, 0, 0]} mat={M.goma('#1B1C1E')} />
    <Cil r={0.9} h={0.6} rot={[Math.PI / 2, 0, 0]} mat={M.color('#2B2E33', 0.5)} />
    {[0, 2.1, 4.2].map((a) => (
      <Caja key={a} tam={[0.3, 2.0, 0.25]} pos={[Math.sin(a) * 1.4, Math.cos(a) * 1.4 - 0.2, 0]} rot={[0, 0, -a]} material={M.color('#2B2E33', 0.5)} />
    ))}
    <Cil r={0.3} h={3.2} pos={[0, 0, -1.8]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#2B2E33', 0.5)} />
    {inflado > 0.01 && <Esf r={2.2 * inflado} pos={[0, 0, 0.4 + 1.6 * inflado]} esc={[1, 1, 0.75]} mat={M.color('#ECEAE4', 0.8)} seg={32} />}
  </group>
);
export const DiscoDuro: React.FC<Anim> = ({t = 0, a = 0}) => {
  const estaciona = a > 0.01 ? (Math.sin(t * 1.2) > 0 ? 1 : 0) : 0;
  return (
    <group position={[0, 0.3, 0]}>
      <Caja tam={[4.6, 0.5, 6.0]} material={M.aceroMate()} radio={0.12} />
      <group position={[0.2, 0.3, -0.5]} rotation={[0, t * 8, 0]}>
        <Cil r={1.9} h={0.06} mat={M.color('#D9DDE1', 0.08, 1)} seg={64} />
        <Cil r={0.4} h={0.12} mat={M.aceroMate()} />
      </group>
      <group position={[1.6, 0.42, 1.8]} rotation={[0, estaciona ? 0.9 : 0.25, 0]}>
        <Caja tam={[0.35, 0.08, 2.4]} pos={[0, 0, -1.2]} material={M.acero()} />
        <Cil r={0.3} h={0.2} mat={M.aceroMate()} />
      </group>
      <Caja tam={[0.5, 0.06, 0.3]} pos={[1.9, 0.33, 2.5]} material={M.color('#F2C230', 0.4)} />
    </group>
  );
};
/** Mapa con celulares que sienten la misma sacudida (red de sismógrafos). */
export const RedSismica: React.FC<Anim> = ({t = 0, a = 0}) => {
  const pts = useMemo(() => Array.from({length: 18}, (_, i) => [((i * 37) % 11) - 5, ((i * 53) % 9) - 4] as [number, number]), []);
  return (
    <group position={[0, 0.2, 0]}>
      <Caja tam={[12, 0.3, 9]} material={M.color('#20303A', 0.8)} radio={0.1} />
      {pts.map(([x, z], i) => {
        const d = Math.hypot(x + 3, z + 1);
        const llega = a > 0.01 && t * 3 > d;
        return (
          <group key={i} position={[x, 0.35, z]}>
            <Caja tam={[0.35, 0.08, 0.65]} material={M.color('#2A2D31', 0.3, 0.8)} radio={0.04} />
            <Esf r={0.1} pos={[0, 0.15, 0]} mat={M.emisivo(llega ? '#FFB547' : '#7CF0FF', llega ? 3 : 0.8)} seg={8} />
          </group>
        );
      })}
      <Arcos origen={[-3, 0.4, -1]} apertura={Math.PI * 2} t={t} t0={a > 0.01 ? 0 : 1e9} vel={3} n={4} cada={0.6} vida={3.0} color="#FF8A80" />
    </group>
  );
};

// ------------------------------------------------------------------ nivel de burbuja, mancuerna, bicicleta con alarma
export const NivelBurbuja: React.FC<Anim & {inclina?: number}> = ({t = 0, a = 0, inclina}) => {
  const ang = inclina ?? (a > 0.01 ? Math.sin(t * 0.9) * 0.15 : 0.05);
  return (
    <group position={[0, 0.6, 0]} rotation={[0, 0, ang]}>
      <Caja tam={[7, 0.9, 1.0]} material={pintura('#F2C230', 0.35)} radio={0.15} />
      <Cil r={0.32} h={2.4} pos={[0, 0.2, 0.52]} rot={[0, 0, Math.PI / 2]} mat={M.vidrio()} />
      <Cil r={0.31} h={2.38} pos={[0, 0.2, 0.52]} rot={[0, 0, Math.PI / 2]} mat={new THREE.MeshPhysicalMaterial({color: '#B7F27D', transparent: true, opacity: 0.6})} />
      <Esf r={0.22} pos={[-ang * 6, 0.32, 0.52]} esc={[1.6, 0.8, 0.9]} mat={M.color('#FFFFFF', 0.1)} seg={16} />
      <Caja tam={[0.04, 0.7, 0.05]} pos={[-0.35, 0.2, 0.86]} material={M.plasticoNegro()} />
      <Caja tam={[0.04, 0.7, 0.05]} pos={[0.35, 0.2, 0.86]} material={M.plasticoNegro()} />
    </group>
  );
};
export const Mancuerna: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 1.0 + (a > 0.01 ? Math.abs(Math.sin(t * 2)) * 1.2 : 0), 0]} rotation={[0, 0.5, 0]}>
    <Cil r={0.22} h={4.0} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
    {[-1.5, 1.5].map((x) => (
      <Cil key={x} r={0.9} h={0.8} pos={[x, 0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#1B1C1E', 0.5, 0.4)} seg={6} />
    ))}
  </group>
);

// ------------------------------------------------------------------ oído interno: otolitos sobre gel con pelos sensibles
export const Otolitos: React.FC<Anim & {inclina?: number}> = ({t = 0, a = 0, inclina}) => {
  const ang = inclina ?? (a > 0.01 ? Math.sin(t * 0.9) * 0.3 : 0);
  const gel = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#E8D9F2', roughness: 0.3, transparent: true, opacity: 0.5}), []);
  return (
    <group position={[0, 0.3, 0]} rotation={[0, 0, ang]}>
      <Caja tam={[7, 0.5, 3.4]} material={M.color('#C98A8A', 0.6)} radio={0.1} />
      {Array.from({length: 12}, (_, i) => (
        <group key={i} position={[-2.9 + i * 0.53, 0.3, 0]} rotation={[0, 0, -ang * 1.6]}>
          <Cil r={0.06} h={1.2} pos={[0, 0.6, 0]} mat={M.color('#F3E5D8', 0.5)} />
        </group>
      ))}
      <Caja tam={[7, 0.7, 3.2]} pos={[-ang * 1.4, 1.5, 0]} material={gel} radio={0.12} />
      {Array.from({length: 26}, (_, i) => (
        <mesh key={`c${i}`} position={[-ang * 1.6 - 3.0 + (i % 13) * 0.5, 2.05, (Math.floor(i / 13) - 0.5) * 1.2]} rotation={[i, i * 2, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ módulo MPU-6050
export const MPU6050: React.FC<Anim> = () => (
  <group>
    <Caja tam={[2.1, 0.16, 1.6]} pos={[0, 0.08, 0]} material={M.color('#1E3A8A', 0.45)} radio={0.03} />
    <Caja tam={[0.45, 0.12, 0.45]} pos={[0, 0.22, 0]} material={M.plasticoNegro()} radio={0.02} />
    {Array.from({length: 8}, (_, i) => (
      <Cil key={i} r={0.04} h={0.4} pos={[-0.88 + i * 0.25, -0.15, 0.68]} mat={M.oro()} />
    ))}
    <TextoPlano lineas={[{t: 'MPU-6050', tam: 90, color: '#E8EAED', peso: 600}]} w={1.2} h={0.25} pos={[0, 0.17, -0.55]} rot={[-Math.PI / 2, 0, 0]} />
  </group>
);

// ------------------------------------------------------------------ S06: giroscopio clásico (rueda en aros) y huracán
export const GiroscopioClasico: React.FC<Anim> = ({t = 0}) => (
  <group position={[0, 2.6, 0]}>
    <group rotation={[0.3, t * 0.2, 0]}>
      <Toro r={2.2} tubo={0.07} rot={[0, 0, 0]} mat={M.laton()} />
      <group rotation={[0, 0, 0.5]}>
        <Toro r={1.85} tubo={0.07} rot={[0, Math.PI / 2, 0]} mat={M.laton()} />
        <group rotation={[0, t * 8, 0]}>
          <Cil r={1.4} h={0.35} mat={M.acero()} seg={48} />
          <Cil r={0.08} h={3.7} mat={M.acero()} />
        </group>
      </group>
    </group>
    <Cil r={0.12} h={2.2} pos={[0, -1.4, 0]} mat={M.laton()} />
    <Cil r={1.2} r2={1.5} h={0.3} pos={[0, -2.45, 0]} mat={M.laton()} />
  </group>
);
export const Huracan: React.FC<Anim> = ({t = 0}) => {
  const brazos = useMemo(() => {
    const out: V3[][] = [];
    for (let b = 0; b < 4; b++) {
      const pts: V3[] = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        const r = 0.6 + u * 4.2;
        const a = b * (Math.PI / 2) - u * 3.2;
        pts.push([r * Math.cos(a), 1.0 + u * 0.2, r * Math.sin(a)]);
      }
      out.push(pts);
    }
    return out;
  }, []);
  return (
    <group rotation={[0, t * 0.6, 0]}>
      <Cil r={5.2} h={0.1} pos={[0, 0.3, 0]} mat={M.color('#1D4E89', 0.4)} seg={64} />
      {brazos.map((p, i) => (
        <Tubo key={i} puntos={p} radio={0.55} material={M.color('#F3F4F6', 0.9)} seg={80} />
      ))}
      <Cil r={0.45} h={0.3} pos={[0, 1.1, 0]} mat={M.color('#1D4E89', 0.5)} />
    </group>
  );
};

export const CATALOGO_S05 = {
  wiimote: {C: ControlMovimiento, alto: 2.4},
  dron: {C: Dron, alto: 3.2},
  volante: {C: Volante as React.FC<Anim>, alto: 6.0},
  disco: {C: DiscoDuro, alto: 1.2},
  sismo: {C: RedSismica, alto: 1.0, escala: 0.55},
  nivel: {C: NivelBurbuja as React.FC<Anim>, alto: 1.8},
  mancuerna: {C: Mancuerna, alto: 2.6},
  otolitos: {C: Otolitos as React.FC<Anim>, alto: 2.6},
  mpu: {C: MPU6050, alto: 0.6, escala: 2.4},
  giroscopio: {C: GiroscopioClasico, alto: 5.0},
  huracan: {C: Huracan, alto: 1.6, escala: 0.65},
};
