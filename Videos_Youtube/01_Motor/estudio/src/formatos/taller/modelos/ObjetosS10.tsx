// Objetos 3D para el S10 (galgas extensiométricas, puente de Wheatstone y básculas).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {M} from '../materiales';
import {azar} from '../texturas';
import {Caja, Tubo} from './Piezas';
import {Anim, Cil, Esf, pintura, Toro} from './Objetos';
import {TextoPlano} from '../texto3d';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ la galga
/**
 * Galga extensiométrica de lámina: rejilla en zigzag sobre una película de poliimida.
 * Plana en el plano XZ (cara hacia +y); mide en la dirección x.
 * `estira` alarga en x y adelgaza en z (Poisson ≈ 0,3): solo para verlo, va exagerado.
 */
export const GalgaFoil: React.FC<{estira?: number; lineas?: number; brillo?: number; colorBrillo?: string; cables?: boolean; colorPelicula?: string}> = ({
  estira = 0,
  lineas = 10,
  brillo = 0,
  colorBrillo = '#FF8A3D',
  cables = true,
  colorPelicula = '#B8661F',
}) => {
  const L = 2.4;
  const W = 1.5;
  const lw = 0.075;
  const h = 0.025;
  const y = 0.03 + h / 2;
  const pista = useMemo(() => new THREE.MeshStandardMaterial({color: '#D9A35E', metalness: 0.85, roughness: 0.28, emissive: new THREE.Color(colorBrillo), emissiveIntensity: 0}), [colorBrillo]);
  pista.emissiveIntensity = brillo;
  const pelicula = useMemo(() => new THREE.MeshPhysicalMaterial({color: colorPelicula, roughness: 0.35, clearcoat: 0.7, transparent: true, opacity: 0.93}), [colorPelicula]);
  const zs = Array.from({length: lineas}, (_, i) => -W / 2 + (i * W) / (lineas - 1));
  const paso = W / (lineas - 1);
  return (
    <group scale={[1 + estira, 1, 1 - 0.3 * estira]}>
      <Caja tam={[L + 2.0, 0.03, W + 0.7]} pos={[-0.25, 0.015, 0]} material={pelicula} radio={0.01} />
      {zs.map((z, i) => (
        <Caja key={`l${i}`} tam={[L, h, lw]} pos={[0, y, z]} material={pista} />
      ))}
      {/* vueltas: anchas para que casi no midan de lado */}
      {zs.slice(0, -1).map((z, i) =>
        i % 2 === 0 ? <Caja key={`d${i}`} tam={[0.2, h, paso + lw]} pos={[L / 2 + 0.06, y, z + paso / 2]} material={pista} /> : null,
      )}
      {zs.slice(1, -2).map((z, i) =>
        i % 2 === 0 ? <Caja key={`i${i}`} tam={[0.2, h, paso + lw]} pos={[-L / 2 - 0.06, y, z + paso / 2]} material={pista} /> : null,
      )}
      {/* salidas hacia las dos almohadillas de soldadura */}
      <Caja tam={[0.45, h, lw]} pos={[-L / 2 - 0.22, y, zs[0]]} material={pista} />
      <Caja tam={[0.45, h, lw]} pos={[-L / 2 - 0.22, y, zs[lineas - 1]]} material={pista} />
      <Caja tam={[0.7, h, W / 2 - 0.08]} pos={[-L / 2 - 0.8, y, -(W / 2 + 0.08) / 2]} material={pista} radio={0.01} />
      <Caja tam={[0.7, h, W / 2 - 0.08]} pos={[-L / 2 - 0.8, y, (W / 2 + 0.08) / 2]} material={pista} radio={0.01} />
      {cables &&
        [-1, 1].map((s) => (
          <Tubo key={s} puntos={[[-L / 2 - 0.85, y + 0.04, s * 0.42], [-L / 2 - 1.6, y + 0.25, s * 0.5], [-L / 2 - 2.6, y + 0.15, s * 0.7]]} radio={0.035} material={M.estano()} seg={16} />
        ))}
    </group>
  );
};

