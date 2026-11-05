// S01 · Piezoeléctrico — escenas 3D que reemplazan a los insertos 2D (versión solo-3D).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {azar} from '../texturas';
import {Caja, ESP32, Protoboard, ResistenciaAxial, Tubo, Zener} from '../modelos/Piezas';
import {PiezoDisco} from '../modelos/Piezo';
import {Arcos, Bombillo, Cil, Esf, Hueso, PesaSobrePiezo, pintura} from '../modelos/Objetos';
import {Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano} from '../texto3d';

const Q = {escala: 0.8} as const;

/** Señal de un piezo con carga que se fuga: escalón al apoyar, decae, y escalón negativo al levantar. */
const senalFuga = (t: number, tApoya: number, tLevanta: number, tau = 0.9, n = 240, ventana = 4) =>
  Array.from({length: n}, (_, i) => {
    const tt = t - ventana + (i / (n - 1)) * ventana;
    let v = 0.012 * Math.sin(i * 1.7);
    if (tt >= tApoya) v += 0.85 * Math.exp(-(tt - tApoya) / tau);
    if (tt >= tLevanta) v -= 0.85 * Math.exp(-(tt - tLevanta) / tau);
    return v;
  });

// ------------------------------------------------------------------ la carga se escapa: solo nota los cambios
export const CargaSeEscapa: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tQ = m('quieto', 1.2);
  const tE = m('escapa', 3.5);
  const tC = m('cambios', 7.5);
  const tLev = Math.max(tC + 2.2, dur - 2.6);
  const baja = ap(t, tQ - 0.5, 0.5, easeInOut) * (1 - ap(t, tLev - 0.4, 0.5, easeInOut));
  const alto = (1 - baja) * 3.2;
  const tApoya = tQ;
  const muestras = senalFuga(t, tApoya, tLev, 0.9);
  const cam: Camara = {pos: [2.2, 7.2, 17.5], obj: [2.6, 2.2, 0], fov: 32};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[2, 1, 0]} {...Q}>
        <group position={[-2.5, 0, 1]} scale={1.3}>
          <PesaSobrePiezo alto={alto} />
        </group>
        <Tubo puntos={[[-1.0, 0.1, 1.2], [0.8, 0.2, 1.6], [2.4, 0.3, 1.0], [3.4, 0.5, -0.4]]} radio={0.06} material={M.color('#C62828', 0.4)} seg={30} />
        <Osciloscopio3D pos={[6.2, 0, -1.6]} rotY={-0.3} muestras={muestras} titulo="voltaje del piezo" />
      </Estudio>
      <TituloGrande texto="la carga se escapa por el circuito" p={ap(t, tE - 0.2, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="solo nota los cambios" p={ap(t, tC, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ sonar bajo el agua (Langevin, 1917)
const Barco: React.FC = () => {
  const casco = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-7, 1.2);
    s.lineTo(6.2, 1.2);
    s.quadraticCurveTo(8.2, 1.0, 8.6, 1.6);
    s.lineTo(8.0, -0.9);
    s.quadraticCurveTo(7.0, -1.6, 5.5, -1.6);
    s.lineTo(-6.0, -1.6);
    s.quadraticCurveTo(-7.4, -1.4, -7, 1.2);
    const g = new THREE.ExtrudeGeometry(s, {depth: 3.0, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2});
    g.translate(0, 0, -1.5);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={casco} material={M.color('#3B4048', 0.6, 0.3)} castShadow />
      <Caja tam={[13.5, 0.3, 3.0]} pos={[0, 1.3, 0]} material={M.color('#5A4632', 0.7)} />
      <Caja tam={[3.4, 1.8, 2.2]} pos={[-1.5, 2.3, 0]} material={M.color('#D9D6CC', 0.6)} radio={0.1} />
      <Cil r={0.45} h={2.6} pos={[1.4, 2.8, 0]} mat={M.color('#2B2D30', 0.5)} />
      <Caja tam={[0.8, 0.4, 0.8]} pos={[1.0, -1.85, 0]} material={M.color('#C9A44C', 0.35, 0.9)} radio={0.06} />
    </group>
  );
};
const Submarino: React.FC = () => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]} material={M.color('#2E3338', 0.55, 0.5)} castShadow>
      <capsuleGeometry args={[1.0, 8.5, 10, 24]} />
    </mesh>
    <Caja tam={[2.2, 1.5, 0.7]} pos={[0.8, 1.35, 0]} material={M.color('#2E3338', 0.55, 0.5)} radio={0.3} />
    <Cil r={0.06} h={1.2} pos={[1.2, 2.5, 0]} mat={M.aceroMate()} />
    <Caja tam={[0.6, 1.6, 0.12]} pos={[-5.6, 0, 0]} material={M.color('#2E3338', 0.55, 0.5)} />
  </group>
);

