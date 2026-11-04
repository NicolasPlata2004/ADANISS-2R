// EP01 · Gancho y analogía del agua (0:00 – 1:25)
import React from 'react';
import {ap, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, Cruz, D, Etiqueta, Flecha, Flujo, Lienzo, Manometro, Medidor, Mover, ondaSeno, P, R, T, temblor} from '../kit';
import {Bateria, Cargador, Enchufe, Reloj, Telefono, Rayo} from '../iconos';
import {Ruta} from '../marco';

// ------------------------------------------------------------------ 0:00 · 7:30, 4 %
export const Alarma: React.FC = () => {
  const {t, M} = useEscena();
  const tCel = M('celular', 4.5);
  const tBat = M('bateria', 6.2);
  const tCon = M('conecta', 8.0);
  const tCar = M('carga', 11.4);
  const mov = ap(t, tCel - 0.4, 0.9, easeInOut);
  const nivel = mix(0.04, 1, ap(t, tCar, 2.8, easeInOut));
  const pct = Math.round(nivel * 100);
  const col = nivel < 0.2 ? P.rojo : P.azul;
  const pCable = ap(t, tCon - 0.2, 0.9, easeInOut);
  return (
    <Lienzo>
      <Mover x={mix(0, -420, mov)} s={mix(1.12, 0.8, mov)} ox={960} oy={460}>
        <Reloj x={960} y={460} p={ap(t, 0, 1.2, easeInOut)} />
        <Ap p={ap(t, 0.9, 0.5)}>
          <T x={960} y={680} s={64} pe={700} mono>
            7:30
          </T>
        </Ap>
      </Mover>
      <Telefono x={1120} y={460} p={ap(t, tCel - 0.2, 1.0, easeInOut)} nivel={t < tBat - 0.2 ? 0 : nivel} texto={t > tBat - 0.2 ? `${pct}%` : undefined} cargando={pCable > 0.95} />
      <D d={`M1800 760C1520 760 1120 820 1120 704`} p={pCable} w={8} c={P.tinta} />
      {pCable > 0.95 && <path d={R.rect(1104, 690, 32, 30, 6)} fill={P.tinta} />}
      <Ap p={ap(t, tBat, 0.5)} s={0.7} ox={1500} oy={430}>
        <T x={1500} y={430} s={150} pe={800} c={col} mono>
          {pct}%
        </T>
        <Etiqueta x={1500} y={530} texto={nivel < 0.99 ? 'batería' : 'listo para el día'} p={1} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ 0:14 · la marea: 100 veces por segundo
export const Marea: React.FC = () => {
  const {t, M} = useEscena();
  const tSen = M('sentido', 4.3);
  const tCien = M('cien', 5.6);
  const tFue = M('fuerza', 7.9);
  const tBat = M('bateria', 11.1);
  const fueraA = sal(t, tFue - 0.2, 0.5);
  const fase = -t * 2 * Math.PI * 0.9;
  const dir = Math.sin(2 * Math.PI * 0.45 * t) >= 0 ? 1 : -1;
  const cuenta = Math.round(100 * ap(t, tCien, 0.9));
  const sube = ap(t, tFue + 0.3, 1.6, easeInOut);
  return (
    <Lienzo>
      <g opacity={fueraA}>
        <Enchufe x={290} y={480} s={0.9} p={ap(t, 0, 1.0, easeInOut)} />
        <D d={R.linea(420, 480, 1640, 480)} p={ap(t, M('piensa', 1.8) - 0.2, 0.8)} w={3} c={P.grisClaro} />
        <D d={ondaSeno(420, 480, 1220, 140, 3.5, fase)} p={ap(t, tSen - 0.2, 1.2, easeInOut)} w={6} c={P.azul} />
        <Ap p={ap(t, tSen + 0.2, 0.5)}>
          <Flecha x1={720 - dir * 90} y1={250} x2={720 + dir * 90} y2={250} c={dir > 0 ? P.azul : P.rojo} w={6} cabeza={22} />
          <Etiqueta x={720} y={310} texto="cambia de sentido" />
        </Ap>
        <Ap p={ap(t, tCien - 0.1, 0.5)} s={0.75} ox={1420} oy={240}>
          <T x={1420} y={235} s={130} pe={800} c={P.azul} mono>
            {cuenta}
          </T>
          <Etiqueta x={1420} y={325} texto="veces por segundo" s={28} />
        </Ap>
      </g>
      <g opacity={ap(t, tFue - 0.1, 0.5)}>
        <Medidor x={760} y={780} h={500} w={56} nivel={sube} c={P.rojo} valor="120–230 V" etiqueta="enchufe" colorValor={P.rojo} />
        <Medidor x={1160} y={780} h={500} w={56} nivel={0.02 * sube} c={P.azul} valor="~4 V" etiqueta="batería" limite={t > tBat ? 0.03 : undefined} />
        <Ap p={ap(t, tFue + 1.2, 0.5)}>
          <T x={1440} y={430} s={72} pe={800} c={P.rojo}>
            ×30 a ×60
          </T>
          <Etiqueta x={1440} y={500} texto="decenas de veces más" s={28} />
        </Ap>
        <Ap p={ap(t, tBat, 0.5)}>
          <Etiqueta x={1260} y={760} texto="su límite" c={P.rojo} a="start" s={24} />
        </Ap>
      </g>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ 0:27 · la cajita que cabe en la mano
export const Cajita: React.FC = () => {
  const {t, M} = useEscena();
  const tCaj = M('cajita', 3.5);
  const tMano = M('mano', 4.4);
  const tDes = M('destruiria', 7.6);
  const tDom = M('domestico', 9.5);
  const tMed = M('medida', 11.3);
  const tRuta = M('ruta', 13.3);
  const tEnc = M('enchufe', 15.6);
  const fuera = sal(t, tRuta - 0.3, 0.6);
  const peligro = ap(t, tDes, 0.4) * sal(t, tDom - 0.2, 0.5);
  const [sx, sy] = temblor(t, 6 * peligro);
  const calma = ap(t, tDom, 0.6);
  return (
    <Lienzo>
      <g opacity={fuera}>
        <Enchufe x={330} y={470} s={0.9} p={ap(t, 0, 0.9, easeInOut)} />
        <Mover x={sx} y={sy}>
          <Telefono x={1600} y={470} s={0.8} p={ap(t, 0.2, 1.0, easeInOut)} nivel={0.6} c={peligro > 0.5 ? P.rojo : P.tinta} />
        </Mover>
        <D d={R.linea(400, 470, 870, 470)} p={ap(t, tCaj + 0.2, 0.6)} w={5} />
        <D d={R.linea(1050, 470, 1510, 470)} p={ap(t, tCaj + 0.5, 0.6)} w={5} />
        <Cargador x={960} y={470} p={ap(t, tCaj - 0.2, 0.9, easeInOut)} />
        <Ap p={ap(t, tMano, 0.5)}>
          <D d={R.poli([[870, 345], [870, 330], [1050, 330], [1050, 345]])} w={3} c={P.tinta2} />
          <Etiqueta x={960} y={295} texto="cabe en tu mano" />
        </Ap>
        {ap(t, tDes - 0.2, 0.5) > 0 && (
          <g opacity={ap(t, tDes - 0.2, 0.5)}>
            <D d={ondaSeno(410, 470, 450, 55, 3, -t * 9)} w={6} c={P.rojo} />
          </g>
        )}
        <g opacity={peligro}>
          <D d="M640 440C760 180 1340 180 1520 420" w={5} c={P.rojo} dash="16 12" />
          <Rayo x={1600} y={300} s={0.8} p={ap(t, tDes + 0.2, 0.4)} />
        </g>
        <g opacity={calma}>
          <D d={R.linea(1060, 470, 1500, 470)} w={7} c={P.azul} />
          <Flujo pts={[[1060, 470], [1500, 470]]} t={t} vel={120} n={7} r={8} />
        </g>
        <Ap p={ap(t, tMed, 0.5)}>
          <Etiqueta x={1280} y={530} texto="justo a la medida" c={P.azul} s={28} />
          <Check x={1280} y={590} p={ap(t, tMed + 0.3, 0.4)} />
        </Ap>
      </g>
      <g opacity={ap(t, tRuta - 0.1, 0.6)}>
        <Ap p={ap(t, tRuta + 0.3, 0.6)}>
          <T x={960} y={330} s={40} pe={500} c={P.tinta2} it>
            la ruta de la energía
          </T>
        </Ap>
        <Ruta y={470} p={ap(t, tRuta, 1.3, easeInOut)} t={t} viajero={t > tEnc - 0.3 ? mix(0, 1, ap(t, tEnc - 0.3, 2.6, easeInOut)) : 0} pEtiquetas={0.9} />
      </g>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ 0:45 · agua en una tubería
export const Tuberia: React.FC = () => {
  const {t, M} = useEscena();
  const tAgua = M('agua', 1.5);
  const tVol = M('voltaje', 3.7);
  const tPre = M('presion', 4.9);
  const tCor = M('corriente', 7.0);
  const tCau = M('caudal', 8.4);
  const agua = ap(t, tAgua, 0.6);
  return (
    <Lienzo>
      {agua > 0 && <path d={R.rect(262, 432, 1396, 116)} fill={P.azulSuave} opacity={agua} />}
      {[455, 490, 525].map((y, k) => (
        <Flujo key={y} pts={[[262, y], [1658, y]]} t={t} vel={210} n={20} r={7} op={agua} desfase={k * 23} resaltarX={t > tCor ? 1250 : undefined} />
      ))}
      <D d={R.linea(260, 430, 1660, 430)} p={ap(t, 0, 1.0, easeInOut)} w={6} />
      <D d={R.linea(260, 550, 1660, 550)} p={ap(t, 0.1, 1.0, easeInOut)} w={6} />
      {/* presión */}
      <D d={R.linea(700, 430, 700, 340)} p={ap(t, tVol - 0.2, 0.4)} w={6} />
      <Manometro x={700} y={300} r={70} valor={0.15 + 0.65 * ap(t, tPre, 1.0, easeInOut)} p={ap(t, tVol, 0.6)} />
      <Ap p={ap(t, tVol, 0.5)}>
        <T x={820} y={250} s={50} pe={700} a="start">
          voltaje
        </T>
      </Ap>
      <Ap p={ap(t, tPre - 0.1, 0.5)}>
        <T x={820} y={312} s={50} pe={700} a="start" c={P.azul}>
          = presión
        </T>
      </Ap>
      <Ap p={ap(t, tPre, 0.5)}>
        <Flecha x1={130} y1={490} x2={240} y2={490} w={8} cabeza={24} />
        <Etiqueta x={185} y={420} texto="empuja" />
      </Ap>
      {/* caudal */}
      <D d={R.linea(1250, 395, 1250, 585)} p={ap(t, tCor - 0.1, 0.5)} w={4} c={P.tinta} dash="10 10" />
      <Ap p={ap(t, tCor, 0.5)}>
        <T x={1250} y={650} s={50} pe={700}>
          corriente
        </T>
      </Ap>
      <Ap p={ap(t, tCau - 0.1, 0.5)}>
        <T x={1250} y={712} s={40} pe={700} c={P.azul}>
          = cuánta agua pasa
        </T>
        <Etiqueta x={1250} y={765} texto="cada segundo" s={26} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ 0:57 · lo que necesita la batería vs. lo que da el enchufe
export const Necesidades: React.FC = () => {
  const {t, M} = useEscena();
  const tPoca = M('poca', 1.3);
  const tSen = M('sentido', 3.4);
  const tEnc = M('enchufe', 6.7);
  const tMucha = M('mucha', 9.0);
  const tVai = M('vaiven', 11.1);
  const tAlt = M('alterna', 14.2);
  const tubo = (x1: number, x2: number, y: number, p: number) => (
    <g>
      {p > 0 && <path d={R.rect(x1, y - 34, x2 - x1, 68)} fill={P.azulSuave} opacity={p} />}
      <D d={R.linea(x1, y - 36, x2, y - 36)} p={p} w={5} />
      <D d={R.linea(x1, y + 36, x2, y + 36)} p={p} w={5} />
    </g>
  );
  return (
    <Lienzo>
      <D d={R.linea(960, 180, 960, 780)} p={ap(t, 0, 0.8)} w={3} c={P.grisClaro} />
      {/* izquierda: batería */}
      <Ap p={ap(t, 0, 0.5)}>
        <Etiqueta x={520} y={180} texto="lo que necesita la batería" s={28} c={P.tinta} />
      </Ap>
      <Bateria x={520} y={270} s={0.8} p={ap(t, 0.2, 0.8, easeInOut)} nivel={0.6} />
      {tubo(300, 740, 450, ap(t, tSen - 0.4, 0.6))}
      <Flujo pts={[[300, 450], [740, 450]]} t={t} vel={70} n={9} r={8} op={ap(t, tSen - 0.2, 0.5)} />
      <Ap p={ap(t, tSen, 0.5)}>
        <Flecha x1={430} y1={375} x2={610} y2={375} c={P.azul} w={6} cabeza={20} />
        <Etiqueta x={520} y={340} texto="siempre en el mismo sentido" s={24} c={P.azul} />
      </Ap>
      <Manometro x={520} y={640} r={64} valor={0.16} p={ap(t, tPoca - 0.1, 0.6)} />
      <Ap p={ap(t, tPoca + 0.1, 0.5)}>
        <T x={520} y={712} s={34} pe={700} c={P.azul}>
          poca presión
        </T>
      </Ap>
      {/* derecha: enchufe */}
      <Ap p={ap(t, tEnc, 0.5)}>
        <Etiqueta x={1400} y={180} texto="lo que da el enchufe" s={28} c={P.tinta} />
      </Ap>
      <Enchufe x={1400} y={262} s={0.62} p={ap(t, tEnc, 0.8, easeInOut)} />
      {tubo(1180, 1620, 450, ap(t, tEnc + 0.2, 0.6))}
      <Flujo pts={[[1180, 450], [1620, 450]]} t={t} n={9} r={8} c={P.rojo} op={ap(t, tEnc + 0.4, 0.5)} vaiven={t > tVai - 0.3 ? 70 * ap(t, tVai - 0.3, 0.6) : 0.001} frec={0.9} />
      <Ap p={ap(t, tVai, 0.5)}>
        <Flecha x1={1400} y1={375} x2={1490} y2={375} c={P.rojo} w={6} cabeza={20} />
        <Flecha x1={1400} y1={375} x2={1310} y2={375} c={P.rojo} w={6} cabeza={20} />
        <Etiqueta x={1400} y={340} texto="va y viene, como una marea" s={24} c={P.rojo} />
      </Ap>
      <Manometro x={1400} y={640} r={64} valor={0.93} c={P.rojo} p={ap(t, tMucha - 0.1, 0.6)} />
      <Ap p={ap(t, tMucha + 0.1, 0.5)}>
        <T x={1400} y={712} s={34} pe={700} c={P.rojo}>
          mucha presión
        </T>
      </Ap>
      <Ap p={ap(t, tAlt - 0.1, 0.5)} s={0.85} ox={1400} oy={790}>
        <path d={R.rect(1215, 762, 370, 58, 29)} fill={P.rojo} />
        <T x={1400} y={791} s={32} pe={700} c="#fff">
          corriente alterna
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ 1:13 · ¿y si fuera solo un cable?
export const SoloUnCable: React.FC = () => {
  const {t, M} = useEscena();
  const tRec = M('recibe', 3.2);
  const tPre = M('presion', 5.6);
  const tNo = M('noesta', 7.7);
  const tTra = M('transformar', 9.8);
  const sufre = ap(t, tPre - 0.2, 0.4) * sal(t, tTra, 0.5);
  const [sx, sy] = temblor(t, 7 * sufre);
  const arreglo = ap(t, tTra, 0.8, easeInOut);
  return (
    <Lienzo>
      <Enchufe x={330} y={470} s={0.9} p={ap(t, 0, 0.9, easeInOut)} />
      <D d={R.linea(400, 470, 1470, 470)} p={ap(t, 0.2, 1.0, easeInOut)} w={5} op={1 - arreglo * 0.0} />
      <Ap p={ap(t, 0.6, 0.5) * sal(t, tRec, 0.4)}>
        <Etiqueta x={935} y={415} texto="solo un cable" s={30} />
      </Ap>
      <g opacity={ap(t, tRec - 0.2, 0.4)}>
        <clipPath id="clipCable">
          <rect x={400} y={300} width={mix(1070, 360, arreglo)} height={340} />
        </clipPath>
        <g clipPath="url(#clipCable)">
          <D d={ondaSeno(400, 470, 1080, 80, 5, -t * 10)} p={ap(t, tRec - 0.2, 1.0)} w={7} c={P.rojo} />
        </g>
      </g>
      <g opacity={arreglo}>
        <path d={R.rect(780, 380, 300, 180, 26)} fill="#fff" stroke={P.azul} strokeWidth={4} strokeDasharray="14 10" />
        <T x={930} y={468} s={96} pe={800} c={P.azul}>
          ?
        </T>
        <D d={R.linea(1090, 470, 1470, 470)} w={7} c={P.azul} />
        <Etiqueta x={930} y={600} texto="transformarla por el camino" c={P.azul} s={28} />
      </g>
      <Mover x={sx} y={sy}>
        <Bateria x={1590} y={470} s={1} p={ap(t, 0.4, 0.9, easeInOut)} nivel={0.55} colorNivel={sufre > 0.5 ? P.rojo : P.azul} c={sufre > 0.5 ? P.rojo : P.tinta} />
      </Mover>
      {sufre > 0.01 &&
        Array.from({length: 8}, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          const r1 = 120 + 10 * Math.sin(t * 20 + k);
          return (
            <path key={k} d={R.linea(1590 + Math.cos(a) * r1, 470 + Math.sin(a) * r1 * 0.7, 1590 + Math.cos(a) * (r1 + 40), 470 + Math.sin(a) * (r1 + 40) * 0.7)}
              stroke={P.rojo} strokeWidth={5} strokeLinecap="round" opacity={sufre} />
          );
        })}
      <Ap p={ap(t, tNo, 0.4) * sal(t, tTra, 0.4)}>
        <Cruz x={1590} y={470} s={2.6} p={ap(t, tNo, 0.6)} w={10} />
        <T x={1590} y={640} s={34} pe={700} c={P.rojo}>
          no está hecha para eso
        </T>
      </Ap>
    </Lienzo>
  );
};
