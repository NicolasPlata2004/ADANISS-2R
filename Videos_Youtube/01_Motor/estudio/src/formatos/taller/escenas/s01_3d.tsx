// S01 · Piezoeléctrico — escenas 3D (estilo render del reel del piezo).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {PiezoDisco, PIEZO, SombraContacto} from '../modelos/Piezo';
import {
  Caja,
  Chispa,
  CristalCuarzo,
  Diapason,
  Encendedor3D,
  ESP32,
  Lapiz,
  Mesa as MesaMadera,
  Ondas,
  Pila,
  Placas,
  Protoboard,
  RED,
  RedAtomica,
  ResistenciaAxial,
  Tubo,
} from '../modelos/Piezas';
import {M} from '../materiales';
import {Dato, EtiquetaGuia, Leyenda, proyectar, senalGolpe, Signo, TituloGrande} from '../ui';
import {EnPantalla, Osciloscopio3D, Voltimetro3D} from '../modelos/Instrumentos';
import {Cil} from '../modelos/Objetos';
import {TextoPlano} from '../texto3d';
import * as THREE from 'three';
import {FUENTES} from '../../../config/marca';

const Q = {escala: 0.8} as const; // calidad de render para la nube (1 = máxima)

const Fondo3D: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill>{children}</AbsoluteFill>;

