// S10 · Galgas extensiométricas — escenas 3D.
// Las deformaciones se exageran para que se vean, y cada vez que pasa se dice en pantalla.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, ClaveCam, Estudio, orbita, V3} from '../Estudio';
import {TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Tubo} from '../modelos/Piezas';
import {Cil, Esf} from '../modelos/Objetos';
import {Persona} from '../modelos/ObjetosS03';
import {CeldaCarga} from '../modelos/ObjetosS09';
import {BasculaCocina, GalgaFoil, HX711, PuenteRombo, TanqueElevado} from '../modelos/ObjetosS10';
import {Osciloscopio3D, Pedestal} from '../modelos/Instrumentos';
import {CATALOGO} from '../modelos/catalogo';
import {azar} from '../texturas';
import {Linea, TextoPlano} from '../texto3d';

const Q = {escala: 0.8} as const;

/** Cartel 3D que siempre mira a la cámara. */
const Cartel: React.FC<{cam: Camara; pos: V3; lineas: Linea[]; w: number; h: number; op?: number; fondo?: boolean; px?: number}> = ({cam, pos, lineas, w, h, op = 1, fondo = true, px}) => {
  if (op <= 0.01) return null;
  const dx = cam.pos[0] - pos[0];
  const dy = cam.pos[1] - pos[1];
  const dz = cam.pos[2] - pos[2];
  const giro = new THREE.Euler(Math.atan2(-dy, Math.hypot(dx, dz)), Math.atan2(dx, dz), 0, 'YXZ');
  return (
    <group position={pos} rotation={giro}>
      <TextoPlano lineas={lineas} w={w} h={h} estilo={fondo ? {fondo: '#0B0F14', radio: 30} : {}} op={op} px={px} />
    </group>
  );
};
const coma = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const miles = (v: number) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ------------------------------------------------------------------ báscula de baño con "rayos X"
const ESQUINAS: [number, number][] = [[-1.95, -1.95], [1.95, -1.95], [-1.95, 1.95], [1.95, 1.95]];
const COLORES_CABLE = ['#C62828', '#1A1A1A', '#2E7D32', '#F2F2EE'];

/** Celda de media galga de una pata: placa con una lengüeta que se dobla (exagerado con `flexion`). */
const CeldaPata: React.FC<{pos: V3; rotY: number; flexion: number; brillo: number}> = ({pos, rotY, flexion, brillo}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Cil r={0.42} h={0.12} pos={[0, 0.06, 0]} mat={M.goma('#151617')} seg={24} />
    <Caja tam={[1.0, 0.1, 1.0]} pos={[0, 0.17, 0]} material={M.aceroMate()} radio={0.03} />
    <group position={[-0.32, 0.27, 0]} rotation={[0, 0, -flexion * 0.14]}>
      <Caja tam={[0.72, 0.08, 0.3]} pos={[0.36, 0, 0]} material={M.acero()} />
      <mesh position={[0.3, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.2]} />
        <meshBasicMaterial color={brillo > 0.05 ? '#FF8A3D' : '#C9A44C'} toneMapped={false} transparent opacity={0.6 + 0.4 * brillo} />
      </mesh>
    </group>
    <Cil r={0.12} h={0.26} pos={[0.36, 0.43 - flexion * 0.09, 0]} mat={M.plasticoNegro()} seg={16} />
  </group>
);

const BasculaRayos: React.FC<{rayos?: number; flexion?: number; brillo?: number; peso?: string; lecturas?: string[]; opLecturas?: number}> = ({
  rayos = 0,
  flexion = 0,
  brillo = 0,
  peso = '0,0 kg',
  lecturas,
  opLecturas = 0,
}) => {
  const tapa = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#EEF2F5', roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.95}), []);
  tapa.opacity = 0.95 - 0.82 * rayos;
  tapa.depthWrite = rayos < 0.3;
  return (
    <group>
      <Caja tam={[5.2, 0.1, 5.2]} pos={[0, 0.05, 0]} material={M.color('#2B2E33', 0.5)} radio={0.05} />
      {ESQUINAS.map(([x, z], i) => (
        <CeldaPata key={i} pos={[x, 0.1, z]} rotY={Math.atan2(z, -x)} flexion={flexion} brillo={brillo} />
      ))}
      {ESQUINAS.map(([x, z], i) => (
        <Tubo key={`c${i}`} puntos={[[x * 0.78, 0.32, z * 0.78], [x * 0.45, 0.36, z * 0.4], [x * 0.15, 0.24, z * 0.12]]} radio={0.03} material={M.color(COLORES_CABLE[i], 0.4)} seg={16} />
      ))}
      <Caja tam={[1.0, 0.06, 0.7]} pos={[0, 0.2, 0]} material={M.color('#0F6B3A', 0.45)} />
      <Caja tam={[5.2, 0.12, 5.2]} pos={[0, 0.62, 0]} material={tapa} radio={0.25} />
      <Caja tam={[1.7, 0.03, 0.6]} pos={[0, 0.695, 1.9]} material={M.color('#0B0F14', 0.2)} />
      <TextoPlano lineas={[{t: peso, tam: 150, color: '#7CF0FF', mono: true}]} w={1.6} h={0.5} pos={[0, 0.715, 1.9]} rot={[-Math.PI / 2, 0, 0]} />
      {lecturas &&
        opLecturas > 0.01 &&
        ESQUINAS.map(([x, z], i) => (
          <TextoPlano key={`l${i}`} lineas={[{t: lecturas[i], tam: 150, color: '#FFB547', mono: true}]} w={1.9} h={0.6} pos={[x * 1.32, 1.5, z * 1.32]} rot={[-0.7, 0, 0]} estilo={{fondo: '#0B0F14', radio: 30}} op={opLecturas} />
        ))}
    </group>
  );
};

/** Persona que llega caminando de lado y se sube a la báscula (queda mirando a la cámara). */
const PersonaSube: React.FC<{t: number}> = ({t}) => {
  const avance = clamp01(t / 2.0);
  const x = mix(-4.6, 0, avance);
  const sube = ap(t, 1.55, 0.45, easeInOut);
  const gira = ap(t, 2.0, 0.6, easeInOut);
  const paso = t < 2.0 ? t * 7.5 : 0;
  return (
    <group position={[x, 0.68 * sube, 0]} rotation={[0, (Math.PI / 2) * (1 - gira), 0]}>
      <Persona paso={paso} t={t} />
    </group>
  );
};

