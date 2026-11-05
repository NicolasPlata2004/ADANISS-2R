// S03 · Sensor PIR — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Protoboard, Tubo} from '../modelos/Piezas';
import {Cil, Esf, Toro} from '../modelos/Objetos';
import {SensorPIR} from '../modelos/ObjetosS02';
import {Bano, matTermico, Persona} from '../modelos/ObjetosS03';
import {Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano} from '../texto3d';
import {Bombillo} from '../modelos/Objetos';

const Q = {escala: 0.8} as const;

// ------------------------------------------------------------------ el baño: la luz se apaga si te quedas quieto
export const Bano3D: React.FC<{modo?: 'gancho' | 'termico' | 'final'}> = ({modo = 'gancho'}) => {
  const {t, M: m, dur} = useEscena();
  const tE = m('entras', 0.4);
  const tQ = m('quieto', 3.5);
  const tO = m('oscuras', 6.0);
  const tB = m('brazo', 8.0);
  const tC = m('calor', 14.0);
  const tCam = m('cambia', 17.0);
  const tX = m('existir', 21.0);
  const tMuevete = m('muevete', 4.0);
  let x = 0;
  let paso = 0;
  let brazo = 0;
  let luz = 1;
  let termico = 0;
  let presencia = 1;
  if (modo === 'gancho') {
    const entra = ap(t, tE - 1.2, 2.2, easeInOut);
    x = mix(-9, 0, entra);
    paso = entra < 1 ? t * 6 : 0;
    luz = ap(t, tE - 0.2, 0.3) * (1 - ap(t, tO, 0.25)) + ap(t, tB + 0.3, 0.25) * (t < tC ? 1 : 0);
    brazo = ap(t, tB - 0.2, 0.4) * (1 - ap(t, tB + 2.6, 0.5));
    termico = t >= tC ? 1 : 0;
    presencia = 1 - ap(t, tX - 0.5, 1.5);
    if (t > tCam && t < tX - 0.6) brazo = 0.6;
  } else if (modo === 'termico') {
    termico = 1;
    x = 0;
  } else {
    luz = 1 - ap(t, tMuevete - 1.2, 0.3);
    brazo = ap(t, tMuevete, 0.4);
    if (brazo > 0.5) luz = 1;
  }
  const cam = camaraEn(
    [
      {t: 0, pos: [7, 8.5, 17], obj: [-1, 3.6, -1], fov: 34},
      {t: modo === 'gancho' ? tC - 0.6 : 99, d: 1.6, pos: [5, 7.2, 16.5], obj: [-0.5, 3.6, -1], fov: 32},
    ],
    t,
  );
  const persona = (
    <group position={[x, 0, -1.2]} rotation={[0, x < -0.5 ? Math.PI / 2 : 0.25, 0]}>
      <Persona paso={paso} brazo={brazo} t={t} ondea={brazo > 0.5 ? 1 : 0} termico={termico > 0.5 ? 1 : 0} />
    </group>
  );
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, -2]} exposicion={termico > 0.5 ? 1 : 0.18 + 0.9 * luz} entorno={termico > 0.5 ? 0.75 : 0.15 + 0.6 * luz} {...Q}>
        <Bano luz={termico > 0.5 ? 0.3 : luz} termico={termico} />
        {termico > 0.5 ? presencia > 0.02 && <group scale={[1, 1, 1]}>{presencia > 0.5 ? persona : null}</group> : persona}
        {termico < 0.5 && <ambientLight intensity={0.05 + 0.2 * luz} />}
      </Estudio>
      {modo === 'gancho' && <TituloGrande texto="ve calor" p={ap(t, tC, 0.4) * sal(t, tCam - 0.3, 0.3)} y={96} />}
      {modo === 'gancho' && <TituloGrande texto="solo ve cuando el calor cambia" p={ap(t, tCam, 0.4) * sal(t, tX - 0.4, 0.3)} y={96} />}
      {modo === 'gancho' && <TituloGrande texto="quieto: desapareces" p={ap(t, tX, 0.4) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'termico' && <TituloGrande texto="eres una mancha brillante" sub="sobre un fondo un poco más oscuro" p={ap(t, m('mancha', 2.0), 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'final' && <TituloGrande texto="¡muévete!" p={ap(t, tMuevete, 0.4) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ todo lo que tiene temperatura brilla
export const Brillo3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tSol = m('sol', 4.0);
  const tEst = m('estufa', 7.0);
  const tTu = m('tu', 11.0);
  const xs = [-9, 0, 9];
  const foco = ap(t, tEst - 0.5, 1.0, easeInOut) + ap(t, tTu - 0.5, 1.0, easeInOut);
  const xf = mix(xs[0], xs[2], foco / 2);
  const abre = ap(t, tTu + 4.5, 1.6, easeInOut);
  const cam: Camara = {pos: [mix(xf + 2, 0, abre), mix(6.5, 11, abre), mix(18.5, 32, abre)], obj: [mix(xf, 0, abre), 3.3, 0], fov: 32};
  const etiquetas = [
    {x: xs[0], texto: 'el Sol', sub: 'sobre todo luz visible', p: ap(t, tSol, 0.5)},
    {x: xs[1], texto: 'al rojo vivo', sub: 'sobre todo infrarrojo', p: ap(t, tEst, 0.5)},
    {x: xs[2], texto: 'tú, a 37 °C', sub: 'infrarrojo lejano · 9–10 micras', p: ap(t, tTu, 0.5)},
  ];
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[xf, 2, 0]} niebla={[20, 60]} {...Q}>
        <Cil r={3} h={0.5} pos={[xs[0], 0.25, 0]} mat={M.color('#15171A', 0.35)} />
        <Esf r={2.0} pos={[xs[0], 2.9, 0]} mat={M.emisivo('#FFF4D6', 3)} seg={48} />
        <pointLight position={[xs[0], 3, 2]} intensity={60} distance={18} color="#FFE6B0" />
        <Cil r={3} h={0.5} pos={[xs[1], 0.25, 0]} mat={M.color('#15171A', 0.35)} />
        <group position={[xs[1], 0.5, 0]}>
          <Cil r={2.4} h={0.5} pos={[0, 0.25, 0]} mat={M.color('#1B1C1E', 0.4, 0.5)} />
          {[0.6, 1.1, 1.6, 2.05].map((r) => (
            <Toro key={r} r={r} tubo={0.11} pos={[0, 0.58, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.emisivo('#FF4A1C', 2.4)} />
          ))}
          <pointLight position={[0, 1.2, 0]} intensity={8} distance={8} color="#FF5A2A" />
        </group>
        <Cil r={3} h={0.5} pos={[xs[2], 0.25, 0]} mat={M.color('#15171A', 0.35)} />
        <group position={[xs[2], 0.5, 0]} scale={0.85}>
          <Persona termico={1} />
        </group>
      </Estudio>
      {etiquetas.map((e, i) => {
        const p = proyectar([e.x, i === 2 ? 7.4 : 5.6, 0], cam);
        return <EtiquetaGuia key={i} desde={p} hacia={{x: p.x + 60, y: Math.max(200, p.y - 70)}} texto={e.texto} sub={e.sub} p={e.p * sal(t, dur, 0.3)} />;
      })}
      <TituloGrande texto="todo lo que tiene temperatura brilla" p={ap(t, 0.2, 0.5) * sal(t, tSol - 0.3, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cristal piroeléctrico: cargas solo cuando la temperatura cambia
export const CristalPiro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tP = m('piro', 1.0);
  const tC = m('cambia', 3.0);
  const tT = m('tantalato', 9.0);
  const tQ = m('caliente', 13.0);
  const tI = m('invisible', 19.0);
  const calor = (tt: number) => ap(tt, tC, 1.0, easeInOut) * (1 - ap(tt, tI - 0.4, 1.2, easeInOut));
  const temp = calor(t);
  const dT = (calor(t + 0.05) - calor(t - 0.05)) / 0.1;
  const carga = clamp01(Math.abs(dT) * 0.9) * Math.sign(dT);
  const muestras = Array.from({length: 200}, (_, i) => {
    const tt = t - 4 + (i / 199) * 4;
    let v = 0;
    for (let k = 0; k < 40; k++) {
      const s = tt - k * 0.05;
      const d = (calor(s + 0.05) - calor(s - 0.05)) / 0.1;
      v += d * Math.exp(-k * 0.05 / 0.35) * 0.05;
    }
    return clamp01(Math.abs(v * 1.6)) * Math.sign(v) * 0.9;
  });
  const cam = orbita([1.5, 2.2, 0], 15, 4.0, -25 + t * 1.5, 32);
  const cristal = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#F3EAD8', roughness: 0.15, transparent: true, opacity: 0.85, clearcoat: 1}), []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 2, 0]} {...Q}>
        <group position={[-2.2, 1.6, 0]}>
          <Caja tam={[4.2, 0.12, 3.0]} pos={[0, 0.55, 0]} material={M.oro()} />
          <Caja tam={[4.0, 1.0, 2.8]} pos={[0, 0, 0]} material={cristal} radio={0.04} />
          <Caja tam={[4.2, 0.12, 3.0]} pos={[0, -0.55, 0]} material={M.oro()} />
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.05, 1.05, 2.85]} />
            <meshBasicMaterial color="#FF7A2A" transparent opacity={0.35 * temp} toneMapped={false} depthWrite={false} />
          </mesh>
          {Math.abs(carga) > 0.03 &&
            [-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => (
              <group key={i}>
                <Esf r={0.15} pos={[x, 0.75, 1.2]} mat={M.emisivo(carga > 0 ? '#FF5C8A' : '#4F8DFF', 2.5 * Math.abs(carga))} seg={10} />
                <Esf r={0.15} pos={[x, -0.75, 1.2]} mat={M.emisivo(carga > 0 ? '#4F8DFF' : '#FF5C8A', 2.5 * Math.abs(carga))} seg={10} />
              </group>
            ))}
          {temp > 0.02 && (
            <group position={[0, 4.6, 0]}>
              <Cil r={0.9} r2={1.4} h={1.2} pos={[0, 0.6, 0]} mat={M.color('#2B2E33', 0.4, 0.5)} />
              <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.35, 40]} />
                <meshBasicMaterial color="#FF6A2A" toneMapped={false} transparent opacity={0.6 + 0.4 * temp} />
              </mesh>
              <mesh position={[0, -2.0, 0]}>
                <cylinderGeometry args={[1.35, 2.2, 4.0, 40, 1, true]} />
                <meshBasicMaterial color="#FF6A2A" transparent opacity={0.08 * temp} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
        <Tubo puntos={[[-0.1, 2.2, 1.0], [1.4, 2.4, 1.4], [3.0, 1.6, 0.8], [4.0, 1.2, -0.6]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={30} />
        <Osciloscopio3D pos={[6.0, 0, -1.6]} rotY={-0.35} escala={0.9} muestras={muestras} titulo="cargas del cristal" />
      </Estudio>
      <TituloGrande texto="piroeléctrico" sub="cargas cuando la temperatura cambia" p={ap(t, tP, 0.5) * sal(t, tT - 0.3, 0.3)} y={96} />
      <TituloGrande texto="tantalato de litio" sub="primo del piezoeléctrico" p={ap(t, tT, 0.5) * sal(t, tQ - 0.3, 0.3)} y={96} />
      <TituloGrande texto="caliente pero quieto: la señal se va" p={ap(t, tQ, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ dos cristales conectados al revés
export const DosOjos3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('dos', 0.8);
  const tR = m('reves', 2.5);
  const tCal = m('calienta', 5.5);
  const tCan = m('cancelan', 8.5);
  const tCr = m('cruza', 12.0);
  const tPar = m('pareja', 17.0);
  const tL = m('lata', 20.0);
  const tV = m('ventana', 26.0);
  const tapa = ap(t, tD - 0.8, 1.2, easeInOut) * (1 - ap(t, tL - 0.4, 1.2, easeInOut));
  const ambiente = ap(t, tCal, 3.0) * (1 - ap(t, tCr - 1.0, 1.0));
  const cruce = clamp01((t - tCr) / 3.2);
  const g = (x: number, c: number) => Math.exp(-((x - c) ** 2) / 0.05);
  const e1 = t >= tCr && t < tCr + 3.2 ? g(cruce, 0.38) : 0;
  const e2 = t >= tCr && t < tCr + 3.2 ? g(cruce, 0.62) : 0;
  const muestras = Array.from({length: 200}, (_, i) => {
    const tt = t - 4 + (i / 199) * 4;
    const c = clamp01((tt - tCr) / 3.2);
    const d1 = tt >= tCr && tt < tCr + 3.2 ? g(c, 0.38) : 0;
    const d2 = tt >= tCr && tt < tCr + 3.2 ? g(c, 0.62) : 0;
    return 0.85 * (d1 - d2) + 0.01 * Math.sin(i * 1.7);
  });
  const cam = orbita([1.5, 2.0, 0], 14, 5.5, -20 + t * 1.2, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <group position={[-2.6, 0, 0.6]}>
          <Cil r={2.0} h={0.3} pos={[0, 0.15, 0]} mat={M.aceroMate()} seg={56} />
          {[-0.75, 0.75].map((x, i) => {
            const brillo = ambiente * 0.6 + (i === 0 ? e1 : e2);
            return (
              <group key={i} position={[x, 0.42, 0]}>
                <Caja tam={[0.9, 0.12, 1.6]} material={M.color('#EADFC8', 0.3)} radio={0.03} />
                <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.8, 1.5]} />
                  <meshBasicMaterial color="#FF6A2A" transparent opacity={0.85 * clamp01(brillo)} toneMapped={false} />
                </mesh>
                <TextoPlano lineas={[{t: i === 0 ? '+' : '−', tam: 300, color: i === 0 ? '#FF5C8A' : '#4F8DFF'}]} w={0.9} h={0.9} pos={[0, 1.0, 0.9]} op={ap(t, tR, 0.5)} />
              </group>
            );
          })}
          <group position={[0, 0.3 + tapa * 3.6, 0]}>
            <Cil r={1.9} h={1.6} pos={[0, 0.8, 0]} mat={M.aceroMate()} seg={56} abierto />
            <Cil r={1.9} h={0.12} pos={[0, 1.6, 0]} mat={M.aceroMate()} seg={56} />
            <Caja tam={[1.6, 0.06, 1.2]} pos={[0, 1.68, 0]} material={M.color('#1E2126', 0.05, 0.6)} />
          </group>
        </group>
        <group position={[mix(-9, 9, cruce), 0, -7]} rotation={[0, Math.PI / 2, 0]} scale={0.8}>
          {t >= tCr - 0.2 && t < tCr + 3.4 && <Persona termico={1} paso={t * 7} />}
        </group>
        <Osciloscopio3D pos={[6.4, 0, -2.2]} rotY={-0.35} escala={0.85} muestras={muestras} titulo="salida del sensor" />
      </Estudio>
      <TituloGrande texto="dos cristales, conectados al revés" p={ap(t, tD, 0.5) * sal(t, tCal - 0.3, 0.3)} y={96} />
      <TituloGrande texto="si todo se calienta igual, se cancelan" p={ap(t, tCal, 0.5) * sal(t, tCr - 0.4, 0.3)} y={96} />
      <TituloGrande texto="algo que se mueve: un pulso + y uno −" p={ap(t, tPar - 0.6, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />
      <TituloGrande texto="ventana de silicio" sub="deja pasar el infrarrojo lejano, bloquea la luz visible" p={ap(t, tV, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ la cúpula de Fresnel divide el espacio en zonas
export const Cupula3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tL = m('lupas', 3.0);
  const tZ = m('zonas', 9.0);
  const tCr = m('cruzando', 17.0);
  const tD = m('directo', 20.0);
  const zonas = ap(t, tZ - 0.5, 1.2);
  const N = 9;
  const abanico = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (let k = 0; k < N; k++) {
      const a0 = -0.75 + k * (1.5 / N);
      const a1 = a0 + (1.5 / N) * 0.55;
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.lineTo(Math.sin(a0) * 22, Math.cos(a0) * 22);
      s.lineTo(Math.sin(a1) * 22, Math.cos(a1) * 22);
      s.lineTo(0, 0);
      out.push(new THREE.ShapeGeometry(s));
    }
    return out;
  }, []);
  // persona: primero cruza (x de -8 a 8 a z = 12), luego camina de frente (z de 18 a 6)
  const fase1 = clamp01((t - (tZ + 2)) / Math.max(2, tD - tZ - 2.5));
  const fase2 = clamp01((t - tD) / 4);
  const enCruce = t < tD;
  const px = enCruce ? mix(-9, 9, fase1) : 1.0;
  const pz = enCruce ? 12 : mix(19, 7, fase2);
  const angP = Math.atan2(px, pz);
  const zonaDe = (a: number) => {
    for (let k = 0; k < N; k++) {
      const a0 = -0.75 + k * (1.5 / N);
      if (a >= a0 && a <= a0 + (1.5 / N) * 0.55) return k;
    }
    return -1;
  };
  const zonaP = t > tZ + 1.5 ? zonaDe(angP) : -1;
  const cam = camaraEn(
    [
      {t: 0, pos: [3.5, 4.0, 9], obj: [0, 3.0, 0], fov: 30},
      {t: tZ - 0.8, d: 2.0, pos: [14, 22, 26], obj: [0, 0, 9], fov: 36},
    ],
    t,
  );
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 6]} niebla={[30, 80]} {...Q}>
        <Caja tam={[16, 7, 0.4]} pos={[0, 3.5, -0.4]} material={M.color('#2A2C30', 0.8)} />
        <group position={[0, 4.2, 0.4]} rotation={[Math.PI / 2 + 0.5, 0, 0]} scale={1.1}>
          <SensorPIR />
        </group>
        {zonas > 0.01 &&
          abanico.map((geo, k) => (
            <mesh key={k} geometry={geo} position={[0, 0.03, 0.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, -1, 1]}>
              <meshBasicMaterial color={k === zonaP ? '#FFB547' : '#7CF0FF'} transparent opacity={zonas * (k === zonaP ? 0.55 : 0.16)} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        {t > tZ + 1.5 && (
          <group position={[px, 0, pz]} rotation={[0, enCruce ? Math.PI / 2 : Math.PI, 0]} scale={0.7}>
            <Persona paso={t * 7} />
          </group>
        )}
      </Estudio>
      <TituloGrande texto="un mosaico de lentes de Fresnel" p={ap(t, tL, 0.5) * sal(t, tZ - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el espacio queda dividido en zonas" p={ap(t, tZ, 0.5) * sal(t, tCr - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cruzando: saltas de zona en zona" p={ap(t, tCr, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="de frente: casi no cambias de zona" p={ap(t, tD, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el módulo HC-SR501 por debajo y su temporizador
export const ModuloPIR3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tChip = m('chip', 1.5);
  const tPer = m('perillas', 6.0);
  const tSen = m('sensibilidad', 7.5);
  const tTie = m('tiempo', 11.0);
  const tPue = m('puente', 16.0);
  const tTem = m('temporizador', 20.0);
  const vista = ap(t, tTem - 0.6, 1.4, easeInOut);
  const cam: Camara = {pos: [mix(0.5, 7, vista), mix(9.5, 7, vista), mix(8, 14, vista)], obj: [mix(0, 3.5, vista), mix(0.8, 1.6, vista), 0], fov: 30};
  const cuenta = clamp01((t - tTem) / Math.max(2, dur - tTem - 1.5));
  const luz = t < tTem ? 1 : cuenta < 1 ? 1 : 0;
  const pChip = proyectar([0, 0.9, 0], cam);
  const pS = proyectar([-1.6, 1.0, 0.9], cam);
  const pT = proyectar([1.6, 1.0, 0.9], cam);
  const pJ = proyectar([2.6, 0.8, -0.6], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <Caja tam={[6.4, 0.2, 4.8]} pos={[0, 0.5, 0]} material={M.color('#1E5B3A', 0.5)} radio={0.04} />
        <Caja tam={[1.6, 0.3, 1.0]} pos={[0, 0.75, 0]} material={M.plasticoNegro()} radio={0.03} />
        <TextoPlano lineas={[{t: 'BISS0001', tam: 110, color: '#C9CDD1', peso: 600}]} w={1.3} h={0.3} pos={[0, 0.91, 0]} rot={[-Math.PI / 2, 0, 0]} />
        {[-1.6, 1.6].map((x) => (
          <group key={x} position={[x, 0.85, 0.9]}>
            <Caja tam={[1.1, 0.5, 1.1]} material={M.color('#E8792F', 0.4)} radio={0.06} />
            <Cil r={0.32} h={0.12} pos={[0, 0.3, 0]} mat={M.color('#F3F1EA', 0.4)} />
            <Caja tam={[0.5, 0.05, 0.08]} pos={[0, 0.37, 0]} rot={[0, t * 0.3 + x, 0]} material={M.plasticoNegro()} />
          </group>
        ))}
        {[-0.5, 0, 0.5].map((z) => (
          <Cil key={z} r={0.06} h={0.6} pos={[2.6, 0.9, z - 0.6]} mat={M.oro()} />
        ))}
        <Caja tam={[0.3, 0.45, 0.8]} pos={[2.6, 1.15, -0.85 + (ap(t, tPue + 1, 0.4) > 0.5 ? 0.5 : 0)]} material={M.color('#F2C230', 0.4)} radio={0.03} />
        {[-1.0, 0, 1.0].map((x) => (
          <Cil key={x} r={0.06} h={0.8} pos={[x, 0.95, -2.1]} mat={M.oro()} />
        ))}
        <group position={[6.5, 0, -0.5]} scale={0.9}>
          <Bombillo luz={luz} />
        </group>
        {t > tTem && cuenta < 1 && (
          <mesh position={[6.5, 7.2, -0.5]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.9, 0.12, 12, 64, Math.PI * 2 * (1 - cuenta)]} />
            <meshBasicMaterial color="#FFB547" toneMapped={false} />
          </mesh>
        )}
      </Estudio>
      <EtiquetaGuia desde={pChip} hacia={{x: pChip.x + 40, y: pChip.y - 170}} texto="chip: amplifica, filtra, compara" p={ap(t, tChip, 0.5) * sal(t, tPer - 0.3, 0.3)} />
      <EtiquetaGuia desde={pS} hacia={{x: pS.x - 80, y: pS.y + 150}} texto="sensibilidad" sub="de unos 3 a 7 metros" p={ap(t, tSen, 0.5) * sal(t, tTem - 0.6, 0.3)} lado="izq" />
      <EtiquetaGuia desde={pT} hacia={{x: pT.x + 80, y: pT.y + 150}} texto="tiempo encendido" sub="de segundos a minutos" p={ap(t, tTie, 0.5) * sal(t, tTem - 0.6, 0.3)} />
      <EtiquetaGuia desde={pJ} hacia={{x: pJ.x + 60, y: pJ.y - 150}} texto="puente: ¿reinicia el tiempo?" p={ap(t, tPue, 0.5) * sal(t, tTem - 0.6, 0.3)} />
      <TituloGrande texto="sin cambios de calor: se acaba el tiempo y se apaga" p={ap(t, tTem + 0.4, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: cámara a batería que despierta sola
export const PIRESP32_3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tCinco = m('cinco', 1.0);
  const tMin = m('minuto', 6.0);
  const tSue = m('sueno', 11.0);
  const tDesp = m('despierta', 15.0);
  const tFoto = m('foto', 16.5);
  const tDuerme = m('duerme', 18.0);
  const tCont = m('contar', 24.0);
  const tAire = m('aire', 30.0);
  const despierto = t >= tDesp && t < tDuerme + 0.5 ? 1 : t < tSue ? 1 : 0.15;
  const flash = Math.exp(-Math.max(0, t - tFoto) * 6) * (t >= tFoto ? 1 : 0);
  const cuenta = t < tCont ? 0 : Math.floor((t - tCont) * 1.4);
  const cam = orbita([1, 1.4, 0.5], 15, 7, -18 + t * 1.0, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <Protoboard pos={[1.2, 0, 1.4]} />
        <ESP32 pos={[3.5, 1.15, 1.4]} rotY={Math.PI / 2} led={despierto > 0.5 ? 1 : 0} />
        <group position={[-5.6, 0, 0.2]} rotation={[0, 0.4, 0]} scale={1.2}>
          <SensorPIR />
        </group>
        <Tubo puntos={[[-5.0, 0.6, -0.8], [-3.5, 0.9, 0.1], [-1.0, 1.0, 1.0]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={24} />
        <Tubo puntos={[[-5.6, 0.6, -0.8], [-3.6, 0.8, 0.5], [-1.0, 1.0, 1.6]]} radio={0.05} material={M.color('#1A1A1A', 0.4)} seg={24} />
        <Tubo puntos={[[-6.2, 0.6, -0.8], [-3.8, 0.7, 0.9], [-1.0, 1.0, 2.2]]} radio={0.05} material={M.color('#F2C230', 0.4)} seg={24} />
        <group position={[6.8, 0, -2.0]}>
          <Caja tam={[2.4, 2.4, 2.4]} pos={[0, 1.2, 0]} material={M.plasticoBlanco()} radio={0.5} />
          <Cil r={0.6} h={0.3} pos={[0, 1.3, 1.2]} rot={[Math.PI / 2, 0, 0]} mat={M.plasticoNegro()} />
          <mesh position={[0, 1.3, 1.4]}>
            <circleGeometry args={[0.45, 32]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={flash} toneMapped={false} />
          </mesh>
          {flash > 0.02 && <pointLight position={[0, 1.4, 2.4]} intensity={60 * flash} distance={14} />}
        </group>
        <TextoPlano lineas={[{t: despierto > 0.5 ? 'despierto' : 'durmiendo…', tam: 110, color: despierto > 0.5 ? '#7CFFB2' : '#8A93A0', mono: true}]} w={3.2} h={0.6} pos={[3.5, 3.2, 1.4]} estilo={{fondo: '#0B0F14', radio: 30}} op={t > tSue - 1 ? 1 : 0} />
        {t >= tCont && <TextoPlano lineas={[{t: `pasadas: ${cuenta}`, tam: 120, color: '#7CF0FF', mono: true}]} w={3.4} h={0.7} pos={[-2, 4.2, -1.5]} estilo={{fondo: '#0B0F14', radio: 30}} />}
      </Estudio>
      <TituloGrande texto="5 V, tierra y salida: listo" sub="la salida ya es de 3,3 V" p={ap(t, tCinco, 0.5) * sal(t, tMin - 0.3, 0.3)} y={96} />
      <TituloGrande texto="espera un minuto al encenderlo" p={ap(t, tMin, 0.5) * sal(t, tSue - 0.3, 0.3)} y={96} />
      <TituloGrande texto="sueño profundo: un pin vigila" p={ap(t, tSue, 0.5) * sal(t, tDesp - 0.3, 0.3)} y={96} />
      <TituloGrande texto="movimiento: despierta, foto, a dormir" p={ap(t, tDesp, 0.5) * sal(t, tCont - 0.3, 0.3)} y={96} />
      <TituloGrande texto="ojo con el aire caliente" sub="calefactores y aires acondicionados" p={ap(t, tAire, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ la turmalina atrae ceniza al calentarse
export const Turmalina3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tS = m('siglos', 0.8);
  const tC = m('calentarlas', 4.0);
  const calor = ap(t, tC - 0.5, 1.2);
  const ceniza = ap(t, tC + 0.6, 2.5, easeInOut);
  const cam = orbita([0, 1.6, 0], 11, 4, -20 + t * 3, 30);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#2E8B57', roughness: 0.12, transparent: true, opacity: 0.85, clearcoat: 1, emissive: new THREE.Color('#FF5A1F'), emissiveIntensity: 0}), []);
  mat.emissiveIntensity = 0.35 * calor;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[6, 0.4, 3]} pos={[0, 0.2, 0]} material={M.color('#2A2420', 0.9)} radio={0.1} />
        {Array.from({length: 14}, (_, i) => (
          <Esf key={i} r={0.3} pos={[-2.4 + (i % 7) * 0.8, 0.5, (Math.floor(i / 7) - 0.5) * 1.2]} mat={M.emisivo('#FF5A1F', Math.round((0.4 + calor * 1.6 + 0.3 * Math.sin(t * 5 + i)) * 10) / 10)} seg={10} />
        ))}
        <group position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2 - 0.1]}>
          <mesh material={mat} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 3.4, 3]} />
          </mesh>
        </group>
        {Array.from({length: 30}, (_, i) => {
          const a = (i * 2.399) % (Math.PI * 2);
          const r = mix(2.8, 0.85, ceniza) + Math.sin(i * 3 + t) * 0.08;
          return <Esf key={`c${i}`} r={0.06} pos={[((i % 10) - 4.5) * 0.32, 1.6 + Math.cos(a) * r, Math.sin(a) * r]} mat={M.color('#9A948C', 0.9)} seg={6} />;
        })}
      </Estudio>
      <TituloGrande texto="“sacadoras de ceniza”" sub="turmalinas traídas de Sri Lanka" p={ap(t, tS, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