// ------------------------------------------------------------------ encendedor
export const Encendedor: React.FC<{final?: boolean}> = ({final = false}) => {
  const {t, M: m, dur} = useEscena();
  const tClic = m('clic', final ? 0.6 : 1.5);
  const tGolpe = m('golpe', final ? 2.5 : 5.6);
  const tChispa = final ? tGolpe : m('chispa', 8.8);
  const clic = ap(t, tClic - 0.2, Math.max(0.6, tGolpe - tClic - 0.1), easeInOut) * (1 - ap(t, tGolpe, 0.5));
  const golpe = ap(t, tGolpe, 0.07, (x) => x) * (1 - ap(t, tGolpe + 0.6, 0.8));
  const qg = t - tGolpe;
  const qc = t - tChispa;
  const brillo = qg >= 0 ? Math.exp(-qg * 3) : 0;
  const parpadeo = (q: number) => (q >= 0 && q < 1.4 ? (0.65 + 0.35 * Math.sin(q * 95)) * Math.exp(-q * 2.2) : 0);
  const chispa = Math.max(parpadeo(qg) * 0.6, final ? 0 : parpadeo(qc));
  const cam = camaraEn(
    [
      {t: 0, pos: [-0.5, 5.2, 19.5], obj: [0.5, 1.4, 0], fov: 30},
      {t: 0, d: dur, pos: [1.5, 4.0, 16.5], obj: [0.9, 1.4, 0], fov: 30},
    ],
    t,
  );
  const pCristal = proyectar([1.1, 2.2, 0], cam);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 1.5, 0]} {...Q}>
        <Encendedor3D clic={clic} golpe={golpe} brillo={brillo} chispa={chispa} />
      </Estudio>
      {!final && (
        <>
          <EtiquetaGuia desde={pCristal} hacia={{x: pCristal.x - 140, y: pCristal.y - 190}} texto="cristal" sub="cerámica piezoeléctrica" p={ap(t, tGolpe - 0.3, 0.6)} lado="izq" />
          <Dato x={1500} y={250} valor="miles de V" sub="sin pilas · sin cables" p={ap(t, tChispa, 0.4) * sal(t, dur - 0.3, 0.3)} />
        </>
      )}
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ cristal: aprietas → electricidad; electricidad → se mueve
export const CristalDual: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tA = m('aprieta', 2.6);
  const tE = m('electricidad', 4.0);
  const tM = m('mueve', 7.9);
  const aprieta = ap(t, tA - 0.3, 0.6) * sal(t, tM - 0.6, 0.5);
  const brillo = ap(t, tE - 0.2, 0.4) * sal(t, tM - 0.6, 0.4);
  const vibra = ap(t, tM - 0.2, 0.4);
  const escalaY = 1 - 0.035 * aprieta + vibra * 0.02 * Math.sin(t * 2 * Math.PI * 6);
  const cam = orbita([0, 2.3, 0], 11, 2.2, -25 + t * 6, 32);
  const pIzq = proyectar([-1.25, 2.3, 0], cam);
  const pDer = proyectar([1.25, 2.3, 0], cam);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <CristalCuarzo pos={[0, 0.35, 0]} escalaY={escalaY} brillo={brillo * 0.9 + vibra * 0.4 * (0.5 + 0.5 * Math.sin(t * 40))} />
        <Caja tam={[3.4, 0.35, 3.4]} pos={[0, 0.18, 0]} material={M.aceroMate()} radio={0.06} />
        <Caja tam={[3.4, 0.35, 3.4]} pos={[0, mix(7, 4.62, aprieta), 0]} material={M.aceroMate()} radio={0.06} />
        <Chispa a={[-1.0, 1.0, 0.9]} b={[1.0, 1.0, 0.9]} intensidad={brillo * (0.6 + 0.4 * Math.sin(t * 60))} semilla={Math.floor(t * 12)} />
        {vibra > 0.01 && (
          <>
            <Pila pos={[3.6, 0.7, 0.5]} rot={[0, 0, Math.PI / 2]} />
            <Ondas centro={[0, 0.4, 0]} t={t} t0={tM} velocidad={3.5} color="#8FD3FF" />
          </>
        )}
      </Estudio>
      <Signo x={pIzq.x - 30} y={pIzq.y} signo="+" p={brillo} />
      <Signo x={pDer.x + 30} y={pDer.y} signo="−" p={brillo} />
      <TituloGrande texto="lo aprietas: electricidad" p={ap(t, tE - 0.2, 0.4) * sal(t, tM - 0.4, 0.3)} y={90} />
      <TituloGrande texto="le das electricidad: se mueve" p={ap(t, tM, 0.4) * sal(t, dur, 0.3)} y={90} />
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ título
export const TituloPiezo: React.FC = () => {
  const {t, dur} = useEscena();
  const cam = orbita([0, 0.2, 0], 5.2, 2.0, 30 - t * 5, 26);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" {...Q}>
        <PiezoDisco />
      </Estudio>
      <TituloGrande texto="Efecto piezoeléctrico" sub="del griego piezein: apretar" p={ap(t, 0.1, 0.5) * sal(t, dur + 0.2, 0.3)} y={120} />
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ red de átomos
const CENTRO_RED: V3 = [0, 3.2, 0];

export const RedAtomos: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tC = m('cuarzo', 10.9);
  const tQ = m('cargas', 15.6);
  const tN = m('neutro', 32.8);
  const cam = orbita(CENTRO_RED, 15, 3.5, -35 + (t / dur) * 70, 32);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={CENTRO_RED} {...Q}>
        <RedAtomica pos={CENTRO_RED} t={t} aparicion={ap(t, 0.2, 5, (x) => x)} color={ap(t, tQ, 1.4)} compresion={0} corrimiento={0} />
        {ap(t, tN - 0.5, 0.5) > 0.01 && (
          <EnPantalla cam={cam} x={1690} y={270} ancho={300 * ap(t, tN - 0.5, 0.5)} anchoObjeto={3.2}>
            <Voltimetro3D valor={0} etiqueta="neutro: 0" />
          </EnPantalla>
        )}
      </Estudio>
      <Leyenda
        x={70}
        y={170}
        p={ap(t, tC - 0.2, 0.6)}
        items={[
          {color: t > tQ ? '#FF5C8A' : '#D9D4CC', texto: t > tQ ? 'silicio  (+)' : 'silicio'},
          {color: t > tQ ? '#4F8DFF' : '#D9D4CC', texto: t > tQ ? 'oxígeno  (−)' : 'oxígeno'},
        ]}
      />
    </Fondo3D>
  );
};

