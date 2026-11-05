// Objetos 3D para el S02 (pantallas táctiles) y el avance del S03 (sensor PIR).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {texturaRuido} from '../texturas';
import type {V3} from '../Estudio';
import {Caja, Tubo} from './Piezas';
import {Anim, Arcos, Cap, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano, useLienzo} from '../texto3d';
import {Portatil} from './Instrumentos';

// ------------------------------------------------------------------ piel y dedo
let piel: THREE.Material | null = null;
export const matPiel = () =>
  (piel ??= new THREE.MeshPhysicalMaterial({color: '#E3A987', roughness: 0.52, sheen: 0.6, sheenColor: new THREE.Color('#FFD2BC'), clearcoat: 0.15, roughnessMap: texturaRuido(41, 0.3, 0.55)}));

/**
 * Dedo índice que apunta hacia -y; la yema queda en el origen. `guante` lo engrosa con lana.
 * Se usa para tocar pantallas: se coloca en el punto de contacto y se sube con `alto`.
 */
export const Dedo: React.FC<{alto?: number; guante?: boolean; plata?: boolean}> = ({alto = 0, guante = false, plata = false}) => {
  const lana = useMemo(() => new THREE.MeshStandardMaterial({color: '#A8322C', roughness: 1, roughnessMap: texturaRuido(52, 0.5, 0.7)}), []);
  const m = guante ? lana : matPiel();
  const g = guante ? 0.22 : 0;
  return (
    <group position={[0, alto, 0]}>
      <Cap r={0.5 + g} largo={1.0} pos={[0, 1.0 + g, 0]} mat={m} />
      <Cap r={0.55 + g} largo={1.3} pos={[0, 2.45 + g, -0.2]} rot={[0.25, 0, 0]} mat={m} />
      <Cap r={0.6 + g} largo={1.7} pos={[0, 4.1 + g, -0.75]} rot={[0.45, 0, 0]} mat={m} />
      <Caja tam={[3.2 + g * 2, 1.4 + g, 3.4]} pos={[0.9, 5.6 + g, -2.4]} rot={[0.6, 0, 0.1]} material={m} radio={0.6} />
      {!guante && <Caja tam={[0.62, 0.08, 0.75]} pos={[0, 1.15, 0.47]} rot={[-0.15, 0, 0]} material={M.color('#F2C7B5', 0.25)} radio={0.03} />}
      {plata && <Esf r={0.75} pos={[0, 0.75, 0]} esc={[1, 0.7, 1]} mat={M.plata()} seg={24} />}
    </group>
  );
};

// ------------------------------------------------------------------ tableta, reloj inteligente
const pantallaGradiente = (g: CanvasRenderingContext2D, w: number, h: number, a: string, b: string, texto?: string) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (texto) {
    g.fillStyle = 'rgba(255,255,255,0.92)';
    g.font = `700 ${Math.round(h * 0.16)}px Inter, Arial`;
    g.textAlign = 'center';
    g.fillText(texto, w / 2, h * 0.42);
  }
};
const Pantalla: React.FC<{w: number; h: number; pos?: V3; rot?: V3; a?: string; b?: string; texto?: string; brillo?: number}> = ({w, h, pos = [0, 0, 0], rot = [-Math.PI / 2, 0, 0], a = '#1C3D6E', b = '#6B3FA0', texto, brillo = 0.6}) => {
  const tex = useLienzo(512, Math.round((512 * h) / w), (g, ww, hh) => pantallaGradiente(g, ww, hh, a, b, texto), [a, b, texto]);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={brillo} roughness={0.1} />
    </mesh>
  );
};
export const Tableta: React.FC<Anim> = () => (
  <group position={[0, 0.2, 0]} rotation={[0, 0.3, 0]}>
    <Caja tam={[7.2, 0.3, 5.2]} material={M.color('#3A3D42', 0.3, 0.8)} radio={0.25} />
    <Pantalla w={6.7} h={4.7} pos={[0, 0.16, 0]} a="#0E4D64" b="#4FB3BF" texto="11:42" />
  </group>
);
export const RelojInteligente: React.FC<Anim> = () => (
  <group>
    <Caja tam={[1.5, 0.25, 3.4]} pos={[0, 0.15, 2.4]} material={M.goma('#2B2E33')} radio={0.1} />
    <Caja tam={[1.5, 0.25, 3.4]} pos={[0, 0.15, -2.4]} material={M.goma('#2B2E33')} radio={0.1} />
    <Caja tam={[2.4, 0.7, 2.8]} pos={[0, 0.5, 0]} material={M.color('#9AA0A6', 0.25, 0.9)} radio={0.45} />
    <Pantalla w={2.0} h={2.4} pos={[0, 0.86, 0]} a="#111827" b="#1F2937" texto="10:24" brillo={0.9} />
    <Cil r={0.16} h={0.3} pos={[1.25, 0.55, -0.4]} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
  </group>
);

