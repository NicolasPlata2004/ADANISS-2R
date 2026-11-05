// S09 · Sensores de temperatura — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Protoboard, ResistenciaAxial, Tubo} from '../modelos/Piezas';
import {Cil, Esf, pintura, Toro} from '../modelos/Objetos';
import {Dedo} from '../modelos/ObjetosS02';
import {matTermico, Persona} from '../modelos/ObjetosS03';
import {MesasMetalMadera} from '../modelos/ObjetosS08';
import {DS18B20, EstufaGas, Termistor, Termopar, TorreEiffel} from '../modelos/ObjetosS09';
import {TextoPlano} from '../texto3d';

const Q = {escala: 0.8} as const;

// ------------------------------------------------------------------ gancho: metal y madera a la misma temperatura
export const MesasGancho3D: React.FC<{final?: boolean; explica?: boolean}> = ({final = false, explica = false}) => {
  const {t, M: m, dur} = useEscena();
  const tMe = m('metal', 0.8);
  const tFr = m('frio', 4.0);
  const tMi = m('misma', 7.0);
  const tPi = m('piel', 10.0);
  const tRo = m('roba', 15.0);
  const tSe = m('sensores', 22.0);
  const toca = ap(t, tMe - 0.6, 1.0, easeInOut);
  const tTemps = m('temps', 2.0);
  const tCond = m('conduce', 7.0);
  const tMad = m('madera', 14.0);
  const term = explica ? (t > tTemps - 0.4 && t < tCond - 0.4 ? 1 : 0) : t > tMi - 0.4 && t < tSe - 0.5 ? 1 : 0;
  const flujo = ap(t, explica ? tCond - 0.5 : tRo - 0.5, 1.0);
  const cam: Camara = orbita([0, 2.8, 0], 15, 4, -15 + t * 0.8, 32);
  const flechas = useMemo(() => Array.from({length: 8}, (_, i) => i), []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        {term ? (
          <group>
            <Caja tam={[3.6, 0.25, 2.6]} pos={[-2.2, 2.6, 0]} material={matTermico(0.42)} />
            <Caja tam={[3.6, 0.35, 2.6]} pos={[2.2, 2.6, 0]} material={matTermico(0.42)} />
            {[[-2.2, 1.25], [2.2, 1.25]].map(([x], i) => (
              <Caja key={i} tam={[3.2, 2.5, 0.2]} pos={[x, 1.25, 0]} material={matTermico(0.4)} />
            ))}
          </group>
        ) : (
          <MesasMetalMadera />
        )}
        {[-2.2, 2.2].map((x, i) => (
          <group key={i} position={[x - 0.4, 2.75, 0.5]} rotation={[0, 0, 0.2]}>
            <Dedo alto={(1 - toca) * 3} />
          </group>
        ))}
        {flujo > 0.01 &&
          flechas.map((k) => {
            const q = ((t * 1.2 + k * 0.12) % 1);
            return <Esf key={k} r={0.08} pos={[-2.6 + Math.sin(k) * 0.3, 2.9 - q * 0.6, 0.5 + Math.cos(k) * 0.3]} mat={M.emisivo('#FF8A3D', 2.5 * flujo)} seg={8} />;
          })}
        {flujo > 0.01 && <Esf r={0.08} pos={[1.8, 2.9 - ((t * 0.3) % 1) * 0.3, 0.5]} mat={M.emisivo('#FF8A3D', 1.5 * flujo)} seg={8} />}
      </Estudio>
      {explica && <TituloGrande texto="tu piel: ~33 °C · las mesas: ~22 °C" p={ap(t, tTemps, 0.4) * sal(t, tCond - 0.3, 0.3)} y={96} />}
      {explica && <TituloGrande texto="el metal conduce cientos de veces mejor" p={ap(t, tCond, 0.4) * sal(t, tMad - 0.3, 0.3)} y={96} />}
      {explica && <TituloGrande texto="la madera se calienta donde la tocas" p={ap(t, tMad, 0.4) * sal(t, tPi - 0.3, 0.3)} y={96} />}
      {explica && <TituloGrande texto="tu piel siente qué tan rápido se enfría" p={ap(t, tPi, 0.4) * sal(t, dur, 0.3)} y={96} />}
      {!final && !explica && <TituloGrande texto="el metal se siente más frío" p={ap(t, tFr, 0.4) * sal(t, tMi - 0.4, 0.3)} y={96} />}
      {!final && !explica && <TituloGrande texto="pero están a la misma temperatura" sub="vista térmica" p={ap(t, tMi, 0.4) * sal(t, tPi - 0.3, 0.3)} y={96} />}
      {!final && !explica && <TituloGrande texto="tu piel siente qué tan rápido se enfría" p={ap(t, tPi, 0.4) * sal(t, tRo - 0.3, 0.3)} y={96} />}
      {!final && !explica && <TituloGrande texto="el metal le roba calor más rápido" p={ap(t, tRo, 0.4) * sal(t, tSe - 0.4, 0.3)} y={96} />}
      {final && <TituloGrande texto="no está más fría: solo te roba calor más rápido" p={ap(t, 1.0, 0.4) * sal(t, dur, 0.3)} y={96} />}
      <Dato x={590} y={300} valor="metal" sub="cientos de veces mejor conductor" p={ap(t, tRo, 0.4) * sal(t, tSe - 0.4, 0.3) * (final || explica ? 0 : 1)} />
      <Dato x={1330} y={300} valor="madera" sub="se calienta donde la tocas" p={ap(t, tRo + 0.3, 0.4) * sal(t, tSe - 0.4, 0.3) * (final || explica ? 0 : 1)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ temperatura = agitación; calor = energía que pasa
export const Agitacion3D: React.FC<{termometro?: boolean}> = ({termometro = false}) => {
  const {t, M: m, dur} = useEscena();
  const tA = m('agitados', 2.0);
  const tC = m('calor', 6.0);
  const tP = m('propia', 22.0);
  const tE = m('equilibrio', 26.0);
  const cuenta = 60;
  const atomos = useMemo(() => Array.from({length: cuenta}, (_, i) => [((i % 10) - 4.5) * 0.55, Math.floor(i / 10) * 0.55, 0] as V3), []);
  const transferencia = ap(t, tC + 1, 6.0);
  const termo = ap(t, tE, 6.0);
  const cam: Camara = orbita([0, 1.8, 0], 14, 3.5, -10 + t * 0.6, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {[-1, 1].map((lado) => {
          const caliente = lado < 0;
          const amp = caliente ? mix(0.16, 0.09, transferencia) : mix(0.03, 0.09, transferencia);
          return (
            <group key={lado} position={[lado * 3.4, 0.6, 0]}>
              {atomos.map((p, i) => (
                <Esf key={i} r={0.17} pos={[p[0] * 0.55 + Math.sin(t * 23 + i * 1.7) * amp, p[1] + Math.cos(t * 19 + i * 2.3) * amp, p[2] + Math.sin(t * 17 + i) * amp]} mat={caliente ? M.emisivo(transferencia < 0.5 ? '#FF6A2A' : '#FFB547', 1.6) : M.emisivo(transferencia < 0.5 ? '#4F8DFF' : '#FFB547', 1.6)} seg={8} />
              ))}
            </group>
          );
        })}
        {t > tC &&
          Array.from({length: 6}, (_, k) => {
            const q = ((t * 0.8 + k / 6) % 1);
            return <Esf key={k} r={0.1} pos={[-1.6 + q * 3.2, 1.5 + Math.sin(k) * 0.6, 0]} mat={M.emisivo('#FF8A3D', 2.5 * (1 - transferencia))} seg={8} />;
          })}
        {t > tP - 0.5 && (
          <group position={[0, 0, 2.8]}>
            <Cil r={0.15} h={3.6} pos={[0, 1.8, 0]} mat={M.vidrio()} />
            <Esf r={0.3} pos={[0, 0.2, 0]} mat={M.emisivo('#E5484D', 1.2)} seg={14} />
            <Cil r={0.08} h={0.4 + 2.6 * termo} pos={[0, 0.4 + (0.4 + 2.6 * termo) / 2, 0]} mat={M.emisivo('#E5484D', 1.2)} />
          </group>
        )}
      </Estudio>
      {!termometro && <TituloGrande texto="temperatura: qué tan agitados están los átomos" p={ap(t, tA, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />}
      {!termometro && <TituloGrande texto="calor: la energía que pasa de lo caliente a lo frío" p={ap(t, tC, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />}
      <TituloGrande texto="un termómetro solo mide su propia temperatura" p={ap(t, tP, 0.5) * sal(t, tE - 0.3, 0.3)} y={96} />
      <TituloGrande texto="hay que darle tiempo para que llegue al equilibrio" p={ap(t, tE, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el bimetal que se dobla
// Disco de cierre rápido: casquete esférico con el borde en y = 0 (radio del borde ≈ 1 y flecha ≈ 0,19).
const R_DISCO = 2.6;
const ANG_DISCO = 0.38;
const H_DISCO = R_DISCO * (1 - Math.cos(ANG_DISCO));
const Y_DISCO = 1.3;
const Y_LAMINA = 2.7;
const X_PIVOTE = -2.6;

export const Bimetal3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('dilatan', 1.0);
  const tE = m('eiffel', 3.0);
  const tB = m('bimetal', 8.0);
  const tP = m('pegas', tB - 4.0);
  const tH = m('hervidores', 13.0);
  const tC = m('clic', 17.0);
  // la lámina se calienta cuando la voz dice «si pegas dos láminas… y las calientas»
  const calor = ap(t, tP + 0.8, 3.0, easeInOut);
  // fase Eiffel: la torre crece en verano (exagerado: en la realidad, hasta ~15 cm en 330 m)
  const eiffel = t > tE - 0.3 && t < tP - 0.3;
  const verano = 0.5 - 0.5 * Math.cos(Math.max(0, t - tE - 0.6) * 1.1);
  // Curvatura exagerada para que se vea; el latón (abajo) queda en el lado convexo porque se estira más.
  const curv = calor * 0.13;
  const geo = useMemo(() => new THREE.BoxGeometry(8, 0.18, 1.4, 60, 1, 1), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const deformar = (g: THREE.BoxGeometry, desfase: number) => {
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3] + 4;
      pos.setY(i, base[i * 3 + 1] + desfase + curv * x * x * 0.35);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
  };
  const g1 = useMemo(() => geo.clone(), [geo]);
  const g2 = useMemo(() => geo.clone(), [geo]);
  deformar(g1, 0.1);
  deformar(g2, -0.1);
  const geoDisco = useMemo(() => {
    const g = new THREE.SphereGeometry(R_DISCO, 48, 10, 0, Math.PI * 2, 0, ANG_DISCO);
    g.translate(0, -R_DISCO * Math.cos(ANG_DISCO), 0);
    return g;
  }, []);
  // El vapor calienta el disco; al llegar a su temperatura se voltea en ~0,1 s y empuja la varilla.
  const vapor = ap(t, tH + 0.8, 1.2);
  const vuelta = ap(t, tC, 0.12, easeInOut);
  const s = -1 + 2 * vuelta;
  const centro = Y_DISCO + H_DISCO * s;
  const sube = centro - (Y_DISCO - H_DISCO);
  const angLamina = Math.atan(sube / -X_PIVOTE);
  const cerrado = vuelta < 0.5;
  const chispa = t > tC && t < tC + 0.3 ? 1 - (t - tC) / 0.3 : 0;
  const cam: Camara = eiffel
    ? orbita([0, 3.3, 0], 17, 2.6, -12 + (t - tE) * 1.5, 30)
    : t < tH
      ? orbita([0, 2.4, 0], 14, 3.5, -10 + t * 0.8, 32)
      : orbita([0.6, 2.2, 0], 11.5, 1.8, 8 + (t - tH) * 0.8, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {eiffel ? (
          <group>
            <group scale={[0.75, 0.75 * (1 + 0.06 * verano), 0.75]}>
              <TorreEiffel />
            </group>
            <TextoPlano
              lineas={[
                {t: verano > 0.5 ? 'verano' : 'invierno', tam: 150, color: verano > 0.5 ? '#FFB547' : '#7CF0FF'},
                {t: 'en verano, hasta ~15 cm más alta', tam: 90, color: '#E8EAED', peso: 600},
                {t: '(aquí, exagerado)', tam: 80, color: '#9AA3AD', peso: 600},
              ]}
              w={4.6}
              h={2.0}
              pos={[4.4, 2.2, 0.5]}
              estilo={{fondo: '#0B0F14', radio: 40}}
            />
          </group>
        ) : t < tH ? (
          <group position={[-3, 1.4, 0]}>
            <Caja tam={[0.8, 2.8, 2.0]} pos={[-0.4, -0.2, 0]} material={M.color('#2B2E33', 0.4)} />
            <mesh geometry={g1} position={[4, 0, 0]} material={M.color('#9AA3AD', 0.3, 1)} castShadow />
            <mesh geometry={g2} position={[4, 0, 0]} material={M.color('#C99A45', 0.3, 1)} castShadow />
            <Cil r={0.35} h={0.3} pos={[4, -1.25, 0]} mat={M.aceroMate()} />
            {calor > 0.02 && (
              <mesh position={[4, -0.55, 0]}>
                <coneGeometry args={[0.32, 1.1 + 0.15 * Math.sin(t * 20), 16]} />
                <meshBasicMaterial color="#5AA9FF" transparent opacity={0.8} toneMapped={false} />
              </mesh>
            )}
            <TextoPlano lineas={[{t: 'acero', tam: 150, color: '#C9D1D9'}]} w={1.6} h={0.5} pos={[1.2, 0.75, 0.8]} op={ap(t, tB + 0.6, 0.5)} />
            <TextoPlano lineas={[{t: 'latón', tam: 150, color: '#F2C27A'}]} w={1.6} h={0.5} pos={[1.2, -0.75, 0.8]} op={ap(t, tB + 0.6, 0.5)} />
          </group>
        ) : (
          <group>
            {/* tubo por donde llega el vapor del agua hirviendo */}
            <Cil r={0.45} h={0.85} pos={[0, 0.425, 0]} mat={M.aceroMate()} seg={32} />
            {vapor > 0.01 &&
              Array.from({length: 9}, (_, i) => {
                const f = (t * 0.8 + i / 9) % 1;
                return (
                  <mesh key={i} position={[Math.sin(i * 2.3 + t) * 0.25, 0.85 + f * 0.75, Math.cos(i * 1.7) * 0.2]}>
                    <sphereGeometry args={[0.16 + 0.08 * (i % 3), 12, 8]} />
                    <meshBasicMaterial color="#E8EEF2" transparent opacity={0.3 * vapor * (1 - f)} depthWrite={false} />
                  </mesh>
                );
              })}
            {/* aro que sostiene el disco */}
            <Toro r={R_DISCO * Math.sin(ANG_DISCO) + 0.05} tubo={0.09} pos={[0, Y_DISCO, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.plasticoNegro()} />
            <mesh geometry={geoDisco} position={[0, Y_DISCO, 0]} scale={[1, s, 1]} castShadow>
              <meshStandardMaterial color="#C4C9CF" metalness={0.9} roughness={0.22} side={THREE.DoubleSide} emissive="#FF6A2A" emissiveIntensity={0.12 * vapor} />
            </mesh>
            {/* varilla que empuja el contacto */}
            <Cil r={0.08} h={Y_LAMINA - (Y_DISCO - H_DISCO)} pos={[0, centro + (Y_LAMINA - (Y_DISCO - H_DISCO)) / 2, 0]} mat={M.plasticoBlanco()} />
            {/* contactos: lámina con pivote a la izquierda, contacto fijo a la derecha */}
            <Caja tam={[0.4, Y_LAMINA, 0.7]} pos={[X_PIVOTE, Y_LAMINA / 2, 0]} material={M.plasticoNegro()} />
            <Cil r={0.12} h={0.85} pos={[X_PIVOTE, Y_LAMINA, 0]} rot={[Math.PI / 2, 0, 0]} mat={M.acero()} />
            <group position={[X_PIVOTE, Y_LAMINA, 0]} rotation={[0, 0, angLamina]}>
              <Caja tam={[5.4, 0.08, 0.7]} pos={[2.7, 0.04, 0]} material={M.cobre()} />
              <Cil r={0.16} h={0.1} pos={[5.0, -0.05, 0]} mat={M.plata()} />
            </group>
            <Caja tam={[0.4, Y_LAMINA - 0.2, 0.7]} pos={[2.4, (Y_LAMINA - 0.2) / 2, 0]} material={M.plasticoNegro()} />
            <Cil r={0.16} h={0.1} pos={[2.4, Y_LAMINA - 0.15, 0]} mat={M.plata()} />
            {chispa > 0 && <Esf r={0.32 * chispa} pos={[2.4, Y_LAMINA - 0.05, 0]} mat={M.emisivo('#FFB547', 3)} seg={12} />}
            <TextoPlano
              lineas={[{t: 'corriente', tam: 120, color: '#9AA3AD'}, {t: cerrado ? 'pasa' : 'cortada', tam: 180, color: cerrado ? '#7CFFB2' : '#FF5A4E'}]}
              w={1.9}
              h={0.78}
              pos={[3.8, 1.15, 0.9]}
              estilo={{fondo: '#0B0F14', radio: 40}}
            />
            {t > tC && t < tC + 0.6 && <TextoPlano lineas={[{t: '¡clic!', tam: 200, color: '#FFB547'}]} w={2.0} h={0.85} pos={[-1.4, 2.0, 0.6]} />}
          </group>
        )}
      </Estudio>
      <TituloGrande texto="los metales se dilatan con el calor" p={ap(t, tD, 0.5) * sal(t, tE - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la torre Eiffel es varios cm más alta en verano" p={ap(t, tE, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="dos láminas pegadas que se estiran distinto" p={ap(t, tP, 0.5) * sal(t, tB - 0.3, 0.3)} y={96} />
      <TituloGrande texto="bimetal: dos metales que se estiran distinto" sub="el latón se estira más: la lámina se curva hacia el acero" p={ap(t, tB, 0.5) * sal(t, tH - 0.3, 0.3)} y={96} />
      <TituloGrande texto="el disco del hervidor se voltea de golpe" sub="es sensor e interruptor a la vez" p={ap(t, tC, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ termistor, Pt100 y termopar
export const ResistenciaTemp3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('termistor', 1.0);
  const tB = m('baja', 4.0);
  const tD = m('diez', 8.0);
  const tPt = m('platino', 14.0);
  const tTp = m('termopar', 22.0);
  const tSe = m('seebeck', 24.0);
  const tMi = m('mil', 33.0);
  const tDi = m('diferencia', 40.0);
  const fase = t < tPt - 0.4 ? 0 : t < tTp - 0.4 ? 1 : 2;
  const calor = fase === 0 ? 0.5 + 0.5 * Math.sin(t * 0.9) : 0.6 + 0.4 * Math.sin(t * 0.7);
  const tempC = 25 + calor * 20;
  const R = 10000 * Math.exp(3950 * (1 / (tempC + 273.15) - 1 / 298.15));
  const pt = 100 * (1 + 0.00385 * (tempC + 0));
  const tCaliente = 25 + calor * 400;
  const mV = 0.041 * (tCaliente - 25);
  const angCam = -10 + t * 0.8;
  const cam: Camara = orbita([0, 2.2, 0], 12, 3, angCam, 32);
  const brujula = ap(t, tSe, 0.6);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {fase === 0 && (
          <>
            <Termistor calor={calor} />
            <mesh position={[0, 3.2, 0]}>
              <sphereGeometry args={[1.0, 24, 16]} />
              <meshBasicMaterial color="#FF6A2A" transparent opacity={0.12 * calor} toneMapped={false} depthWrite={false} />
            </mesh>
            <TextoPlano lineas={[{t: `${tempC.toFixed(0)} °C`, tam: 120, color: '#FFB547', mono: true}, {t: `${(R / 1000).toFixed(1).replace('.', ',')} kΩ`, tam: 130, color: '#7CFFB2', mono: true}]} w={3.2} h={1.6} pos={[3.8, 3.2, -1]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tB, 0.5)} />
          </>
        )}
        {fase === 1 && (
          <>
            <group position={[-2, 0, 0]}>
              <Cil r={0.18} h={5.0} pos={[2.5, 1.0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
              <Cil r={0.55} h={1.0} pos={[-0.4, 1.0, 0]} rot={[0, 0, Math.PI / 2]} mat={M.color('#2B2E33', 0.4, 0.4)} />
            </group>
            <TextoPlano lineas={[{t: 'Pt100', tam: 140, color: '#E8EAED'}, {t: `${pt.toFixed(1).replace('.', ',')} Ω`, tam: 130, color: '#7CFFB2', mono: true}]} w={3.4} h={1.7} pos={[0, 3.6, -1]} estilo={{fondo: '#0B0F14', radio: 40}} />
          </>
        )}
        {fase === 2 && (
          <>
            <Termopar calor={calor} />
            <mesh position={[0, 0.4, 0]}>
              <coneGeometry args={[0.35, 1.0 + 0.15 * Math.sin(t * 20), 16]} />
              <meshBasicMaterial color="#5AA9FF" transparent opacity={0.8} toneMapped={false} />
            </mesh>
            {brujula > 0.01 && (
              <group position={[0, 0.2, 2.6]} rotation={[0, Math.sin(t * 2) * 0.4 * brujula, 0]}>
                <Cil r={0.9} h={0.2} mat={M.laton()} seg={40} />
                <Caja tam={[0.12, 0.05, 1.4]} pos={[0, 0.13, 0]} material={pintura('#C62828', 0.35)} />
              </group>
            )}
            <TextoPlano lineas={[{t: `${tCaliente.toFixed(0)} °C → ${mV.toFixed(1).replace('.', ',')} mV`, tam: 96, color: '#7CFFB2', mono: true}]} w={5.0} h={0.8} pos={[0, 3.6, -2.5]} rot={[0, (angCam * Math.PI) / 180, 0]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tMi, 0.5)} />
          </>
        )}
      </Estudio>
      <TituloGrande texto="termistor: se calienta y su resistencia baja" p={ap(t, tT, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="10 kΩ a 25 °C… menos de la mitad a 45 °C" p={ap(t, tD, 0.5) * sal(t, tPt - 0.6, 0.3)} y={96} />
      <TituloGrande texto="Pt100: 100 Ω a 0 °C, +0,39 Ω por grado" p={ap(t, tPt, 0.5) * sal(t, tTp - 0.6, 0.3)} y={96} />
      <TituloGrande texto="termopar: dos metales distintos, un voltaje" sub="Seebeck, 1821" p={ap(t, tTp, 0.5) * sal(t, tMi - 0.3, 0.3)} y={96} />
      <TituloGrande texto="~40 µV por grado y más de 1.000 °C" p={ap(t, tMi, 0.5) * sal(t, tDi - 0.3, 0.3)} y={96} />
      <TituloGrande texto="mide la diferencia entre sus extremos" p={ap(t, tDi, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ medir sin tocar: brillo infrarrojo y emisividad
export const SinTocar3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tB = m('brilla', 2.0);
  const tTp = m('termopila', 5.0);
  const tTr = m('trampa', 12.0);
  const tO = m('olla', 18.0);
  const fase2 = t > tTr - 0.5;
  const cam: Camara = orbita([0, 2.6, 0], 13, 2.5, -12 + t * 0.8, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        {!fase2 ? (
          <>
            <group position={[-3, 0, 0]} scale={0.6}>
              <Persona termico={1} />
            </group>
            <group position={[2.6, 2.2, 0]} rotation={[0, Math.PI, 0]}>
              <Caja tam={[2.8, 1.0, 0.9]} material={M.plasticoBlanco()} radio={0.35} />
              <Caja tam={[0.8, 2.0, 0.7]} pos={[0.7, -1.2, 0]} rot={[0, 0, 0.25]} material={M.plasticoBlanco()} radio={0.25} />
            </group>
            {Array.from({length: 5}, (_, k) => {
              const q = ((t * 0.9 + k / 5) % 1);
              return <Esf key={k} r={0.09} pos={[-2.5 + q * 3.8, 3.9 - q * 1.6, 0]} mat={M.emisivo('#FF6A2A', 2.4)} seg={8} />;
            })}
          </>
        ) : (
          <>
            <group position={[-2.2, 0, 0]}>
              <Cil r={1.4} h={1.8} pos={[0, 0.9, 0]} mat={M.acero()} seg={48} />
              <Caja tam={[1.6, 0.2, 0.3]} pos={[1.9, 1.6, 0]} material={M.plasticoNegro()} />
            </group>
            <group position={[2.2, 0, 0]}>
              <Cil r={1.4} h={1.8} pos={[0, 0.9, 0]} mat={M.color('#1E2024', 0.8)} seg={48} />
            </group>
            <TextoPlano lineas={[{t: 'lee: 31 °C', tam: 110, color: '#FF8A3D', mono: true}, {t: 'real: 80 °C', tam: 90, color: '#E8EAED', mono: true}]} w={3.0} h={1.4} pos={[-2.2, 3.4, 0]} estilo={{fondo: '#0B0F14', radio: 30}} op={ap(t, tO, 0.5)} />
            <TextoPlano lineas={[{t: 'lee: 79 °C', tam: 110, color: '#7CFFB2', mono: true}, {t: 'real: 80 °C', tam: 90, color: '#E8EAED', mono: true}]} w={3.0} h={1.4} pos={[2.2, 3.4, 0]} estilo={{fondo: '#0B0F14', radio: 30}} op={ap(t, tO + 0.4, 0.5)} />
          </>
        )}
      </Estudio>
      <TituloGrande texto="todo lo que tiene temperatura brilla en infrarrojo" p={ap(t, tB, 0.5) * sal(t, tTp - 0.3, 0.3)} y={96} />
      <TituloGrande texto="termopila: decenas de termopares en serie" p={ap(t, tTp, 0.5) * sal(t, tTr - 0.6, 0.3)} y={96} />
      <TituloGrande texto="no todo brilla igual" sub="un metal pulido emite poco y refleja lo de alrededor" p={ap(t, tTr, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: el DS18B20 en el mismo cable
export const DS18B20_ESP32: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tS = m('sonda', 2.0);
  const tC = m('cables', 8.0);
  const tSe = m('serie', 13.0);
  const tUs = m('usos', 19.0);
  const temps = [4.2 + 0.3 * Math.sin(t), 25.8 + 0.2 * Math.sin(t * 1.3), 63.5 + 1.5 * Math.sin(t * 0.7)];
  const cam: Camara = orbita([-0.6, 1.4, 0.4], 15.5, 7, -15 + t * 0.8, 30);
  const varios = ap(t, tSe, 0.8);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Protoboard pos={[0.4, 0, 0.8]} />
        <ESP32 pos={[3.8, 1.15, 0.8]} rotY={Math.PI / 2} led={1} />
        <ResistenciaAxial pos={[-0.6, 0.85, 1.4]} bandas={['#F2C230', '#6B3FA0', '#C62828', '#D4AF37']} />
        {/* sondas acostadas sobre la protoboard, con su cable hasta el circuito */}
        {[0, 1, 2].map((i) =>
          i === 0 || varios > 0.5 ? (
            <group key={i}>
              <Cil r={0.24} h={1.8} pos={[-5.9, 1.1, -1.2 + i * 1.6]} rot={[0, 0, Math.PI / 2]} mat={M.acero()} />
              <Esf r={0.24} pos={[-6.8, 1.1, -1.2 + i * 1.6]} mat={M.acero()} />
              <Tubo puntos={[[-5.0, 1.1, -1.2 + i * 1.6], [-4.0, 1.2, -1.0 + i * 1.5], [-2.9, 1.05, 0.9 + i * 0.3], [-2.0, 0.95, 1.2 + i * 0.25]]} radio={0.09} material={M.plasticoNegro()} seg={30} />
            </group>
          ) : null,
        )}
        <TextoPlano
          lineas={[
            {t: `#1  ${temps[0].toFixed(1).replace('.', ',')} °C  nevera`, tam: 80, color: '#7CF0FF', mono: true},
            {t: varios > 0.5 ? `#2  ${temps[1].toFixed(1).replace('.', ',')} °C  sala` : ' ', tam: 80, color: '#E8EAED', mono: true},
            {t: varios > 0.5 ? `#3  ${temps[2].toFixed(1).replace('.', ',')} °C  horno` : ' ', tam: 80, color: '#FFB547', mono: true},
          ]}
          w={6.4}
          h={2.2}
          pos={[2.4, 1.8, -4.6]}
          estilo={{fondo: '#0B0F14', radio: 40, alinear: 'left'}}
          op={ap(t, tC, 0.5)}
        />
      </Estudio>
      <TituloGrande texto="DS18B20: sonda a prueba de agua" sub="±0,5 °C entre −10 y 85 °C" p={ap(t, tS, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="tres cables y una resistencia de 4,7 kΩ" p={ap(t, tC, 0.5) * sal(t, tSe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cada sensor tiene su número de serie" sub="varios en el mismo cable" p={ap(t, tSe, 0.5) * sal(t, tUs - 0.3, 0.3)} y={96} />
      <TituloGrande texto="avisos en el celular" p={ap(t, tUs, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