/** Escena compartida: red que se aprieta, se polariza y (opcional) se conecta. */
const RedConPlacas: React.FC<{compresion: number; corrimiento: number; vibra?: number; t: number; cam: Camara; cable?: number; pila?: number; children?: React.ReactNode}> = ({
  compresion,
  corrimiento,
  vibra = 0,
  t,
  cam,
  cable = 0,
  pila = 0,
  children,
}) => {
  const sep = RED.alto * (1 - 0.22 * compresion) + 1.0;
  const xI = -RED.ancho / 2 - 0.9;
  const xD = RED.ancho / 2 + 0.9;
  const y = CENTRO_RED[1];
  return (
    <Estudio camara={cam} fondo="negro" centroLuz={CENTRO_RED} {...Q}>
      <RedAtomica pos={CENTRO_RED} t={t} aparicion={1} color={1} compresion={compresion} corrimiento={corrimiento} vibra={vibra} />
      <Placas separacion={sep} y0={y} op={compresion > 0.01 || vibra > 0 ? 1 : 0} />
      {/* electrodos laterales y cable de vuelta por delante */}
      {(cable > 0 || pila > 0) && (
        <>
          <Caja tam={[0.2, 3.4, 4.2]} pos={[xI, y, 0]} material={M.cobre()} radio={0.05} />
          <Caja tam={[0.2, 3.4, 4.2]} pos={[xD, y, 0]} material={M.cobre()} radio={0.05} />
        </>
      )}
      {cable > 0 && (
        <Tubo puntos={[[xI - 0.1, y - 1.2, 2.2], [xI - 0.6, y - 3, 3.4], [0, y - 3.6, 4.2], [xD + 0.6, y - 3, 3.4], [xD + 0.1, y - 1.2, 2.2]]} radio={0.09} material={M.goma('#B5121B')} progreso={cable} />
      )}
      {pila > 0 && (
        <>
          <Pila pos={[0, y - 4.4, 3.2]} rot={[0, 0, Math.PI / 2]} />
          <Tubo puntos={[[xI - 0.1, y - 1.2, 2.2], [xI - 0.4, y - 3.6, 3.2], [-2.4, y - 4.4, 3.2]]} radio={0.08} material={M.goma('#141414')} progreso={pila} />
          <Tubo puntos={[[xD + 0.1, y - 1.2, 2.2], [xD + 0.4, y - 3.6, 3.2], [2.4, y - 4.4, 3.2]]} radio={0.08} material={M.goma('#B5121B')} progreso={pila} />
        </>
      )}
      {children}
    </Estudio>
  );
};

export const RedAprieta: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tA = m('acercan', 3.9);
  const tD = m('desplazan', 9.0);
  const tC = m('caras', 15.3);
  const tV = m('voltaje', 23.8);
  const tK = m('cable', 25.5);
  const compresion = ap(t, Math.max(0.2, tA - 3), 3.2, easeInOut);
  const corrimiento = ap(t, tD - 0.2, 2.2, easeInOut) * (1 - ap(t, tK + 2.5, 2.5) * 0.6);
  const cam = camaraEn(
    [
      {t: 0, pos: [-4, 6.5, 15.5], obj: CENTRO_RED, fov: 32},
      {t: 0, d: dur, pos: [3.5, 4.8, 15], obj: CENTRO_RED, fov: 32},
    ],
    t,
  );
  const pI = proyectar([-RED.ancho / 2 - 0.9, CENTRO_RED[1], 0], cam);
  const pD = proyectar([RED.ancho / 2 + 0.9, CENTRO_RED[1], 0], cam);
  const cable = ap(t, tK, 1.2);
  return (
    <Fondo3D>
      <RedConPlacas compresion={compresion} corrimiento={corrimiento} t={t} cam={cam} cable={cable}>
        {ap(t, tV - 0.4, 0.5) > 0.01 && (
          <EnPantalla cam={cam} x={1700} y={270} ancho={300 * ap(t, tV - 0.4, 0.5)} anchoObjeto={3.2}>
            <Voltimetro3D valor={corrimiento * (1 - cable * 0.8)} />
          </EnPantalla>
        )}
      </RedConPlacas>
      <Signo x={pD.x + 20} y={pD.y} signo="+" p={ap(t, tC, 0.5)} />
      <Signo x={pI.x - 20} y={pI.y} signo="−" p={ap(t, tC + 0.3, 0.5)} />
      <TituloGrande texto="eso es un voltaje" p={ap(t, tV - 0.1, 0.4) * sal(t, tK + 1.5, 0.4)} y={110} />
    </Fondo3D>
  );
};

