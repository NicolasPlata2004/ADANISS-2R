// EP01 · Capítulo 2: la presión (estufa, ladrillo, conmutación, flyback, aislamiento) 2:39 – 4:31
import React from 'react';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, Cruz, D, Etiqueta, Flecha, Flujo, Lienzo, Manometro, Mover, P, R, T} from '../kit';
import {
  Alerta,
  Bateria,
  Cargador,
  Coche,
  Condensador,
  Diodo,
  Enchufe,
  Escudo,
  Interruptor,
  Ladrillo,
  Mosfet,
  Resistencia,
  Resorte,
  TransformadorFerrita,
  TransformadorGrande,
  TransistorPieza,
} from '../iconos';

type Pt = [number, number];

/** Onda cuadrada exacta (bordes verticales). */
const cuadrada = (x0: number, yAlto: number, yBajo: number, w: number, ciclos: number, ciclo = 0.5, desplaz = 0) => {
  const per = w / ciclos;
  let d = '';
  let x = x0 - ((desplaz % per) + per) % per;
  let primero = true;
  while (x < x0 + w) {
    const xa = Math.max(x0, x);
    const xb = Math.min(x0 + w, x + per * ciclo);
    const xc = Math.min(x0 + w, x + per);
    if (xb > x0) {
      d += primero ? `M${xa} ${yAlto}` : `V${yAlto}`;
      primero = false;
      d += `H${xb}`;
      if (xc > xb) d += `V${yBajo}H${xc}`;
    } else if (xc > x0) {
      d += primero ? `M${xa} ${yBajo}` : `V${yBajo}`;
      primero = false;
      d += `H${xc}`;
    }
    x += per;
  }
  return d;
};

