// S08 · Tiempo de vuelo y LiDAR — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {azar} from '../texturas';
import {Caja, ESP32, Tubo} from '../modelos/Piezas';
import {Cil, Esf, pintura} from '../modelos/Objetos';
import {Dedo} from '../modelos/ObjetosS02';
import {LunaReflector, SelvaPiramide, VL53L0X} from '../modelos/ObjetosS08';
import {Tierra} from '../modelos/ObjetosS06';
import {Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano, useLienzo} from '../texto3d';

const Q = {escala: 0.8} as const;
const ROJO = '#FF3B30';

/** Pulso de luz: un segmento brillante que viaja entre dos puntos. */
const Pulso: React.FC<{a: V3; b: V3; q: number; color?: string; largo?: number}> = ({a, b, q, color = ROJO, largo = 0.15}) => {
  if (q <= 0 || q >= 1) return null;
  const p = (u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  return <Tubo puntos={[p(Math.max(0, q - largo)), p(q)]} radio={0.07} material={M.emisivo(color, 3)} seg={4} />;
};

// ------------------------------------------------------------------ gancho: la luz da 7,5 vueltas a la Tierra y aun así se cronometra
export const LuzGancho3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tV = m('vueltas', 3.0);
  const tC = m('chip', 7.0);
  const tN = m('nano', 15.0);
  const tCa = m('carros', 20.0);
  const tSe = m('selva', 26.0);
  const fase = t < tC - 0.5 ? 0 : t < tCa - 0.5 ? 1 : 2;
  const camT: Camara = orbita([0, 6.2, 0], 34, 6, t * 3, 32);
  const camC: Camara = orbita([0, 1.6, 1.4], 12, 3.5, 55 + t * 1.5, 30);
  const camS: Camara = {pos: [6, 18, 16], obj: [0, 0, 0], fov: 34};
  const cam = fase === 0 ? camT : fase === 1 ? camC : camS;
  const anillo = useMemo(() => {
    const pts: V3[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push([Math.cos(a) * 7.0, 6.2 + Math.sin(a * 3) * 0.3, Math.sin(a) * 7.0]);
    }
    return pts;
  }, []);
  const q = (((t - tV) * 2.5) % 1 + 1) % 1;
  const ida = ((t - tC) * 0.8) % 1;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} niebla={[30, 90]} {...Q}>
        {fase === 0 && (
          <>
            <Tierra r={6} t={t} />
            {t > tV && <Tubo puntos={anillo} radio={0.08} material={M.emisivo('#FFF4D6', 2)} seg={240} progreso={q} />}
          </>
        )}
        {fase === 1 && (
          <>
            <VL53L0X laser={1} />
            <group position={[0, 0.4, 3.2]}>
              <Dedo alto={2.4} />
            </group>
            <Pulso a={[-0.13, 0.35, 0.2]} b={[0, 2.8, 3.2]} q={ida * 2} />
            <Pulso a={[0, 2.8, 3.2]} b={[0.13, 0.35, 0.2]} q={ida * 2 - 1} color="#FFB547" />
          </>
        )}
        {fase === 2 && (
          <group scale={1.4}>
            <SelvaPiramide revela={ap(t, tSe + 0.6, 2.0, easeInOut)} />
          </group>
        )}
      </Estudio>
      {fase === 0 && <TituloGrande texto="7,5 vueltas a la Tierra en un segundo" p={ap(t, tV, 0.4) * sal(t, tC - 0.6, 0.3)} y={96} />}
      {fase === 1 && <TituloGrande texto="un chip que cronometra la luz" sub="ida y vuelta a tu mano: unas pocas milmillonésimas de segundo" p={ap(t, tC, 0.4) * sal(t, tCa - 0.6, 0.3)} y={96} />}
      {fase === 2 && <TituloGrande texto="ciudades mayas bajo la selva" sub="sin excavar" p={ap(t, tSe, 0.4) * sal(t, dur, 0.3)} y={96} />}
      {fase === 2 && <Dato x={1500} y={330} valor="LiDAR" sub="luz que rebota" p={ap(t, tCa, 0.4) * sal(t, tSe - 0.3, 0.3)} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ física: 30 cm por nanosegundo y 67 billonésimas por centímetro
export const Nanosegundo3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tN = m('nano', 3.0);
  const tU = m('ultrasonico', 7.0);
  const tM = m('metro', 12.0);
  const tC = m('centimetro', 16.0);
  const tD = m('directa', 22.0);
  const tI = m('indirecta', 28.0);
  const tT = m('triangulacion', 34.0);
  const t9 = m('nm940', 46.0);
  const U = 6; // 1 m = 6 unidades
  const ciclo = 2.6;
  const q = t > tM ? ((t - tM) % ciclo) / ciclo : 0;
  const ns = q * 6.7;
  const cam = orbita([3, 1.4, 0], 14, 5, -10 + t * 0.6, 32);
  const fase = t < tD ? 0 : t < tT ? 1 : t < t9 ? 2 : 3;
  const fotones = useMemo(() => {
    const r = azar(3);
    return Array.from({length: 40}, () => [r() * 6 - 3, r() * 3, r() * 4 - 2] as V3);
  }, []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[3, 1, 0]} {...Q}>
        <group position={[-0.4, 0.8, 0]} rotation={[0, 0, -Math.PI / 2]} scale={1.4}>
          <VL53L0X laser={1} />
        </group>
        <Caja tam={[0.5, 4, 5]} pos={[U + 0.25, 2, 0]} material={M.color('#8D8A84', 0.9)} />
        <Tubo puntos={[[0, 0.05, 2.4], [U, 0.05, 2.4]]} radio={0.04} material={M.emisivo('#E8EAED', 1)} seg={4} />
        <TextoPlano lineas={[{t: '1 m', tam: 140, color: '#E8EAED'}]} w={1.6} h={0.7} pos={[U / 2, 0.06, 3.1]} rot={[-Math.PI / 2, 0, 0]} />
        {fase === 0 && t > tN && (
          <>
            <Pulso a={[0, 0.8, 0]} b={[U, 0.8, 0]} q={q * 2} largo={0.3 / U * 6} />
            <Pulso a={[U, 0.8, 0]} b={[0, 0.8, 0]} q={q * 2 - 1} color="#FFB547" largo={0.3 / U * 6} />
          </>
        )}
        {fase === 1 &&
          Array.from({length: 6}, (_, k) => {
            const qq = (((t - tD) * 1.3 - k * 0.18) % 1 + 1) % 1;
            return <Pulso key={k} a={[0, 0.8, 0]} b={[U, 0.8, 0]} q={qq} color={k % 2 ? '#FF7A6E' : ROJO} largo={0.08} />;
          })}
        {fase === 2 && (
          <>
            <Tubo puntos={[[0, 0.8, -1.0], [U * 0.7, 0.8, 0]]} radio={0.06} material={M.emisivo(ROJO, 2.5)} seg={4} />
            <Tubo puntos={[[U * 0.7, 0.8, 0], [0, 0.8, 1.0]]} radio={0.04} material={M.emisivo('#FFB547', 2)} seg={4} />
            <Caja tam={[0.6, 0.6, 0.6]} pos={[0, 0.8, 1.0]} material={M.plasticoNegro()} radio={0.08} />
          </>
        )}
        {fase === 3 &&
          fotones.map((p, i) => (
            <Esf key={i} r={0.06} pos={[U / 2 + p[0], 0.5 + p[1], p[2]]} mat={M.emisivo(i % 4 ? '#FFF4D6' : ROJO, 2)} seg={6} />
          ))}
        <TextoPlano lineas={[{t: `${ns.toFixed(1).replace('.', ',')} ns`, tam: 140, color: '#7CFFB2', mono: true}]} w={3.2} h={0.9} pos={[3, 2.8, -2.8]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tM, 0.5) * (fase === 0 ? 1 : 0)} />
      </Estudio>
      <TituloGrande texto="en un nanosegundo, la luz recorre ~30 cm" p={ap(t, tN, 0.5) * sal(t, tU - 0.3, 0.3)} y={96} />
      <TituloGrande texto="como el ultrasónico… pero con luz" p={ap(t, tU, 0.5) * sal(t, tM - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1 m de distancia: ~6,7 ns de ida y vuelta" p={ap(t, tM, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1 cm = unas 67 billonésimas de segundo" p={ap(t, tC, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="directa: pulsos cortísimos y un reloj ultrarrápido" p={ap(t, tD, 0.5) * sal(t, tI - 0.3, 0.3)} y={96} />
      <TituloGrande texto="indirecta: cuánto se atrasa el parpadeo" p={ap(t, tI, 0.5) * sal(t, tT - 0.3, 0.3)} y={96} />
      <TituloGrande texto="triangulación: dónde cae el punto en la cámara" p={ap(t, tT, 0.5) * sal(t, t9 - 0.3, 0.3)} y={96} />
      <TituloGrande texto="infrarrojo de 940 nm" sub="el vapor de agua lo quita de la luz del sol" p={ap(t, t9, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ por dentro: VCSEL, SPAD y el histograma
export const SPAD3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tV = m('vcsel', 3.0);
  const tCl = m('clase', 9.0);
  const tS = m('spad', 13.0);
  const tA = m('avalancha', 22.0);
  const tH = m('histograma', 32.0);
  const tP = m('pico', 40.0);
  const tL = m('lidar', 47.0);
  const fase = t < tS - 0.5 ? 0 : t < tH - 0.5 ? 1 : 2;
  const histo = useLienzo(
    900,
    560,
    (g, w, h) => {
      g.fillStyle = '#0B0F14';
      g.fillRect(0, 0, w, h);
      const n = 40;
      const r = azar(Math.floor(t * 4));
      const lleno = clamp01((t - tH) / 6);
      for (let i = 0; i < n; i++) {
        const base = 0.18 + 0.1 * r();
        const pico = Math.exp(-(((i - 26) / 1.6) ** 2)) * 0.75;
        const v = (base + pico) * lleno;
        g.fillStyle = Math.abs(i - 26) < 3 && t > tP ? '#FF3B30' : '#7CF0FF';
        g.fillRect(40 + i * 20, h - 60 - v * (h - 120), 14, v * (h - 120));
      }
      g.fillStyle = '#E8EAED';
      g.font = '600 30px Inter, Arial';
      g.fillText('tiempo de llegada →', w - 330, h - 18);
      g.fillText('fotones', 40, 40);
    },
    [Math.floor(t * 8), t > tP],
  );
  const cam = fase === 0 ? orbita([0, 0.6, 0.2], 6, 3.2, -20 + t * 2, 30) : fase === 1 ? orbita([0, 1, 0], 13, 6, -15 + t * 1, 30) : orbita([0, 2.4, 0], 12, 2, -8 + t * 0.6, 30);
  const avalancha = t > tA ? ((t - tA) % 2.5) / 2.5 : 0;
  const N = 8;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {fase === 0 && (
          <group scale={2.2}>
            <VL53L0X laser={1} />
            {t > tV && (
              <mesh position={[-0.13, 1.3, 0.2]}>
                <cylinderGeometry args={[0.18, 0.05, 2.0, 16, 1, true]} />
                <meshBasicMaterial color={ROJO} transparent opacity={0.25} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        )}
        {fase === 1 && (
          <group>
            {Array.from({length: N * N}, (_, i) => {
              const x = (i % N) - (N - 1) / 2;
              const z = Math.floor(i / N) - (N - 1) / 2;
              const disparado = t > tA && i === 27 ? avalancha : 0;
              return (
                <group key={i} position={[x * 0.9, 0, z * 0.9]}>
                  <Caja tam={[0.75, 0.4, 0.75]} pos={[0, 0.2, 0]} material={disparado > 0.05 ? M.emisivo('#FFB547', 1 + disparado * 2) : M.color('#3A3F47', 0.35, 0.5)} radio={0.05} />
                </group>
              );
            })}
            {t > tA && avalancha < 0.35 && <Pulso a={[0.45, 5, -0.45]} b={[0.45, 0.45, -0.45]} q={avalancha / 0.35} color="#FFF4D6" largo={0.12} />}
            {t > tA &&
              avalancha > 0.35 &&
              Array.from({length: Math.floor(Math.pow(2, Math.min(7, (avalancha - 0.35) * 14)))}, (_, k) => {
                const r = azar(k + 1);
                return <Esf key={k} r={0.05} pos={[0.45 + (r() - 0.5) * 0.6, 0.45 + r() * 0.6 * (avalancha - 0.35) * 3, -0.45 + (r() - 0.5) * 0.6]} mat={M.emisivo('#4F8DFF', 2.5)} seg={6} />;
              })}
          </group>
        )}
        {fase === 2 && (
          <mesh position={[0, 2.6, 0]}>
            <planeGeometry args={[8.4, 5.2]} />
            <meshBasicMaterial map={histo} toneMapped={false} />
          </mesh>
        )}
      </Estudio>
      <TituloGrande texto="VCSEL: un láser que sale por arriba" sub="940 nm" p={ap(t, tV, 0.5) * sal(t, tCl - 0.3, 0.3)} y={96} />
      <TituloGrande texto="láser de clase 1: seguro para los ojos" p={ap(t, tCl, 0.5) * sal(t, tS - 0.6, 0.3)} y={96} />
      <TituloGrande texto="SPAD: diodos de avalancha de un solo fotón" p={ap(t, tS, 0.5) * sal(t, tA - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un fotón → una avalancha de electrones" p={ap(t, tA, 0.5) * sal(t, tH - 0.6, 0.3)} y={96} />
      <TituloGrande texto="miles de pulsos: un histograma" p={ap(t, tH, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el pico es la distancia" p={ap(t, tP, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />
      <TituloGrande texto="miles de puntos o un espejo que barre: LiDAR" p={ap(t, tL, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ historia: el eco de la Luna
export const LunaLaser3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tL = m('laser', 2.0);
  const tMit = m('mit', 6.0);
  const tA = m('apolo', 11.0);
  const tH = m('hoy', 17.0);
  const tSe = m('aleja', 25.0);
  const viaje = t > tH ? ((t - tH) % 2.5) / 2.5 : -1;
  const cam: Camara = {pos: [0, 4.5, 30], obj: [0, 5.2, 0], fov: 36};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 4, 0]} niebla={[40, 120]} {...Q}>
        <group position={[-10, 0, 0]} scale={0.7}>
          <Tierra r={4} t={t} />
        </group>
        <group position={[10, 1.2, 0]} scale={0.75}>
          <LunaReflector t={t} />
        </group>
        {viaje >= 0 && (
          <>
            <Pulso a={[-7.6, 4.5, 0]} b={[9.6, 6.0, 0]} q={viaje * 2} largo={0.08} />
            <Pulso a={[9.6, 6.0, 0]} b={[-7.6, 4.5, 0]} q={viaje * 2 - 1} color="#FFB547" largo={0.08} />
          </>
        )}
      </Estudio>
      <TituloGrande texto="1962: un eco de láser desde la Luna" p={ap(t, tMit, 0.5) * sal(t, tA - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1969: reflectores del Apolo 11" p={ap(t, tA, 0.5) * sal(t, tH - 0.3, 0.3)} y={96} />
      <TituloGrande texto="2,5 s de ida y vuelta" sub="y una precisión de milímetros" p={ap(t, tH, 0.5) * sal(t, tSe - 0.3, 0.3)} y={96} />
      <Dato x={960} y={760} valor="3,8 cm" sub="por año: lo que se aleja la Luna" p={ap(t, tSe, 0.5) * sal(t, dur, 0.3)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: el VL53L0X midiendo en milímetros
export const ToFESP32_3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tI = m('i2c', 1.0);
  const tL = m('libreria', 6.0);
  const tN = m('normal', 11.0);
  const tD = m('direccion', 16.0);
  const tP = m('proyectos', 22.0);
  const tG = m('cuadricula', 30.0);
  const mano = 0.6 + 0.35 * Math.sin(t * 0.8);
  const mm = Math.round(mano * 1000);
  const cam = orbita([0.5, 1.6, 0.6], 13, 6, -15 + t * 0.8, 30);
  const varios = ap(t, tD, 0.6);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[9, 0.3, 5]} pos={[0, 0.15, 0]} material={M.color('#B98B5A', 0.8)} />
        <group position={[-2.5, 0.3, 0.5]} scale={1.5}>
          <VL53L0X laser={1} />
        </group>
        {varios > 0.01 &&
          [-1, 1].map((s) => (
            <group key={s} position={[-2.5 + s * 2.2, 0.3, 0.5]} scale={1.5 * varios}>
              <VL53L0X laser={1} />
            </group>
          ))}
        <ESP32 pos={[2.6, 0.5, 0.5]} rotY={Math.PI / 2} led={1} />
        {[['#C62828', 0.0], ['#1A1A1A', 0.25], ['#2563EB', 0.5], ['#F2C230', 0.75]].map(([c, z], i) => (
          <Tubo key={i} puntos={[[-1.9, 0.45, 0.3 + (z as number)], [-0.4, 0.9, 0.5 + (z as number)], [1.4, 0.6, 0.2 + (z as number)]]} radio={0.05} material={M.color(c as string, 0.4)} seg={16} />
        ))}
        <group position={[-2.5, 0.4 + mano * 4, 0.5]}>
          <Caja tam={[1.8, 0.4, 2.4]} material={new THREE.MeshPhysicalMaterial({color: '#E3A987', roughness: 0.5})} radio={0.18} />
        </group>
        <TextoPlano lineas={[{t: `${mm} mm`, tam: 150, color: '#7CFFB2', mono: true}]} w={3.4} h={0.9} pos={[3.2, 3.8, -2]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tL, 0.5)} />
      </Estudio>
      <TituloGrande texto="I2C: cuatro cables y 3,3 V" p={ap(t, tI, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la distancia en milímetros, ~30 veces por segundo" p={ap(t, tL, 0.5) * sal(t, tN - 0.3, 0.3)} y={96} />
      <TituloGrande texto="algo más de 1 m; ~2 m en largo alcance" p={ap(t, tN, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="varios sensores: cámbiales la dirección" p={ap(t, tD, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="versiones de 8×8 zonas: una cámara de profundidad" p={ap(t, tG, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