export const RedInverso: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tP = m('pila', 2.3);
  const tD = m('deforma', 7.1);
  const tN = m('nombre', 14.9);
  const vibra = ap(t, tD - 0.3, 0.6);
  const cam = orbita(CENTRO_RED, 16, 2.4, -15 + (t / dur) * 25, 33);
  return (
    <Fondo3D>
      <RedConPlacas compresion={0} corrimiento={vibra * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 3))} vibra={vibra} t={t} cam={cam} pila={ap(t, tP - 0.2, 1.2)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FUENTES.sans}}>
        {[
          ['directo', 'lo aprietas y aparece voltaje', 0],
          ['inverso', 'le pones voltaje y se mueve', 0.4],
        ].map(([a, b, d]) => (
          <div key={a as string} style={{opacity: ap(t, tN - 0.2 + (d as number), 0.5), background: 'rgba(8,10,12,0.65)', borderRadius: 18, padding: '14px 26px', color: '#fff'}}>
            <div style={{fontSize: 34, fontWeight: 800, color: a === 'directo' ? '#FF8FB1' : '#8FB8FF'}}>{a}</div>
            <div style={{fontSize: 26, fontWeight: 600}}>{b}</div>
          </div>
        ))}
      </div>
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ cuarzo vs PZT
export const CuarzoPZT: React.FC = () => {
  const {t, M: m} = useEscena();
  const tP = m('pzt', 7.0);
  const cam = orbita([0, 1.6, 0], 13, 3.0, -8 + t * 2.5, 30);
  const giro = t * 0.35;
  const pQ = proyectar([-3, 4.6, 0], cam);
  const pZ = proyectar([3, 2.0, 0], cam);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1.5, 0]} {...Q}>
        <group position={[-3, 0, 0]} rotation={[0, giro, 0]}>
          <CristalCuarzo pos={[0, 0, 0]} s={0.95} />
        </group>
        <group position={[3, 0, 0]} rotation={[0, -giro, 0]} scale={1 + 0.08 * ap(t, tP, 0.4) * sal(t, tP + 0.6, 0.6)}>
          <mesh position={[0, 0.5, 0]} castShadow material={M.ceramica()}>
            <cylinderGeometry args={[1.6, 1.6, 1.0, 64]} />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow material={M.plata()}>
            <cylinderGeometry args={[1.5, 1.5, 0.04, 64]} />
          </mesh>
          <SombraContacto r={2} op={0.5} />
        </group>
      </Estudio>
      <EtiquetaGuia desde={pQ} hacia={{x: pQ.x - 60, y: pQ.y - 120}} texto="cuarzo" sub="cristal natural" p={ap(t, 0.5, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pZ} hacia={{x: pZ.x + 60, y: pZ.y - 200}} texto="PZT" sub="titanato zirconato de plomo" p={ap(t, tP - 0.2, 0.6)} />
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ el disco: héroe, despiece, corte, golpe, zumbador
export const PiezoHero: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const cam = orbita([0, 0.2, 0.3], 6.5, 3.4, -40 + (t / dur) * 30, 26);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" {...Q}>
        <PiezoDisco />
      </Estudio>
      <Dato x={1460} y={300} valor="< 1" unidad="USD" sub="en cualquier tienda de electrónica" p={ap(t, m('dolar', 3.3) - 0.2, 0.4)} />
    </Fondo3D>
  );
};