// ------------------------------------------------------------------ gancho (y cierre): la báscula se dobla
export const BasculaGancho3D: React.FC<{final?: boolean}> = ({final = false}) => {
  const {t, M: m, dur} = useEscena();
  const tD = m('dobla', 3.3);
  const tP = m('poco', 7.6);
  const tCa = m('cabello', final ? 8.5 : 15.3);
  const tCi = m('cien', 22.8);
  const tN = m('nota', 10.7);
  const kg = 72.4 * ap(t, 2.3, 1.2);
  const peso = `${coma(Math.round(kg * 10) / 10)} kg`;
  const rayos = final ? ap(t, 3.2, 1.2) : ap(t, tD - 0.3, 0.9);
  const flexion = final ? 0.25 * ap(t, 3.8, 1.0) : ap(t, tD + 0.3, 0.9) * (1 - 0.85 * ap(t, tP + 0.8, 1.2));
  const brillo = final ? ap(t, 4.2, 0.8) : ap(t, tP + 1.6, 0.6);
  const micro = !final && t > tCa - 0.4 && t < tCi + 0.4;
  const claves: ClaveCam[] = final
    ? [
        {t: 0, pos: [3, 7, 19], obj: [-1, 3.2, 0], fov: 30},
        {t: 3.0, d: 4.0, pos: [6.5, 5.5, 11], obj: [0.5, 1.4, 0.5], fov: 30},
        {t: tN - 0.4, d: 1.4, pos: [0.4, 4.4, 6.6], obj: [0, 0.8, 1.6], fov: 30},
      ]
    : [
        {t: 0, pos: [3, 7, 19], obj: [-1, 3.2, 0], fov: 30},
        {t: tD - 0.3, d: 2.0, pos: [6.0, 4.6, 9.8], obj: [0.6, 0.7, 0.6], fov: 30},
        {t: tP + 0.6, d: 2.2, pos: [4.2, 1.9, 4.9], obj: [1.9, 0.35, 1.9], fov: 28},
        {t: tCa - 0.2, d: 0.05, pos: [60, 4.0, 22], obj: [60, 3.3, 0], fov: 34},
        {t: tCi - 0.25, d: 0.05, pos: [0.4, 4.4, 6.6], obj: [0, 0.8, 1.6], fov: 30},
      ];
  const cam: Camara = camaraEn(claves, t);
  const exagera = !final && flexion > 0.3 && t < tCa;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={micro ? [60, 2, 0] : [0, 1, 0]} {...Q}>
        <BasculaRayos rayos={rayos} flexion={flexion} brillo={brillo} peso={peso} />
        <PersonaSube t={t} />
        {exagera && <Cartel cam={cam} pos={[2.7, 1.55, 2.7]} lineas={[{t: 'deformación exagerada', tam: 110, color: '#FFB547'}]} w={2.4} h={0.38} op={clamp01((flexion - 0.3) * 4)} />}
        {!final && t > tP + 1.6 && t < tCa && <Cartel cam={cam} pos={[1.45, 0.62, 2.8]} lineas={[{t: 'la galga se estira ~5 µm', tam: 110, color: '#FF8A3D'}]} w={0.95} h={0.17} op={ap(t, tP + 1.8, 0.5)} />}
        {micro && (
          <group position={[60, 0, 0]}>
            <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[3.5, 3.5, 34, 72]} />
              <meshStandardMaterial color="#4A3324" roughness={0.5} metalness={0.05} />
            </mesh>
            {Array.from({length: 9}, (_, i) => (
              <mesh key={i} position={[-16 + i * 4, 3.8, 0]} rotation={[0, 0, Math.PI / 2 + 0.25]}>
                <torusGeometry args={[3.52, 0.04, 6, 72]} />
                <meshStandardMaterial color="#3A281C" roughness={0.6} />
              </mesh>
            ))}
            <Caja tam={[0.5, 0.2, 0.2]} pos={[0, 3.8, 3.75]} material={M.emisivo('#FF8A3D', 3)} />
            <mesh position={[0, 3.8, 3.8]}>
              <torusGeometry args={[0.6, 0.035, 8, 48]} />
              <meshBasicMaterial color="#FF8A3D" toneMapped={false} transparent opacity={0.5 + 0.5 * Math.sin(t * 5) ** 2} />
            </mesh>
            <TextoPlano lineas={[{t: 'un cabello: ~70 µm de grosor', tam: 100, color: '#E8EAED'}]} w={7.5} h={0.8} pos={[-5.5, 5.6, 3.6]} estilo={{fondo: '#0B0F14', radio: 30}} op={ap(t, tCa, 0.5)} />
            <TextoPlano lineas={[{t: '← lo que se estira la galga: ~5 µm', tam: 100, color: '#FF8A3D'}]} w={7.2} h={0.78} pos={[4.1, 3.8, 3.8]} estilo={{fondo: '#0B0F14', radio: 30}} op={ap(t, tCa + 1.2, 0.5)} />
            <TextoPlano lineas={[{t: 'ampliado miles de veces', tam: 90, color: '#9AA3AD'}]} w={4.2} h={0.5} pos={[3.5, 1.4, 3.8]} op={ap(t, tCa + 0.6, 0.5)} />
          </group>
        )}
        {final && t > tN && (
          <TextoPlano lineas={[{t: '✓', tam: 300, color: '#7CFFB2'}]} w={0.8} h={0.8} pos={[1.4, 1.1, 2.0]} rot={[-0.55, 0, 0]} op={ap(t, tN + 0.2, 0.4)} />
        )}
      </Estudio>
      {final ? (
        <>
          <TituloGrande texto="la próxima vez que te subas a una báscula…" p={ap(t, 0.3, 0.5) * sal(t, tCa - 0.3, 0.3)} y={96} />
          <TituloGrande texto="un metal que se estira menos que un cabello…" p={ap(t, tCa, 0.5) * sal(t, tN - 0.3, 0.3)} y={96} />
          <TituloGrande texto="…y lo nota" p={ap(t, tN, 0.5) * sal(t, dur, 0.3)} y={96} />
        </>
      ) : (
        <>
          <TituloGrande texto="cuando te subes a una báscula…" p={ap(t, 0.2, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
          <TituloGrande texto="…el metal de abajo se dobla" p={ap(t, tD, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
          <TituloGrande texto="muy poco: unas millonésimas de metro" p={ap(t, tP, 0.5) * sal(t, tCa - 0.3, 0.3)} y={96} />
          <TituloGrande texto="mucho menos que el grosor de un cabello" p={ap(t, tCa, 0.5) * sal(t, tCi - 0.3, 0.3)} y={96} />
          <TituloGrande texto="y aun así marca de 100 en 100 gramos" p={ap(t, tCi, 0.5) * sal(t, dur, 0.3)} y={96} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cuatro patas, cuatro sensores
export const CuatroPatas3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tC = m('cuatro', 6.2);
  const tS = m('suman', 8.9);
  const rayos = ap(t, tC - 0.8, 1.0);
  const lecturas = ['17,2 kg', '19,1 kg', '18,9 kg', '17,2 kg'];
  const cam: Camara = camaraEn(
    [
      {t: 0, pos: [-3.5, 8.5, 22], obj: [-3.0, 3.0, 0], fov: 30},
      {t: tC - 1.0, d: 2.0, pos: [0.5, 15.5, 14], obj: [0.4, 0.6, 0.6], fov: 30},
    ],
    t,
  );
  const suma = ap(t, tS, 0.6);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <BasculaRayos rayos={rayos} flexion={0.2 * rayos} brillo={rayos} peso="72,4 kg" />
        {ESQUINAS.map(([x, z], i) => (
          <Cartel key={i} cam={cam} pos={[x * 1.5, 1.3, z * 1.5]} lineas={[{t: lecturas[i], tam: 150, color: '#FFB547', mono: true}]} w={1.8} h={0.55} op={ap(t, tC + i * 0.25, 0.5)} />
        ))}
        <group position={[0, 0.68, 0]}>
          <Persona />
        </group>
        <group position={[-7.0, 0, 0.8]} scale={1.1}>
          <BasculaCocina a={1} />
        </group>
        <Cartel
          cam={cam}
          pos={[5.7, 1.6, 0.2]}
          lineas={[
            {t: '  17,2', tam: 120, color: '#FFB547', mono: true},
            {t: '+ 19,1', tam: 120, color: '#FFB547', mono: true},
            {t: '+ 18,9', tam: 120, color: '#FFB547', mono: true},
            {t: '+ 17,2', tam: 120, color: '#FFB547', mono: true},
            {t: '= 72,4 kg', tam: 130, color: '#7CF0FF', mono: true},
          ]}
          w={2.6}
          h={3.2}
          op={suma}
        />
      </Estudio>
      <TituloGrande texto="básculas de baño y de cocina" p={ap(t, 0.2, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la de baño: un sensor en cada pata" p={ap(t, tC, 0.5) * sal(t, tS - 0.3, 0.3)} y={96} />
      <TituloGrande texto="y suma lo que mide cada uno" p={ap(t, tS, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ la galga: zigzag, factor de galga y el ejemplo de 350 Ω
const GL = 2.4;
const GW = 1.5;
const GN = 10;
/** Recorrido de la corriente por la rejilla (coordenadas locales de GalgaFoil). */
const RECORRIDO: V3[] = (() => {
  const zs = Array.from({length: GN}, (_, i) => -GW / 2 + (i * GW) / (GN - 1));
  const pts: V3[] = [[-GL / 2 - 0.8, 0.07, zs[0]]];
  zs.forEach((z, i) => {
    const x0 = i % 2 === 0 ? -GL / 2 : GL / 2;
    pts.push([x0, 0.07, z], [-x0, 0.07, z]);
  });
  pts.push([-GL / 2 - 0.8, 0.07, zs[GN - 1]]);
  return pts;
})();
const LARGOS = RECORRIDO.map((p, i) => (i ? Math.hypot(p[0] - RECORRIDO[i - 1][0], p[2] - RECORRIDO[i - 1][2]) : 0)).reduce<number[]>((acc, d, i) => [...acc, (acc[i - 1] ?? 0) + d], []);
const TOTAL = LARGOS[LARGOS.length - 1];
const puntoEn = (s: number): V3 => {
  const d = ((s % TOTAL) + TOTAL) % TOTAL;
  let i = 1;
  while (i < LARGOS.length - 1 && LARGOS[i] < d) i++;
  const q = (d - LARGOS[i - 1]) / Math.max(1e-6, LARGOS[i] - LARGOS[i - 1]);
  const a = RECORRIDO[i - 1];
  const b = RECORRIDO[i];
  return [mix(a[0], b[0], q), 0.08, mix(a[2], b[2], q)];
};

/** Multímetro amarillo de pie, mirando a +z. */
const Multimetro: React.FC<{pos: V3; lectura: string; color?: string}> = ({pos, lectura, color = '#7CFFB2'}) => (
  <group position={pos}>
    <Caja tam={[2.2, 3.4, 0.6]} pos={[0, 1.7, 0]} material={M.color('#F2C230', 0.45)} radio={0.18} />
    <Caja tam={[1.8, 0.8, 0.05]} pos={[0, 2.6, 0.31]} material={M.color('#0B0F14', 0.2)} />
    <TextoPlano lineas={[{t: lectura, tam: 150, color, mono: true}]} w={1.75} h={0.62} pos={[0, 2.6, 0.34]} />
    <Cil r={0.55} h={0.15} pos={[0, 1.3, 0.32]} rot={[Math.PI / 2, 0, 0]} mat={M.plasticoNegro()} seg={32} />
    {[-0.5, 0.5].map((x) => (
      <Cil key={x} r={0.12} h={0.12} pos={[x, 0.4, 0.32]} rot={[Math.PI / 2, 0, 0]} mat={M.color(x < 0 ? '#1A1A1A' : '#C62828', 0.4)} seg={16} />
    ))}
  </group>
);

export const GalgaZigzag3D: React.FC<{modo?: 'presenta' | 'explica'}> = ({modo = 'explica'}) => {
  const {t, M: m, dur} = useEscena();
  const explica = modo === 'explica';
  // presenta
  const tG = m('galga', 0.1);
  const tZp = m('zigzag', 5.8);
  const tEs = m('estiras', 8.4);
  // explica
  const tZ = m('zigzag', 5.6);
  const tDi = m('direccion', 20.7);
  const tF = m('factor', 24.9);
  const tMi = m('millonesimas', 36.7);
  const tEj = m('ejemplo', 39.4);
  const tOh = m('ohmios', 51.0);
  const tTr = m('truco', 53.8);
  const pega = explica ? ap(t, tZ + 4.0, 2.0, easeInOut) : 1;
  const alto = mix(2.0, 0, pega);
  const tira = explica ? ap(t, tDi, 1.2) * sal(t, tF + 1.0, 1.0) : ap(t, tEs, 1.0);
  const e = 0.14 * tira;
  const corriente = explica ? ap(t, tZ + 6.5, 0.6) : ap(t, tZp, 0.6);
  const tSigma = explica ? ap(t, tOh, 0.8) : ap(t, tEs + 0.3, 0.8);
  const lectura = `${coma(350 + 0.7 * tSigma)} Ω`;
  const cam: Camara = explica
    ? camaraEn(
        [
          {t: 0, pos: [2.0, 7.5, 15.0], obj: [0.6, 2.2, -1.0], fov: 30},
          {t: tDi - 0.4, d: 1.6, pos: [1.0, 9.0, 10.0], obj: [0.3, 1.2, 0], fov: 30},
          {t: tF - 0.3, d: 2.0, pos: [2.0, 7.5, 15.0], obj: [0.6, 2.2, -1.0], fov: 30},
        ],
        t,
      )
    : orbita([0.8, 1.2, 0], 12.5, 6.5, -24 + t * 2.0, 30);
  const placa = (texto: string, sub: string, desde: number, hasta: number, color = '#7CF0FF') =>
    t > desde - 0.1 && t < hasta + 0.4 ? (
      <TextoPlano
        lineas={[{t: texto, tam: 120, color}, {t: sub, tam: 80, color: '#C9D1D9', peso: 600}]}
        w={9.6}
        h={1.9}
        pos={[0.6, 3.2, -3.4]}
        estilo={{fondo: '#0B0F14', radio: 40}}
        op={ap(t, desde, 0.5) * sal(t, hasta, 0.3)}
        px={2048}
      />
    ) : null;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {/* la pieza de acero (se estira con la galga) */}
        <group scale={[1 + e, 1, 1 - 0.3 * e]}>
          <Caja tam={[9.5, 0.3, 3.6]} pos={[0, 1.0, 0]} material={M.aceroMate()} radio={0.05} />
        </group>
        {tira > 0.01 &&
          [-1, 1].map((s) => (
            <group key={s} position={[s * (4.75 * (1 + e) + 0.9), 1.0, 0]} rotation={[0, 0, (-s * Math.PI) / 2]}>
              <mesh position={[0, 0.4, 0]}>
                <coneGeometry args={[0.35, 0.8, 20]} />
                <meshBasicMaterial color="#FFB547" toneMapped={false} transparent opacity={tira} />
              </mesh>
              <Cil r={0.12} h={1.0} pos={[0, -0.4, 0]} mat={M.emisivo('#FFB547', 1.2)} />
            </group>
          ))}
        <group position={[0.6 * (1 + e), 1.16 + alto, 0]} scale={1.6}>
          <GalgaFoil estira={e} brillo={tira * 2.5 + corriente * 0.4} />
          {corriente > 0.01 && (
            <group scale={[1 + e, 1, 1 - 0.3 * e]}>
              {Array.from({length: 7}, (_, i) => (
                <Esf key={i} r={0.07} pos={puntoEn(t * 5.5 + (i * TOTAL) / 7)} mat={M.emisivo('#7CF0FF', 3)} seg={10} />
              ))}
            </group>
          )}
        </group>
        <Multimetro pos={[6.4, 0, 0.4]} lectura={lectura} color={tSigma > 0.5 ? '#FFB547' : '#7CFFB2'} />
        {[-1, 1].map((s) => {
          // de los bornes del multímetro, por detrás de la pieza, hasta las patas de la galga
          const fin: V3 = [0.6 * (1 + e) + 1.6 * (1 + e) * -3.8, 1.16 + alto + 1.6 * 0.2, s * 1.6 * 0.7 * (1 - 0.3 * e)];
          return (
            <Tubo
              key={s}
              puntos={[[6.4 + s * 0.5, 0.4, 0.75], [6.9 + s * 0.3, 0.3, -1.2], [5.0, 0.5, -2.6 - s * 0.15], [-2.0, 0.7, -2.7 - s * 0.15], [-5.6, 1.0, -2.2 - s * 0.1], [fin[0] - 0.5, fin[1], fin[2]], fin]}
              radio={0.045}
              material={M.color(s < 0 ? '#1A1A1A' : '#C62828', 0.4)}
              seg={60}
            />
          );
        })}
        {explica && (
          <>
            {placa('una galga: un hilo largo en zigzag', 'muchas idas y vueltas sobre una película plástica', tZ + 6.2, tDi - 0.3)}
            {placa('factor de galga ≈ 2', 'ΔR/R  =  2 × ΔL/L', tF, tEj - 0.3)}
            {placa('1 millonésima de estiramiento', '→ 2 millonésimas de cambio en la resistencia', tMi, tEj - 0.3, '#FFB547')}
            {placa('350 Ω · estirada 1 milésima', '350 × 2 × 0,001 = 0,7 Ω', tEj, dur, '#7CFFB2')}
          </>
        )}
      </Estudio>
      {explica ? (
        <>
          <TituloGrande texto="el cambio es pequeñísimo" p={ap(t, 0.2, 0.5) * sal(t, tZ - 0.3, 0.3)} y={96} />
          <TituloGrande texto="por eso la galga va en zigzag" sub="pegada a la pieza" p={ap(t, tZ, 0.5) * sal(t, tDi - 0.3, 0.3)} y={96} />
          <TituloGrande texto="todo se estira en la misma dirección" sub="estiramiento exagerado" p={ap(t, tDi, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
          <TituloGrande texto="el factor de galga" sub="en las galgas metálicas, cerca de 2" p={ap(t, tF, 0.5) * sal(t, tEj - 0.3, 0.3)} y={96} />
          <TituloGrande texto="un ejemplo con una galga de 350 Ω" p={ap(t, tEj, 0.5) * sal(t, tOh - 0.3, 0.3)} y={96} />
          <TituloGrande texto="apenas 0,7 Ω: un 0,2 %" p={ap(t, tOh, 0.5) * sal(t, tTr - 0.3, 0.3)} y={96} />
          <TituloGrande texto="medir algo así exige un truco" p={ap(t, tTr, 0.5) * sal(t, dur, 0.3)} y={96} />
        </>
      ) : (
        <>
          <TituloGrande texto="galga extensiométrica" sub="«strain gauge» en inglés" p={ap(t, tG + 0.1, 0.5) * sal(t, tZp - 0.3, 0.3)} y={96} />
          <TituloGrande texto="una tira de metal finísima, en zigzag" p={ap(t, tZp, 0.5) * sal(t, tEs - 0.3, 0.3)} y={96} />
          <TituloGrande texto="si la estiras, su resistencia cambia" sub="estiramiento exagerado" p={ap(t, tEs, 0.5) * sal(t, dur, 0.3)} y={96} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ estirar un hilo: R = ρ·L/A
export const EstirarHilo3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tF = m('forma', 7.1);
  const tPa = m('pasillo', 14.1);
  const tE = m('estiras', 19.5);
  const tS = m('sube', 24.3);
  const tC = m('comprimes', 26.3);
  // ε exagerado; el radio baja con Poisson ≈ 0,3
  const eps = 0.2 * ap(t, tE, 1.4, easeInOut) * sal(t, tC - 0.1, 0.5) - 0.15 * ap(t, tC + 0.3, 1.0, easeInOut);
  const L = 8 * (1 + eps);
  const r = 0.55 * (1 - 0.3 * eps);
  const rel = (1 + eps) / (1 - 0.3 * eps) ** 2;
  const vidrio = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#D9874F', metalness: 0.3, roughness: 0.25, transparent: true, opacity: 0.42, depthWrite: false, clearcoat: 1}), []);
  // electrones: a voltaje fijo, la corriente baja cuando R sube
  const vel = 1.6 / rel;
  const fase = useMemo(() => {
    const r = azar(1856);
    return Array.from({length: 46}, () => [r(), r() * Math.PI * 2, 0.15 + r() * 0.7]);
  }, []);
  const cam: Camara = orbita([0, 2.4, 0], 16.5, 4.2, -6 + t * 0.35, 30);
  const flecha = (s: number, haciaFuera: boolean, op: number) => (
    <group key={`${s}${haciaFuera}`} position={[s * (L / 2 + 1.9), 2.2, 0]} rotation={[0, 0, haciaFuera ? (-s * Math.PI) / 2 : (s * Math.PI) / 2]}>
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.32, 0.7, 20]} />
        <meshBasicMaterial color={haciaFuera ? '#FFB547' : '#5AA9FF'} toneMapped={false} transparent opacity={op} />
      </mesh>
    </group>
  );
  const opEst = ap(t, tE, 0.4) * sal(t, tC - 0.1, 0.3);
  const opCom = ap(t, tC + 0.2, 0.4);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} material={vidrio}>
          <cylinderGeometry args={[r, r, L, 48, 1, false]} />
        </mesh>
        {fase.map(([u0, ang, rr], i) => {
          const u = (u0 + t * vel * 0.12) % 1;
          return <Esf key={i} r={0.07} pos={[-L / 2 + u * L, 2.2 + Math.sin(ang) * rr * r, Math.cos(ang) * rr * r]} mat={M.emisivo('#7CF0FF', 2.6)} seg={8} />;
        })}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Caja tam={[0.9, 1.9, 1.9]} pos={[s * (L / 2 + 0.45), 2.2, 0]} material={M.color('#3A4048', 0.45, 0.5)} radio={0.08} />
            <Caja tam={[0.9, 2.2, 1.4]} pos={[s * (L / 2 + 0.45), 0.65, 0]} material={M.color('#2B2E33', 0.5, 0.3)} />
          </group>
        ))}
        {opEst > 0.01 && [-1, 1].map((s) => flecha(s, true, opEst))}
        {opCom > 0.01 && [-1, 1].map((s) => flecha(s, false, opCom))}
        <TextoPlano
          lineas={[{t: 'R = ρ · L / A', tam: 150, color: '#FFFFFF', mono: true}, {t: 'L: largo   A: sección   ρ: el metal', tam: 70, color: '#9AA3AD', peso: 600}]}
          w={5.4}
          h={1.45}
          pos={[-4.6, 3.9, -0.5]}
          estilo={{fondo: '#0B0F14', radio: 40}}
          op={ap(t, tF, 0.6)}
        />
        <TextoPlano
          lineas={[{t: `R: ${Math.round(rel * 100)} %`, tam: 150, color: rel > 1.01 ? '#FFB547' : rel < 0.99 ? '#5AA9FF' : '#7CFFB2', mono: true}, {t: 'cambio exagerado', tam: 70, color: '#9AA3AD', peso: 600}]}
          w={3.6}
          h={1.35}
          pos={[4.8, 3.9, -0.5]}
          estilo={{fondo: '#0B0F14', radio: 40}}
          op={ap(t, tE - 0.4, 0.5)}
        />
      </Estudio>
      <TituloGrande texto="¿por qué cambia la resistencia?" p={ap(t, 0.2, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la resistencia depende de la forma" p={ap(t, tF, 0.5) * sal(t, tPa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="largo y delgado: le cuesta más pasar" sub="como avanzar por un pasillo largo y estrecho" p={ap(t, tPa, 0.5) * sal(t, tE - 0.3, 0.3)} y={96} />
      <TituloGrande texto="estirado: más largo y más delgado" sub="la resistencia sube" p={ap(t, tE, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="comprimido: más corto y más grueso" sub="la resistencia baja" p={ap(t, tC, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Ruge, 1938: el papel pegado al tanque
export const TanqueRuge3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('tanque', 3.0);
  const tF = m('funciono', 5.2);
  const tD = m('desde', 7.3);
  const sismo = ap(t, 0.3, 1.0);
  const dx = Math.sin(t * 9) * 0.14 * sismo;
  const vuela = ap(t, tT - 0.2, 1.4, easeInOut);
  const inicio: V3 = [4.2, 5.4, 4.5];
  const destino: V3 = [dx, 5.6, 1.63];
  const pos: V3 = inicio.map((v, i) => mix(v, destino[i], vuela)) as V3;
  const senal = ap(t, tF, 0.4);
  const muestras = Array.from({length: 220}, (_, i) => {
    const tt = t - 1.5 + (i / 219) * 1.5;
    return (tt > tF ? 0.75 * Math.sin(tt * 9) : 0) * senal + 0.015 * Math.sin(i * 1.7);
  });
  const cam: Camara = {pos: [-3.5 + t * 0.12, 7.6, 19.5], obj: [1.6, 4.4, 0], fov: 32};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[7.5, 0.6, 5.5]} pos={[0, 0.3, 0]} material={M.color('#2B2E33', 0.5, 0.3)} radio={0.05} />
        <group position={[dx, 0.6, 0]}>
          <Caja tam={[6.0, 0.25, 4.6]} pos={[0, 0.12, 0]} material={M.color('#7A5230', 0.7)} />
          <group position={[0, 0.25, 0]}>
            <TanqueElevado sacude={0} />
          </group>
        </group>
        <group position={pos} rotation={[Math.PI / 2, 0, 0]} scale={0.32}>
          <GalgaFoil colorPelicula="#F2EEE3" lineas={8} brillo={senal * 1.5} cables={false} />
        </group>
        <Osciloscopio3D pos={[7.4, 0, -1.2]} rotY={-0.45} escala={0.62} muestras={muestras} titulo="galga de Ruge" encendido={ap(t, tF - 0.6, 0.5)} />
      </Estudio>
      <TituloGrande texto="Ruge pegó un hilo finísimo sobre papel" p={ap(t, 0.1, 0.5) * sal(t, tT - 0.3, 0.3)} y={96} />
      <TituloGrande texto="…y pegó el papel al tanque" p={ap(t, tT, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="¡funcionó!" sub="la galga pegada, 1938" p={ap(t, tF, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="desde entonces, básica en ingeniería" p={ap(t, tD, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el puente de Wheatstone
export const PuenteWheatstone3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tW = m('wheatstone', 5.1);
  const tR = m('rombo', 8.5);
  const tCe = m('cero', 20.6);
  const tCa = m('cambia', 22.9);
  const tG = m('gracia', 28.9);
  const tCu = m('cuatro', 40.1);
  const tTe = m('temperatura', 47.0);
  const tMi = m('mili', 56.8);
  const una = ap(t, tCa, 0.8) * (1 - ap(t, tCu, 0.8));
  const cuatro = ap(t, tCu, 0.8);
  const calor = ap(t, tTe, 1.0) * (0.6 + 0.4 * Math.sin(t * 1.4));
  // resistencias (Ω): 0 arriba-izq, 1 abajo-izq, 2 arriba-der, 3 abajo-der; ΔR = 0,7 Ω
  const k = 1 + 0.004 * calor;
  const R = [350 - 0.7 * cuatro, 350 + 0.7 * (una + cuatro), 350 + 0.7 * cuatro, 350 - 0.7 * cuatro].map((v) => v * k);
  const vA = (5 * R[1]) / (R[0] + R[1]);
  const vB = (5 * R[3]) / (R[2] + R[3]);
  const mV = (vA - vB) * 1000;
  const medidor = ap(t, tCe - 0.6, 0.5);
  const cambios = [-cuatro, una + cuatro, cuatro, -cuatro];
  const cam: Camara = orbita([0, 4.6, 0], 19.5, 0.6, -6 + t * 0.2, 32);
  const aparece = (i: number) => ap(t, tR + i * 0.35, 0.5);
  const voltaje = (x: number, v: number, op: number) => (
    <TextoPlano lineas={[{t: `${v.toFixed(4).replace('.', ',')} V`, tam: 140, color: '#E8EAED', mono: true}]} w={2.9} h={0.62} pos={[x, 4.6 + 0.85, 0.3]} estilo={{fondo: '#0B0F14', radio: 30}} op={op} />
  );
  const opV = ap(t, tCe - 2.5, 0.5) * sal(t, tCu - 0.3, 0.3);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, 0]} {...Q}>
        <group position={[0, 4.6, 0]}>
          <PuenteRombo d={2.6} tablero={1.0} cambios={cambios} calor={calor} aparece={[0, 1, 2, 3].map(aparece)} medidor={medidor} lectura={`${coma(Math.abs(mV) < 0.005 ? 0 : mV, 2)} mV`} colorLectura={Math.abs(mV) > 0.05 ? '#FFB547' : '#7CFFB2'} />
        </group>
        {voltaje(-4.3, vA, opV)}
        {voltaje(4.3, vB, opV)}
        {t > tG - 0.2 && t < tCu && (
          <>
            <TextoPlano lineas={[{t: '0 → 2,5 mV', tam: 130, color: '#7CFFB2', mono: true}, {t: 'partir de cero: fácil', tam: 80, color: '#C9D1D9', peso: 600}]} w={4.6} h={1.5} pos={[-6.2, 2.3, 0.6]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tG, 0.5) * sal(t, tCu - 0.3, 0.3)} />
            <TextoPlano lineas={[{t: '2,5000 → 2,5025 V', tam: 110, color: '#FF7B72', mono: true}, {t: 'un 0,1 % de un valor grande: difícil', tam: 70, color: '#C9D1D9', peso: 600}]} w={4.6} h={1.5} pos={[6.2, 2.3, 0.6]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tG + 1.5, 0.5) * sal(t, tCu - 0.3, 0.3)} />
          </>
        )}
        {cuatro > 0.01 && (
          <TextoPlano lineas={[{t: '× 4', tam: 220, color: '#FFB547'}]} w={1.8} h={0.9} pos={[4.3, 5.45, 0.3]} estilo={{fondo: '#0B0F14', radio: 30}} op={cuatro * sal(t, tTe - 0.3, 0.3)} />
        )}
        {calor > 0.01 && (
          <TextoPlano lineas={[{t: 'las cuatro se calientan igual', tam: 100, color: '#FF7B72'}, {t: 'la lectura no cambia', tam: 80, color: '#7CFFB2', peso: 600}]} w={5.2} h={1.3} pos={[-6.2, 2.3, 0.6]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tTe + 0.6, 0.5) * sal(t, tMi - 0.3, 0.3)} />
        )}
      </Estudio>
      <TituloGrande texto="un truco de casi 200 años" sub="Christie lo describió en 1833; Wheatstone lo popularizó en 1843" p={ap(t, 0.2, 0.5) * sal(t, tW - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el puente de Wheatstone" p={ap(t, tW, 0.5) * sal(t, tR - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cuatro resistencias en rombo" sub="alimentadas por arriba y por abajo" p={ap(t, tR, 0.5) * sal(t, tCe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="iguales: la diferencia es cero" p={ap(t, tCe, 0.5) * sal(t, tCa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="si una cambia, aparece un voltajito" sub="aquí, +0,7 Ω en una galga" p={ap(t, tCa, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="medir desde cero es mucho más fácil" p={ap(t, tG, 0.5) * sal(t, tCu - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cuatro galgas: la señal × 4" sub="dos se estiran y dos se comprimen" p={ap(t, tCu, 0.5) * sal(t, tTe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el calor afecta a las cuatro: se cancela" p={ap(t, tTe, 0.5) * sal(t, tMi - 0.3, 0.3)} y={96} />
      <TituloGrande texto="aun así: unas milésimas de voltio" sub="10 mV = 0,010 V" p={ap(t, tMi, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ montaje de una celda de carga (fija a la izquierda, carga a la derecha)
const MontajeCelda: React.FC<{flexion: number; galgas?: number; children?: React.ReactNode}> = ({flexion, galgas = 1, children}) => {
  const dyR = -flexion * 0.6 * 0.972;
  return (
    <group>
      <Caja tam={[2.0, 0.9, 1.8]} pos={[-3.0, 0.45, 0]} material={M.color('#3A4048', 0.5, 0.4)} radio={0.05} />
      {[-0.35, 0.35].map((z) => (
        <Cil key={z} r={0.2} h={0.12} pos={[-3.4, 2.37, z]} mat={M.acero()} seg={6} />
      ))}
      <CeldaCarga flexion={flexion} galgas={galgas} />
      <group position={[3.2, dyR, 0]}>
        <Caja tam={[1.6, 0.3, 1.2]} pos={[0, 2.45, 0]} material={M.color('#3A4048', 0.5, 0.4)} />
        <Caja tam={[4.4, 0.16, 3.4]} pos={[0, 2.68, 0]} material={M.aceroMate()} radio={0.04} />
        <group position={[0, 2.76, 0]}>{children}</group>
      </group>
    </group>
  );
};
/** Contorno del agujero en «8» (frente de la barra). */
const CONTORNO_HUECO: V3[] = (() => {
  const pts: V3[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI / 2 + (i / 16) * Math.PI;
    pts.push([-0.9 + Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0]);
  }
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI;
    pts.push([0.9 + Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0]);
  }
  pts.push([-0.9, 0.5, 0]);
  return pts;
})();

export const CeldaDentro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tB = m('barra', 7.1);
  const tPt = m('puntos', 15.5);
  const tE = m('ese', 23.8);
  const tPu = m('puente', 31.3);
  const tCa = m('cables', 34.1);
  const tSe = m('senal', 40.1);
  const tD = m('decimas', 49.8);
  const tS = m('sobrecarga', 54.0);
  const cae = ap(t, tE, 0.6, easeInOut);
  const pesaY = mix(4.0, 0, cae) * (1 - ap(t, tS - 0.6, 0.5));
  // flexión exagerada (×20) hasta "décimas"; luego la real (~0,3 mm); al final, la sobrecarga
  const real = ap(t, tD, 1.0, easeInOut);
  const golpe = ap(t, tS + 0.2, 0.5);
  const quita = ap(t, tS + 2.6, 1.0, easeInOut);
  let flexion = cae * mix(1, 0.05, real);
  if (t > tS + 0.2) flexion = mix(0.05, 3.0, golpe) * (1 - quita) + 1.7 * quita;
  const grande = t > tS ? 1 - ap(t, tS + 2.6, 0.8) : 0;
  const galgas = ap(t, tPt + 0.8, 0.6);
  const marcas = ap(t, tPt, 0.5) * sal(t, tE + 2.0, 0.5);
  const hueco = ap(t, tB + 1.2, 0.5) * sal(t, tPt + 2.0, 0.5);
  const claves: ClaveCam[] = [
    {t: 0, pos: [-4.5, 6.0, 15], obj: [0.5, 1.9, 0], fov: 30},
    {t: tB - 0.3, d: 2.0, pos: [0.8, 3.2, 9.0], obj: [0, 1.6, 0], fov: 30},
    {t: tE - 0.4, d: 2.0, pos: [2.0, 4.8, 14.0], obj: [0.8, 2.0, 0], fov: 30},
    {t: tPu - 0.3, d: 1.6, pos: [5.0, 5.6, 16.5], obj: [3.0, 2.8, -1.0], fov: 30},
    {t: tCa - 0.3, d: 1.6, pos: [-6.5, 3.6, 9.0], obj: [-4.8, 1.6, 0.6], fov: 30},
    {t: tD - 0.3, d: 1.8, pos: [2.0, 4.2, 12.5], obj: [0.6, 1.8, 0], fov: 30},
    {t: tS - 0.3, d: 1.4, pos: [3.0, 5.6, 15.0], obj: [1.0, 2.4, 0], fov: 30},
  ];
  const cam: Camara = camaraEn(claves, t);
  const etiquetaCable = (texto: string, color: string, i: number, op: number) => (
    <Cartel cam={cam} pos={[-7.7, 2.45 - i * 0.48, 1.5]} lineas={[{t: texto, tam: 120, color}]} w={1.9} h={0.4} op={op} />
  );
  const gEtq = (texto: string, color: string, pos: V3, op: number) => <TextoPlano lineas={[{t: texto, tam: 120, color}]} w={2.4} h={0.5} pos={pos} estilo={{fondo: '#0B0F14', radio: 30}} op={op} />;
  const opEse = ap(t, tE + 1.0, 0.5) * sal(t, tPu - 0.3, 0.3);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <MontajeCelda flexion={flexion} galgas={galgas}>
          {pesaY < 3.95 && <Cil r={0.9} h={1.1} pos={[0, 0.55 + pesaY, 0]} mat={M.laton()} seg={40} />}
          {grande > 0.01 && t > tS - 0.6 && <Caja tam={[3.0, 2.0, 2.6]} pos={[0, 1.0 + mix(5, 0, ap(t, tS - 0.2, 0.4, easeInOut)) + quita * 4, 0]} material={M.color('#4A4F57', 0.5, 0.6)} radio={0.1} />}
        </MontajeCelda>
        {hueco > 0.01 && (
          <group position={[0, 1.6, 0.72]}>
            <Tubo puntos={CONTORNO_HUECO} radio={0.035} material={M.emisivo('#7CF0FF', 2)} seg={160} />
          </group>
        )}
        {marcas > 0.01 &&
          [[-0.9, 0.62], [0.9, 0.62], [-0.9, -0.62], [0.9, -0.62]].map(([x, y], i) => (
            <Esf key={i} r={0.13 * marcas} pos={[x, 1.6 + y, 0.72]} mat={M.emisivo('#FFB547', 3)} seg={12} />
          ))}
        {opEse > 0.01 && (
          <>
            {gEtq('se estira', '#FF8A3D', [-1.6, 3.2, 0.8], opEse)}
            {gEtq('se comprime', '#4F8DFF', [1.6, 3.2, 0.8], opEse)}
            {gEtq('se comprime', '#4F8DFF', [-1.6, -0.05 + 0.35, 1.2], opEse)}
            {gEtq('se estira', '#FF8A3D', [1.8, -0.05 + 0.35, 1.2], opEse)}
          </>
        )}
        {t > tPu - 0.3 && t < tCa + 0.5 && (
          <group position={[6.6, 3.4, -2.2]} scale={0.62}>
            <PuenteRombo d={2.0} tablero={1.0} cambios={[-1, 1, 1, -1]} lectura="10,0 mV" colorLectura="#FFB547" etiquetas={false} />
          </group>
        )}
        {etiquetaCable('rojo: E+', '#FF7B72', 0, ap(t, tCa, 0.4) * sal(t, tD - 0.3, 0.3))}
        {etiquetaCable('negro: E−', '#C9D1D9', 1, ap(t, tCa + 0.5, 0.4) * sal(t, tD - 0.3, 0.3))}
        {etiquetaCable('verde: S+', '#7CFFB2', 2, ap(t, tSe, 0.4) * sal(t, tD - 0.3, 0.3))}
        {etiquetaCable('blanco: S−', '#FFFFFF', 3, ap(t, tSe + 0.5, 0.4) * sal(t, tD - 0.3, 0.3))}
        {real > 0.01 && t < tS && <Cartel cam={cam} pos={[-2.3, 3.0, 0.9]} lineas={[{t: 'tamaño real: ~0,3 mm a plena carga', tam: 100, color: '#7CFFB2'}]} w={4.4} h={0.42} op={real * sal(t, tS - 0.3, 0.3)} />}
        {t > tS + 2.8 && <Cartel cam={cam} pos={[-2.3, 3.0, 0.9]} lineas={[{t: 'deformación permanente', tam: 110, color: '#FF5A4E'}]} w={3.6} h={0.44} op={ap(t, tS + 3.0, 0.5)} />}
      </Estudio>
      <TituloGrande texto="la celda de carga" sub="la pieza dentro de tu báscula de cocina" p={ap(t, 0.2, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />
      <TituloGrande texto="barra de aluminio con agujero en «8»" p={ap(t, tB, 0.5) * sal(t, tPt - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cuatro puntos delgados" sub="justo ahí van las galgas" p={ap(t, tPt, 0.5) * sal(t, tE - 0.3, 0.3)} y={96} />
      <TituloGrande texto="con peso, se dobla en «S» suave" sub="dos se estiran, dos se comprimen · deformación exagerada ×20" p={ap(t, tE, 0.5) * sal(t, tPu - 0.3, 0.3)} y={96} />
      <TituloGrande texto="las 4 galgas forman el puente" p={ap(t, tPu, 0.5) * sal(t, tCa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="rojo y negro alimentan el puente" p={ap(t, tCa, 0.5) * sal(t, tSe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="verde y blanco llevan la señal" sub="los colores más comunes" p={ap(t, tSe, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="a plena carga: décimas de milímetro" sub="y vuelve siempre a su forma" p={ap(t, tD, 0.5) * sal(t, tS - 0.3, 0.3)} y={96} />
      <TituloGrande texto="si la sobrecargas, queda inservible" p={ap(t, tS, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ HX711 + ESP32 y calibración
const Botella: React.FC = () => {
  const plastico = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#E8F4FA', roughness: 0.05, transparent: true, opacity: 0.25, clearcoat: 1, depthWrite: false}), []);
  const agua = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#4FA8E0', roughness: 0.1, transparent: true, opacity: 0.55}), []);
  return (
    <group>
      <Cil r={1.3} h={4.6} pos={[0, 2.3, 0]} mat={agua} seg={40} />
      <Cil r={1.36} h={5.2} pos={[0, 2.6, 0]} mat={plastico} seg={40} />
      <Cil r={1.36} r2={0.5} h={1.0} pos={[0, 5.7, 0]} mat={plastico} seg={40} />
      <Cil r={0.5} h={0.45} pos={[0, 6.4, 0]} mat={M.color('#2563EB', 0.4)} seg={24} />
    </group>
  );
};

export const HX711_ESP32_3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tH = m('hx711', 5.1);
  const tBi = m('bits', 8.0);
  const tG = m('ganancia', 14.9);
  const tV = m('veces', 21.2);
  const tCab = m('cables', 24.0);
  const tCal = m('calibrar', 36.2);
  const tT = m('tara', 43.0);
  const tL = m('litro', 48.1);
  const tPa = m('pasos', 53.9);
  const modulo = ap(t, tH - 0.3, 0.6);
  const cables1 = ap(t, tCab, 1.4);
  const cables2 = ap(t, tCab + 1.6, 1.4);
  const cae = ap(t, tL, 0.7, easeInOut);
  const botY = mix(6, 0, cae);
  const flexion = 0.08 * cae;
  const parpadeo = t > tV && Math.sin(t * 22) > 0;
  // extremos de los cables de la celda (celda girada 180°, escala 0,55, en x = −5)
  const cx = -5.0;
  const finCelda = (i: number): V3 => [cx + 0.55 * 6.4, 0.55 * (1.6 + 0.1 - i * 0.2), -0.55 * 1.2];
  const pinIzq = (i: number): V3 => [1.2 - 1.2 * 1.55, 1.2 * 0.67, 1.2 * (-0.85 + i * 0.34)];
  const pinDer = (i: number): V3 => [1.2 + 1.2 * 1.55, 1.2 * 0.67, 1.2 * (-0.51 + i * 0.34)];
  const pinEsp = (i: number): V3 => [6.6 - 2.3 + i * 0.508, 0.75, 1.27];
  // orden de la celda: rojo E+, negro E−, verde A+, blanco A− → pines E+, E−, A+, A−
  const celdaAPin = [0, 1, 3, 2];
  const espColores = ['#1A1A1A', '#F2C230', '#2563EB', '#C62828'];
  const lineas: string[] =
    t < tCal - 0.2
      ? [
          'HX711',
          t > tBi ? '24 bits = 16.777.216 pasos' : ' ',
          t > tG ? 'ganancia: × 128' : ' ',
          t > tV ? '10 u 80 lecturas por segundo' : ' ',
        ]
      : [
          'calibración',
          t > tT ? '1) vacía: 84.213  →  tara = 0 g' : ' ',
          t > tL ? '2) 1 L de agua: 513.527' : ' ',
          t > tPa ? '429.314 pasos / 1000 g = 429,3 pasos/g' : ' ',
        ];
  const cam: Camara = orbita([0.6, 1.4, 0], 16.5, 7.5, -14 + t * 0.45, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[20, 0.2, 8]} pos={[0.5, -0.1, 0]} material={M.color('#B98B5A', 0.8)} />
        <group position={[cx, 0, 0]} rotation={[0, Math.PI, 0]} scale={0.55}>
          <MontajeCelda flexion={flexion}>
            {cae > 0.01 && (
              <group position={[0, botY, 0]} scale={0.8}>
                <Botella />
              </group>
            )}
          </MontajeCelda>
        </group>
        <group position={[1.2, 0, 0]} scale={1.2 * modulo}>
          <HX711 />
        </group>
        <ESP32 pos={[6.6, 0.45, 0]} rotY={Math.PI / 2} led={1} />
        {cables1 > 0.01 &&
          [0, 1, 2, 3].map((i) => {
            const a = finCelda(i);
            const b = pinIzq(celdaAPin[i]);
            return <Tubo key={`c${i}`} puntos={[a, [mix(a[0], b[0], 0.5), 1.5, mix(a[2], b[2], 0.5)], b]} radio={0.045} material={M.color(COLORES_CABLE[i], 0.4)} seg={30} progreso={cables1} />;
          })}
        {cables2 > 0.01 &&
          [0, 1, 2, 3].map((i) => {
            const a = pinDer(i);
            const b = pinEsp(i);
            return <Tubo key={`e${i}`} puntos={[a, [mix(a[0], b[0], 0.5), 1.8, mix(a[2], b[2], 0.5) + 0.3], b]} radio={0.045} material={M.color(espColores[i], 0.4)} seg={30} progreso={cables2} />;
          })}
        {parpadeo &&
          [1, 2].map((i) => {
            const p = pinDer(i);
            return <Esf key={i} r={0.14} pos={[p[0], p[1] + 0.12, p[2]]} mat={M.emisivo('#7CF0FF', 3)} seg={10} />;
          })}
        <TextoPlano
          lineas={lineas.map((l, i) => ({t: l, tam: i ? 104 : 120, color: i ? '#7CFFB2' : '#FFFFFF', mono: i > 0}))}
          w={9.0}
          h={2.6}
          pos={[1.0, 1.6, -4.2]}
          estilo={{fondo: '#0B0F14', radio: 40, alinear: 'left', relleno: 70}}
          op={ap(t, tH, 0.5)}
          px={2048}
        />
      </Estudio>
      <TituloGrande texto="para leer milésimas de voltio…" p={ap(t, 0.2, 0.5) * sal(t, tH - 0.3, 0.3)} y={96} />
      <TituloGrande texto="…un amplificador: el HX711" p={ap(t, tH, 0.5) * sal(t, tBi - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un convertidor de 24 bits" sub="más de 16 millones de pasos" p={ap(t, tBi, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="amplifica la señal 128 veces" p={ap(t, tG, 0.5) * sal(t, tV - 0.3, 0.3)} y={96} />
      <TituloGrande texto="2 pines: 10 u 80 lecturas por segundo" p={ap(t, tV, 0.5) * sal(t, tCab - 0.3, 0.3)} y={96} />
      <TituloGrande texto="4 cables a la celda, 4 al ESP32" sub="alimentación, tierra, datos y reloj" p={ap(t, tCab, 0.5) * sal(t, tCal - 0.3, 0.3)} y={96} />
      <TituloGrande texto="luego hay que calibrar" p={ap(t, tCal, 0.5) * sal(t, tT - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1. vacía: ese es el cero (la tara)" p={ap(t, tT, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />
      <TituloGrande texto="2. un peso conocido" sub="1 litro de agua ≈ 1 kg, sin el envase" p={ap(t, tL, 0.5) * sal(t, tPa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="¿cuántos pasos son un gramo?" p={ap(t, tPa, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ límites: temperatura, fluencia, vibración, fuerza de lado
export const LimitesCelda3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tTe = m('temperatura', 3.4);
  const tF = m('fluencia', 11.1);
  const tV = m('vibra', 19.1);
  const tL = m('lado', 21.4);
  const tP = m('precision', 28.1);
  const ruido = (x: number) => Math.sin(x * 97.3) * Math.sin(x * 41.7) * 0.6 + Math.sin(x * 263.1) * 0.4;
  const lectura = (tau: number) => {
    const base = 0.25;
    if (tau < tTe) return base;
    if (tau < tF) return base + 0.32 * Math.sin((tau - tTe) * 0.45);
    if (tau < tV) return base + 0.32 * Math.sin((tF - tTe) * 0.45) * Math.exp(-(tau - tF) * 3) + 0.14 * (1 - Math.exp(-(tau - tF) / 2.5));
    if (tau < tL) return base + 0.1 + 0.22 * ruido(tau);
    if (tau < tP) return base - 0.3 + 0.02 * ruido(tau);
    return base + 0.01 * ruido(tau);
  };
  const muestras = Array.from({length: 240}, (_, i) => lectura(t - 6 + (i / 239) * 6));
  const temp = ap(t, tTe, 0.6) * sal(t, tF, 0.6);
  const vib = t > tV && t < tL ? 1 : 0;
  const jx = vib * Math.sin(t * 70) * 0.06;
  const lado = ap(t, tL, 0.8) * sal(t, tP, 0.8);
  const cam: Camara = {pos: [-1.0 + t * 0.05, 6.8, 17.5], obj: [0.6, 2.3, 0], fov: 30};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[-3.6 + jx, 0, 0]} scale={0.72}>
          <MontajeCelda flexion={0.18}>
            <Cil r={0.9} h={1.1} pos={[mix(0, 1.6, lado), 0.55, 0]} mat={M.laton()} seg={40} />
          </MontajeCelda>
          {lado > 0.01 && (
            <group position={[3.2 + 4.0, 3.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh position={[0, 0.6, 0]}>
                <coneGeometry args={[0.45, 0.9, 20]} />
                <meshBasicMaterial color="#FFB547" toneMapped={false} transparent opacity={lado} />
              </mesh>
              <Cil r={0.15} h={1.4} pos={[0, -0.5, 0]} mat={M.emisivo('#FFB547', 1.2)} />
            </group>
          )}
        </group>
        {temp > 0.01 && (
          <group position={[-4.2, 4.6, 1.2]}>
            <Cil r={0.5} r2={0.9} h={0.7} mat={M.color('#2B2E33', 0.4, 0.5)} seg={28} />
            <Esf r={0.42} pos={[0, -0.45, 0]} mat={M.emisivo('#FF5A3D', 2.5 * temp)} seg={20} />
            <mesh position={[0, -1.8, 0]}>
              <coneGeometry args={[1.6, 2.6, 32, 1, true]} />
              <meshBasicMaterial color="#FF6A2A" transparent opacity={0.12 * temp} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        <Osciloscopio3D pos={[4.6, 0, -0.6]} rotY={-0.3} escala={0.78} muestras={muestras} titulo="lectura de la báscula" />
      </Estudio>
      <TituloGrande texto="las galgas tienen sus manías" p={ap(t, 0.2, 0.5) * sal(t, tTe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1. la temperatura" sub="cambia la resistencia y dilata la barra: hay que compensarla" p={ap(t, tTe, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="2. fluencia: la lectura se arrastra" sub="con un peso encima mucho tiempo" p={ap(t, tF, 0.5) * sal(t, tV - 0.3, 0.3)} y={96} />
      <TituloGrande texto="3. las vibraciones meten ruido" p={ap(t, tV, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />
      <TituloGrande texto="4. fuerza de lado o mal apoyada" sub="la lectura sale mal" p={ap(t, tL, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="precisión = metal + galga + filtro" sub="pieza bien diseñada, galga bien pegada y electrónica que filtra el ruido" p={ap(t, tP, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ fin de la serie: los diez sensores
const SERIE: [string, string][] = [
  ['piezo', 'piezo'],
  ['celular', 'táctil'],
  ['pir', 'PIR'],
  ['control', 'Hall'],
  ['mems', 'acelerómetro'],
  ['giroscopio', 'giroscopio'],
  ['hcsr04', 'ultrasonido'],
  ['carroLidar', 'LiDAR'],
  ['termopar', 'temperatura'],
  ['celda', 'galga'],
];
export const SerieDiez3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tC = m('cual', 3.7);
  const tCo = m('comentarios', 8.0);
  const paso = 3.6;
  const xs = SERIE.map((_, i) => (i - 4.5) * paso);
  // travelling del 1 al 10 y al final plano general
  const recorre = ap(t, 0.2, Math.max(2, tCo - 1.2), easeInOut);
  const xf = mix(xs[0], xs[9], recorre);
  const abre = ap(t, tCo - 1.0, 1.8, easeInOut);
  const cerca: V3 = [xf + 2.5, 6.2, 16.5];
  const lejos: V3 = [0, 9, 34];
  const cam: Camara = {pos: cerca.map((v, i) => mix(v, lejos[i], abre)) as V3, obj: [mix(xf, 0, abre), mix(1.6, 1.2, abre), 0], fov: mix(30, 34, abre)};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[mix(xf, 0, abre), 1, 0]} niebla={[mix(16, 40, abre), mix(46, 100, abre)]} {...Q}>
        {SERIE.map(([clave, nombre], i) => {
          const f = CATALOGO[clave];
          const q = ap(t, 0.1 + i * 0.12, 0.6);
          const esc = (f?.escala ?? 1) * Math.min(1, 2.8 / Math.max(0.1, (f?.alto ?? 3) * (f?.escala ?? 1))) * 0.9;
          const C = f?.C;
          const foco = clamp01(1 - Math.abs((xf - xs[i]) / paso)) * (1 - abre) + abre;
          return (
            <group key={clave}>
              <Pedestal pos={[xs[i], 0, 0]} r={1.55} luz={q * foco} />
              {C && q > 0.01 && (
                <group position={[xs[i], 0.5, 0]} rotation={[0, t * 0.3, 0]} scale={esc * q}>
                  <C t={t} a={1} />
                </group>
              )}
              <TextoPlano lineas={[{t: `${i + 1} · ${nombre}`, tam: 120, color: '#E8EAED'}]} w={3.3} h={0.6} pos={[xs[i], 0.4, 2.2]} rot={[-0.6, 0, 0]} estilo={{fondo: '#0B0F14', radio: 30}} op={q} />
            </group>
          );
        })}
      </Estudio>
      <TituloGrande texto="fin de la serie: 10 sensores" p={ap(t, 0.2, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="¿cuál quieres en la próxima temporada?" p={ap(t, tC, 0.5) * sal(t, tCo - 0.3, 0.3)} y={96} />
      <TituloGrande texto="déjalo en los comentarios" p={ap(t, tCo, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