// ------------------------------------------------------------------ frenar en toda una bajada → estufa
export const Estufa: React.FC = () => {
  const {t, M} = useEscena();
  const tFre = M('frenar', 2.9);
  const tFun = M('funciona', 5.2);
  const tEst = M('estufa', 8.3);
  const tIne = M('ineficiente', 9.2);
  const tPel = M('peligroso', 10.6);
  const bajada = sal(t, tEst - 0.4, 0.6);
  const s = mix(0.06, 0.8, ap(t, tFre - 0.3, tEst - tFre, (x) => x));
  const ang = (Math.atan2(400, 1200) * 180) / Math.PI;
  const cx = 300 + 1200 * s;
  const cy = 300 + 400 * s;
  return (
    <Lienzo>
      <g opacity={bajada}>
        <D d={R.poli([[300, 300], [1500, 700], [1500, 760], [300, 760]], true)} p={ap(t, 0, 1.0, easeInOut)} w={4} fill={P.grisClaro} fillOp={0.6} />
        <g transform={`translate(${cx} ${cy - 4}) rotate(${ang})`}>
          <Coche x={0} y={0} s={0.9} p={ap(t, 0.3, 0.8)} freno={ap(t, tFre - 0.2, 0.4)} />
        </g>
        {t > tFre &&
          [0, 1, 2].map((k) => {
            const q = (t * 1.2 + k * 0.33) % 1;
            return (
              <path key={k} d={`M${cx - 40 + k * 40} ${cy - 120 - q * 60}q 8 -10 0 -20 q -8 -10 0 -20`} stroke={P.rojo} strokeWidth={4} fill="none" strokeLinecap="round" opacity={(1 - q) * ap(t, tFre, 0.5)} />
            );
          })}
        <Ap p={ap(t, tFre + 0.2, 0.5)}>
          <Etiqueta x={1200} y={330} texto="frenando todo el camino" c={P.rojo} s={30} />
        </Ap>
        <Ap p={ap(t, tFun, 0.5)}>
          <Check x={1120} y={400} p={ap(t, tFun, 0.5)} c={P.tinta2} />
          <Etiqueta x={1150} y={400} texto="funcionaría…" a="start" s={30} />
        </Ap>
      </g>
      <g opacity={ap(t, tEst - 0.3, 0.6)}>
        <D d={R.linea(560, 470, 660, 470)} w={5} />
        <D d={R.linea(1260, 470, 1360, 470)} w={5} />
        <g transform="translate(0 0)">
          <Resistencia x1={660} x2={1260} y={470} calor={1} t={t} />
        </g>
        <T x={960} y={290} s={56} pe={800} c={P.rojo}>
          una pequeña estufa
        </T>
      </g>
      <Ap p={ap(t, tIne, 0.5)}>
        <path d={R.rect(560, 610, 800, 44, 10)} fill={P.rojo} />
        <path d={R.rect(560, 610, 16, 44, 6)} fill={P.azul} />
        <Etiqueta x={568} y={690} texto="útil" a="start" c={P.azul} s={24} />
        <Etiqueta x={1360} y={690} texto="casi todo se pierde como calor" a="end" c={P.rojo} s={24} />
      </Ap>
      <Ap p={ap(t, tPel, 0.5)} s={0.7} ox={1560} oy={470}>
        <Alerta x={1560} y={460} s={0.9} />
        <Etiqueta x={1560} y={560} texto="peligroso" c={P.rojo} s={28} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ el transformador de antes: un ladrillo
export const LadrilloEscena: React.FC = () => {
  const {t, M} = useEscena();
  const tTra = M('transformador', 2.3);
  const tLad = M('ladrillo', 5.9);
  const tCam = M('cambie', 7.7);
  return (
    <Lienzo>
      <TransformadorGrande x={640} y={430} s={1.25} p={ap(t, tTra - 0.6, 1.1, easeInOut)} />
      <Ap p={ap(t, tTra, 0.5)}>
        <T x={640} y={225} s={50} pe={800}>
          transformador
        </T>
        <Etiqueta x={640} y={275} texto="de los cargadores antiguos" s={28} />
      </Ap>
      <Ap p={ap(t, tLad - 0.2, 0.5)}>
        <T x={990} y={430} s={80} pe={800}>
          =
        </T>
      </Ap>
      <Ladrillo x={1300} y={430} s={1.15} p={ap(t, tLad - 0.2, 0.8, easeInOut)} />
      <Ap p={ap(t, tLad + 0.3, 0.5)}>
        <Flecha x1={640} y1={590} x2={640} y2={650} w={6} c={P.rojo} />
        <Flecha x1={1300} y1={520} x2={1300} y2={580} w={6} c={P.rojo} />
        <Etiqueta x={1300} y={615} texto="pesado" c={P.rojo} s={28} />
      </Ap>
      <Ap p={ap(t, tCam, 0.5)}>
        <D d={R.funcion(470, 745, 230, 34, (u) => Math.sin(u * Math.PI * 4))} w={5} c={P.rojo} />
        <Check x={730} y={745} />
        <Etiqueta x={760} y={745} texto="necesita corriente que cambie" a="start" s={26} />
      </Ap>
      <Ap p={ap(t, tCam + 0.7, 0.5)}>
        <D d={R.linea(470, 805, 700, 805)} w={5} c={P.azul} />
        <Cruz x={730} y={805} s={0.6} w={5} />
        <Etiqueta x={760} y={805} texto="con corriente continua no funciona" a="start" s={26} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ volverla cambiante, pero rapidísimo
export const Picar: React.FC = () => {
  const {t, M} = useEscena();
  const tCam = M('cambiante', 3.7);
  const tRap = M('rapido', 6.3);
  const corte = ap(t, tCam - 0.2, 0.8, easeInOut);
  const ciclos = mix(5, 46, ap(t, tRap - 0.2, 1.3, easeInOut));
  const yA = 400;
  const yB = mix(yA, 600, corte);
  return (
    <Lienzo>
      <D d={R.linea(300, 600, 1620, 600)} p={ap(t, 0, 0.6)} w={3} c={P.grisClaro} />
      {corte < 0.01 ? (
        <D d={R.linea(300, yA, 1620, yA)} p={ap(t, 0.1, 1.0, easeInOut)} w={7} c={P.azul} />
      ) : (
        <path d={cuadrada(300, yA, yB, 1320, ciclos, 0.5, t * 40)} stroke={P.azul} strokeWidth={6} fill="none" strokeLinejoin="round" />
      )}
      <Ap p={ap(t, 0.5, 0.5) * sal(t, tCam, 0.4)}>
        <T x={960} y={300} s={48} pe={700} c={P.azul}>
          continua y tranquila
        </T>
      </Ap>
      <Ap p={ap(t, tCam, 0.5)}>
        <T x={960} y={300} s={48} pe={800}>
          ¿y si la volvemos cambiante?
        </T>
        <Etiqueta x={250} y={yA} texto="encendido" a="end" s={24} />
        <Etiqueta x={250} y={600} texto="apagado" a="end" s={24} />
      </Ap>
      <Ap p={ap(t, tRap, 0.5)} s={0.7} ox={960} oy={720}>
        <T x={960} y={720} s={56} pe={800} c={P.rojo}>
          ¡rapidísimo!
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ el transistor: un interruptor sin partes móviles
export const Transistor: React.FC = () => {
  const {t, M} = useEscena();
  const tInt = M('interruptor', 1.3);
  const tMov = M('moviles', 2.0);
  const tTra = M('transistor', 3.7);
  const tVec = M('veces', 6.7);
  const tCon = M('conmutacion', 10.0);
  const morf = ap(t, tTra - 0.4, 0.7, easeInOut);
  const lento = Math.sin(t * 2.6) > 0 ? 1 : 0;
  const rapido = Math.sin(t * 2 * Math.PI * 3.5) > 0 ? 1 : 0;
  const on = t > tVec ? rapido : lento;
  return (
    <Lienzo>
      <g opacity={1 - morf}>
        <Interruptor x={600} y={480} s={1.3} p={ap(t, tInt - 0.5, 0.8, easeInOut)} cerrado={lento} />
        <Ap p={ap(t, tInt - 0.2, 0.4)}>
          <T x={600} y={330} s={48} pe={800}>
            interruptor
          </T>
        </Ap>
        <Ap p={ap(t, tMov, 0.4)}>
          <Etiqueta x={600} y={600} texto="…pero sin partes móviles" s={30} c={P.tinta} />
        </Ap>
      </g>
      <g opacity={morf}>
        <TransistorPieza x={600} y={470} s={1.1} p={morf} />
        <T x={600} y={260} s={52} pe={800}>
          transistor
        </T>
      </g>
      <Ap p={ap(t, tTra + 0.3, 0.6)}>
        <Mosfet x={1180} y={470} s={1.4} on={on} p={ap(t, tTra + 0.3, 0.8)} />
        <Etiqueta x={1290} y={300} texto={on ? 'cerrado: conduce' : 'abierto: no conduce'} a="start" s={26} c={on ? P.azul : P.tinta2} />
      </Ap>
      <Ap p={ap(t, tVec, 0.5)}>
        <path d={cuadrada(960, 690, 760, 640, 10, 0.5, t * 380)} stroke={P.tinta} strokeWidth={4} fill="none" />
        <Etiqueta x={940} y={725} texto="señal" a="end" s={22} />
      </Ap>
      <Ap p={ap(t, tVec, 0.5) * sal(t, tCon - 0.2, 0.4)}>
        <T x={1280} y={175} s={52} pe={800} c={P.azul}>
          decenas de miles
        </T>
        <Etiqueta x={1280} y={225} texto="de veces por segundo" s={28} />
      </Ap>
      <Ap p={ap(t, tCon - 0.1, 0.5)}>
        <T x={1280} y={190} s={60} pe={800} c={P.azul}>
          conmutación
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ flyback: el resorte magnético
const PRIM: Pt[] = [[330, 398], [330, 260], [760, 260], [760, 300], [760, 560], [760, 720], [677, 720], [443, 720], [330, 720], [330, 542]];
const SEC: Pt[] = [[876, 560], [876, 300], [876, 260], [1300, 260], [1300, 398], [1300, 542], [1300, 720], [876, 720], [876, 560]];

export const Flyback: React.FC = () => {
  const {t, M} = useEscena();
  const tFly = M('flyback', 1.8);
  const tRes = M('resorte', 4.2);
  const tCon = M('conduce', 5.7);
  const tCam = M('campo', 9.4);
  const tNad = M('nada', 12.3);
  const tCor = M('corta', 15.3);
  const tPas = M('pasa', 19.1);
  const tMen = M('menor', 21.6);
  const pD = ap(t, 0, 1.6, easeInOut);
  // energía guardada y estado del interruptor (un ciclo lento y luego ciclos rápidos)
  let E = 0;
  let cerrado = 0;
  let suelta = 0;
  if (t >= tCon && t < tCor) {
    cerrado = 1;
    E = ap(t, tCon, tCor - tCon, (x) => x);
  } else if (t >= tCor && t < tMen + 0.8) {
    E = 1 - ap(t, tCor, 1.6, (x) => x);
    suelta = E > 0.02 ? 1 : 0;
  } else if (t >= tMen + 0.8) {
    const q = ((t - tMen - 0.8) % 1.0) / 1.0;
    cerrado = q < 0.55 ? 1 : 0;
    E = q < 0.55 ? q / 0.55 : 1 - (q - 0.55) / 0.45;
    suelta = q >= 0.55 ? 1 : 0;
  }
  const xBloque = mix(1720, 1590, E);
  const fantasma = t > tNad;
  return (
    <Lienzo>
      {/* primario */}
      <D d={R.poli(PRIM.slice(0, 4))} p={pD} w={4} />
      <D d={R.poli([[760, 560], [760, 720], [677, 720]])} p={pD} w={4} />
      <D d={R.poli([[443, 720], [330, 720], [330, 542]])} p={pD} w={4} />
      <Condensador x={330} y={470} s={1} p={pD} />
      <D d={R.bobina(760, 300, 560, 6, 26, false)} p={pD} w={5} />
      <Interruptor x={560} y={720} s={0.9} p={pD} cerrado={cerrado} />
      <Etiqueta x={560} y={770} texto={cerrado ? 'transistor: conduce' : 'transistor: cortado'} s={22} c={cerrado ? P.azul : P.tinta2} p={ap(t, tCon - 0.3, 0.4)} />
      {/* núcleo */}
      <D d={R.linea(810, 280, 810, 580)} p={pD} w={5} />
      <D d={R.linea(826, 280, 826, 580)} p={pD} w={5} />
      {/* secundario */}
      <D d={R.bobina(876, 300, 560, 6, 26, true)} p={pD} w={5} />
      <D d={R.poli([[876, 300], [876, 260], [1000, 260]])} p={pD} w={4} />
      <Diodo x1={1000} y1={260} x2={1180} y2={260} tam={24} p={pD} />
      <D d={R.poli([[1180, 260], [1300, 260], [1300, 398]])} p={pD} w={4} />
      <Condensador x={1300} y={470} s={1} p={pD} />
      <D d={R.poli([[1300, 542], [1300, 720], [876, 720], [876, 560]])} p={pD} w={4} />
      {/* campo magnético */}
      {E > 0.01 &&
        [0, 1, 2, 3].map((k) => {
          const q = clamp01(E * 4 - k);
          return q > 0 ? (
            <ellipse key={k} cx={818} cy={430} rx={46 + k * 26} ry={170 + k * 22} fill="none" stroke={P.azul} strokeWidth={4} strokeDasharray="10 10" opacity={0.85 * q} />
          ) : null;
        })}
      {cerrado === 1 && t > tCon && <Flujo pts={PRIM} t={t} vel={240} n={22} r={6} c={P.rojo} />}
      {suelta === 1 && <Flujo pts={SEC} t={t} vel={300} n={18} r={6} c={P.azul} />}
      {/* rótulos */}
      <Ap p={ap(t, 0.6, 0.5)}>
        <Etiqueta x={330} y={215} texto="entrada: alta presión" c={P.rojo} s={26} />
        <Etiqueta x={1300} y={215} texto="salida" c={P.azul} s={26} />
      </Ap>
      <Ap p={ap(t, tFly, 0.5)}>
        <Etiqueta x={818} y={620} texto="transformador" s={24} c={P.tinta} />
      </Ap>
      <Ap p={ap(t, tCam, 0.5)}>
        <T x={560} y={430} s={34} pe={800} c={P.azul}>
          campo
        </T>
        <T x={560} y={472} s={34} pe={800} c={P.azul}>
          magnético
        </T>
      </Ap>
      {/* energía guardada */}
      <Ap p={ap(t, tCon, 0.5)}>
        <path d={R.rect(708, 150, 220, 26, 13)} fill="#fff" stroke={P.tinta} strokeWidth={3} />
        {E > 0.01 && <path d={R.rect(712, 154, 212 * E, 18, 9)} fill={P.azul} />}
        <Etiqueta x={818} y={120} texto="energía guardada" s={22} />
      </Ap>
      {/* la metáfora del resorte */}
      <Ap p={ap(t, tRes, 0.6)}>
        <D d={R.linea(1480, 380, 1480, 560)} w={6} />
        {[0, 1, 2, 3, 4].map((k) => (
          <D key={k} d={R.linea(1480, 390 + k * 40, 1458, 410 + k * 40)} w={3} />
        ))}
        <Resorte x1={1480} x2={xBloque} y={470} n={8} amp={28} c={fantasma ? P.gris : P.tinta} dash={fantasma ? '8 8' : undefined} />
        <path d={R.rect(xBloque, 430, 60, 80, 8)} fill={fantasma ? 'none' : P.azulSuave} stroke={fantasma ? P.gris : P.tinta} strokeWidth={4} strokeDasharray={fantasma ? '8 8' : undefined} />
        <Etiqueta x={1600} y={350} texto={E > 0.05 && cerrado ? 'se comprime' : suelta ? 'se suelta' : 'resorte'} s={26} />
      </Ap>
      <Ap p={ap(t, tNad, 0.5)}>
        <Etiqueta x={1600} y={600} texto="(nada se comprime de verdad)" s={22} c={P.tinta2} />
      </Ap>
      <Ap p={ap(t, tPas, 0.5)}>
        <T x={1100} y={620} s={34} pe={800} c={P.azul}>
          pasa al otro lado
        </T>
      </Ap>
      <Ap p={ap(t, tMen, 0.5)}>
        <Manometro x={1300} y={150} r={42} valor={0.2} p={1} />
        <Etiqueta x={1380} y={140} texto="mucho menor" a="start" c={P.azul} s={24} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ la velocidad sustituye al tamaño
export const Tamano: React.FC = () => {
  const {t, M} = useEscena();
  const tRit = M('ritmo', 2.2);
  const tDim = M('diminuto', 3.8);
  const tSus = M('sustituye', 5.7);
  return (
    <Lienzo>
      <TransformadorGrande x={600} y={460} s={1.25} p={ap(t, 0, 0.9, easeInOut)} />
      <Ap p={ap(t, 0.4, 0.5)}>
        <T x={600} y={660} s={40} pe={800}>
          lento
        </T>
        <Etiqueta x={600} y={705} texto="50–60 veces por segundo" s={24} />
      </Ap>
      <TransformadorFerrita x={1320} y={470} s={0.6} p={ap(t, tRit - 0.2, 0.8, easeInOut)} />
      <Ap p={ap(t, tRit, 0.5)}>
        <T x={1320} y={660} s={40} pe={800} c={P.azul}>
          rápido
        </T>
        <Etiqueta x={1320} y={705} texto="decenas de miles por segundo" s={24} c={P.azul} />
      </Ap>
      <Ap p={ap(t, tDim - 0.1, 0.5)}>
        <D d={R.poli([[400, 300], [380, 300], [380, 600], [400, 600]])} w={3} c={P.tinta2} />
        <D d={R.poli([[1250, 430], [1235, 430], [1235, 520], [1250, 520]])} w={3} c={P.azul} />
        <T x={1320} y={380} s={34} pe={800} c={P.azul}>
          diminuto
        </T>
      </Ap>
      <Ap p={ap(t, tSus - 0.1, 0.6)}>
        <text x={960} y={215} fontSize={52} fontWeight={800} textAnchor="middle" fontFamily="Inter" dominantBaseline="central">
          <tspan>la </tspan>
          <tspan fill={P.azul}>velocidad</tspan>
          <tspan> sustituye al </tspan>
          <tspan fill={P.rojo}>tamaño</tspan>
        </text>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ al otro lado: otra puerta y otro depósito
export const Secundario: React.FC = () => {
  const {t, M} = useEscena();
  const tPue = M('puerta', 3.1);
  const tDep = M('deposito', 5.5);
  const tAho = M('ahora', 7.8);
  const pD = ap(t, 0, 1.0, easeInOut);
  const pulsos = (u: number) => {
    const q = (u * 5) % 1;
    return q < 0.35 ? Math.sin((q / 0.35) * Math.PI) : -0.35 * Math.sin(((q - 0.35) / 0.65) * Math.PI);
  };
  return (
    <Lienzo>
      <g transform="translate(0 80)">
      <D d={R.bobina(300, 380, 560, 5, 24, true)} p={pD} w={5} />
      <D d={R.poli([[300, 380], [300, 340], [620, 340]])} p={pD} w={4} />
      <D d={R.poli([[300, 560], [300, 620], [1500, 620]])} p={pD} w={4} />
      <Diodo x1={620} y1={340} x2={840} y2={340} tam={30} p={ap(t, tPue - 0.4, 0.8)} relleno={P.azulSuave} />
      <D d={R.linea(840, 340, 1500, 340)} p={ap(t, tPue, 0.6)} w={4} />
      <Condensador x={1060} y={480} s={1.0} patas={70} p={ap(t, tDep - 0.3, 0.8)} />
      {/* ondas en cada etapa */}
      <Ap p={ap(t, 0.5, 0.5)}>
        <D d={R.funcion(380, 230, 210, 60, pulsos)} w={4} c={P.tinta2} />
        <Etiqueta x={485} y={150} texto="llega a pulsos" s={24} />
      </Ap>
      <Ap p={ap(t, tPue + 0.2, 0.5)}>
        <D d={R.funcion(640, 230, 210, 60, (u) => Math.max(0, pulsos(u)))} w={4} c={P.azul} />
        <Etiqueta x={730} y={410} texto="otra puerta (diodo)" s={24} c={P.azul} />
      </Ap>
      <Ap p={ap(t, tDep + 0.2, 0.5)}>
        <D d={R.funcion(1140, 230, 260, 60, (u) => 0.55 - 0.05 * ((u * 5) % 1))} w={6} c={P.azul} />
        <Etiqueta x={1060} y={690} texto="otro depósito (condensador)" s={24} c={P.azul} />
      </Ap>
      <Bateria x={1640} y={480} s={0.8} p={ap(t, tAho - 0.6, 0.8)} nivel={mix(0.3, 0.75, ap(t, tAho, 3, easeInOut))} />
      <D d={R.poli([[1500, 340], [1560, 340], [1560, 440]])} p={ap(t, tAho - 0.6, 0.6)} w={4} />
      <D d={R.poli([[1500, 620], [1560, 620], [1560, 520]])} p={ap(t, tAho - 0.6, 0.6)} w={4} />
      {t > tAho && <Flujo pts={[[840, 340], [1500, 340]]} t={t} vel={120} n={8} r={7} />}
      <Ap p={ap(t, tAho, 0.5)}>
        <Check x={1560} y={705} />
        <T x={1595} y={705} s={30} pe={700} a="start">
          poca presión
        </T>
      </Ap>
      <Ap p={ap(t, tAho + 1.2, 0.5)}>
        <Check x={1560} y={752} />
        <T x={1595} y={752} s={30} pe={700} a="start">
          un solo sentido
        </T>
      </Ap>
      </g>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ aislamiento galvánico
export const Aislamiento: React.FC = () => {
  const {t, M} = useEscena();
  const tCon = M('conexion', 1.7);
  const tCru = M('cruzo', 4.0);
  const tNom = M('nombre', 8.4);
  const tPro = M('protege', 10.5);
  const tBar = M('baratos', 14.8);
  const pD = ap(t, 0, 1.0, easeInOut);
  return (
    <Lienzo>
      <Ap p={pD}>
        <path d={R.rect(200, 230, 690, 500, 28)} fill={P.rojoSuave} />
        <path d={R.rect(1030, 230, 690, 500, 28)} fill={P.azulSuave} />
        <Etiqueta x={545} y={270} texto="lado de la red" c={P.rojo} s={26} />
        <Etiqueta x={1375} y={270} texto="lado del teléfono" c={P.azul} s={26} />
      </Ap>
      <Enchufe x={400} y={480} s={0.75} p={pD} />
      <D d={R.bobina(840, 380, 580, 6, 26, false)} p={pD} w={5} />
      <D d={R.bobina(1080, 380, 580, 6, 26, true)} p={pD} w={5} />
      <D d={R.poli([[460, 440], [620, 440], [620, 380], [840, 380]])} p={pD} w={4} />
      <D d={R.poli([[460, 520], [620, 520], [620, 580], [840, 580]])} p={pD} w={4} />
      <D d={R.linea(960, 190, 960, 770)} p={ap(t, 0.4, 0.8)} w={5} c={P.rojo} dash="16 12" />
      {/* intento de cable directo */}
      <Ap p={ap(t, tCon - 0.2, 0.4) * sal(t, tCru, 0.4)}>
        <D d={R.linea(700, 680, 1220, 680)} w={5} c={P.tinta2} dash="10 10" />
        <Cruz x={960} y={680} s={1} />
        <Etiqueta x={960} y={630} texto="sin conexión eléctrica" c={P.rojo} s={26} />
      </Ap>
      {/* el campo cruza */}
      {t > tCru - 0.2 &&
        [0, 1, 2].map((k) => {
          const q = ((t - tCru) * 0.7 + k / 3) % 1;
          return (
            <path key={k} d={R.arco(880, 480, 40 + q * 170, -40, 40)} stroke={P.azul} strokeWidth={5} fill="none" strokeLinecap="round" opacity={(1 - q) * ap(t, tCru - 0.2, 0.5)} />
          );
        })}
      <Ap p={ap(t, tCru, 0.5)}>
        <Etiqueta x={960} y={640} texto="cruza como campo magnético" c={P.azul} s={26} />
      </Ap>
      <Ap p={ap(t, tNom - 0.1, 0.5)}>
        <T x={960} y={160} s={44} pe={800} c={P.rojo}>
          aislamiento galvánico
        </T>
      </Ap>
      <Mover op={sal(t, tBar - 0.2, 0.4)}>
        <Ap p={ap(t, tPro, 0.6)} s={0.7} ox={1420} oy={470}>
          <Escudo x={1420} y={470} s={1.2} />
          <Etiqueta x={1420} y={600} texto="protege tu seguridad" c={P.azul} s={28} />
        </Ap>
      </Mover>
      <Ap p={ap(t, tBar, 0.6)}>
        <Cargador x={1380} y={480} s={0.75} relleno="#fff" />
        <path d={R.rect(1470, 380, 90, 50, 10)} fill={P.rojo} />
        <T x={1515} y={405} s={30} pe={800} c="#fff">
          $
        </T>
        <Alerta x={1600} y={560} s={0.55} />
        <Etiqueta x={1380} y={680} texto="desconfía de los sospechosamente baratos" c={P.rojo} s={24} />
      </Ap>
    </Lienzo>
  );
};

export {LadrilloEscena as Ladrillo};