export const PiezoDespiece: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tL = m('laton', 0.7);
  const tC = m('ceramica', 5.5);
  const tP = m('plata', 11.3);
  const tK = m('cables', 14.3);
  const desp = ap(t, Math.max(0.1, tL - 0.4), 1.6, easeInOut);
  const cam = camaraEn(
    [
      {t: 0, pos: [4.6, 3.6, 5.4], obj: [0, 0.8, 0], fov: 28},
      {t: 0, d: dur, pos: [3.4, 3.2, 5.6], obj: [0, 0.8, 0], fov: 28},
    ],
    t,
  );
  const P = PIEZO;
  const pL = proyectar([-P.rLaton, 0.02, 0], cam);
  const pC = proyectar([-P.rCeram, P.eLaton + desp * 0.9 + 0.03, 0], cam);
  const pP = proyectar([-P.rPlata * 0.7, P.eLaton + P.eCeram + desp * 1.7 + 0.01, -0.2], cam);
  const pK = proyectar([0.5, P.eLaton + P.eCeram + desp * 1.7 + 0.05, 0.42], cam);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" {...Q}>
        <PiezoDisco despiece={desp} />
      </Estudio>
      <EtiquetaGuia desde={pL} hacia={{x: 330, y: 760}} texto="disco de latón" sub="unos 27 mm" p={ap(t, tL + 0.6, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pC} hacia={{x: 330, y: 470}} texto="cerámica PZT" sub="décimas de milímetro" p={ap(t, tC - 0.2, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pP} hacia={{x: 380, y: 240}} texto="electrodo de plata" p={ap(t, tP - 0.2, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pK} hacia={{x: 1500, y: 300}} texto="rojo: plata · negro: latón" p={ap(t, tK - 0.2, 0.6)} />
    </Fondo3D>
  );
};

export const PiezoCorte: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('dobla', 3.0);
  const tC = m('curva', 6.1);
  const tV = m('voltaje', 15.2);
  const golpe = (t0: number) => (t >= t0 ? Math.exp(-(t - t0) / 0.6) * Math.cos(2 * Math.PI * 1.6 * (t - t0)) : 0);
  const flex = 0.8 * (golpe(tD) + golpe(tV)) + 0.5 * ap(t, tC, 0.6) * sal(t, tV - 0.6, 0.5);
  const cam = camaraEn(
    [
      {t: 0, pos: [8.2, 3.4, 5.6], obj: [0.4, 0.35, 0], fov: 30},
      {t: 0, d: dur, pos: [7.2, 2.6, 3.4], obj: [0.6, 0.35, 0], fov: 30},
    ],
    t,
  );
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 0.5, 0]} {...Q}>
        <group scale={[2.6, 5, 2.6]} position={[0, 0.2, 0]}>
          <PiezoDisco flex={flex} corte={1.6} cables={false} />
        </group>
        {ap(t, tV - 0.6, 0.5) > 0.01 && (
          <EnPantalla cam={cam} x={1560} y={660} ancho={520 * ap(t, tV - 0.6, 0.5)} anchoObjeto={7.2} dist={5}>
            <group position={[0, -2.35, 0]}>
              <Osciloscopio3D muestras={senalGolpe(t, tV, 220, 1.4, 0.95)} titulo="voltaje entre los cables" color="#C88BFF" />
            </group>
          </EnPantalla>
        )}
      </Estudio>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', gap: 50, fontFamily: FUENTES.sans}}>
        <div style={{opacity: ap(t, tC, 0.5), background: 'rgba(8,10,12,0.72)', borderRadius: 16, padding: '10px 22px', color: '#FFC266', fontSize: 34, fontWeight: 800}}>latón: se curva</div>
        <div style={{opacity: ap(t, tC + 1.2, 0.5), background: 'rgba(8,10,12,0.72)', borderRadius: 16, padding: '10px 22px', color: '#FF9DBB', fontSize: 34, fontWeight: 800}}>cerámica: se comprime o se estira</div>
      </div>
      <div style={{position: 'absolute', right: 60, bottom: 170, fontFamily: FUENTES.sans, color: 'rgba(255,255,255,0.6)', fontSize: 20, opacity: ap(t, 0.5, 0.5)}}>grosor exagerado ×5</div>
    </Fondo3D>
  );
};

export const PiezoGolpe: React.FC = () => {
  const {t, M: m} = useEscena();
  const tP = m('pico', 2.8);
  const bajada = t < tP ? ap(t, tP - 0.7, 0.7, (x) => x * x) : 1 - ap(t, tP, 0.4);
  const yLapiz = mix(3.2, 0.45, bajada);
  const q = t - tP;
  const flex = q >= 0 ? 0.8 * Math.exp(-q / 0.18) * Math.cos(2 * Math.PI * 7 * q) : 0;
  const cam = orbita([0, 0.4, 0], 6.8, 3.0, 25 + t * 2, 26);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" {...Q}>
        <PiezoDisco flex={flex} />
        <Lapiz pos={[0.05, yLapiz, 0]} rot={[0, 0, 0.12]} />
        {ap(t, 0.2, 0.5) > 0.01 && (
          <EnPantalla cam={cam} x={350} y={290} ancho={540 * ap(t, 0.2, 0.5)} anchoObjeto={7.2} dist={9}>
            <group position={[0, -2.35, 0]}>
              <Osciloscopio3D muestras={senalGolpe(t, tP, 240, 1.2, 0.95)} titulo="piezo · golpe con el dedo" color="#C88BFF" />
            </group>
          </EnPantalla>
        )}
      </Estudio>
      <Dato x={1500} y={270} valor="varios V" sub="en milésimas de segundo" p={ap(t, tP + 0.3, 0.4)} />
    </Fondo3D>
  );
};