/** La galga pegada a una platina de acero, de pie para la vitrina. */
export const GalgaVitrina: React.FC<Anim> = ({t = 0, a = 0}) => {
  const e = a > 0.01 ? 0.1 * (0.5 - 0.5 * Math.cos(t * 1.6)) : 0;
  return (
    <group>
      <Caja tam={[1.8, 1.0, 0.9]} pos={[0, 0.5, 0.25]} material={M.plasticoNegro()} radio={0.08} />
      <Caja tam={[0.3, 2.3, 0.3]} pos={[0, 1.15, -0.32]} material={M.plasticoNegro()} />
      <group position={[0, 2.25, 0]} rotation={[1.22, 0, 0]}>
        <Caja tam={[5.8, 0.18, 2.6]} pos={[0, -0.1, 0]} material={M.aceroMate()} radio={0.05} />
        <group position={[0.3, 0, 0]}>
          <GalgaFoil estira={e} brillo={e * 6} />
        </group>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ historia
/** Kelvin, 1856: un hilo de cobre estirado por una pesa, con su galvanómetro. */
export const ExperimentoKelvin: React.FC<Anim> = ({t = 0, a = 0}) => {
  const madera = M.color('#7A5230', 0.7);
  const tira = a > 0.01 ? 0.5 - 0.5 * Math.cos(t * 1.4) : 0;
  const largo = 3.0 + tira * 0.2;
  const aguja = -0.5 + tira * 1.0;
  return (
    <group>
      <Caja tam={[4.6, 0.3, 2.4]} pos={[0, 0.15, 0]} material={madera} radio={0.04} />
      <Caja tam={[0.35, 5.6, 0.35]} pos={[-1.9, 3.1, -0.6]} material={madera} />
      <Caja tam={[3.0, 0.3, 0.35]} pos={[-0.55, 5.75, -0.6]} material={madera} />
      <Cil r={0.035} h={largo} pos={[0.6, 5.6 - largo / 2, -0.6]} mat={M.cobre()} seg={10} />
      <Cil r={0.42} h={0.75} pos={[0.6, 5.6 - largo - 0.38, -0.6]} mat={M.laton()} seg={28} />
      <Cil r={0.12} h={0.2} pos={[0.6, 5.6 - largo + 0.05, -0.6]} mat={M.laton()} />
      {/* carrete de hilo */}
      <group position={[1.6, 0.3, 0.6]}>
        <Cil r={0.55} h={0.08} pos={[0, 0.04, 0]} mat={madera} />
        <Cil r={0.42} h={0.6} pos={[0, 0.38, 0]} mat={M.cobre()} seg={32} />
        <Cil r={0.55} h={0.08} pos={[0, 0.72, 0]} mat={madera} />
      </group>
      {/* galvanómetro */}
      <group position={[-0.7, 1.15, 0.7]}>
        <Cil r={0.75} h={0.35} rot={[Math.PI / 2, 0, 0]} mat={M.laton()} seg={40} />
        <Cil r={0.64} h={0.02} pos={[0, 0, 0.18]} rot={[Math.PI / 2, 0, 0]} mat={M.color('#EFE6D2', 0.6)} seg={40} />
        <Caja tam={[0.05, 0.55, 0.02]} pos={[Math.sin(aguja) * 0.25, -0.2 + Math.cos(aguja) * 0.25, 0.21]} rot={[0, 0, -aguja]} material={M.color('#1A1A1A', 0.4)} />
        <Caja tam={[0.6, 0.85, 0.5]} pos={[0, -0.75, -0.05]} material={madera} />
      </group>
    </group>
  );
};

/** Simmons: torre de caída de peso sobre una probeta. */
export const TorreImpacto: React.FC<Anim> = ({t = 0, a = 0}) => {
  const c = a > 0.01 ? (t % 2.4) / 2.4 : 0.3;
  const y = c < 0.82 ? 1.19 + (c / 0.82) * 3.3 : 4.49 - ((c - 0.82) / 0.18) ** 2 * 3.3;
  const golpe = a > 0.01 && c > 0.97 ? 1 : 0;
  return (
    <group>
      <Caja tam={[3.8, 0.5, 2.4]} pos={[0, 0.25, 0]} material={M.color('#3A4048', 0.45, 0.4)} radio={0.06} />
      {[-1.05, 1.05].map((x) => (
        <Cil key={x} r={0.09} h={5.8} pos={[x, 3.4, 0]} mat={M.acero()} />
      ))}
      <Caja tam={[2.8, 0.35, 0.6]} pos={[0, 6.3, 0]} material={M.color('#3A4048', 0.45, 0.4)} />
      <Caja tam={[1.2, 0.55, 1.2]} pos={[0, 0.78, 0]} material={M.aceroMate()} />
      <Caja tam={[1.8, 0.14, 0.45]} pos={[0, 1.12, 0]} material={M.color('#C9CDD1', 0.3, 1)} />
      <Caja tam={[1.7, 0.8, 0.9]} pos={[0, y + 0.4, 0]} material={M.color('#5B6470', 0.4, 0.7)} radio={0.05} />
      {golpe > 0 && <Esf r={0.45} pos={[0, 1.2, 0.3]} mat={M.emisivo('#FFB547', 2.5)} seg={12} />}
    </group>
  );
};

/** Ruge: tanque de agua elevado (modelo de laboratorio). */
export const TanqueElevado: React.FC<Anim & {sacude?: number}> = ({t = 0, a = 0, sacude}) => {
  const s = sacude ?? (a > 0.01 ? 1 : 0);
  const ang = Math.sin(t * 9) * 0.035 * s;
  const hierro = M.color('#6E747C', 0.5, 0.6);
  const patas: [number, number][] = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]];
  return (
    <group rotation={[0, 0, ang]}>
      {patas.map(([x, z], i) => (
        <Cil key={i} r={0.11} h={4.0} pos={[x, 2.0, z]} mat={hierro} seg={12} />
      ))}
      {patas.map(([x, z], i) => {
        const [x2, z2] = patas[(i + 1) % 4];
        return (
          <group key={`b${i}`}>
            <Tubo puntos={[[x, 0.3, z], [x2, 2.0, z2]]} radio={0.04} material={hierro} seg={4} />
            <Tubo puntos={[[x2, 0.3, z2], [x, 2.0, z]]} radio={0.04} material={hierro} seg={4} />
            <Tubo puntos={[[x, 2.0, z], [x2, 3.8, z2]]} radio={0.04} material={hierro} seg={4} />
            <Tubo puntos={[[x2, 2.0, z2], [x, 3.8, z]]} radio={0.04} material={hierro} seg={4} />
          </group>
        );
      })}
      <Cil r={1.75} h={0.15} pos={[0, 4.05, 0]} mat={hierro} seg={40} />
      <Cil r={1.6} h={2.0} pos={[0, 5.1, 0]} mat={M.color('#9FA7AF', 0.45, 0.5)} seg={48} />
      <mesh position={[0, 6.5, 0]} castShadow>
        <coneGeometry args={[1.75, 0.8, 48]} />
        <meshStandardMaterial color="#7E868E" roughness={0.45} metalness={0.5} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ puente de Wheatstone
/**
 * Puente de Wheatstone en rombo, de pie (plano XY, mirando a +z), con el voltímetro en el centro.
 * Orden de las resistencias: 0 arriba-izq, 1 abajo-izq, 2 arriba-der, 3 abajo-der.
 * `cambios` en [-1, 1]: + se estira (naranja), − se comprime (azul).
 */
export const PuenteRombo: React.FC<{
  d?: number;
  tablero?: number;
  cambios?: number[];
  calor?: number;
  lectura?: string;
  colorLectura?: string;
  etiquetas?: boolean;
  aparece?: number[];
  medidor?: number;
}> = ({d = 2.4, tablero = 1.6, cambios = [0, 0, 0, 0], calor = 0, lectura = '0,00 mV', colorLectura = '#7CFFB2', etiquetas = true, aparece = [1, 1, 1, 1], medidor = 1}) => {
  const nodos: V3[] = [[0, d, 0], [-d, 0, 0], [0, -d, 0], [d, 0, 0]];
  const lados: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 2]];
  const neutro = new THREE.Color('#D8C29A');
  return (
    <group>
      <Caja tam={[(2 * d + tablero) / Math.SQRT2 * 1.0, (2 * d + tablero) / Math.SQRT2 * 1.0, 0.14]} pos={[0, 0, -0.45]} rot={[0, 0, Math.PI / 4]} material={M.color('#16202B', 0.6)} radio={0.1} />
      {lados.map(([a, b], i) => {
        const pa = nodos[a];
        const pb = nodos[b];
        const mx = (pa[0] + pb[0]) / 2;
        const my = (pa[1] + pb[1]) / 2;
        const ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
        const c = cambios[i] ?? 0;
        const col = neutro.clone().lerp(new THREE.Color(c >= 0 ? '#FF8A3D' : '#4F8DFF'), Math.min(1, Math.abs(c)));
        if (calor > 0) col.lerp(new THREE.Color('#FF5A4E'), calor * 0.5);
        const largoLado = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        const q = aparece[i] ?? 1;
        return (
          <group key={i}>
            <mesh position={[mx, my, 0]} rotation={[0, 0, ang - Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, largoLado, 8]} />
              <meshStandardMaterial color="#CDD1D4" metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[mx, my, 0]} rotation={[0, 0, ang - Math.PI / 2]} scale={[q, q * (1 + 0.12 * c), q]} castShadow>
              <capsuleGeometry args={[0.24, 0.85, 8, 20]} />
              <meshStandardMaterial color={col} roughness={0.45} emissive={col} emissiveIntensity={Math.abs(c) * 0.35 + calor * 0.3} />
            </mesh>
            {q > 0.01 && [-0.22, 0.0, 0.22].map((k, j) => (
              <mesh key={j} position={[mx + Math.cos(ang) * k * q, my + Math.sin(ang) * k * q, 0]} rotation={[0, 0, ang - Math.PI / 2]} scale={q}>
                <cylinderGeometry args={[0.245, 0.245, 0.06, 20]} />
                <meshStandardMaterial color={['#7A4A21', '#151515', '#C62828'][j]} roughness={0.45} />
              </mesh>
            ))}
          </group>
        );
      })}
      {nodos.map((p, i) => (
        <Esf key={i} r={0.13} pos={p} mat={M.estano()} seg={14} />
      ))}
      {/* voltímetro entre los nodos izquierdo y derecho */}
      {medidor > 0.01 && (
        <group scale={[medidor, medidor, medidor]}>
          <Cil r={0.035} h={d - 0.95} pos={[-(d + 0.95) / 2, 0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#C62828', 0.4)} seg={8} />
          <Cil r={0.035} h={d - 0.95} pos={[(d + 0.95) / 2, 0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#1A1A1A', 0.4)} seg={8} />
          <Caja tam={[1.9, 0.95, 0.35]} pos={[0, 0, 0.05]} material={M.color('#F2C230', 0.45)} radio={0.12} />
          <TextoPlano lineas={[{t: lectura, tam: 150, color: colorLectura, mono: true}]} w={1.6} h={0.55} pos={[0, 0.02, 0.24]} estilo={{fondo: '#0B0F14', radio: 30}} />
        </group>
      )}
      {/* alimentación: arriba +5 V, abajo 0 V (etiquetas al lado para no crecer en alto) */}
      <Cil r={0.035} h={0.45} pos={[0, d + 0.22, 0]} mat={M.color('#C62828', 0.4)} seg={8} />
      <Cil r={0.035} h={0.45} pos={[0, -d - 0.22, 0]} mat={M.color('#1A1A1A', 0.4)} seg={8} />
      {etiquetas && (
        <>
          <TextoPlano lineas={[{t: '+5 V', tam: 150, color: '#FF7B72'}]} w={1.5} h={0.55} pos={[1.15, d + 0.3, 0.1]} estilo={{fondo: '#0B0F14', radio: 30}} />
          <TextoPlano lineas={[{t: '0 V', tam: 150, color: '#C9D1D9'}]} w={1.3} h={0.55} pos={[1.05, -d - 0.3, 0.1]} estilo={{fondo: '#0B0F14', radio: 30}} />
        </>
      )}
    </group>
  );
};

/** El puente de pie para la vitrina. */
export const PuenteVitrina: React.FC<Anim> = ({t = 0, a = 0}) => {
  const c = a > 0.01 ? 0.5 + 0.5 * Math.sin(t * 1.3) : 0;
  return (
    <group position={[0, 3.1, 0]} scale={0.75}>
      <PuenteRombo d={2.0} cambios={[-c, c, c, -c]} lectura={`${(c * 10).toFixed(1).replace('.', ',')} mV`} etiquetas={false} />
    </group>
  );
};

// ------------------------------------------------------------------ electrónica
/** Módulo HX711 (verde), plano en XZ con los pines hacia arriba. */
export const HX711: React.FC<{conTextos?: boolean}> = ({conTextos = true}) => {
  const izq = ['E+', 'E−', 'A−', 'A+', 'B−', 'B+'];
  const der = ['GND', 'DT', 'SCK', 'VCC'];
  return (
    <group>
      <Caja tam={[3.6, 0.12, 2.2]} pos={[0, 0.06, 0]} material={M.color('#0F6B3A', 0.45)} radio={0.04} />
      <Caja tam={[1.0, 0.16, 0.62]} pos={[0.1, 0.2, -0.3]} material={M.plasticoNegro()} radio={0.02} />
      {Array.from({length: 8}, (_, i) =>
        [-1, 1].map((s) => <Caja key={`${i}${s}`} tam={[0.045, 0.03, 0.14]} pos={[0.1 - 0.39 + i * 0.112, 0.14, -0.3 + s * 0.36]} material={M.estano()} />),
      )}
      {izq.map((_, i) => (
        <group key={`i${i}`} position={[-1.55, 0.12, -0.85 + i * 0.34]}>
          <Cil r={0.1} h={0.03} pos={[0, 0.015, 0]} mat={M.oro()} seg={14} />
          <Caja tam={[0.07, 0.55, 0.07]} pos={[0, 0.28, 0]} material={M.oro()} />
        </group>
      ))}
      {der.map((_, i) => (
        <group key={`d${i}`} position={[1.55, 0.12, -0.51 + i * 0.34]}>
          <Cil r={0.1} h={0.03} pos={[0, 0.015, 0]} mat={M.oro()} seg={14} />
          <Caja tam={[0.07, 0.55, 0.07]} pos={[0, 0.28, 0]} material={M.oro()} />
        </group>
      ))}
      {conTextos && (
        <>
          <TextoPlano lineas={[{t: 'HX711', tam: 170, color: '#D9DDE1', mono: true}]} w={0.9} h={0.3} pos={[0.1, 0.29, -0.3]} rot={[-Math.PI / 2, 0, 0]} />
          {izq.map((s, i) => (
            <TextoPlano key={s} lineas={[{t: s, tam: 200, color: '#F2F2EE'}]} w={0.5} h={0.26} pos={[-1.12, 0.13, -0.85 + i * 0.34]} rot={[-Math.PI / 2, 0, 0]} />
          ))}
          {der.map((s, i) => (
            <TextoPlano key={s} lineas={[{t: s, tam: 200, color: '#F2F2EE'}]} w={0.62} h={0.26} pos={[1.08, 0.13, -0.51 + i * 0.34]} rot={[-Math.PI / 2, 0, 0]} />
          ))}
        </>
      )}
    </group>
  );
};
export const HX711Vitrina: React.FC<Anim> = () => (
  <group>
    <Caja tam={[1.6, 0.8, 0.8]} pos={[0, 0.4, 0.3]} material={M.plasticoNegro()} radio={0.08} />
    <group position={[0, 1.9, 0]} rotation={[1.1, 0, 0]} scale={1.3}>
      <HX711 />
    </group>
  </group>
);

// ------------------------------------------------------------------ básculas y usos
export const BasculaFrutas: React.FC<Anim> = ({a = 0}) => {
  const manzanas: V3[] = [[-0.6, 1.51, 0.1], [0.15, 1.51, -0.35], [0.7, 1.51, 0.3], [-0.1, 1.51, 0.6], [0.05, 2.12, 0.15]];
  return (
    <group>
      <Caja tam={[3.8, 1.0, 3.0]} pos={[0, 0.5, 0]} material={M.plasticoBlanco()} radio={0.15} />
      <Caja tam={[3.4, 0.1, 2.6]} pos={[0, 1.08, 0]} material={M.acero()} radio={0.04} />
      <Caja tam={[0.3, 2.4, 0.3]} pos={[0, 2.2, -1.3]} material={M.plasticoBlanco()} />
      <Caja tam={[2.4, 1.0, 0.4]} pos={[0, 3.6, -1.3]} material={M.plasticoBlanco()} radio={0.1} />
      <TextoPlano lineas={[{t: a > 0.01 ? '0,846 kg' : '0,000 kg', tam: 150, color: '#7CF0FF', mono: true}]} w={2.0} h={0.6} pos={[0, 3.62, -1.09]} estilo={{fondo: '#0B0F14', radio: 30}} />
      {manzanas.map((p, i) => (
        <group key={i} position={p}>
          <Esf r={0.42} esc={[1, 0.9, 1]} mat={M.goma(i % 2 ? '#B3261E' : '#D23B2A')} seg={24} />
          <Cil r={0.03} h={0.2} pos={[0, 0.42, 0]} mat={M.color('#5A3B1C', 0.7)} />
        </group>
      ))}
    </group>
  );
};

/** Impresora 3D de cama móvil; la boquilla baja hasta tocar la cama. */
export const Impresora3D: React.FC<Anim> = ({t = 0, a = 0}) => {
  const toque = a > 0.01 ? Math.max(0, Math.sin(t * 2.2)) : 0;
  // la boquilla baja hasta rozar la cama (punta en y = 0,94)
  const yE = 1.79 + (1 - toque) * 1.2;
  const marco = M.color('#E36B1E', 0.4, 0.2);
  return (
    <group>
      <Caja tam={[4.2, 0.4, 3.4]} pos={[0, 0.2, 0]} material={M.color('#26292E', 0.45, 0.4)} radio={0.06} />
      <Caja tam={[3.4, 0.08, 3.0]} pos={[0, 0.9, 0]} material={M.color('#2C2C2C', 0.75, 0.3)} radio={0.04} />
      <Caja tam={[0.5, 0.45, 0.5]} pos={[0, 0.62, 0]} material={M.aceroMate()} />
      {[-1.8, 1.8].map((x) => (
        <Caja key={x} tam={[0.35, 5.2, 0.35]} pos={[x, 2.8, -1.2]} material={marco} />
      ))}
      <Caja tam={[3.95, 0.35, 0.35]} pos={[0, 5.4, -1.2]} material={marco} />
      <Cil r={0.06} h={3.6} pos={[0, yE, -1.2]} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
      <Caja tam={[0.9, 1.1, 1.4]} pos={[0, yE, -0.5]} material={M.color('#1E2024', 0.4)} radio={0.08} />
      <mesh position={[0, yE - 0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.12, 0.3, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.25} />
      </mesh>
      {toque > 0.97 && <Esf r={0.16} pos={[0, 0.97, 0]} mat={M.emisivo('#7CF0FF', 2.5)} seg={10} />}
    </group>
  );
};

export const BasculaCocina: React.FC<Anim> = ({a = 0}) => (
  <group>
    <Caja tam={[3.4, 0.45, 3.4]} pos={[0, 0.25, 0]} material={M.plasticoBlanco()} radio={0.2} />
    <Caja tam={[3.1, 0.06, 3.1]} pos={[0, 0.5, 0]} material={M.vidrio()} radio={0.12} />
    <Caja tam={[1.4, 0.04, 0.5]} pos={[0, 0.48, 1.35]} material={M.color('#0B0F14', 0.2)} />
    <TextoPlano lineas={[{t: a > 0.01 ? '250 g' : '0 g', tam: 130, color: '#7CF0FF', mono: true}]} w={1.3} h={0.42} pos={[0, 0.51, 1.35]} rot={[-Math.PI / 2, 0, 0]} />
    <mesh position={[0, 1.31, -0.1]} rotation={[Math.PI, 0, 0]} scale={[1, 0.6, 1]} castShadow>
      <sphereGeometry args={[1.3, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#E9E4DA" roughness={0.35} side={THREE.DoubleSide} />
    </mesh>
    <Cil r={1.2} h={0.04} pos={[0, 1.2, -0.1]} mat={M.color('#E9C46A', 0.7)} seg={40} />
  </group>
);

export const Comedero: React.FC<Anim> = ({t = 0, a = 0}) => {
  const croquetas = useMemo(() => {
    const r = azar(310);
    return Array.from({length: 40}, () => {
      const ang = r() * Math.PI * 2;
      const rr = Math.sqrt(r()) * 1.0;
      return [Math.cos(ang) * rr, 0.4 + r() * 0.14, Math.sin(ang) * rr] as V3;
    });
  }, []);
  const quedan = a > 0.01 ? Math.max(0.15, 1 - ((t * 0.08) % 1)) : 1;
  return (
    <group>
      <Caja tam={[3.4, 0.25, 3.4]} pos={[0, 0.13, 0]} material={M.color('#2B2E33', 0.45)} radio={0.12} />
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[1.35, 1.1, 0.65, 48, 1, true]} />
        <meshStandardMaterial color="#E4E7EA" metalness={1} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <Cil r={1.1} h={0.05} pos={[0, 0.28, 0]} mat={M.acero()} seg={48} />
      <Toro r={1.33} tubo={0.07} pos={[0, 0.9, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} />
      {croquetas.slice(0, Math.round(croquetas.length * quedan)).map((p, i) => (
        <Esf key={i} r={0.13} pos={p} esc={[1, 0.7, 1]} mat={M.color(i % 3 ? '#8B5A2B' : '#A0522D', 0.8)} seg={8} />
      ))}
      <Esf r={0.12} pos={[1.4, 0.3, 1.4]} mat={M.emisivo(quedan < 0.3 ? '#FF5A4E' : '#7CFFB2', 2)} seg={10} />
    </group>
  );
};

export const Tornillos: React.FC<Anim> = ({a = 0}) => {
  const piezas = useMemo(() => {
    const r = azar(520);
    return Array.from({length: 46}, () => [(r() - 0.5) * 2.6, 0.75 + r() * 0.35, (r() - 0.5) * 1.6, r() * Math.PI, r() * Math.PI] as [number, number, number, number, number]);
  }, []);
  return (
    <group>
      <Caja tam={[3.6, 0.45, 2.6]} pos={[0, 0.25, 0]} material={M.color('#2B2E33', 0.45)} radio={0.1} />
      <Caja tam={[3.2, 0.06, 2.2]} pos={[0, 0.5, 0]} material={M.aceroMate()} />
      {[[-1.6, 0], [1.6, 0]].map(([x], i) => (
        <Caja key={i} tam={[0.08, 0.5, 2.2]} pos={[x, 0.75, 0]} material={M.aceroMate()} />
      ))}
      {piezas.map(([x, y, z, rx, ry], i) => (
        <group key={i} position={[x, y, z]} rotation={[rx, ry, 0]}>
          <Cil r={0.05} h={0.55} mat={M.acero()} seg={8} />
          <Cil r={0.11} h={0.06} pos={[0, 0.28, 0]} mat={M.acero()} seg={10} />
        </group>
      ))}
      <TextoPlano lineas={[{t: a > 0.01 ? '46 piezas' : '— piezas', tam: 130, color: '#7CF0FF', mono: true}]} w={2.2} h={0.55} pos={[0, 1.9, -1.0]} estilo={{fondo: '#0B0F14', radio: 30}} />
    </group>
  );
};

export const Colmena: React.FC<Anim> = ({t = 0, a = 0}) => {
  const madera = M.color('#C8A26B', 0.7);
  const abejas = useMemo(() => {
    const r = azar(77);
    return Array.from({length: 9}, () => [r() * Math.PI * 2, 1.6 + r() * 0.8, 1.0 + r() * 2.0, 0.6 + r()] as [number, number, number, number]);
  }, []);
  return (
    <group>
      <Caja tam={[3.0, 0.35, 2.4]} pos={[0, 0.18, 0]} material={M.color('#2B2E33', 0.45)} radio={0.06} />
      <Caja tam={[2.8, 1.3, 2.2]} pos={[0, 1.05, 0]} material={madera} radio={0.03} />
      <Caja tam={[2.8, 1.0, 2.2]} pos={[0, 2.22, 0]} material={M.color('#D9B47E', 0.7)} radio={0.03} />
      <Caja tam={[3.0, 0.25, 2.4]} pos={[0, 2.85, 0]} material={M.color('#9AA3AD', 0.4, 0.6)} radio={0.03} />
      <Caja tam={[1.2, 0.12, 0.05]} pos={[0, 0.5, 1.11]} material={M.color('#1A1208', 0.8)} />
      {a > 0.01 &&
        abejas.map(([f, y, rr, v], i) => {
          const ang = f + t * v * 2;
          return (
            <group key={i} position={[Math.cos(ang) * rr, y + Math.sin(t * 3 + i) * 0.2, Math.sin(ang) * rr * 0.6 + 0.8]}>
              <Esf r={0.09} esc={[1.5, 1, 1]} mat={M.color(i % 2 ? '#F2C230' : '#1A1A1A', 0.5)} seg={8} />
            </group>
          );
        })}
    </group>
  );
};

// ------------------------------------------------------------------ tres datos
/** Balanza de dos platos, equilibrada. */
export const Balanza: React.FC<Anim> = ({t = 0, a = 0}) => {
  const vaiven = a > 0.01 ? Math.sin(t * 1.5) * 0.06 * Math.exp(-t * 0.25) : 0;
  const plato = (x: number, y: number) => (
    <group position={[x, y, 0]}>
      {[0, 1, 2].map((k) => {
        const g = (k / 3) * Math.PI * 2;
        return <Tubo key={k} puntos={[[0, 0, 0], [Math.cos(g) * 0.85, -1.6, Math.sin(g) * 0.85]]} radio={0.02} material={M.laton()} seg={4} />;
      })}
      <Cil r={0.95} r2={0.75} h={0.15} pos={[0, -1.65, 0]} mat={M.laton()} seg={36} />
    </group>
  );
  const brazo = 1.9;
  const dy = Math.sin(vaiven) * brazo;
  return (
    <group>
      <Cil r={1.1} r2={1.3} h={0.35} pos={[0, 0.18, 0]} mat={M.color('#5A3B1C', 0.6)} seg={36} />
      <Cil r={0.12} h={3.6} pos={[0, 2.1, 0]} mat={M.laton()} />
      <mesh position={[0, 4.05, 0]} rotation={[0, 0, vaiven]}>
        <boxGeometry args={[brazo * 2 + 0.2, 0.14, 0.18]} />
        <meshStandardMaterial color="#C99A45" metalness={1} roughness={0.3} />
      </mesh>
      {plato(-brazo, 4.0 - dy)}
      {plato(brazo, 4.0 + dy)}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * brazo, 2.7 + s * dy, 0]}>
          <Cil r={0.32} h={0.55} mat={M.laton()} seg={24} />
          <Cil r={0.1} h={0.18} pos={[0, 0.36, 0]} mat={M.laton()} seg={16} />
        </group>
      ))}
    </group>
  );
};

/** El kilogramo patrón (1889–2019): cilindro de platino e iridio bajo tres campanas de vidrio. */
export const KilogramoPatron: React.FC<Anim> = () => {
  const vidrio = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#DDEBF2', roughness: 0.05, transparent: true, opacity: 0.16, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide}), []);
  const campana = (r: number, h: number, i: number) => (
    <group key={i}>
      <mesh position={[0, 0.4 + h / 2, 0]} material={vidrio}>
        <cylinderGeometry args={[r, r, h, 48, 1, true]} />
      </mesh>
      <mesh position={[0, 0.4 + h, 0]} material={vidrio}>
        <sphereGeometry args={[r, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
  return (
    <group>
      <Cil r={2.2} h={0.4} pos={[0, 0.2, 0]} mat={M.color('#2B2E33', 0.35, 0.5)} seg={48} />
      <Cil r={0.5} h={1.0} pos={[0, 0.9, 0]} mat={M.color('#D9DCDF', 0.15, 1)} seg={48} />
      {campana(0.95, 1.4, 0)}
      {campana(1.4, 2.0, 1)}
      {campana(1.9, 2.6, 2)}
    </group>
  );
};

export const CATALOGO_S10 = {
  galga: {C: GalgaVitrina, alto: 3.5},
  bobina: {C: ExperimentoKelvin, alto: 6.0, escala: 0.85},
  impacto: {C: TorreImpacto, alto: 6.5, escala: 0.8},
  tanqueElevado: {C: TanqueElevado as React.FC<Anim>, alto: 6.9, escala: 0.8},
  wheatstone: {C: PuenteVitrina, alto: 6.1},
  hx711: {C: HX711Vitrina, alto: 3.0},
  basculaFrutas: {C: BasculaFrutas, alto: 4.2},
  impresora3d: {C: Impresora3D, alto: 5.6, escala: 0.85},
  basculaCocina: {C: BasculaCocina, alto: 2.6},
  comedero: {C: Comedero, alto: 1.2},
  tornillos: {C: Tornillos, alto: 2.3},
  colmena: {C: Colmena, alto: 3.0},
  balanza: {C: Balanza, alto: 4.3},
  kilogramo: {C: KilogramoPatron, alto: 3.4},
};