export const Sonar3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tS = m('submarinos', 1.0);
  const tL = m('langevin', 3.0);
  const tB = m('base', 7.0);
  const ping = tL + 0.6;
  const cam = camaraEn(
    [
      {t: 0, pos: [-3, 7.5, 44], obj: [1.5, 8, 0], fov: 36},
      {t: 0, d: dur, pos: [3, 7, 40], obj: [2.5, 8, 0], fov: 36},
    ],
    t,
  );
  const ecoT = ping + 2.2;
  const pBarco = proyectar([-4, 13.6, 0], cam);
  const pSub = proyectar([9, 3.0, 0], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="agua" centroLuz={[0, 6, 0]} exposicion={1.15} {...Q}>
        <mesh position={[0, 14.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#5FA8C8" transparent opacity={0.35} side={THREE.DoubleSide} roughness={0.1} />
        </mesh>
        <group position={[-4, 14.6, 0]}>
          <Barco />
        </group>
        <group position={[9 + Math.sin(t * 0.3) * 0.3, 3.0, 0]}>
          <Submarino />
        </group>
        <Arcos origen={[-3, 12.6, 0]} dir={0.9} apertura={0.9} t={t} t0={ping} vel={6} n={4} cada={0.25} vida={2.0} max={14} color="#8FD3FF" rot={[Math.PI / 2, 0, 0]} />
        <Arcos origen={[9, 3.0, 0]} dir={4.04} apertura={0.9} t={t} t0={ecoT} vel={6} n={3} cada={0.25} vida={2.0} max={14} color="#FFC46B" rot={[Math.PI / 2, 0, 0]} />
      </Estudio>
      <EtiquetaGuia desde={{x: pBarco.x + 40, y: pBarco.y + 60}} hacia={{x: pBarco.x + 220, y: pBarco.y + 140}} texto="emisor de cuarzo" sub="Langevin, 1917" p={ap(t, tL, 0.6)} />
      <EtiquetaGuia desde={pSub} hacia={{x: pSub.x + 140, y: pSub.y - 150}} texto="submarino" sub="el eco delata su posición" p={ap(t, ecoT + 0.5, 0.6)} />
      <TituloGrande texto="la base del sonar" p={ap(t, tB, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ polarizar el PZT
const FLECHAS = {nx: 7, ny: 3, nz: 3};
export const Polarizar3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('direcciones', 2.0);
  const tCal = m('calienta', 5.0);
  const tCampo = m('campo', 6.5);
  const tPol = m('polarizar', 10.0);
  const tR = m('responde', 12.5);
  const alinea = ap(t, tCampo + 0.6, 3.2, easeInOut);
  const calor = ap(t, tCal, 1.0) * (1 - ap(t, tPol + 1.0, 2.0));
  const placas = ap(t, tCampo - 0.2, 0.7, easeInOut);
  const bloque = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#F2EEE6', roughness: 0.4, transparent: true, opacity: 0.2, depthWrite: false}), []);
  const flecha = useMemo(() => new THREE.MeshStandardMaterial({color: '#7CF0FF', emissive: '#2BB8D6', emissiveIntensity: 0.6, roughness: 0.35}), []);
  const geo = useMemo(() => {
    const cono = new THREE.ConeGeometry(0.22, 0.5, 16);
    cono.translate(0, 0.45, 0);
    return cono;
  }, []);
  const palo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12);
    g.translate(0, -0.05, 0);
    return g;
  }, []);
  const azarRot = useMemo(() => {
    const r = azar(42);
    const n = FLECHAS.nx * FLECHAS.ny * FLECHAS.nz;
    return Array.from({length: n}, () => new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2)));
  }, []);
  const arriba = new THREE.Quaternion();
  const flechas: React.ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < FLECHAS.nx; i++)
    for (let j = 0; j < FLECHAS.ny; j++)
      for (let l = 0; l < FLECHAS.nz; l++) {
        const tiembla = (1 - alinea) * calor * 0.25;
        const qq = azarRot[k]
          .clone()
          .slerp(arriba, alinea)
          .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t * 9 + k) * tiembla, 0, Math.cos(t * 7 + k) * tiembla)));
        flechas.push(
          <group key={k} position={[(i - (FLECHAS.nx - 1) / 2) * 1.15, 2.2 + (j - 1) * 1.1, (l - 1) * 1.1]} quaternion={qq}>
            <mesh geometry={geo} material={flecha} />
            <mesh geometry={palo} material={flecha} />
          </group>,
        );
        k++;
      }
  const cam = orbita([0, 2.4, 0], 17, 4.2, -28 + t * 2.2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <Caja tam={[8.6, 3.8, 3.8]} pos={[0, 2.2, 0]} material={bloque} radio={0.15} />
        {flechas}
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[8.7, 3.9, 3.9]} />
          <meshBasicMaterial color="#FF7A2A" transparent opacity={0.22 * calor} depthWrite={false} toneMapped={false} />
        </mesh>
        {placas > 0.01 && (
          <>
            <Caja tam={[9.2, 0.25, 4.2]} pos={[0, mix(7.5, 4.3, placas), 0]} material={M.plata()} radio={0.05} />
            <Caja tam={[9.2, 0.25, 4.2]} pos={[0, mix(-3, 0.12, placas), 0]} material={M.plata()} radio={0.05} />
            <TextoPlano lineas={[{t: '+', tam: 300, color: '#FF5C8A'}]} w={2.2} h={2.2} pos={[5.6, 4.4, 0.5]} op={placas} />
            <TextoPlano lineas={[{t: '−', tam: 300, color: '#4F8DFF'}]} w={2.2} h={2.2} pos={[5.6, 0.2, 0.5]} op={placas} />
          </>
        )}
      </Estudio>
      <TituloGrande texto="regiones en todas las direcciones" p={ap(t, tD - 0.2, 0.5) * sal(t, tCal - 0.3, 0.3)} y={96} />
      <TituloGrande texto="calor + campo eléctrico fuerte" p={ap(t, tCal, 0.5) * sal(t, tPol - 0.3, 0.3)} y={96} />
      <TituloGrande texto="polarizar" sub="las regiones quedan alineadas" p={ap(t, tPol, 0.5) * sal(t, tR - 0.2, 0.3)} y={96} />
      <TituloGrande texto="mucho más sensible que el cuarzo" p={ap(t, tR, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ protección: resistencia en serie + zener de 3,3 V
export const Proteccion3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tP = m('picos', 1.5);
  const tR = m('resistencia', 5.0);
  const tZ = m('zener', 6.6);
  const tRec = m('recortan', 8.5);
  const recorta = t >= tRec;
  const golpes = [tP + 0.4, tP + 2.4, tRec + 0.3, tRec + 2.3, tRec + 4.3].filter((g) => g < dur);
  const muestras = Array.from({length: 240}, (_, i) => {
    const tt = t - 1.6 + (i / 239) * 1.6;
    const g = golpes.filter((x) => x <= tt).pop();
    if (g === undefined) return 0.01 * Math.sin(i * 1.3);
    const q = tt - g;
    let v = 1.5 * Math.exp(-q / 0.16) * Math.cos(2 * Math.PI * 7 * q);
    if (g >= tRec) v = Math.max(-0.12, Math.min(0.62, v));
    return v;
  });
  const vista = ap(t, tRec - 0.8, 1.4, easeInOut);
  const cam: Camara = {pos: [mix(0.5, 4.0, vista), mix(9.5, 8.5, vista), mix(12.5, 18, vista)], obj: [mix(0.5, 3.0, vista), mix(0.6, 2.0, vista), mix(0, -1.5, vista)], fov: 30};
  const pR = proyectar([-1.0, 1.4, 1.2], cam);
  const pZ = proyectar([1.3, 1.4, 1.2], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <Protoboard pos={[0, 0, 0.8]} />
        <ESP32 pos={[5.4, 1.15, 0.8]} rotY={Math.PI / 2} led={recorta ? 0.6 : 0} />
        <group position={[-7.5, 0, 1.5]}>
          <PiezoDisco />
        </group>
        <Tubo puntos={[[-6.4, 0.1, 1.6], [-5.2, 0.4, 1.4], [-3.9, 0.9, 1.2]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={20} />
        <Tubo puntos={[[-6.4, 0.1, 2.0], [-5.2, 0.4, 2.3], [-3.9, 0.9, 2.4]]} radio={0.05} material={M.color('#1A1A1A', 0.4)} seg={20} />
        {t >= tR - 0.3 && <ResistenciaAxial pos={[-1.0, 0.85, 1.2]} bandas={['#7A4A21', '#151515', '#E5732E', '#D4AF37']} />}
        {t >= tZ - 0.3 && <Zener pos={[1.3, 0.85, 1.2]} rotY={Math.PI / 2} />}
        <Osciloscopio3D pos={[7.8, 0, -4.0]} rotY={-0.3} muestras={muestras} recorte={0.62} etiquetaRecorte="3,3 V" titulo={recorta ? 'con protección' : 'sin protección'} />
      </Estudio>
      <EtiquetaGuia desde={pR} hacia={{x: pR.x - 120, y: pR.y - 170}} texto="resistencia en serie" p={ap(t, tR, 0.5) * sal(t, tRec - 0.6, 0.3)} lado="izq" />
      <EtiquetaGuia desde={pZ} hacia={{x: pZ.x + 120, y: pZ.y - 170}} texto="zener de 3,3 V" p={ap(t, tZ, 0.5) * sal(t, tRec - 0.6, 0.3)} />
      <TituloGrande texto="picos de más de 3,3 V" p={ap(t, tP, 0.5) * sal(t, tR - 0.3, 0.3)} y={96} />
      <TituloGrande texto="los picos quedan recortados" p={ap(t, tRec + 0.4, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ huesos piezoeléctricos
export const Hueso3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tC = m('colageno', 2.0);
  const tP = m('peso', 4.0);
  const tF = m('fortalece', 7.0);
  const carga = ap(t, tP - 0.4, 0.8, easeInOut);
  const cam = orbita([0, 2.6, 0], 15, 3.6, -20 + t * 2.5, 30);
  const signos = Array.from({length: 7}, (_, i) => -2.4 + i * 0.8);
  const op = ap(t, tP + 0.3, 0.6);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1.5, 0]} {...Q}>
        <Caja tam={[0.8, 1.6, 2.0]} pos={[-3.1, 0.8, 0]} material={M.aceroMate()} radio={0.1} />
        <Caja tam={[0.8, 1.6, 2.0]} pos={[3.1, 0.8, 0]} material={M.aceroMate()} radio={0.1} />
        <group position={[0, 0.65 - carga * 0.1, 0]}>
          <Hueso />
        </group>
        <group position={[0, mix(7, 2.7, carga), 0]}>
          <Cil r={1.0} h={1.3} pos={[0, 0.65, 0]} mat={M.color('#9AA1A8', 0.25, 1)} />
        </group>
        {op > 0.01 &&
          signos.map((x, i) => (
            <group key={i}>
              <Esf r={0.13} pos={[x, 2.45, 0.42]} mat={M.emisivo('#4F8DFF', 3)} seg={12} />
              <Esf r={0.13} pos={[x, 1.05, 0.42]} mat={M.emisivo('#FF5C8A', 3)} seg={12} />
            </group>
          ))}
      </Estudio>
      <TituloGrande texto="el colágeno genera pequeñas cargas" sub="lado comprimido: negativo · lado estirado: positivo" p={ap(t, tP + 0.4, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="¿así sabe el hueso dónde reforzarse?" sub="todavía se investiga" p={ap(t, tF, 0.5) * sal(t, dur, 0.3)} y={96} />
      <TituloGrande texto="tus huesos son piezoeléctricos" p={ap(t, 0.2, 0.5) * sal(t, tP + 0.2, 0.3) * (t < tC + 4 ? 1 : 0)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ baldosas que cosechan pasos (Tokio, 2008)
export const Baldosas3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('tokio', 3.5);
  const tB = m('bombillo', 6.5);
  const tC = m('ciudad', 10.5);
  const NX = 8;
  const NZ = 4;
  const pasos = Array.from({length: 60}, (_, k) => ({x: (k % NX) - (NX - 1) / 2, z: (Math.floor(k / 2) % NZ) - (NZ - 1) / 2, t0: 0.4 + k * 0.42}));
  const brilloBaldosa = (i: number, j: number) => {
    let b = 0;
    for (const p of pasos) if (Math.round(p.x + (NX - 1) / 2) === i && Math.round(p.z + (NZ - 1) / 2) === j) b = Math.max(b, t >= p.t0 ? Math.exp(-(t - p.t0) * 3) : 0);
    return b;
  };
  const luz = ap(t, tB, 2.5);
  const lejos = ap(t, tC - 0.3, 2.2, easeInOut);
  const cam: Camara = {pos: [mix(-2, 0, lejos), mix(11, 26, lejos), mix(19, 46, lejos)], obj: [mix(1, 6, lejos), mix(1.4, 2, lejos), mix(-1.5, 0, lejos)], fov: mix(32, 36, lejos)};
  const edificios = useMemo(() => {
    const r = azar(7);
    return Array.from({length: 28}, (_, i) => ({x: 14 + (i % 7) * 4.2, z: -10 + Math.floor(i / 7) * 5, h: 4 + r() * 14}));
  }, []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {Array.from({length: NX}, (_, i) =>
          Array.from({length: NZ}, (_, j) => {
            const b = brilloBaldosa(i, j);
            return (
              <group key={`${i}-${j}`} position={[(i - (NX - 1) / 2) * 2.05, 0, (j - (NZ - 1) / 2) * 2.05]}>
                <Caja tam={[1.95, 0.25, 1.95]} pos={[0, 0.13, 0]} material={M.color('#3A3D42', 0.6)} radio={0.04} />
                <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.7, 1.7]} />
                  <meshBasicMaterial color="#7CF0FF" transparent opacity={0.04 + 0.9 * b} toneMapped={false} depthWrite={false} />
                </mesh>
              </group>
            );
          }),
        )}
        {[-1, 1].map((s) => (
          <group key={s} position={[-9.6, 0, s * 2.2]}>
            <Caja tam={[1.4, 3.0, 3.2]} pos={[0, 1.5, 0]} material={M.color('#C5CBD1', 0.3, 0.8)} radio={0.1} />
            <Caja tam={[1.42, 0.25, 3.2]} pos={[0, 3.05, 0]} material={M.plasticoNegro()} radio={0.05} />
          </group>
        ))}
        {pasos.map((p, k) => {
          const q = t - p.t0;
          if (q < -0.3 || q > 0.5) return null;
          const y = q < 0 ? -q * 2 : 0;
          return <Caja key={k} tam={[0.7, 0.18, 1.3]} pos={[p.x * 2.05 + 0.2 * ((k % 2) * 2 - 1), 0.35 + y, p.z * 2.05]} material={M.color('#F0F0EC', 0.6)} radio={0.08} />;
        })}
        <group position={[5.2, 0, -6.5]} scale={1.3}>
          {t >= tB - 0.4 && <Bombillo luz={luz} />}
        </group>
        {lejos > 0.01 &&
          edificios.map((e, i) => <Caja key={i} tam={[3.2, e.h, 3.2]} pos={[e.x, e.h / 2, e.z]} material={M.color('#1B1E22', 0.6, 0.2)} />)}
      </Estudio>
      <TituloGrande texto="Tokio, 2008" sub="un piso que cosecha la energía de los pasos" p={ap(t, tT, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />
      <Dato x={1560} y={640} valor="100 W" sub="algo más de 1 hora al día" p={ap(t, tB + 0.6, 0.5) * sal(t, tC - 0.3, 0.3)} />
      <TituloGrande texto="no va a encender una ciudad" p={ap(t, tC + 0.8, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