export const Zumbador: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tV = m('vibra', 6.6);
  const tMi = m('micro', 9.4);
  const tE = m('escucha', 14.6);
  const tH = m('habla', 15.9);
  const vib = ap(t, tV - 0.4, 0.6);
  const flex = vib * 0.25 * Math.sin(t * 2 * Math.PI * 9);
  const cam = orbita([0, 0.3, 0], 7.5, 3.6, -10 + (t / dur) * 25, 28);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" {...Q}>
        <PiezoDisco flex={flex} />
        {vib > 0.01 && <Ondas centro={[0, 0.06, 0]} t={t} t0={tV - 0.2} velocidad={2.4} n={8} color="#9FE0FF" />}
        {ap(t, 1.0, 0.5) > 0.01 && (
          <EnPantalla cam={cam} x={340} y={420} ancho={500 * ap(t, 1.0, 0.5)} anchoObjeto={7.2} dist={9}>
            <group position={[0, -2.35, 0]}>
              <Osciloscopio3D muestras={Array.from({length: 200}, (_, i) => vib * 0.75 * Math.sign(Math.sin(i * 0.35 + t * 20)))} titulo="señal: sube y baja miles de veces" color="#7FD1FF" />
            </group>
          </EnPantalla>
        )}
      </Estudio>
      <TituloGrande texto="el zumbador del microondas" p={ap(t, tMi - 0.2, 0.4) * sal(t, tE - 0.4, 0.3)} y={110} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FUENTES.sans}}>
        <div style={{opacity: ap(t, tE - 0.1, 0.4), background: 'rgba(8,10,12,0.65)', borderRadius: 18, padding: '12px 28px', color: '#FF8FB1', fontSize: 38, fontWeight: 800}}>escucha: sensor</div>
        <div style={{opacity: ap(t, tH - 0.1, 0.4), background: 'rgba(8,10,12,0.65)', borderRadius: 18, padding: '12px 28px', color: '#8FD3FF', fontSize: 38, fontWeight: 800}}>habla: zumbador</div>
      </div>
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ montaje con ESP32
export const MontajeESP32: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('tierra', 4.4);
  const tE = m('entrada', 6.9);
  const tR = m('resistencia', 13.7);
  const cam = camaraEn(
    [
      {t: 0, pos: [2, 17, 16], obj: [1.2, 0, 1.0], fov: 32},
      {t: 0, d: dur, pos: [4, 14, 14.5], obj: [2.2, 0, 1.4], fov: 32},
    ],
    t,
  );
  const yTop = 0.85;
  const negro = ap(t, tT - 0.2, 1.2);
  const rojo = ap(t, tE - 0.2, 1.2);
  const res = ap(t, tR - 0.3, 0.6);
  const pG = proyectar([-1.9, yTop + 0.3, -1.95], cam);
  const pA = proyectar([-1.9, yTop + 0.3, 0.65], cam);
  const pR = proyectar([3.2, yTop + 1.0, 1.0], cam);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" centroLuz={[2, 0, 1]} {...Q}>
        <Protoboard pos={[1, 0, 0]} />
        <ESP32 pos={[-3.6, yTop + 0.55, 0]} rotY={Math.PI / 2} />
        <PiezoDisco posicion={[9.5, 0, 5.5]} cables={false} />
        {/* cables del piezo a la protoboard */}
        <Tubo puntos={[[9.0, 0.12, 5.0], [7, 0.4, 3.4], [4.0, 1.4, 1.95], [3.4, yTop + 0.25, 1.95]]} radio={0.07} material={M.goma('#141414')} progreso={negro} />
        <Tubo puntos={[[9.4, 0.12, 4.9], [7.5, 0.5, 3.2], [5.0, 1.5, 0.95], [4.4, yTop + 0.25, 0.95]]} radio={0.07} material={M.goma('#B5121B')} progreso={rojo} />
        {/* puentes a GND y a la entrada analógica */}
        <Tubo puntos={[[3.4, yTop + 0.2, 1.95], [2.0, yTop + 1.4, 0.2], [-1.9, yTop + 0.9, -1.95], [-1.9, yTop + 0.2, -1.95]]} radio={0.06} material={M.goma('#2A2A2A')} progreso={negro} />
        <Tubo puntos={[[4.4, yTop + 0.2, 0.95], [2.8, yTop + 1.7, 0.5], [-1.9, yTop + 1.1, 0.65], [-1.9, yTop + 0.2, 0.65]]} radio={0.06} material={M.goma('#E8A93A')} progreso={rojo} />
        {res > 0.01 && (
          <group position={[3.9, yTop + 0.1 + (1 - res) * 2, 1.45]} rotation={[0, Math.PI / 2, 0]}>
            <ResistenciaAxial />
          </group>
        )}
      </Estudio>
      <EtiquetaGuia desde={pG} hacia={{x: pG.x - 120, y: pG.y - 150}} texto="GND (tierra)" p={ap(t, tT + 0.6, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pA} hacia={{x: pA.x - 120, y: pA.y + 140}} texto="GPIO 34" sub="entrada analógica" p={ap(t, tE + 0.6, 0.6)} lado="izq" />
      <EtiquetaGuia desde={pR} hacia={{x: pR.x + 140, y: pR.y - 170}} texto="1 MΩ" sub="descarga el piezo" p={ap(t, tR + 0.3, 0.6)} />
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ mesa sensible: tres discos y el orden de llegada
export const Mesa: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tT = m('tres', 6.0);
  const tO = m('orden', 10.0);
  const tE = m('estimar', 12.8);
  const discos: V3[] = [
    [-17, 1.62, -9],
    [17, 1.62, -9],
    [0, 1.62, 10],
  ];
  const toque: V3 = [8, 1.62, -2];
  const tGolpe = tT + 1.6;
  const vel = 9;
  const llegada = discos.map((d) => tGolpe + Math.hypot(d[0] - toque[0], d[2] - toque[2]) / vel);
  const orden = [...llegada].map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const cam = camaraEn(
    [
      {t: 0, pos: [0, 38, 30], obj: [0, 0, 0], fov: 34},
      {t: 0, d: dur, pos: [4, 34, 27], obj: [1, 0, 0], fov: 34},
    ],
    t,
  );
  const giroCam = (() => {
    const c = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 400);
    c.position.set(...cam.pos);
    c.lookAt(...cam.obj);
    return c.quaternion.clone();
  })();
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="tapete" centroLuz={[0, 2, 0]} {...Q}>
        <MesaMadera />
        {discos.map((d, i) => (
          <PiezoDisco key={i} posicion={d} cables={false} flex={t > llegada[i] ? 0.8 * Math.exp(-(t - llegada[i]) / 0.25) * Math.cos(30 * (t - llegada[i])) : 0} />
        ))}
        <Ondas centro={[toque[0], 1.63, toque[2]]} t={t} t0={tGolpe} velocidad={vel} n={3} color="#FFD27F" />
        {/* orden de llegada: insignias 3D que miran a la cámara */}
        {discos.map((d, i) => {
          const q = ap(t, Math.max(llegada[i], tO - 0.4), 0.3);
          if (q <= 0.01) return null;
          return (
            <group key={i} position={[d[0], 5.2, d[2]]} quaternion={giroCam} scale={q}>
              <Cil r={1.5} h={0.25} rot={[Math.PI / 2, 0, 0]} mat={M.color('#FF5A5F', 0.4)} seg={40} />
              <TextoPlano lineas={[{t: String(orden.indexOf(i) + 1), tam: 700, color: '#FFFFFF'}]} w={2.2} h={2.2} pos={[0, 0, 0.16]} />
            </group>
          );
        })}
        {ap(t, tE, 0.4) > 0.01 && (
          <mesh position={[toque[0], 1.72, toque[2]]} rotation={[Math.PI / 2, 0, 0]} scale={ap(t, tE, 0.4)}>
            <torusGeometry args={[2.4, 0.22, 16, 64]} />
            <meshBasicMaterial color="#FFD27F" toneMapped={false} />
          </mesh>
        )}
      </Estudio>
      <TituloGrande texto="¿dónde tocaste?" p={ap(t, tE + 0.3, 0.4)} y={90} />
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ reloj de cuarzo: 32.768 = 2^15
export const RelojCuarzo: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('diapason', 6.5);
  const tV = m('vibra', 8.4);
  const tP = m('potencia', 12.0);
  const tDi = m('divide', 16.9);
  const tS = m('segundo', 21.2);
  const cam = orbita([0, 2.8, 0], 11, 1.6, -30 + (t / dur) * 50, 32);
  const vib = ap(t, tV - 0.3, 0.5);
  // panel 3D: primero 32.768 = 2^15; luego la cadena de divisiones entre 2 hasta 1 por segundo
  const pasos = Array.from({length: 16}, (_, k) => 32768 / 2 ** k);
  const lineas =
    t < tDi - 0.2
      ? [
          {t: '32.768', tam: 150, color: '#FFFFFF', mono: true},
          {t: 'vibraciones por segundo', tam: 64, color: '#C9D1D9', peso: 600},
          {t: t > tP - 0.1 ? '= 2¹⁵' : ' ', tam: 130, color: '#C88BFF'},
        ]
      : pasos.map((v, k) => ({
          t: t > tDi + k * 0.28 ? `${k ? '÷2 → ' : ''}${v.toLocaleString('es-ES')}${k === 15 ? ' por segundo' : ''}` : ' ',
          tam: k === 15 ? 62 : 54,
          color: k === 15 && t > tS ? '#FF5A5F' : k ? '#E8EAED' : '#FFFFFF',
          mono: true,
        }));
  const panel = ap(t, tV, 0.4);
  return (
    <Fondo3D>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2.5, 0]} {...Q}>
        <group scale={ap(t, 0.2, 1.0, easeInOut) * 0.999 + 0.001}>
          <Diapason vib={vib} t={t} abierto={0} lata={1 - ap(t, tD - 0.3, 1.2, easeInOut)} />
        </group>
        {panel > 0.01 && (
          <EnPantalla cam={cam} x={1580} y={540} ancho={440 * panel} anchoObjeto={4.2}>
            <TextoPlano lineas={lineas} w={4.2} h={t < tDi - 0.2 ? 2.4 : 5.2} estilo={{fondo: '#0B0F14', radio: 40, alinear: t < tDi - 0.2 ? 'center' : 'left', relleno: 60}} />
          </EnPantalla>
        )}
      </Estudio>
    </Fondo3D>
  );
};