// ------------------------------------------------------------------ pantalla del carro, estufa, ascensor, lámpara, audífonos
export const PantallaCarro: React.FC<Anim> = () => (
  <group position={[0, 0, 0]}>
    <Caja tam={[7.6, 2.4, 3.2]} pos={[0, 1.2, 0]} material={M.color('#1E2024', 0.6)} radio={0.5} />
    <group position={[0, 3.2, 0.4]} rotation={[-0.25, 0, 0]}>
      <Caja tam={[5.6, 3.4, 0.3]} material={M.plasticoNegro()} radio={0.12} />
      <Pantalla w={5.3} h={3.1} pos={[0, 0, 0.16]} rot={[0, 0, 0]} a="#0B1320" b="#16324F" texto="Navegación" brillo={0.8} />
    </group>
  </group>
);
export const EstufaInduccion: React.FC<Anim> = ({a = 0}) => {
  const vidrio = M.color('#0B0C0E', 0.08, 0.2);
  return (
    <group>
      <Caja tam={[7.0, 0.4, 5.0]} pos={[0, 0.2, 0]} material={vidrio} radio={0.1} />
      {[[-1.7, -0.6, 1.3], [1.7, -0.6, 1.0], [0, 1.4, 0.8]].map(([x, z, r], i) => (
        <Toro key={i} r={r} tubo={0.03} pos={[x, 0.41, z]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#6B7076', 0.4)} />
      ))}
      {Array.from({length: 5}, (_, i) => (
        <mesh key={i} position={[-1.6 + i * 0.8, 0.41, 2.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 24]} />
          <meshBasicMaterial color={i === 2 && a > 0.01 ? '#FF6B3D' : '#9AA3AD'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};
export const Ascensor: React.FC<Anim> = ({a = 0}) => (
  <group position={[0, 0, 0]}>
    <Caja tam={[2.6, 5.6, 0.4]} pos={[0, 2.8, 0]} material={M.color('#BFC4C9', 0.25, 0.95)} radio={0.1} />
    {Array.from({length: 8}, (_, i) => (
      <group key={i} position={[(i % 2) * 1.0 - 0.5, 4.4 - Math.floor(i / 2) * 0.95, 0.22]}>
        <Cil r={0.32} h={0.08} rot={[Math.PI / 2, 0, 0]} mat={M.color('#1C1E21', 0.3)} />
        <TextoPlano lineas={[{t: String(8 - i), tam: 120, color: i === 3 && a > 0.01 ? '#7CF0FF' : '#E8EAED'}]} w={0.4} h={0.4} pos={[0, 0, 0.05]} />
      </group>
    ))}
  </group>
);
export const LamparaTactil: React.FC<Anim> = ({a = 0}) => (
  <group>
    <Cil r={1.4} r2={1.7} h={0.6} pos={[0, 0.3, 0]} mat={M.laton()} />
    <Cil r={0.12} h={3.4} pos={[0, 2.3, 0]} mat={M.laton()} />
    <Cil r={1.1} r2={2.2} h={2.2} pos={[0, 4.6, 0]} mat={M.color(a > 0.01 ? '#FFF1D6' : '#E9E2D3', 0.7)} abierto seg={48} />
    {a > 0.01 && <pointLight position={[0, 4.2, 0]} intensity={14 * a} distance={10} color="#FFD9A0" />}
    <Esf r={0.45} pos={[0, 4.4, 0]} mat={M.emisivo('#FFE1B0', a > 0.01 ? 3 : 0.1)} seg={16} />
  </group>
);
export const Audifonos: React.FC<Anim> = () => (
  <group>
    <Caja tam={[3.4, 1.4, 2.4]} pos={[0, 0.7, 0]} material={M.plasticoBlanco()} radio={0.65} />
    {[-0.9, 0.9].map((x) => (
      <group key={x} position={[x, 1.9, 0.2]} rotation={[0.4, 0, x > 0 ? -0.3 : 0.3]}>
        <Esf r={0.55} pos={[0, 0, 0]} mat={M.plasticoBlanco()} />
        <Cap r={0.2} largo={1.2} pos={[0, -0.9, 0]} mat={M.plasticoBlanco()} />
      </group>
    ))}
  </group>
);

// ------------------------------------------------------------------ pantallas resistivas de antes
export const Cajero: React.FC<Anim> = () => (
  <group>
    <Caja tam={[4.2, 6.4, 3.0]} pos={[0, 3.2, 0]} material={M.color('#6E7A86', 0.4, 0.6)} radio={0.15} />
    <Caja tam={[3.4, 2.2, 0.3]} pos={[0, 4.6, 1.45]} rot={[-0.2, 0, 0]} material={M.plasticoNegro()} radio={0.05} />
    <Pantalla w={3.0} h={1.8} pos={[0, 4.62, 1.62]} rot={[-0.2, 0, 0]} a="#0E3B2E" b="#1B6B4F" texto="Bienvenido" brillo={0.7} />
    <Caja tam={[2.4, 1.1, 0.6]} pos={[0, 2.7, 1.6]} rot={[0.5, 0, 0]} material={M.color('#2B2E33', 0.4)} radio={0.06} />
    <Caja tam={[1.6, 0.12, 0.2]} pos={[0, 1.6, 1.52]} material={M.plasticoNegro()} />
  </group>
);
export const AgendaPDA: React.FC<Anim> = () => (
  <group position={[0, 0.25, 0]} rotation={[0, -0.2, 0]}>
    <Caja tam={[3.0, 0.5, 4.8]} material={M.color('#5B636B', 0.35, 0.5)} radio={0.3} />
    <Pantalla w={2.4} h={2.8} pos={[0, 0.26, -0.5]} a="#9DB59B" b="#7E9A7C" brillo={0.25} />
    {[-0.8, 0, 0.8].map((x) => (
      <Cil key={x} r={0.25} h={0.12} pos={[x, 0.3, 1.6]} mat={M.color('#2B2E33', 0.4)} />
    ))}
    <Cil r={0.07} r2={0.07} h={4.2} pos={[1.7, 0.1, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} />
  </group>
);
export const ConsolaDoble: React.FC<Anim> = () => (
  <group position={[0, 0.3, 0]}>
    <Caja tam={[5.0, 0.5, 3.0]} material={M.color('#D9DCE0', 0.35)} radio={0.3} />
    <Pantalla w={2.6} h={2.0} pos={[0, 0.27, 0]} a="#EDEFF2" b="#C9D1DA" brillo={0.35} />
    <group position={[0, 0.2, -1.5]} rotation={[-1.75, 0, 0]}>
      <Caja tam={[5.0, 0.4, 3.0]} pos={[0, 0, -1.5]} material={M.color('#D9DCE0', 0.35)} radio={0.3} />
      <Pantalla w={2.6} h={2.0} pos={[0, -0.22, -1.5]} rot={[Math.PI / 2, 0, 0]} a="#3B82F6" b="#93C5FD" brillo={0.5} />
    </group>
    <Cil r={0.35} h={0.1} pos={[-1.9, 0.27, 0.2]} mat={M.color('#3A3D42', 0.4)} />
    {[0, 1, 2, 3].map((i) => (
      <Cil key={i} r={0.15} h={0.1} pos={[1.9 + [0, 0.3, -0.3, 0][i], 0.27, [-0.3, 0, 0, 0.3][i] + 0.2]} mat={M.color('#3A3D42', 0.4)} />
    ))}
  </group>
);

// ------------------------------------------------------------------ historia: consola de radar y terminal del CERN
export const ConsolaRadar: React.FC<Anim> = ({t = 0}) => {
  const tex = useLienzo(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = '#021006';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(80,255,140,0.35)';
      g.lineWidth = 3;
      for (const r of [80, 160, 240]) {
        g.beginPath();
        g.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        g.stroke();
      }
      const ang = t * 1.6;
      const gr = g.createConicGradient(ang, w / 2, h / 2);
      gr.addColorStop(0, 'rgba(80,255,140,0.75)');
      gr.addColorStop(0.15, 'rgba(80,255,140,0)');
      gr.addColorStop(1, 'rgba(80,255,140,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(w / 2, h / 2, 250, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#9CFFB8';
      for (const [x, y] of [[330, 170], [180, 320], [290, 380]]) {
        g.beginPath();
        g.arc(x, y, 7, 0, Math.PI * 2);
        g.fill();
      }
    },
    [Math.round(t * 24)],
  );
  return (
    <group scale={0.72}>
      <Caja tam={[5.6, 3.0, 4.4]} pos={[0, 1.5, 0]} material={M.color('#5E6B5C', 0.6, 0.3)} radio={0.15} />
      <group position={[0, 4.6, -0.3]} rotation={[-0.35, 0, 0]}>
        <Caja tam={[5.2, 3.6, 3.6]} material={M.color('#5E6B5C', 0.6, 0.3)} radio={0.2} />
        <mesh position={[0, 0.1, 1.82]}>
          <circleGeometry args={[1.45, 48]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {Array.from({length: 6}, (_, i) => (
        <Cil key={i} r={0.18} h={0.25} pos={[-1.8 + i * 0.72, 3.05, 1.6]} mat={M.color('#D9C9A3', 0.5)} />
      ))}
    </group>
  );
};
export const TerminalCRT: React.FC<Anim> = () => (
  <group>
    <Caja tam={[4.6, 4.0, 4.4]} pos={[0, 2.6, -0.3]} material={M.color('#D8D2C2', 0.6)} radio={0.4} />
    <Caja tam={[3.6, 2.9, 0.2]} pos={[0, 2.8, 1.95]} material={M.color('#2A2C2E', 0.3)} radio={0.15} />
    <Pantalla w={3.2} h={2.5} pos={[0, 2.8, 2.07]} rot={[0, 0, 0]} a="#062312" b="#0A3B1E" texto="SPS" brillo={0.7} />
    {Array.from({length: 5}, (_, i) => (
      <Caja key={i} tam={[3.2, 0.015, 0.015]} pos={[0, 1.8 + i * 0.5, 2.1]} material={M.emisivo('#7CF0FF', 0.6)} />
    ))}
    <Caja tam={[4.2, 0.6, 2.2]} pos={[0, 0.3, 0.6]} material={M.color('#C9C2B0', 0.6)} radio={0.15} />
  </group>
);

// ------------------------------------------------------------------ accesorios táctiles
export const GuanteTactil: React.FC<Anim> = () => (
  <group position={[0, 0.2, 0]} rotation={[0, 0, -Math.PI / 2 + 0.25]} scale={0.7}>
    <Dedo guante plata />
  </group>
);
export const LapizGoma: React.FC<Anim> = () => (
  <group position={[0, 0.55, 0]} rotation={[0, 0.5, Math.PI / 2 - 0.1]}>
    <Cil r={0.35} h={6.0} pos={[0, 3.2, 0]} mat={M.color('#A7ADB3', 0.3, 0.9)} />
    <Esf r={0.62} pos={[0, 0.0, 0]} esc={[1, 0.9, 1]} mat={M.goma('#25272B')} />
    <Cil r={0.3} r2={0.5} h={0.4} pos={[0, 0.25, 0]} mat={M.color('#A7ADB3', 0.3, 0.9)} />
  </group>
);
export const LapizActivo: React.FC<Anim> = ({t = 0, a = 0}) => (
  <group position={[0, 0.45, 0]}>
    <group rotation={[0, 0.5, Math.PI / 2 - 0.1]}>
      <Cil r={0.32} h={6.4} pos={[0, 3.4, 0]} mat={M.plasticoBlanco()} />
      <Cil r={0.06} r2={0.3} h={0.5} pos={[0, 0.0, 0]} mat={M.plasticoBlanco()} />
    </group>
    <Arcos origen={[0, -0.1, 0]} apertura={Math.PI * 2} t={t} t0={a > 0.01 ? 0 : 1e9} vel={2.2} n={4} cada={0.25} vida={1.0} color="#C88BFF" />
  </group>
);
export const Esfero: React.FC<Anim> = () => (
  <group position={[0, 0.35, 0]} rotation={[0, 0.4, Math.PI / 2]}>
    <Cil r={0.28} h={6.0} pos={[0, 3.0, 0]} mat={pintura('#1D4ED8', 0.3)} />
    <Cil r={0.04} r2={0.28} h={0.7} pos={[0, -0.35, 0]} mat={M.acero()} />
    <Caja tam={[0.1, 2.0, 0.3]} pos={[0.32, 5.2, 0]} material={M.acero()} />
  </group>
);
export const PanelSolar: React.FC<Anim> = () => {
  const tex = useLienzo(
    512,
    320,
    (g, w, h) => {
      g.fillStyle = '#0D1F3C';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(200,220,255,0.5)';
      g.lineWidth = 2;
      for (let x = 0; x <= w; x += w / 8) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke();
      }
      for (let y = 0; y <= h; y += h / 5) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y);
        g.stroke();
      }
    },
    [],
  );
  return (
    <group position={[0, 1.6, 0]} rotation={[-0.7, 0, 0]}>
      <Caja tam={[6.4, 0.2, 4.0]} material={M.aceroMate()} radio={0.05} />
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.2, 3.8]} />
        <meshStandardMaterial map={tex} roughness={0.15} metalness={0.3} />
      </mesh>
    </group>
  );
};
export const PantallaFlexible: React.FC<Anim> = ({t = 0}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(6, 3.6, 40, 4), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const k = 0.5 + 0.4 * Math.sin(t * 1.4);
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    pos.setZ(i, k * (x / 3) ** 2 * 1.8);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const tex = useLienzo(512, 300, (g, w, h) => pantallaGradiente(g, w, h, '#7C3AED', '#22D3EE'), []);
  return (
    <group position={[0, 2.2, 0]} rotation={[-0.35, 0, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.6} side={THREE.DoubleSide} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ sensor PIR (módulo HC-SR501 con cúpula de Fresnel)
export const SensorPIR: React.FC<Anim & {corte?: number}> = ({corte = 0}) => {
  const cupula = useMemo(() => {
    const g = new THREE.SphereGeometry(1.45, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#F3F1EA', roughness: 0.55, transmission: 0, transparent: true, opacity: 1 - 0.75 * corte, side: THREE.DoubleSide}), [corte]);
  const facetas = useMemo(() => {
    const out: {pos: V3; rot: V3}[] = [];
    for (let fila = 0; fila < 3; fila++) {
      const n = [12, 9, 5][fila];
      const elev = [0.25, 0.75, 1.2][fila];
      for (let i = 0; i < n; i++) {
        const az = (i / n) * Math.PI * 2;
        const r = 1.47;
        out.push({pos: [r * Math.cos(elev) * Math.cos(az), r * Math.sin(elev), r * Math.cos(elev) * Math.sin(az)], rot: [0, -az + Math.PI / 2, 0]});
      }
    }
    return out;
  }, []);
  return (
    <group>
      <Caja tam={[3.2, 0.16, 2.4]} pos={[0, 0.6, 0]} material={M.color('#1E5B3A', 0.5)} radio={0.03} />
      {[-1.0, 0, 1.0].map((x) => (
        <Cil key={x} r={0.05} h={0.6} pos={[x, 0.3, -0.9]} mat={M.oro()} />
      ))}
      {[[-0.9, 0.6], [0.9, 0.6]].map(([x, z]) => (
        <Cil key={x} r={0.32} h={0.3} pos={[x, 0.45, z]} mat={M.color('#E8792F', 0.4)} />
      ))}
      <group position={[0, 0.68, 0]}>
        <Cil r={0.7} h={0.6} pos={[0, 0.3, 0]} mat={M.aceroMate()} />
        <Caja tam={[0.6, 0.02, 0.4]} pos={[0, 0.61, 0]} material={M.color('#2B2E33', 0.15, 0.4)} />
        <mesh geometry={cupula} material={mat} castShadow />
        {corte < 0.5 && facetas.map((f, i) => (
          <mesh key={i} position={f.pos} rotation={f.rot}>
            <planeGeometry args={[0.55, 0.38]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.35} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Hoja de papel aluminio sobre cartón, con cable. */
export const BotonAluminio: React.FC<Anim & {papel?: number}> = ({papel = 0}) => {
  const foil = useMemo(() => new THREE.MeshStandardMaterial({color: '#D9DDE1', metalness: 1, roughness: 0.35, roughnessMap: texturaRuido(61, 0.9, 0.4)}), []);
  return (
    <group>
      <Caja tam={[6, 0.3, 6]} pos={[0, 0.15, 0]} material={M.color('#B98B5A', 0.9)} />
      <Caja tam={[3.6, 0.03, 3.6]} pos={[0, 0.32, 0]} material={foil} />
      {papel > 0.01 && <Caja tam={[4.6, 0.02, 4.6]} pos={[0, 0.34 + (1 - papel) * 2, 0]} material={M.color('#F7F6F2', 0.9)} />}
      <Tubo puntos={[[1.6, 0.36, 1.6], [2.6, 0.5, 2.4], [3.8, 0.4, 2.8], [5.2, 0.4, 2.6]]} radio={0.06} material={M.color('#2563EB', 0.4)} seg={30} />
    </group>
  );
};

const PortatilVitrina: React.FC<Anim> = () => <Portatil lineas={['']} titulo="" />;

export const CATALOGO_S02 = {
  portatil: {C: PortatilVitrina, alto: 5.6, escala: 0.62},
  tableta: {C: Tableta, alto: 1.0},
  smartwatch: {C: RelojInteligente, alto: 1.3},
  carro: {C: PantallaCarro, alto: 5.2},
  estufa: {C: EstufaInduccion, alto: 0.8},
  ascensor: {C: Ascensor, alto: 5.8},
  lampara: {C: LamparaTactil, alto: 5.9},
  audifonos: {C: Audifonos, alto: 2.6},
  cajero: {C: Cajero, alto: 6.5},
  pda: {C: AgendaPDA, alto: 0.8},
  consola: {C: ConsolaDoble, alto: 3.4},
  radar: {C: ConsolaRadar, alto: 4.8},
  crt: {C: TerminalCRT, alto: 4.7},
  guanteTactil: {C: GuanteTactil, alto: 2.4},
  lapizGoma: {C: LapizGoma, alto: 1.4},
  lapizActivo: {C: LapizActivo, alto: 1.2},
  esfero: {C: Esfero, alto: 1.0},
  solar: {C: PanelSolar, alto: 3.4},
  flexible: {C: PantallaFlexible, alto: 4.0},
  pir: {C: SensorPIR as React.FC<Anim>, alto: 2.5, escala: 1.4},
  aluminio: {C: BotonAluminio as React.FC<Anim>, alto: 0.8},
};
