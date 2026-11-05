// S07 · Sensor ultrasónico — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Protoboard, ResistenciaAxial, Tubo} from '../modelos/Piezas';
import {Arcos, Cil, Esf, pintura} from '../modelos/Objetos';
import {CarroSimple, Murcielago} from '../modelos/ObjetosS06';
import {HCSR04, Polilla} from '../modelos/ObjetosS07';
import {Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano} from '../texto3d';

const Q = {escala: 0.8} as const;
const CIAN = '#7CF0FF';
const V_SONIDO = 343;

// ------------------------------------------------------------------ gancho: el carro grita, el murciélago caza, el sensor barato
export const GritoGancho3D: React.FC<{final?: boolean}> = ({final = false}) => {
  const {t, M: m, dur} = useEscena();
  const tG = m('gritando', 0.8);
  const tE = m('eco', 7.0);
  const tD = m('distancia', 10.0);
  const tMu = m('murcielagos', final ? 99 : 15.0);
  const tSe = m('sensor', final ? 99 : 33.0);
  const enCarro = t < tMu - 0.5;
  const enBat = t >= tMu - 0.5 && t < tSe - 0.5;
  // el carro retrocede hacia la pared: distancia de 3 m a 0,3 m
  const avance = clamp01((t - tG) / Math.max(4, tMu - tG - 1.5));
  const dist = mix(3.0, 0.35, easeInOut(avance));
  const xCarro = -dist * 3; // 1 m = 3 unidades
  const periodoBip = 0.15 + dist * 0.3;
  const bip = enCarro && t > tG && (t % periodoBip) < 0.06;
  const camCarro = camaraEn(
    [
      {t: 0, pos: [-6, 6, 16], obj: [-3, 1.6, 0], fov: 34},
      {t: tE - 0.5, d: 2.0, pos: [-1, 9, 12], obj: [-2, 1.2, 0], fov: 34},
    ],
    t,
  );
  const camBat: Camara = orbita([0, 3, 0], 13, 1.5, 20 + t * 2, 32);
  const camSen: Camara = orbita([0, 1.4, 0], 9, 1.5, -10 + t * 3, 30);
  const cam = enCarro ? camCarro : enBat ? camBat : camSen;
  const tPulsos = useMemo(() => Array.from({length: 40}, (_, k) => tG + k * 0.45), [tG]);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1.5, 0]} {...Q}>
        {enCarro && (
          <>
            <group position={[xCarro - 2.5, 0, 0]} rotation={[0, Math.PI, 0]}>
              <CarroSimple />
            </group>
            <Caja tam={[0.8, 5, 8]} pos={[0.4, 2.5, 0]} material={M.color('#8D8A84', 0.9)} />
            {tPulsos.map((tp, k) => (
              <group key={k}>
                <Arcos origen={[xCarro, 1.0, 0]} dir={Math.PI / 2} apertura={0.6} t={t} t0={tp} vel={9} n={1} vida={dist * 3 / 9} color={CIAN} />
                {t > tE - 1 && <Arcos origen={[0, 1.0, 0]} dir={-Math.PI / 2} apertura={0.6} t={t} t0={tp + (dist * 3) / 9} vel={9} n={1} vida={dist * 3 / 9} color="#FFB547" />}
              </group>
            ))}
            <TextoPlano lineas={[{t: `${dist.toFixed(2).replace('.', ',')} m`, tam: 140, color: bip ? '#FF5A5F' : '#7CFFB2', mono: true}]} w={3.2} h={0.9} pos={[-4, 5.4, -2]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tD, 0.5)} />
          </>
        )}
        {enBat && (
          <>
            <group position={[-1.5, 0, 0]}>
              <Murcielago t={t} a={1} />
            </group>
            <group position={[3.2, 0.4, 0]} scale={0.6}>
              <Polilla t={t} />
            </group>
          </>
        )}
        {!enCarro && !enBat && (
          <group scale={1.6}>
            <HCSR04 />
          </group>
        )}
      </Estudio>
      {enCarro && <TituloGrande texto="está gritando" sub="decenas de miles de vibraciones por segundo" p={ap(t, tG, 0.4) * sal(t, tE - 0.3, 0.3)} y={96} />}
      {enCarro && <TituloGrande texto="escucha el eco y cronometra" p={ap(t, tE, 0.4) * sal(t, tMu - 0.6, 0.3)} y={96} />}
      {enBat && <TituloGrande texto="los murciélagos: unos 50 millones de años" sub="y los delfines también" p={ap(t, tMu, 0.4) * sal(t, tSe - 0.6, 0.3)} y={96} />}
      {!enCarro && !enBat && !final && <TituloGrande texto="dos ojos… que no son ojos" p={ap(t, tSe, 0.4) * sal(t, dur, 0.3)} y={96} />}
      {final && <TituloGrande texto="lleva rato gritando" p={ap(t, 1.0, 0.4) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el sonido es una onda de presión
export const OndaPresion3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tF = m('frecuencia', 6.0);
  const tO = m('oidos', 10.0);
  const tU = m('ultrasonido', 14.0);
  const tV = m('velocidad', 19.0);
  const cols = 34;
  const filas = 5;
  const f = t < tF ? 0.6 : 1.2;
  const k = 0.8;
  const cam = orbita([0, 1.8, 0], 18, 4, -12 + t * 0.8, 32);
  const espectro = ap(t, tO - 0.3, 0.8);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[0.6, 3.2, 3.2]} pos={[-10.2 + 0.4 * Math.sin(2 * Math.PI * f * t), 1.8, 0]} material={M.aceroMate()} radio={0.06} />
        {Array.from({length: cols}, (_, i) =>
          Array.from({length: filas}, (_, j) => {
            const x0 = -9.2 + i * 0.58;
            const d = 0.22 * Math.sin(2 * Math.PI * f * t - k * i);
            const comp = Math.cos(2 * Math.PI * f * t - k * i);
            return <Esf key={`${i}-${j}`} r={0.13} pos={[x0 + d, 0.6 + j * 0.62, ((i * 7 + j * 3) % 5) * 0.3 - 0.6]} mat={M.emisivo(comp > 0.6 ? '#FFB547' : CIAN, comp > 0.6 ? 2 : 1.1)} seg={8} />;
          }),
        )}
        {espectro > 0.01 && (
          <group position={[0, 0, 4.6]}>
            <Caja tam={[12, 0.2, 0.8]} pos={[-2, 0.1, 0]} material={M.emisivo('#34D399', 0.9)} />
            <Caja tam={[8, 0.2, 0.8]} pos={[8, 0.1, 0]} material={M.emisivo('#C88BFF', 0.9 * ap(t, tU, 0.6))} />
            <TextoPlano lineas={[{t: 'lo que oyes: hasta ~20.000 por segundo', tam: 80, color: '#34D399'}]} w={9} h={0.7} pos={[-2, 0.25, 0.9]} rot={[-Math.PI / 2, 0, 0]} op={espectro} />
            <TextoPlano lineas={[{t: 'ultrasonido', tam: 90, color: '#C88BFF'}]} w={5} h={0.7} pos={[8, 0.25, 0.9]} rot={[-Math.PI / 2, 0, 0]} op={ap(t, tU, 0.6)} />
          </group>
        )}
      </Estudio>
      <TituloGrande texto="una onda de presión" sub="las moléculas se pasan el empujón" p={ap(t, 0.3, 0.5) * sal(t, tF - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la frecuencia: empujones por segundo" p={ap(t, tF, 0.5) * sal(t, tU - 0.3, 0.3)} y={96} />
      <TituloGrande texto="ultrasonido: demasiado agudo para ti" p={ap(t, tU, 0.5) * sal(t, tV - 0.3, 0.3)} y={96} />
      <Dato x={960} y={300} valor="343 m/s" sub="en el aire, a 20 °C" p={ap(t, tV, 0.5) * sal(t, dur, 0.3)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ eco: distancia = velocidad × tiempo ÷ 2
export const EcoDistancia3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tP = m('pulso', 2.0);
  const tI = m('idavuelta', 6.0);
  const tD = m('dos', 9.0);
  const tEj = m('ejemplo', 12.0);
  const tPq = m('porque', 19.0);
  const tC = m('centimetro', 25.0);
  const metro = 6; // 1 m = 6 unidades
  const ciclo = 3.0;
  const fase = t > tP ? (t - tP) % ciclo : -1;
  const vel = metro * 2.0;
  const ida = fase >= 0 ? Math.min(fase * vel, metro) : 0;
  const vuelta = fase >= 0 && fase * vel > metro ? Math.min(fase * vel - metro, metro) : 0;
  const ms = fase >= 0 ? Math.min(6, (fase * vel) / metro * 2.92) : 0;
  const cam = orbita([3, 1.4, 0], 13, 5, -10 + t * 0.6, 32);
  const haz = ap(t, tPq, 0.6);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[3, 1, 0]} {...Q}>
        <group position={[-0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <HCSR04 />
        </group>
        <Caja tam={[0.6, 4, 5]} pos={[metro + 0.3, 2, 0]} material={M.color('#8D8A84', 0.9)} />
        {fase >= 0 && ida > 0.05 && ida < metro && <Arcos origen={[0, 1.2, 0]} dir={Math.PI / 2} apertura={0.5 * (1 - haz * 0.5)} t={ida} t0={0} vel={1} n={1} vida={99} r0={0} color={CIAN} />}
        {vuelta > 0.05 && vuelta < metro && <Arcos origen={[metro, 1.2, 0]} dir={-Math.PI / 2} apertura={0.5} t={vuelta} t0={0} vel={1} n={1} vida={99} r0={0} color="#FFB547" />}
        <Tubo puntos={[[0, 0.05, 2.2], [metro, 0.05, 2.2]]} radio={0.04} material={M.emisivo('#E8EAED', 1)} seg={4} />
        <TextoPlano lineas={[{t: '1 m', tam: 140, color: '#E8EAED'}]} w={1.6} h={0.7} pos={[metro / 2, 0.06, 2.9]} rot={[-Math.PI / 2, 0, 0]} op={ap(t, tEj, 0.5)} />
        <TextoPlano lineas={[{t: `${ms.toFixed(1).replace('.', ',')} ms`, tam: 140, color: '#7CFFB2', mono: true}]} w={3.2} h={0.9} pos={[3, 3.4, -2.6]} estilo={{fondo: '#0B0F14', radio: 40}} op={ap(t, tEj, 0.5)} />
      </Estudio>
      <TituloGrande texto="lanza un pulso, rebota y vuelve" p={ap(t, tP, 0.5) * sal(t, tD - 0.3, 0.3)} y={96} />
      <TituloGrande texto="distancia = velocidad × tiempo ÷ 2" p={ap(t, tD, 0.5) * sal(t, tEj - 0.3, 0.3)} y={96} />
      <TituloGrande texto="6 ms de ida y vuelta ≈ 1 m de distancia" p={ap(t, tEj, 0.5) * sal(t, tPq - 0.3, 0.3)} y={96} />
      <TituloGrande texto="ondas cortas: un haz más angosto" p={ap(t, tPq, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="a 40 kHz, cada onda mide unos 8,6 mm" p={ap(t, tC, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ por dentro del HC-SR04: disparo, ráfaga y eco
export const HCSR04Dentro3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tO = m('ojos', 2.0);
  const tP = m('piezo', 5.0);
  const tTr = m('trigger', 12.0);
  const tRa = m('rafaga', 15.0);
  const tVu = m('vuelve', 20.0);
  const tAn = m('ancho', 25.0);
  const tRg = m('rango', 28.0);
  const corte = ap(t, tP - 0.4, 0.8);
  const pulso = t > tRa ? Math.exp(-((t - tRa) % 3) * 4) : 0;
  const muestras = Array.from({length: 240}, (_, i) => {
    const u = i / 239;
    let v = -0.6;
    if (t > tTr && u > 0.04 && u < 0.07) v = 0.1;
    if (t > tRa && u > 0.08 && u < 0.14) v = -0.6 + 0.25 * Math.sin(u * 900);
    if (t > tVu - 1 && u > 0.15 && u < 0.62) v = 0.55;
    return v;
  });
  const cam = orbita([1.5, 1.6, 0], 12, 3, -20 + t * 1.2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1, 0]} {...Q}>
        <group scale={1.4}>
          <HCSR04 t={t} corte={corte} pulso={pulso} />
        </group>
        {t > tTr - 0.5 && <Osciloscopio3D pos={[7.5, 0, -2.5]} rotY={-0.4} escala={0.8} muestras={muestras} titulo="Trigger · Echo" />}
      </Estudio>
      <TituloGrande texto="uno habla y el otro escucha" p={ap(t, tO, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />
      <TituloGrande texto="dentro: un piezo con un cono" sub="como en el primer episodio" p={ap(t, tP, 0.5) * sal(t, tTr - 0.3, 0.3)} y={96} />
      <TituloGrande texto="Trigger: un pulso de 10 µs" p={ap(t, tTr, 0.5) * sal(t, tRa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="ráfaga de 8 ciclos a 40 kHz" p={ap(t, tRa, 0.5) * sal(t, tVu - 0.3, 0.3)} y={96} />
      <TituloGrande texto="Echo en alto hasta que vuelve el eco" p={ap(t, tVu, 0.5) * sal(t, tRg - 0.3, 0.3)} y={96} />
      <TituloGrande texto="de unos 2 cm a 4 m, en un cono de ~15°" sub="según el fabricante" p={ap(t, tRg, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: divisor de voltaje y centímetros
export const UltraESP32_3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tC = m('cinco', 2.0);
  const tDiv = m('divisor', 6.0);
  const tTr = m('trigger', 11.0);
  const tPu = m('pulsein', 14.0);
  const tCin = m('cincuenta', 18.0);
  const d = 20 + 15 * Math.sin(t * 0.7);
  const us = Math.round(d * 58);
  const cam = orbita([0.5, 1.4, 0.6], 15, 7, -15 + t * 0.8, 30);
  const pDiv = proyectar([-1.4, 1.2, 1.6], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Protoboard pos={[0.4, 0, 0.8]} />
        <group position={[-5.6, 0.85, 0.5]} rotation={[0, -Math.PI / 2, 0]} scale={0.8}>
          <HCSR04 />
        </group>
        <ResistenciaAxial pos={[-1.8, 0.85, 1.6]} bandas={['#7A4A21', '#151515', '#C62828', '#D4AF37']} />
        <ResistenciaAxial pos={[-0.8, 0.85, 1.6]} bandas={['#C62828', '#151515', '#C62828', '#D4AF37']} />
        <ESP32 pos={[3.8, 1.15, 0.8]} rotY={Math.PI / 2} led={1} />
        <group position={[-6.8 - d * 0.12, 0, 0.5]}>
          <Caja tam={[0.4, 3.4, 3.4]} pos={[0, 1.7, 0]} material={M.color('#8D8A84', 0.9)} />
        </group>
        <TextoPlano
          lineas={[
            {t: `pulso: ${us} µs`, tam: 90, color: '#E8EAED', mono: true},
            {t: `÷ 58 = ${d.toFixed(1).replace('.', ',')} cm`, tam: 110, color: '#7CFFB2', mono: true},
          ]}
          w={5.2}
          h={1.7}
          pos={[6.0, 3.0, -2.6]}
          rot={[0, -0.4, 0]}
          estilo={{fondo: '#0B0F14', radio: 40}}
          op={ap(t, tPu, 0.5)}
        />
      </Estudio>
      <EtiquetaGuia desde={pDiv} hacia={{x: pDiv.x - 80, y: pDiv.y - 180}} texto="divisor de voltaje" sub="1 kΩ y 2 kΩ: 5 V → 3,3 V" p={ap(t, tDiv, 0.5) * sal(t, tTr - 0.3, 0.3)} lado="izq" />
      <TituloGrande texto="el HC-SR04 clásico va a 5 V" sub="y su Echo también responde con 5 V" p={ap(t, tC, 0.5) * sal(t, tDiv - 0.3, 0.3)} y={96} />
      <TituloGrande texto="pulseIn() mide el eco en microsegundos" p={ap(t, tPu, 0.5) * sal(t, tCin - 0.3, 0.3)} y={96} />
      <TituloGrande texto="÷ 58 → centímetros" sub="29 µs por centímetro, de ida y de vuelta" p={ap(t, tCin, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ la temperatura cambia la velocidad del sonido
export const TemperaturaSonido3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('temperatura', 1.0);
  const tC = m('centimetros', 6.0);
  const tTe = m('termometro', 10.0);
  const temp = 10 * Math.sin(t * 0.5) + 15;
  const v = 331.3 + 0.606 * temp;
  const cam = orbita([0, 2.2, 0], 14, 4, -10 + t * 0.6, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <HCSR04 />
        </group>
        <Caja tam={[0.6, 4, 5]} pos={[4.3, 2, 0]} material={M.color('#8D8A84', 0.9)} />
        <Arcos origen={[-3.8, 1.2, 0]} dir={Math.PI / 2} apertura={0.5} t={t} t0={0} vel={v / 343 * 6} n={20} cada={0.5} vida={8 / (v / 343 * 6)} color={temp > 15 ? '#FFB547' : CIAN} />
        <TextoPlano lineas={[{t: `${temp.toFixed(0)} °C`, tam: 150, color: temp > 15 ? '#FFB547' : CIAN, mono: true}, {t: `${v.toFixed(0)} m/s`, tam: 110, color: '#E8EAED', mono: true}]} w={3.6} h={1.7} pos={[0, 5, -1.5]} estilo={{fondo: '#0B0F14', radio: 40}} />
      </Estudio>
      <TituloGrande texto="+0,6 m/s por cada grado" p={ap(t, tT, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la medida cambia varios cm por metro" p={ap(t, tC, 0.5) * sal(t, tTe - 0.3, 0.3)} y={96} />
      <TituloGrande texto="los medidores serios llevan termómetro" p={ap(t, tTe, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
