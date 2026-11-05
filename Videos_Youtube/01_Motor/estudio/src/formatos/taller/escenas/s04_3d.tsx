// S04 · Efecto Hall — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Protoboard, Tubo} from '../modelos/Piezas';
import {Cil, Esf, pintura, Toro} from '../modelos/Objetos';
import {Control, Iman, SensorHall} from '../modelos/ObjetosS03';
import {MonitorJuego, PotenciometroCorte} from '../modelos/ObjetosS04';
import {TextoPlano, useLienzo} from '../texto3d';

const Q = {escala: 0.8} as const;
const CIAN = '#7CF0FF';

/** Voltímetro de aguja con la escala dibujada (valor entre -1 y 1). */
const Voltimetro: React.FC<{pos?: V3; valor: number; rotY?: number; etiqueta?: string}> = ({pos = [0, 0, 0], valor, rotY = 0, etiqueta = 'voltaje Hall'}) => {
  const tex = useLienzo(
    640,
    420,
    (g, w, h) => {
      g.fillStyle = '#F2EFE7';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#1A1A1A';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(w / 2, h * 0.92, h * 0.72, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * 1.15 + (i / 10) * Math.PI * 0.7;
        g.beginPath();
        g.moveTo(w / 2 + Math.cos(a) * h * 0.66, h * 0.92 + Math.sin(a) * h * 0.66);
        g.lineTo(w / 2 + Math.cos(a) * h * 0.74, h * 0.92 + Math.sin(a) * h * 0.74);
        g.stroke();
      }
      g.fillStyle = '#1A1A1A';
      g.font = '700 40px Inter, Arial';
      g.textAlign = 'center';
      g.fillText('−      0      +', w / 2, h * 0.2);
      g.font = '600 30px Inter, Arial';
      g.fillText(etiqueta, w / 2, h * 0.97);
      const a = Math.PI * 1.5 + clamp01((valor + 1) / 2) * Math.PI * 0.7 - Math.PI * 0.35;
      g.strokeStyle = '#E5484D';
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(w / 2, h * 0.92);
      g.lineTo(w / 2 + Math.cos(a) * h * 0.68, h * 0.92 + Math.sin(a) * h * 0.68);
      g.stroke();
    },
    [Math.round(valor * 200), etiqueta],
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Caja tam={[3.6, 2.8, 1.4]} pos={[0, 1.4, 0]} material={M.color('#2B2E33', 0.4, 0.4)} radio={0.2} />
      <mesh position={[0, 1.55, 0.71]}>
        <planeGeometry args={[3.0, 1.97]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ gancho: el personaje camina solo
export const DriftGancho3D: React.FC<{final?: boolean}> = ({final = false}) => {
  const {t, M: m, dur} = useEscena();
  const tDrift = m('drift', 4.0);
  const tNueva = m('nueva', 12.0);
  const tAnio = m('anio', 15.0);
  const tIman = m('iman', 26.0);
  const panea = final ? 0 : ap(t, tNueva - 0.6, 1.8, easeInOut);
  const cam = camaraEn(
    [
      {t: 0, pos: [2, 6.5, 17], obj: [0, 3.0, 0], fov: 32},
      {t: final ? 99 : tNueva - 0.6, d: 1.8, pos: [10, 7.5, 18], obj: [7.4, 2.2, 1.6], fov: 30},
    ],
    t,
  );
  // en el cierre, la cámara un poco más atrás y más arriba para que el título no tape el monitor
  if (final) {
    cam.pos = [2, 7.5, 21];
    cam.obj = [0, 4.0, 0];
  }
  const deriva = 0.35;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[3, 2, 0]} {...Q}>
        <Caja tam={[24, 0.5, 9]} pos={[3, -0.25, 1.5]} material={M.color('#3A2A1E', 0.6)} />
        <MonitorJuego t={t} deriva={deriva} joyX={-deriva} joyY={0.05} />
        <group position={[0, 0, 4.2]} rotation={[0, 0, 0]}>
          <Control inclina={0} />
        </group>
        {(panea > 0.01 || final) && !final && (
          <>
            <group position={[6.0, 0, 1.6]}>
              <SensorHall />
            </group>
            <group position={[8.8, 0, 1.8]} scale={ap(t, tIman - 0.3, 0.6)}>
              <Iman />
            </group>
          </>
        )}
      </Estudio>
      {!final && <TituloGrande texto="drift" sub="la palanca se desgasta" p={ap(t, tDrift, 0.4) * sal(t, tNueva - 0.4, 0.3)} y={96} />}
      {!final && <Dato x={1500} y={330} valor="1879" sub="un efecto sin contacto" p={ap(t, tAnio, 0.4) * sal(t, dur, 0.3)} />}
      {final && <TituloGrande texto="la solución existe desde 1879" p={ap(t, 1.0, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el potenciómetro que se gasta
export const Potenciometro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tPot = m('potenciometros', 1.0);
  const tDes = m('desliza', 4.0);
  const tG = m('gasta', 9.0);
  const tCam = m('camina', 15.0);
  const tRec = m('recalibrar', 18.0);
  const mueve = t < tG ? Math.sin(t * 1.4) * 0.9 * ap(t, tDes, 0.6) : t < tCam ? Math.sin(t * 1.4) * 0.6 : 0;
  const desgaste = ap(t, tG, 2.0);
  const leido = t >= tCam ? 0.28 + 0.04 * Math.sin(t * 13) : mueve / 0.9;
  const cam = orbita([0, 0.4, 0.8], 10.5, 7, -20 + t * 2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <PotenciometroCorte ang={mueve} desgaste={desgaste} t={t} />
        <group position={[5.2, 0, 0]}>
          <Caja tam={[0.7, 4.4, 0.7]} pos={[0, 2.2, 0]} material={M.vidrio()} radio={0.08} />
          <Caja tam={[0.5, 0.06, 0.5]} pos={[0, 2.2, 0]} material={M.emisivo('#FFFFFF', 1)} />
          <Caja tam={[0.5, Math.max(0.05, Math.abs(leido) * 2), 0.5]} pos={[0, 2.2 + (leido * 2) / 2, 0]} material={M.emisivo(t >= tCam ? '#FF5A5F' : CIAN, 1.6)} />
        </group>
      </Estudio>
      <TituloGrande texto="pista de carbón + contacto que roza" p={ap(t, tPot, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="todo lo que roza se gasta" p={ap(t, tG, 0.5) * sal(t, tCam - 0.3, 0.3)} y={96} />
      <TituloGrande texto="sueltas la palanca… y lee algo" p={ap(t, tCam, 0.5) * sal(t, tRec - 0.3, 0.3)} y={96} />
      <TituloGrande texto="recalibrar solo lo esconde" p={ap(t, tRec, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ joystick Hall: un imán y un sensor que no se tocan
export const JoystickHall3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tI = m('iman', 0.8);
  const tA = m('aire', 3.0);
  const tN = m('nada', 6.0);
  const inc = Math.sin(t * 1.3) * 0.45;
  const lineas = Array.from({length: 7}, (_, k) => {
    const r = 0.6 + k * 0.35;
    const pts: V3[] = [];
    for (let i = 0; i <= 14; i++) {
      const th = Math.PI * (i / 14);
      pts.push([r * Math.cos(th) + Math.sin(inc) * 1.2, 2.2 - r * Math.sin(th) * 1.3, 0]);
    }
    return pts;
  });
  const cam = orbita([0, 2.6, 0], 12, 3.5, -25 + t * 2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <Caja tam={[7, 0.2, 4]} pos={[0, 0.1, 0]} material={M.color('#1E5B3A', 0.5)} radio={0.04} />
        <group position={[0, 0.2, 0]} scale={0.55}>
          <SensorHall />
        </group>
        <group position={[0, 2.6, 0]} rotation={[0, 0, inc]}>
          <Caja tam={[1.6, 0.5, 1.0]} pos={[0, 0, 0]} material={pintura('#C62828', 0.4)} radio={0.06} />
          <Cil r={0.25} h={3.4} pos={[0, 1.9, 0]} mat={M.color('#15171A', 0.5)} />
          <Cil r={0.9} h={0.35} pos={[0, 3.7, 0]} mat={M.goma('#2A2D31')} />
        </group>
        {lineas.map((p, k) => (
          <Tubo key={k} puntos={p} radio={0.025} material={M.emisivo(CIAN, 1.4)} seg={30} />
        ))}
      </Estudio>
      <TituloGrande texto="un imán en la palanca" p={ap(t, tI, 0.5) * sal(t, tN - 0.3, 0.3)} y={96} />
      <TituloGrande texto="nada roza: nada se gasta" p={ap(t, tN, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el efecto Hall en una lámina
export const EfectoHall3D: React.FC<{modo?: 'basico' | 'detalle'}> = ({modo = 'basico'}) => {
  const {t, M: m, dur} = useEscena();
  const tL = m('lamina', 0.8);
  const tC = m('corriente', 2.0);
  const tI = m('iman', 5.0);
  const tCo = m('costado', 8.0);
  const tLo = m('lorentz', 12.0);
  const tB = m('borde', 16.0);
  const tV = m('voltaje', 20.0);
  const tP = m('proporcional', 1.0);
  const tVu = m('vuelta', 6.0);
  const tCu = m('cobre', 13.0);
  const tSe = m('semiconductor', 20.0);
  // campo: + hacia arriba (imán abajo); se invierte al darle la vuelta
  let campo = modo === 'basico' ? ap(t, tI, 1.4) : 1;
  if (modo === 'detalle') {
    campo = 0.6 + 0.4 * Math.sin(Math.min(t, tVu) * 1.5) ** 2;
    if (t > tVu) campo = mix(1, -1, ap(t, tVu, 1.0, easeInOut));
    if (t > tCu) campo = 1;
  }
  const material = modo === 'detalle' && t > tCu ? (t > tSe ? 'semi' : 'cobre') : 'base';
  const N = material === 'cobre' ? 70 : material === 'semi' ? 14 : 36;
  const vel = material === 'cobre' ? 0.6 : material === 'semi' ? 3.5 : 1.6;
  const acumula = modo === 'basico' ? ap(t, tB - 1.0, 3.0) : 1;
  const desvio = clamp01(Math.abs(campo)) * Math.sign(campo);
  const electrones = Array.from({length: N}, (_, i) => {
    const z0 = -1.6 + ((i * 7919) % 97) / 97 * 3.2;
    const x = ((-4.4 + ((i * 3.7) % 8.8) + t * vel) % 8.8 + 8.8) % 8.8 - 4.4;
    const avance = (x + 4.4) / 8.8;
    const z = mix(z0, z0 - desvio * 3.0 * avance, modo === 'basico' ? ap(t, tCo - 0.5, 1.2) : 1);
    return [x, 2.35, Math.max(-1.8, Math.min(1.8, z))] as V3;
  });
  const vh = desvio * acumula * (material === 'cobre' ? 0.08 : material === 'semi' ? 1 : 0.7);
  const cam = orbita([1.5, 2.2, 0], 16, 8, -30 + t * 1.2, 30);
  const placa = material === 'cobre' ? M.cobre() : material === 'semi' ? M.color('#4B5563', 0.3, 0.5) : M.color('#8C939C', 0.35, 0.7);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 2, 0]} {...Q}>
        <Caja tam={[9.4, 0.25, 4.0]} pos={[0, 2.1, 0]} material={placa} radio={0.04} />
        {t > tC - 0.3 &&
          electrones.map((p, i) => <Esf key={i} r={material === 'cobre' ? 0.08 : 0.11} pos={p} mat={M.emisivo('#4F8DFF', 2.2)} seg={8} />)}
        {acumula > 0.02 &&
          Array.from({length: 12}, (_, i) => (
            <group key={`b${i}`}>
              <Esf r={0.12} pos={[-4 + i * 0.72, 2.3, -1.9 * Math.sign(desvio || 1)]} mat={M.emisivo('#4F8DFF', 2.5 * acumula * Math.abs(desvio))} seg={8} />
              <Esf r={0.12} pos={[-4 + i * 0.72, 2.3, 1.9 * Math.sign(desvio || 1)]} mat={M.emisivo('#FF5C8A', 2.5 * acumula * Math.abs(desvio))} seg={8} />
            </group>
          ))}
        {(modo === 'detalle' || t > tI - 1.5) && (
          <group position={[0, mix(-2.4, 0, modo === 'basico' ? ap(t, tI - 1.2, 1.2, easeInOut) : 1), 0]} rotation={[campo < 0 ? Math.PI : 0, 0, 0]}>
            <group position={[0, 0.9, 0]}>
              <Caja tam={[3.2, 0.8, 2.6]} pos={[0, 0.4, 0]} material={pintura('#C62828', 0.4)} radio={0.08} />
              <Caja tam={[3.2, 0.8, 2.6]} pos={[0, -0.4, 0]} material={pintura('#1E4FD8', 0.4)} radio={0.08} />
              <TextoPlano lineas={[{t: 'N', tam: 300}]} w={0.6} h={0.6} pos={[0, 0.4, 1.31]} />
            </group>
          </group>
        )}
        <Tubo puntos={[[0, 2.25, -2.0], [0.5, 3.4, -3.2], [5.0, 2.6, -2.6], [6.4, 2.4, -1.2]]} radio={0.05} material={M.color('#1A1A1A', 0.4)} seg={30} />
        <Tubo puntos={[[0, 2.25, 2.0], [0.5, 3.4, 3.0], [5.0, 2.6, 2.2], [6.4, 2.4, 0.6]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={30} />
        <Voltimetro pos={[7.6, 1.0, -0.3]} rotY={-0.5} valor={vh} />
        <TextoPlano lineas={[{t: 'electrones →', tam: 110, color: '#9CC2FF'}]} w={3.6} h={0.6} pos={[-2.5, 2.25, 2.4]} rot={[-Math.PI / 2, 0, 0]} op={ap(t, tC, 0.5)} />
      </Estudio>
      {modo === 'basico' && <TituloGrande texto="un imán empuja a las cargas de lado" sub="fuerza de Lorentz" p={ap(t, tCo, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />}
      {modo === 'basico' && <TituloGrande texto="un borde negativo, el otro positivo" p={ap(t, tB, 0.5) * sal(t, tV - 0.3, 0.3)} y={96} />}
      {modo === 'basico' && <TituloGrande texto="el voltaje Hall" p={ap(t, tV, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'detalle' && <TituloGrande texto="más imán, más voltaje" p={ap(t, tP, 0.5) * sal(t, tVu - 0.3, 0.3)} y={96} />}
      {modo === 'detalle' && <TituloGrande texto="imán al revés: el voltaje cambia de signo" p={ap(t, tVu, 0.5) * sal(t, tCu - 0.3, 0.3)} y={96} />}
      {modo === 'detalle' && <TituloGrande texto="cobre: voltaje diminuto" sub="muchísimos electrones, muy lentos" p={ap(t, tCu, 0.5) * sal(t, tSe - 0.3, 0.3)} y={96} />}
      {modo === 'detalle' && <TituloGrande texto="semiconductor: miles de veces más" sub="pocos portadores, más rápidos" p={ap(t, tSe, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ por dentro del chip Hall
export const ChipHall3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tPat = m('patas', 1.0);
  const tPl = m('placa', 4.0);
  const tAmp = m('amplificador', 8.0);
  const tCom = m('comparador', 12.0);
  const tLin = m('lineales', 20.0);
  const tDig = m('digital', 25.0);
  const abre = ap(t, tPl - 0.8, 1.6, easeInOut);
  const histeresis = useLienzo(
    640,
    420,
    (g, w, h) => {
      g.fillStyle = '#0B0F14';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(40, h - 60);
      g.lineTo(w - 30, h - 60);
      g.moveTo(60, h - 40);
      g.lineTo(60, 30);
      g.stroke();
      g.strokeStyle = CIAN;
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(60, h - 90);
      g.lineTo(380, h - 90);
      g.lineTo(380, 80);
      g.lineTo(w - 40, 80);
      g.stroke();
      g.strokeStyle = '#FFB547';
      g.beginPath();
      g.moveTo(w - 40, 80);
      g.lineTo(260, 80);
      g.lineTo(260, h - 90);
      g.lineTo(60, h - 90);
      g.stroke();
      g.fillStyle = '#E8EAED';
      g.font = '600 30px Inter, Arial';
      g.fillText('campo →', w - 170, h - 20);
      g.fillText('salida', 72, 40);
    },
    [],
  );
  const cam = orbita([0, 2.6, 0], 12, 4, -15 + t * 1.5, 30);
  const bloques = [
    {x: -1.6, nombre: 'placa Hall', color: CIAN, p: ap(t, tPl, 0.5)},
    {x: 0, nombre: 'amplificador', color: '#C88BFF', p: ap(t, tAmp, 0.5)},
    {x: 1.6, nombre: 'comparador', color: '#FFB547', p: ap(t, tCom, 0.5)},
  ];
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        {[-1.2, 0, 1.2].map((x) => (
          <Caja key={x} tam={[0.3, 2.6, 0.12]} pos={[x, 1.3, 0]} material={M.estano()} />
        ))}
        <group position={[0, 3.6 + abre * 0.5, -abre * 1.2]}>
          <Caja tam={[4.6, 2.4, 1.6]} material={new THREE.MeshPhysicalMaterial({color: '#1A1C1F', roughness: 0.3, transparent: true, opacity: 1 - 0.75 * abre})} radio={0.12} />
        </group>
        <Caja tam={[4.6, 0.12, 1.4]} pos={[0, 3.5, 0.9 * abre]} material={M.color('#5B6470', 0.3, 0.6)} />
        {bloques.map((b, i) => (
          <group key={i} position={[b.x, 3.65, 0.9 * abre]}>
            <Caja tam={[1.3, 0.18, 1.0]} material={M.emisivo(b.color, 0.4 + 1.6 * b.p)} radio={0.04} />
          </group>
        ))}
        {t > tCom - 0.3 && t < tLin && (
          <mesh position={[4.9, 4.4, 0.6]} rotation={[0, -0.35, 0]}>
            <planeGeometry args={[4.2, 2.75]} />
            <meshBasicMaterial map={histeresis} toneMapped={false} transparent opacity={ap(t, tCom, 0.5)} />
          </mesh>
        )}
      </Estudio>
      {bloques.map((b, i) => {
        const p = proyectar([b.x, 3.8, 0.9 * abre], cam);
        return <EtiquetaGuia key={i} desde={p} hacia={{x: p.x + (i - 1) * 60, y: p.y + 190}} texto={b.nombre} p={b.p * sal(t, dur, 0.3)} lado={i === 0 ? 'izq' : 'der'} />;
      })}
      <TituloGrande texto="tres patas: alimentación, tierra y salida" p={ap(t, tPat, 0.5) * sal(t, tPl - 0.3, 0.3)} y={96} />
      <TituloGrande texto="histéresis: no tiembla en el límite" p={ap(t, tCom + 1.5, 0.5) * sal(t, tLin - 0.3, 0.3)} y={96} />
      <TituloGrande texto="lineales: un voltaje proporcional al campo" p={ap(t, tLin, 0.5) * sal(t, tDig - 0.3, 0.3)} y={96} />
      <TituloGrande texto="los modernos: digitales, por bus de datos" p={ap(t, tDig, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ motor sin escobillas con tres sensores Hall
export const MotorBLDC3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tM = m('motores', 0.8);
  const tB = m('bobina', 5.0);
  const tD = m('drones', 9.0);
  const ang = t * 1.6;
  const bobinas = 9;
  const imanes = 12;
  const sensores = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const cam = orbita([0, 1.2, 0], 13, 9, -20 + t * 1.5, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Cil r={1.3} h={1.6} pos={[0, 0.8, 0]} mat={M.aceroMate()} />
        {Array.from({length: bobinas}, (_, i) => {
          const a = (i / bobinas) * Math.PI * 2;
          const fase = Math.floor(((ang * imanes) / 2 / Math.PI + i) % 3);
          const activa = t > tB && fase === 0;
          return (
            <group key={i} position={[Math.cos(a) * 2.5, 0.8, Math.sin(a) * 2.5]} rotation={[0, -a, Math.PI / 2]}>
              <Cil r={0.42} h={1.6} mat={activa ? M.emisivo('#FF8A3D', 1.8) : M.cobre()} seg={20} />
            </group>
          );
        })}
        <group rotation={[0, ang, 0]}>
          <Cil r={4.2} h={1.6} pos={[0, 0.8, 0]} mat={M.color('#2B2E33', 0.4, 0.6)} abierto seg={72} />
          {Array.from({length: imanes}, (_, i) => {
            const a = (i / imanes) * Math.PI * 2;
            return <Caja key={i} tam={[0.35, 1.5, 0.95]} pos={[Math.cos(a) * 3.9, 0.8, Math.sin(a) * 3.9]} rot={[0, -a, 0]} material={pintura(i % 2 ? '#C62828' : '#1E4FD8', 0.4)} />;
          })}
        </group>
        {sensores.map((s, i) => {
          const rel = (((ang + s) * imanes) / (2 * Math.PI)) % 2;
          const on = rel < 1;
          return (
            <group key={i} position={[Math.cos(s + 0.35) * 3.35, 1.7, Math.sin(s + 0.35) * 3.35]}>
              <Caja tam={[0.4, 0.3, 0.3]} material={M.plasticoNegro()} />
              <Esf r={0.1} pos={[0, 0.25, 0]} mat={M.emisivo(CIAN, on ? 3 : 0.2)} seg={10} />
            </group>
          );
        })}
      </Estudio>
      <TituloGrande texto="tres sensores Hall leen los imanes del rotor" p={ap(t, tM, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />
      <TituloGrande texto="y encienden la bobina correcta" p={ap(t, tB, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="los de los drones: sin sensores" sub="lo deducen del voltaje del propio motor" p={ap(t, tD, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ velocímetro de bicicleta con un ESP32
const VUELTAS_S = 1.5; // vueltas por segundo de la animación
const CIRC = 2.1; // metros por vuelta (rueda de bicicleta común)
export const Velocimetro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tA = m('a3144', 1.5);
  const tI = m('iman', 4.0);
  const tCinco = m('cinco', 8.0);
  const tVu = m('vuelta', 13.0);
  const tP = m('pulso', 16.5);
  const tInt = m('interrupcion', 20.0);
  const tCir = m('circunferencia', 24.0);
  const tDis = m('distancia', 30.0);
  const gira = ap(t, tI + 1.0, 1.0);
  const ang = gira > 0 ? (t - tI - 1.0) * VUELTAS_S * Math.PI * 2 * gira : 0;
  const magAng = -Math.PI / 2 + ang;
  const cerca = Math.cos(magAng - Math.PI / 2);
  const pulso = cerca > 0.985 && gira > 0.5;
  const vueltas = Math.max(0, Math.floor(((t - tI - 1.0) * VUELTAS_S) + 0.25));
  const kmh = (VUELTAS_S * CIRC * 3.6).toFixed(1).replace('.', ',');
  const cam = camaraEn(
    [
      {t: 0, pos: [0, 6.5, 22], obj: [0, 6.5, 0], fov: 34},
      {t: tCinco - 0.6, d: 1.6, pos: [6, 9.5, 13], obj: [2.5, 9.5, 0], fov: 30},
      {t: tCir - 0.6, d: 1.6, pos: [3, 7, 23], obj: [3, 6.5, 0], fov: 34},
    ],
    t,
  );
  const radios = useMemo(() => Array.from({length: 24}, (_, i) => (i / 24) * Math.PI * 2), []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 6, 0]} niebla={[20, 70]} {...Q}>
        <group position={[0, 6.5, 0]}>
          <group rotation={[0, 0, -ang]}>
            <Toro r={5.8} tubo={0.45} rot={[0, 0, 0]} mat={M.goma('#151617')} />
            <Toro r={5.3} tubo={0.16} rot={[0, 0, 0]} mat={M.color('#B9BEC4', 0.3, 0.9)} />
            {radios.map((a, i) => (
              <mesh key={i} position={[Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0]} rotation={[0, 0, a + Math.PI / 2]} material={M.acero()}>
                <cylinderGeometry args={[0.03, 0.03, 5.2, 6]} />
              </mesh>
            ))}
            <Cil r={0.45} h={1.0} rot={[Math.PI / 2, 0, 0]} mat={M.aceroMate()} />
            <Caja tam={[0.35, 0.5, 0.25]} pos={[Math.cos(-Math.PI / 2) * 4.3, Math.sin(-Math.PI / 2) * 4.3, 0.15]} material={pintura('#C62828', 0.4)} radio={0.04} />
          </group>
          {[-0.55, 0.55].map((z) => (
            <Tubo key={z} puntos={[[0, 0, z], [0.6, 5.5, z * 1.2], [1.0, 8.5, z * 1.4]]} radio={0.18} material={pintura('#1D4ED8', 0.3)} seg={20} />
          ))}
          <group position={[0.35, 4.3, 0.75]}>
            <Caja tam={[0.5, 0.7, 0.3]} material={M.plasticoNegro()} radio={0.05} />
            <Esf r={0.09} pos={[0, 0.45, 0.16]} mat={M.emisivo('#FF3B30', pulso ? 3.5 : 0.3)} seg={10} />
          </group>
          <Tubo puntos={[[0.5, 4.6, 0.8], [1.4, 6.0, 1.2], [3.0, 7.2, 1.0], [4.4, 7.4, 0.8]]} radio={0.05} material={M.color('#2563EB', 0.4)} seg={30} />
          <ESP32 pos={[5.6, 7.3, 0.6]} rotY={0} led={pulso ? 1 : 0} />
        </group>
        <TextoPlano lineas={[{t: `${t > tCir ? kmh : '--,-'} km/h`, tam: 130, color: '#7CFFB2', mono: true}, {t: `vueltas: ${vueltas}`, tam: 70, color: '#C9CDD1', mono: true}]} w={4.4} h={1.8} pos={[9.2, 12.6, 0]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tInt, 0.5)} />
      </Estudio>
      <TituloGrande texto="sensor A3144 + un imán en el rayo" p={ap(t, tA, 0.5) * sal(t, tCinco - 0.3, 0.3)} y={96} />
      <TituloGrande texto="5 V, resistencia de 10 kΩ a 3,3 V" sub="si no reacciona, dale la vuelta al imán" p={ap(t, tCinco, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cada paso del imán: un pulso" p={ap(t, tP, 0.5) * sal(t, tCir - 0.3, 0.3)} y={96} />
      <TituloGrande texto="velocidad = circunferencia ÷ tiempo" sub={`rueda de ${String(CIRC).replace('.', ',')} m a ${String(VUELTAS_S).replace('.', ',')} vueltas por segundo`} p={ap(t, tCir, 0.5) * sal(t, tDis - 0.3, 0.3)} y={96} />
      <TituloGrande texto="sumando vueltas: la distancia" p={ap(t, tDis, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ sensor lineal: un voltaje que sube y baja con el campo
export const SensorLineal3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tL = m('lineal', 0.8);
  const tV = m('voltaje', 4.0);
  const tJ = m('joystick', 8.0);
  const d = 3.2 + 2.0 * Math.sin(t * 1.1);
  const campo = clamp01(1.6 / (d * d));
  const cam = orbita([1.5, 1.6, 0.6], 12, 6, -20 + t * 1.5, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <Protoboard pos={[1.2, 0, 1.0]} />
        <group position={[0, 0.85, 1.0]} scale={0.6}>
          <SensorHall codigo="49E" />
        </group>
        <group position={[-d, 0.85, 1.2]} scale={0.7}>
          <Iman />
        </group>
        {/* voltaje de salida del 49E (alimentado a 5 V: 2,5 V sin imán, sube con el campo) */}
        <group position={[4.6, 0.85, 0.6]}>
          <Caja tam={[0.8, 2.0, 0.8]} pos={[0, 1.0, 0]} material={M.vidrio()} radio={0.08} />
          <Caja tam={[0.6, 0.95 + campo * 0.95, 0.6]} pos={[0, 0.05 + (0.95 + campo * 0.95) / 2, 0]} material={M.emisivo(CIAN, 1.6)} />
          <TextoPlano
            lineas={[{t: 'salida', tam: 90, color: '#C9D1D9', peso: 600}, {t: `${(2.5 + 1.5 * campo).toFixed(1).replace('.', ',')} V`, tam: 130, color: '#7CFFB2', mono: true}]}
            w={2.2}
            h={1.15}
            pos={[1.8, 1.55, 0]}
            estilo={{fondo: '#0B0F14', radio: 40}}
          />
        </group>
      </Estudio>
      <TituloGrande texto="sensor lineal (49E)" sub="la salida sube y baja con el campo" p={ap(t, tL, 0.5) * sal(t, tJ - 0.3, 0.3)} y={96} />
      <TituloGrande texto="joystick casero o pedal analógico" p={ap(t, tJ, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
