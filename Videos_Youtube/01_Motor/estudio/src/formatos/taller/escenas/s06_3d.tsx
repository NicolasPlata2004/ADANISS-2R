// S06 · Giroscopio MEMS — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, Tubo} from '../modelos/Piezas';
import {Cil, Esf, pintura, Toro} from '../modelos/Objetos';
import {Persona} from '../modelos/ObjetosS03';
import {GiroscopioClasico, Huracan, MPU6050} from '../modelos/ObjetosS05';
import {Lavamanos, RobotEquilibrio, Tierra, Trompo} from '../modelos/ObjetosS06';
import {TextoPlano} from '../texto3d';

const Q = {escala: 0.8} as const;
const CIAN = '#7CF0FF';

// ------------------------------------------------------------------ el planeta que gira y el huracán
export const GloboHuracan3D: React.FC<{modo?: 'gancho' | 'coriolis'}> = ({modo = 'gancho'}) => {
  const {t, M: m, dur} = useEscena();
  const tN = m('norte', 4.0);
  const tH = m('huracanes', 9.0);
  const giro = t * 0.25;
  const lat = 0.42;
  const R = 6;
  const cam = orbita([0, 7.6, 1.5], 21, 5.5, 4 + t * 0.6, 32);
  const flechas = useMemo(() => {
    const out: V3[][] = [];
    for (let k = 0; k < 6; k++) {
      const pts: V3[] = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        const r = 2.4 * (1 - u) + 0.35;
        const a = (k / 6) * Math.PI * 2 + u * 1.8;
        pts.push([r * Math.cos(a), 0.25, -r * Math.sin(a)]);
      }
      out.push(pts);
    }
    return out;
  }, []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 6, 0]} niebla={[30, 80]} {...Q}>
        <group position={[0, 0, 0]}>
          <group position={[0, R + 0.2, 0]} rotation={[0.41, 0, 0]}>
            <group rotation={[0, giro, 0]}>
              <group position={[0, -R - 0.2, 0]}>
                <Tierra r={R} giro={0} />
              </group>
              <group rotation={[0, 0, 0]} position={[0, Math.sin(lat) * (R - 0.25), Math.cos(lat) * (R - 0.25)]}>
                <group rotation={[Math.PI / 2 - lat, 0, 0]}>
                  <group scale={0.32}>
                    <Huracan t={t} />
                  </group>
                  {modo === 'coriolis' &&
                    flechas.map((p, i) => <Tubo key={i} puntos={p} radio={0.08} material={M.emisivo('#FFB547', 1.8)} seg={30} progreso={ap(t, tN, 1.5)} />)}
                </group>
              </group>
            </group>
          </group>
        </group>
      </Estudio>
      {modo === 'gancho' && <TituloGrande texto="los huracanes giran por la fuerza de Coriolis" p={ap(t, 0.4, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'coriolis' && <TituloGrande texto="el aire que va hacia la baja presión se desvía de lado" p={ap(t, 0.4, 0.5) * sal(t, tN - 0.3, 0.3)} y={96} />}
      {modo === 'coriolis' && <TituloGrande texto="hemisferio norte: contra las agujas del reloj" sub="hemisferio sur: a favor" p={ap(t, tN, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el mito del lavamanos
export const Lavamanos3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tF = m('forma', 3.0);
  const cam = orbita([0, 3.5, 0], 17, 7, -15 + t * 1.0, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, 0]} {...Q}>
        <group position={[-4.2, 0, 0]}>
          <Lavamanos t={t} sentido={1} />
        </group>
        <group position={[4.2, 0, 0]}>
          <Lavamanos t={t} sentido={-1} />
        </group>
      </Estudio>
      <TituloGrande texto="mito: en tu lavamanos, Coriolis no decide" sub="manda la forma del recipiente y cómo lo llenaste" p={ap(t, 0.3, 0.5) * sal(t, dur, 0.3)} y={96} />
      <Dato x={560} y={760} valor="↺" sub="puede girar así" p={ap(t, tF, 0.5) * sal(t, dur, 0.3)} />
      <Dato x={1360} y={760} valor="↻" sub="o así, en cualquier hemisferio" p={ap(t, tF + 0.3, 0.5) * sal(t, dur, 0.3)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el giroscopio clásico: trompo y rueda en aros
export const ClasicoGiro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('trompo', 2.0);
  const tA = m('aros', 7.0);
  const tF = m('foucault', 12.0);
  const tB = m('barcos', 20.0);
  const base = ap(t, tA, 1.0) * t * 0.8;
  const cam = orbita([0, 2.6, 0], 17, 4.5, -15 + t * 1.0, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <group position={[-4.5, 0, 0]}>
          <Trompo t={t} />
        </group>
        <group position={[4.5, 0, 0]}>
          <Cil r={2.2} h={0.25} pos={[0, 0.12, 0]} mat={M.color('#2B2E33', 0.4)} />
          <group rotation={[0, base, 0]}>
            <group rotation={[0, -base, 0]}>
              <GiroscopioClasico t={t} />
            </group>
            <Caja tam={[0.3, 0.3, 4.4]} pos={[0, 0.3, 0]} material={M.laton()} />
          </group>
        </group>
      </Estudio>
      <TituloGrande texto="un trompo: en vez de caer, su eje da vueltas" p={ap(t, tT, 0.5) * sal(t, tA - 0.3, 0.3)} y={96} />
      <TituloGrande texto="en aros libres, el eje no cambia de dirección" sub="momento angular" p={ap(t, tA, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="Foucault, 1852: “observar el giro”" p={ap(t, tF, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />
      <TituloGrande texto="guiaron barcos, aviones y misiles" p={ap(t, tB, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el carrusel: la pelota recta desde afuera, curva desde adentro
const OMEGA = 0.9; // rad/s del carrusel
export const Carrusel3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tL = m('lanzas', 3.0);
  const tA = m('afuera', 6.0);
  const tP = m('para', 9.0);
  const tC = m('coriolis', 14.0);
  const tM = m('mueve', 18.0);
  const dentro = t > tP - 0.3;
  const v = 3.2;
  const lanzar = (tt: number) => (tt > tL ? tL + ((tt - tL) % 3.2) : tL);
  const tau = Math.max(0, lanzar(t) - tL);
  const ang = dentro ? 0 : t * OMEGA;
  const t0Lanz = t - tau;
  const estela: V3[] = [];
  for (let i = 0; i <= 24; i++) {
    const s = (tau * i) / 24;
    const p = new THREE.Vector3(v * s, 0.9, 0);
    if (dentro) p.applyAxisAngle(new THREE.Vector3(0, 1, 0), -OMEGA * s);
    else p.applyAxisAngle(new THREE.Vector3(0, 1, 0), OMEGA * (t0Lanz));
    estela.push([p.x, p.y, p.z]);
  }
  const amigoAng = ang;
  const cam: Camara = {pos: [0, 19, 9], obj: [0, 0, 0.5], fov: 38};
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group rotation={[0, ang, 0]}>
          <Cil r={6.3} h={0.4} pos={[0, 0.2, 0]} mat={M.color('#8E5A3C', 0.6)} seg={72} />
          {Array.from({length: 8}, (_, i) => (
            <Caja key={i} tam={[6.2, 0.05, 0.12]} pos={[Math.cos((i * Math.PI) / 4) * 3.1, 0.43, -Math.sin((i * Math.PI) / 4) * 3.1]} rot={[0, (i * Math.PI) / 4, 0]} material={M.color('#F2C230', 0.5)} />
          ))}
          <group position={[0, 0.4, 0]} scale={0.35}>
            <Persona />
          </group>
        </group>
        <group rotation={[0, amigoAng, 0]}>
          <group position={[5.6, 0.4, 0]} scale={0.35}>
            <Persona />
          </group>
        </group>
        {t > tL && tau > 0.02 && (
          <>
            <Tubo puntos={estela} radio={0.07} material={M.emisivo(dentro ? '#FFB547' : CIAN, 1.8)} seg={40} />
            <Esf r={0.28} pos={estela[24]} mat={pintura('#E5484D', 0.3)} />
          </>
        )}
      </Estudio>
      <TituloGrande texto="desde afuera: la pelota va recta" p={ap(t, tA, 0.5) * sal(t, tP - 0.4, 0.3)} y={96} />
      <TituloGrande texto="para ti, que giras: se curva" p={ap(t, tP, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la fuerza de Coriolis (aparente)" p={ap(t, tC, 0.5) * sal(t, tM - 0.3, 0.3)} y={96} />
      <TituloGrande texto="empuja de lado; crece con el giro y con la velocidad" p={ap(t, tM, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el giroscopio MEMS: masa que vibra y empujón lateral
export const GiroMEMS3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tV = m('vibrar', 3.0);
  const tNo = m('nogira', 8.0);
  const tG = m('giras', 12.0);
  const tE = m('empujon', 17.0);
  const tD = m('dedos', 21.0);
  const tGr = m('grados', 27.0);
  const tT = m('tres', 31.0);
  const w = 7;
  const vibra = ap(t, tV, 0.6);
  const giro = ap(t, tG, 1.0) * (t < tT ? 1 : 0.5);
  const xd = vibra * 0.6 * Math.sin(w * t);
  const zs = giro * 0.35 * Math.cos(w * t);
  const plataforma = giro * t * 0.6;
  const si = M.color('#9AA3AD', 0.28, 0.85);
  const fijo = M.color('#6B7480', 0.35, 0.85);
  const cam = orbita([0, 1.2, 0], 15, 10, -20 + t * 0.8, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group rotation={[0, plataforma, 0]}>
          <Caja tam={[13, 0.3, 11]} pos={[0, 0.15, 0]} material={M.color('#2A2F36', 0.6, 0.3)} />
          <group position={[xd, 1.0, zs]}>
            <Caja tam={[4.4, 0.35, 3.2]} material={si} />
            {Array.from({length: 12}, (_, i) => (
              <Caja key={i} tam={[0.3, 0.37, 0.3]} pos={[-1.6 + (i % 4) * 1.06, 0, -0.9 + Math.floor(i / 4) * 0.9]} material={M.color('#1E2329', 0.6)} />
            ))}
            {[-1, 1].map((s) =>
              Array.from({length: 6}, (_, i) => <Caja key={`${s}${i}`} tam={[0.13, 0.28, 1.0]} pos={[-1.6 + i * 0.64, 0, s * 2.1]} material={si} />),
            )}
          </group>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Caja tam={[5.0, 0.35, 0.5]} pos={[0, 1.0, s * 3.4]} material={fijo} />
              {Array.from({length: 6}, (_, i) => (
                <group key={i}>
                  <Caja tam={[0.13, 0.28, 0.9]} pos={[-1.3 + i * 0.64, 1.0, s * 2.75]} material={fijo} />
                  <mesh position={[-1.45 + i * 0.64, 1.25, s * 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.2, 0.7]} />
                    <meshBasicMaterial color={CIAN} transparent opacity={clamp01((s > 0 ? zs : -zs) * 3)} toneMapped={false} />
                  </mesh>
                </group>
              ))}
            </group>
          ))}
          {[-1, 1].map((s) => (
            <group key={`d${s}`}>
              <Caja tam={[0.5, 0.35, 3.0]} pos={[s * 4.0, 1.0, 0]} material={fijo} />
              <Tubo puntos={[[s * 2.2, 1.0, -1.2], [s * 3.0, 1.0, -0.4], [s * 2.4, 1.0, 0.4], [s * 3.2, 1.0, 1.2]]} radio={0.06} material={si} seg={20} />
            </group>
          ))}
        </group>
      </Estudio>
      <TituloGrande texto="una masa que vibra sin parar" sub="miles de veces por segundo · aquí en cámara lenta" p={ap(t, tV, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="al girar: un empujón de lado" sub="al mismo ritmo de la vibración" p={ap(t, tG, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="dedos-condensador miden el empujón" p={ap(t, tD, 0.5) * sal(t, tGr - 0.3, 0.3)} y={96} />
      <TituloGrande texto="más giro, más empujón: grados por segundo" p={ap(t, tGr, 0.5) * sal(t, tT - 0.3, 0.3)} y={96} />
      <TituloGrande texto="tres ejes: cabeceo, giro y ladeo" p={ap(t, tT, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ la deriva: sumar giros acumula errores
export const Deriva3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tS = m('sumar', 4.0);
  const tG = m('grado', 9.0);
  const tD = m('deriva', 15.0);
  const tC = m('combinar', 18.0);
  const tF = m('fusion', 30.0);
  const tCo = m('complementario', 34.0);
  const reloj = clamp01((t - tG) / Math.max(4, tD - tG + 2)) * 60;
  const corr = ap(t, tC + 2, 4.0, easeInOut);
  const angEst = ((reloj * Math.PI) / 180) * (1 - corr);
  const cam = orbita([0, 1.8, 0], 15, 9, -15 + t * 0.8, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Cil r={5} h={0.3} pos={[0, 0.15, 0]} mat={M.color('#1B1F24', 0.5)} seg={72} />
        {Array.from({length: 36}, (_, i) => (
          <Caja key={i} tam={[0.08, 0.05, i % 3 === 0 ? 0.6 : 0.3]} pos={[Math.sin((i * Math.PI) / 18) * 4.5, 0.33, -Math.cos((i * Math.PI) / 18) * 4.5]} rot={[0, -(i * Math.PI) / 18, 0]} material={M.color('#9AA3AD', 0.4)} />
        ))}
        <group rotation={[0, 0, 0]}>
          <Tubo puntos={[[0, 0.5, 0], [0, 0.5, -3.8]]} radio={0.12} material={M.emisivo(CIAN, 1.6)} seg={4} />
        </group>
        <group rotation={[0, -angEst, 0]}>
          <Tubo puntos={[[0, 0.6, 0], [0, 0.6, -3.6]]} radio={0.12} material={M.emisivo('#FF8A3D', 1.6)} seg={4} />
        </group>
        {t > tC && (
          <group position={[6.6, 0, 1]} scale={1.6}>
            <MPU6050 />
          </group>
        )}
        <TextoPlano lineas={[{t: `t = ${Math.round(reloj)} s`, tam: 110, color: '#E8EAED', mono: true}, {t: `error: ${Math.round(reloj * (1 - corr))}°`, tam: 110, color: '#FF8A3D', mono: true}]} w={4.2} h={1.6} pos={[7.2, 2.4, -1.5]} rot={[0, -0.5, 0]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tG, 0.5)} />
      </Estudio>
      <TituloGrande texto="el giroscopio mide velocidad de giro, no el ángulo" p={ap(t, 0.3, 0.5) * sal(t, tS - 0.3, 0.3)} y={96} />
      <TituloGrande texto="para el ángulo hay que ir sumando" p={ap(t, tS, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="1 °/s de más: en un minuto, 60° falsos" p={ap(t, tG, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la deriva" p={ap(t, tD, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el acelerómetro corrige poco a poco" p={ap(t, tC, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="fusión de sensores: filtro complementario" p={ap(t, tF, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: robot que se equilibra
export const RobotEquilibrio3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tV = m('velocidades', 3.0);
  const tMe = m('mezclas', 9.0);
  const tL = m('linea', 14.0);
  const tH = m('horizontal', 17.0);
  const tR = m('robot', 22.0);
  const tP = m('pid', 26.0);
  const fase = t > tR ? (t - tR) % 4 : 0;
  const inclina = t > tR ? 0.22 * Math.exp(-fase * 1.2) * Math.cos(fase * 4.5) : 0.04 * Math.sin(t * 2);
  const xRuedas = t > tR ? -0.6 * Math.exp(-fase * 1.2) * Math.sin(fase * 4.5) : 0;
  const cam = orbita([-1.5, 4.2, 0], 19, 3.8, -18 + t * 0.6, 34);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <group position={[xRuedas, 0, 0]}>
          <RobotEquilibrio inclina={inclina} />
        </group>
        <TextoPlano
          lineas={[{t: 'ángulo = 0,98 · (ángulo + giro·dt)', tam: 76, color: '#E8EAED', mono: true}, {t: '       + 0,02 · ángulo_acelerómetro', tam: 76, color: '#7CFFB2', mono: true}]}
          w={9.4}
          h={1.7}
          pos={[-6.0, 7.4, -3.0]}
          rot={[0, 0.35, 0]}
          estilo={{fondo: '#0B0F14', radio: 40, alinear: 'left'}}
          op={ap(t, tMe, 0.5)}
        />
      </Estudio>
      <TituloGrande texto="tres velocidades de giro por lectura" p={ap(t, tV, 0.5) * sal(t, tMe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="una línea elimina la deriva de la inclinación" p={ap(t, tL, 0.5) * sal(t, tH - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el rumbo necesita un magnetómetro" p={ap(t, tH, 0.5) * sal(t, tR - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un PID mueve las ruedas hacia donde cae" p={ap(t, tP, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
