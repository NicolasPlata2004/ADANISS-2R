// EP01 · Capítulo 1: el sentido (diodos, puente rectificador, condensador) 1:25 – 2:39
import React from 'react';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, Cruz, D, Ejes, Etiqueta, Flecha, Flujo, Lienzo, Mover, P, R, T} from '../kit';
import {Diodo, Gota, Lupa, Tanque, FuenteAlterna, Condensador} from '../iconos';

type Pt = [number, number];

// ------------------------------------------------------------------ puertas de un solo sentido → diodo
export const Puertas: React.FC = () => {
  const {t, M} = useEscena();
  const tPasa = M('pasa', 4.3);
  const tReg = M('regresa', 5.9);
  const tDio = M('diodos', 10.4);
  const tMorf = tDio - 2.2;
  const tubo = sal(t, tMorf, 0.7);
  const abierta = ap(t, tPasa - 0.1, 0.5, easeInOut) * (1 - ap(t, tReg - 0.1, 0.25, easeInOut));
  const ang = -64 * abierta;
  const filas = [442, 480, 518];
  const fluyendo = t > tPasa - 0.2 && t < tReg;
  const bloqueado = t >= tReg;
  return (
    <Lienzo>
      <g opacity={tubo}>
        <path d={R.rect(262, 402, 1396, 156)} fill={P.azulSuave} opacity={ap(t, 0.3, 0.6)} />
        {fluyendo &&
          filas.map((y, k) => <Flujo key={y} pts={[[262, y], [1658, y]]} t={t} vel={230} n={18} r={7} desfase={k * 31} op={ap(t, tPasa - 0.2, 0.3)} />)}
        {!fluyendo &&
          !bloqueado &&
          filas.map((y, k) =>
            Array.from({length: 7}, (_, j) => <circle key={`${k}${j}`} cx={300 + j * 90 + k * 30} cy={y} r={7} fill={P.azul} opacity={ap(t, 0.6, 0.5)} />),
          )}
        {bloqueado &&
          filas.map((y, k) =>
            Array.from({length: 9}, (_, j) => {
              const pila = 986 + j * 19 + (k % 2) * 8;
              const inicio = 1060 + j * 70 + k * 20;
              const x = Math.max(pila, inicio - 260 * (t - tReg));
              const vib = x <= pila + 0.5 ? Math.sin(t * 30 + j + k) * 1.5 : 0;
              return <circle key={`${k}${j}`} cx={x + vib} cy={y} r={7} fill={P.azul} />;
            }),
          )}
        <D d={R.linea(260, 400, 1660, 400)} p={ap(t, 0, 1.0, easeInOut)} w={6} />
        <D d={R.linea(260, 560, 1660, 560)} p={ap(t, 0.1, 1.0, easeInOut)} w={6} />
        <g transform={`rotate(${ang} 960 404)`}>
          <D d={R.rect(952, 404, 16, 148, 6)} p={ap(t, 0.6, 0.6)} w={4} fill={P.tinta} />
        </g>
        <D d={R.rect(930, 538, 18, 20, 3)} p={ap(t, 0.9, 0.4)} w={3} fill={P.tinta} />
        <circle cx={960} cy={404} r={ap(t, 0.6, 0.3) * 9} fill={P.tinta} />
        <Ap p={ap(t, 1.6, 0.5) * sal(t, tPasa, 0.3)}>
          <Flecha x1={1010} y1={340} x2={1150} y2={340} c={P.azul} w={6} />
          <Etiqueta x={1080} y={300} texto="se abre" c={P.azul} />
          <Flecha x1={910} y1={340} x2={770} y2={340} c={P.rojo} w={6} />
          <Etiqueta x={840} y={300} texto="no se abre" c={P.rojo} />
        </Ap>
        <Ap p={ap(t, tPasa, 0.4) * sal(t, tReg, 0.3)}>
          <Etiqueta x={1180} y={350} texto="el flujo pasa" c={P.azul} s={30} />
        </Ap>
        <Ap p={ap(t, tReg + 0.3, 0.4)}>
          <Cruz x={900} y={330} s={1.1} p={ap(t, tReg + 0.3, 0.5)} />
          <Etiqueta x={1180} y={350} texto="no puede regresar" c={P.rojo} s={30} />
        </Ap>
      </g>
      <Ap p={ap(t, tMorf + 0.2, 0.7)} s={0.6} ox={960} oy={480}>
        <Diodo x1={700} y1={480} x2={1220} y2={480} tam={74} w={6} p={ap(t, tMorf + 0.2, 1.0, easeInOut)} relleno={P.azulSuave} />
        <Flujo pts={[[700, 480], [1220, 480]]} t={t} vel={150} n={6} r={8} op={ap(t, tDio, 0.5)} />
      </Ap>
      <Ap p={ap(t, tDio - 0.1, 0.5)}>
        <T x={960} y={300} s={72} pe={800}>
          diodo
        </T>
        <Etiqueta x={960} y={640} texto="la puerta de un solo sentido de la electrónica" s={30} />
      </Ap>
      <Ap p={ap(t, tDio + 0.6, 0.5)}>
        <D d={R.linea(1460, 480, 1520, 480)} w={4} />
        <path d={R.rect(1520, 456, 130, 48, 24)} fill="#fff" stroke={P.tinta} strokeWidth={4} />
        <path d={R.rect(1612, 458, 16, 44)} fill={P.tinta} />
        <D d={R.linea(1650, 480, 1710, 480)} w={4} />
        <Etiqueta x={1585} y={545} texto="así se ve" s={22} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ puente rectificador
const T0: Pt = [900, 300];
const B0: Pt = [900, 640];
const L0: Pt = [730, 470];
const R0: Pt = [1070, 470];
const CAMINO_POS: Pt[] = [[440, 422], [440, 230], [900, 230], T0, R0, [1330, 470], [1330, 790], [650, 790], [650, 470], L0, B0, [900, 710], [440, 710], [440, 518]];
const CAMINO_NEG: Pt[] = [[440, 518], [440, 710], [900, 710], B0, R0, [1330, 470], [1330, 790], [650, 790], [650, 470], L0, T0, [900, 230], [440, 230], [440, 422]];

export const Puente: React.FC = () => {
  const {t, M} = useEscena();
  const tMar = M('marea', 1.7);
  const tSal = M('salir', 3.4);
  const tNom = M('nombre', 6.9);
  const pD = ap(t, 0, 1.4, easeInOut);
  const activo = t > tMar - 0.2;
  const periodo = 2.4;
  const fase = activo ? ((t - tMar) % periodo) / periodo : 0;
  const positivo = fase < 0.5;
  const col = positivo ? P.azul : P.rojo;
  const camino = positivo ? CAMINO_POS : CAMINO_NEG;
  const cable = (pts: Pt[], p = pD) => <D d={R.poli(pts)} p={p} w={4} />;
  const brillo = (d1: boolean) => (activo && d1 ? col : P.tinta);
  const ondaIn = (u: number) => Math.sin(2 * Math.PI * (2 * u));
  return (
    <Lienzo>
      {cable([[440, 422], [440, 230], [900, 230], T0])}
      {cable([[440, 518], [440, 710], [900, 710], B0])}
      {cable([R0, [1330, 470], [1330, 560]])}
      {cable([[1330, 700], [1330, 790], [650, 790], [650, 722]])}
      <D d={`M650 722A12 12 0 0 0 650 698`} p={pD} w={4} />
      {cable([[650, 698], [650, 470], L0])}
      {activo && <D d={R.poli(camino)} w={9} c={col} op={0.22} />}
      <Diodo x1={T0[0]} y1={T0[1]} x2={R0[0]} y2={R0[1]} tam={28} p={pD} c={brillo(positivo)} relleno={activo && positivo ? P.azulSuave : '#fff'} />
      <Diodo x1={B0[0]} y1={B0[1]} x2={R0[0]} y2={R0[1]} tam={28} p={pD} c={brillo(!positivo)} relleno={activo && !positivo ? P.rojoSuave : '#fff'} />
      <Diodo x1={L0[0]} y1={L0[1]} x2={T0[0]} y2={T0[1]} tam={28} p={pD} c={brillo(!positivo)} relleno={activo && !positivo ? P.rojoSuave : '#fff'} />
      <Diodo x1={L0[0]} y1={L0[1]} x2={B0[0]} y2={B0[1]} tam={28} p={pD} c={brillo(positivo)} relleno={activo && positivo ? P.azulSuave : '#fff'} />
      {[T0, B0, L0, R0].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={pD * 8} fill={P.tinta} />
      ))}
      <FuenteAlterna x={440} y={470} p={pD} />
      <g transform="rotate(90 1330 630)">
        <D d={R.zigzag(1260, 630, 1400, 6, 22, 12)} p={pD} w={5} />
      </g>
      <Etiqueta x={1380} y={630} texto="salida" a="start" p={pD} />
      {activo && <Flujo pts={camino} t={t} vel={260} n={26} r={7} c={col} />}
      <Ap p={ap(t, tSal, 0.5)}>
        <Flecha x1={1420} y1={540} x2={1420} y2={720} c={P.azul} w={7} cabeza={22} />
        <Etiqueta x={1460} y={720} texto="siempre en la misma dirección" a="start" c={P.azul} s={26} />
      </Ap>
      {/* entrada y salida en miniatura */}
      <Ap p={ap(t, tMar, 0.5)}>
        <Ejes x={110} y={470} w={220} hArriba={70} hAbajo={70} />
        <D d={R.funcion(110, 470, 220, 60, ondaIn)} w={4} c={P.tinta2} />
        <circle cx={110 + 220 * fase} cy={470 - 60 * ondaIn(fase)} r={9} fill={col} />
        <Etiqueta x={220} y={580} texto="entra: va y viene" s={22} />
      </Ap>
      <Ap p={ap(t, tSal - 0.2, 0.5)}>
        <Ejes x={1460} y={470} w={220} hArriba={110} />
        <D d={R.funcion(1460, 470, 220, 60, (u) => Math.abs(ondaIn(u)))} w={4} c={P.azul} />
        <circle cx={1460 + 220 * fase} cy={470 - 60 * Math.abs(ondaIn(fase))} r={9} fill={col} />
        <Etiqueta x={1570} y={330} texto="sale: siempre positiva" s={22} c={P.azul} />
      </Ap>
      <Ap p={ap(t, tNom - 0.1, 0.5)}>
        <T x={900} y={160} s={52} pe={800}>
          puente rectificador
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ llega en colinas
export const Colinas: React.FC = () => {
  const {t, M} = useEscena();
  const tEmp = M('empujones', 2.1);
  const tCol = M('colinas', 3.7);
  const giro = ap(t, 0.4, 1.1, easeInOut);
  const ciclos = 4;
  const fn = (u: number) => {
    const s = Math.sin(2 * Math.PI * ciclos * u);
    return mix(s, Math.abs(s), giro);
  };
  const x0 = 360;
  const w = 1200;
  const y0 = 600;
  const A = 230;
  const u = clamp01(ap(t, tCol, 2.4, (x) => x));
  return (
    <Lienzo>
      <Ejes x={x0} y={y0} w={w} hArriba={280} hAbajo={giro < 0.95 ? 240 : 0} p={ap(t, 0, 0.6)} etiquetaX="tiempo" />
      <D d={R.funcion(x0, y0, w, A, (v) => Math.sin(2 * Math.PI * ciclos * v))} p={1 - giro} w={4} c={P.gris} dash="10 10" />
      <D d={R.funcion(x0, y0, w, A, fn)} p={ap(t, 0, 0.6)} w={7} c={giro > 0.5 ? P.azul : P.tinta2} />
      <Ap p={ap(t, 0.6, 0.5) * sal(t, tEmp, 0.4)}>
        <Etiqueta x={x0 + w * 0.19} y={y0 + 200} texto="lo que iba hacia atrás…" c={P.rojo} />
        <Etiqueta x={x0 + w * 0.19} y={y0 - 280} texto="…ahora empuja hacia adelante" c={P.azul} />
      </Ap>
      {Array.from({length: 8}, (_, k) => {
        const cx = x0 + (w * (k + 0.5)) / 8;
        return (
          <Ap key={k} p={ap(t, tEmp + k * 0.12, 0.35)}>
            <Flecha x1={cx} y1={y0 + 80} x2={cx} y2={y0 + 20} c={P.azul} w={5} cabeza={14} />
          </Ap>
        );
      })}
      <Ap p={ap(t, tCol, 0.5)}>
        <circle cx={x0 + w * u} cy={y0 - A * fn(u)} r={14} fill={P.tinta} />
        <Etiqueta x={x0 + w * 0.32} y={y0 - A - 50} texto="sube" />
        <Etiqueta x={x0 + w * 0.44} y={y0 - A - 50} texto="baja" />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ el depósito (condensador)
const N_FILTRO = 480;
const filtrado = (() => {
  const out: number[] = [];
  let v = 0;
  const caida = Math.exp(-1 / (N_FILTRO * 0.55));
  for (let k = 0; k <= N_FILTRO; k++) {
    const u = k / N_FILTRO;
    const pico = Math.abs(Math.sin(2 * Math.PI * 4 * u));
    v = Math.max(pico, v * caida);
    out.push(v);
  }
  return out;
})();
const vFiltro = (u: number) => filtrado[Math.round(clamp01(u) * N_FILTRO)];

export const Deposito: React.FC = () => {
  const {t, M} = useEscena();
  const tDep = M('deposito', 1.6);
  const tCim = M('cimas', 3.2);
  const tVal = M('valles', 4.9);
  const tCon = M('condensador', 5.6);
  const tRes = M('resultado', 8.8);
  const x0 = 760;
  const w = 920;
  const y0 = 650;
  const A = 300;
  const u = ap(t, tDep, Math.max(1, tRes - tDep - 0.2), (x) => x);
  const colinas = (v: number) => Math.abs(Math.sin(2 * Math.PI * 4 * v));
  const cargando = colinas(u) >= vFiltro(u) - 0.01 && u > 0 && u < 1;
  const morf = ap(t, tCon - 0.1, 0.8, easeInOut);
  return (
    <Lienzo>
      <Ejes x={x0} y={y0} w={w} hArriba={340} p={ap(t, 0, 0.5)} etiquetaX="tiempo" />
      <D d={R.funcion(x0, y0, w, A, colinas)} w={5} c={t > tRes ? P.gris : P.tinta2} dash={t > tRes ? '10 10' : undefined} />
      {u > 0 && u < 1 && <path d={R.linea(x0 + w * u, y0, x0 + w * u, y0 - 330)} stroke={P.gris} strokeWidth={3} strokeDasharray="6 8" />}
      {u > 0 && <D d={R.funcion(x0, y0, w * u, A, (v) => vFiltro(v * u), 200)} w={5} c={P.azul} op={0.55} />}
      <D d={R.funcion(x0, y0, w, A, vFiltro, 300)} p={ap(t, tRes, 1.4, easeInOut)} w={9} c={P.azul} />
      <Ap p={ap(t, tRes + 0.6, 0.5)}>
        <T x={x0 + w * 0.62} y={y0 - A - 40} s={34} pe={700} c={P.azul}>
          casi constante
        </T>
      </Ap>
      {/* depósito → condensador */}
      <Mover x={mix(0, -40, morf)} y={mix(0, -150, morf)} s={mix(1, 0.55, morf)} ox={430} oy={470}>
        <Tanque x={430} y={470} p={ap(t, tDep - 0.2, 0.8, easeInOut)} nivel={0.12 + 0.8 * vFiltro(u)} t={t} />
        <Ap p={ap(t, tCim, 0.4) * (cargando ? 1 : 0.15)}>
          <Flecha x1={430} y1={250} x2={430} y2={318} c={P.azul} w={6} />
          <Etiqueta x={430} y={220} texto="se llena en las cimas" c={P.azul} s={26} />
        </Ap>
        <Ap p={ap(t, tVal, 0.4) * (!cargando && u > 0 ? 1 : 0.15)}>
          <Flecha x1={540} y1={600} x2={640} y2={600} c={P.tinta} w={6} />
          <Etiqueta x={430} y={680} texto="suelta en los valles" s={26} />
        </Ap>
      </Mover>
      <Ap p={morf}>
        <Condensador x={430} y={560} s={1.1} p={morf} />
        <T x={430} y={720} s={36} pe={800}>
          condensador
        </T>
        <Etiqueta x={430} y={765} texto="de filtrado" s={28} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ corriente continua (con ondulación y presión alta)
export const Continua: React.FC = () => {
  const {t, M} = useEscena();
  const tOnd = M('ondulacion', 4.0);
  const tPre = M('presion', 6.0);
  const tAlt = M('altisima', 9.7);
  const yDC = 430;
  const rojo = ap(t, tAlt, 0.6);
  const rizo = (u: number) => -((u * 12) % 1) * 0.6;
  return (
    <Lienzo>
      <Ap p={ap(t, 0, 0.6)}>
        <T x={960} y={210} s={66} pe={800} c={P.azul}>
          corriente continua
        </T>
      </Ap>
      <D d={R.funcion(300, yDC, 1320, 10, rizo, 600)} p={ap(t, 0.2, 1.2, easeInOut)} w={8} c={rojo > 0.5 ? P.rojo : P.azul} />
      <Ap p={ap(t, tOnd - 0.2, 0.6)}>
        <defs>
          <clipPath id="lupaClip">
            <circle cx={1180} cy={yDC} r={118} />
          </clipPath>
        </defs>
        <circle cx={1180} cy={yDC} r={118} fill="#fff" />
        <g clipPath="url(#lupaClip)">
          <D d={R.funcion(1050, yDC + 10, 260, 70, (u) => -((u * 2.5) % 1) + 0.5, 300)} w={7} c={P.azul} />
        </g>
        <Lupa x={1180} y={yDC} r={120} />
        <Etiqueta x={1180} y={640} texto="de cerca: una leve ondulación" s={28} />
      </Ap>
      <Ap p={ap(t, tPre - 0.1, 0.6)}>
        <D d={R.linea(240, 780, 240, 380)} w={3} />
        <D d={R.linea(300, 772, 860, 772)} w={5} c={P.azul} dash="12 10" />
        <Etiqueta x={880} y={772} texto="lo que aguanta la batería: ~4 V" a="start" c={P.azul} s={26} />
        <Flecha x1={560} y1={760} x2={560} y2={yDC + 18} c={P.rojo} w={6} p={ap(t, tPre + 0.3, 0.8)} />
        <T x={600} y={560} s={44} pe={800} c={P.rojo} a="start">
          170–325 V
        </T>
        <Etiqueta x={600} y={612} texto="casi la misma de la red" a="start" s={26} c={P.rojo} />
      </Ap>
      <Ap p={rojo}>
        <T x={300} y={yDC - 60} s={40} pe={800} c={P.rojo} a="start">
          altísima
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ ojo: el agua es solo una imagen
export const SoloImagen: React.FC = () => {
  const {t, M} = useEscena();
  const tIma = M('imagen', 2.1);
  const tLiq = M('liquido', 4.3);
  const tEne = M('energia', 6.1);
  const tVal = M('vale', 7.9);
  const tTod = M('todo', 10.5);
  const bandas = [];
  if (t > tEne - 0.2) {
    for (let k = 0; k < 4; k++) {
      const x = 900 + ((t * 320 + k * 190) % 760);
      bandas.push(<rect key={k} x={x - 40} y={418} width={80} height={44} rx={22} fill={P.azul} opacity={0.35 * ap(t, tEne - 0.2, 0.5)} />);
    }
  }
  return (
    <Lienzo>
      <Ap p={ap(t, 0, 0.4)} s={0.7} ox={960} oy={220}>
        <T x={960} y={215} s={90} pe={800} c={P.rojo}>
          Ojo
        </T>
      </Ap>
      <Gota x={560} y={440} s={1.5} p={ap(t, 0.4, 0.8, easeInOut)} />
      <Ap p={ap(t, tIma, 0.5)}>
        <path d={R.rect(430, 310, 260, 260, 26)} fill="none" stroke={P.tinta} strokeWidth={3} strokeDasharray="12 10" />
        <Etiqueta x={560} y={610} texto="solo una imagen" s={30} c={P.tinta} />
      </Ap>
      <D d={R.linea(900, 440, 1660, 440)} p={ap(t, tLiq - 0.3, 0.8)} w={26} c={P.grisClaro} />
      <D d={R.linea(900, 418, 1660, 418)} p={ap(t, tLiq - 0.3, 0.8)} w={4} />
      <D d={R.linea(900, 462, 1660, 462)} p={ap(t, tLiq - 0.3, 0.8)} w={4} />
      <Ap p={ap(t, tLiq, 0.4) * sal(t, tEne, 0.4)}>
        {[1020, 1200, 1380, 1560].map((x) => (
          <Gota key={x} x={x} y={442} s={0.3} />
        ))}
        <Cruz x={1290} y={360} s={1.2} p={ap(t, tLiq + 0.3, 0.5)} />
        <Etiqueta x={1290} y={300} texto="no viaja un líquido" c={P.rojo} s={28} />
      </Ap>
      {bandas}
      <Ap p={ap(t, tEne, 0.5)}>
        <T x={1280} y={350} s={44} pe={800} c={P.azul}>
          viaja energía
        </T>
      </Ap>
      <Ap p={ap(t, tVal, 0.5)}>
        <Check x={940} y={590} />
        <T x={980} y={590} s={32} pe={600} a="start">
          presión = voltaje
        </T>
      </Ap>
      <Ap p={ap(t, tVal + 0.6, 0.5)}>
        <Check x={940} y={650} />
        <T x={980} y={650} s={32} pe={600} a="start">
          flujo = corriente
        </T>
      </Ap>
      <Ap p={ap(t, tTod, 0.5)}>
        <Cruz x={940} y={712} s={0.6} w={5} />
        <T x={980} y={712} s={32} pe={600} a="start" c={P.rojo}>
          no para todo
        </T>
      </Ap>
    </Lienzo>
  );
};