// ------------------------------------------------------------------ resumen
export const Recap: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tA = m('atomos', 3.1);
  const tC = m('cargas', 5.7);
  const tU = m('usos', 8.4);
  const cam = orbita(CENTRO_RED, 16, 3, 20 - (t / dur) * 30, 32);
  const comp = ap(t, tA - 0.3, 1.0) * (1 - ap(t, dur - 1, 1) * 0);
  const pI = proyectar([-RED.ancho / 2 - 0.9, CENTRO_RED[1], 0], cam);
  const pD = proyectar([RED.ancho / 2 + 0.9, CENTRO_RED[1], 0], cam);
  const iconos = ['encender estufas', 'ver bebés antes de nacer', 'contar segundos', 'proteger un motor'];
  return (
    <Fondo3D>
      <RedConPlacas compresion={comp} corrimiento={comp} t={t} cam={cam} />
      <Signo x={pD.x + 20} y={pD.y} signo="+" p={ap(t, tC, 0.4)} />
      <Signo x={pI.x - 20} y={pI.y} signo="−" p={ap(t, tC + 0.2, 0.4)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', gap: 22, fontFamily: FUENTES.sans}}>
        {iconos.map((x, i) => (
          <div key={x} style={{opacity: ap(t, tU + i * 0.55, 0.4), background: 'rgba(8,10,12,0.7)', borderRadius: 16, padding: '12px 22px', color: '#fff', fontSize: 28, fontWeight: 700}}>
            {x}
          </div>
        ))}
      </div>
    </Fondo3D>
  );
};

