// Insertos 2D del formato mixto (estilo Pizarra, el que te gustó): usos, agenda, gráficas,
// línea de tiempo, esquemas y listas. Las escenas genéricas (Usos, Agenda, Linea, Lista,
// Proximo) reciben sus textos desde el plan.yaml, así sirven para toda la serie.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, Cruz, D, Ejes, Etiqueta, Flecha, Lienzo, P, R, T} from '../../pizarra/kit';
import {Icono2D} from '../iconos2d';
import {FUENTES} from '../../../config/marca';

const Papel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: P.papel}}>
    <Lienzo>{children}</Lienzo>
  </AbsoluteFill>
);

type ItemIcono = {icono: string; texto: string; marca: string};

// ------------------------------------------------------------------ fila de usos con íconos (genérica)
export const Usos: React.FC<{items?: ItemIcono[]}> = ({items = []}) => {
  const {t, M} = useEscena();
  const n = items.length;
  const ancho = Math.min(380, 1600 / Math.max(1, n));
  const x0 = 960 - ((n - 1) * ancho) / 2;
  const tiempos = items.map((it, i) => M(it.marca, 0.5 + i * 2));
  const activo = tiempos.reduce((acc, ti, i) => (t >= ti - 0.2 ? i : acc), -1);
  return (
    <Papel>
      {items.map((it, i) => {
        const x = x0 + i * ancho;
        const p = ap(t, tiempos[i] - 0.25, 0.8, easeInOut);
        const esActivo = i === activo;
        const s = n > 3 ? 0.85 : 1.05;
        return (
          <g key={i}>
            <Ap p={ap(t, tiempos[i] - 0.25, 0.4)} s={0.85} ox={x} oy={420}>
              <circle cx={x} cy={420} r={150 * s} fill={esActivo ? P.azulSuave : '#fff'} stroke={esActivo ? P.azul : P.grisClaro} strokeWidth={4} />
            </Ap>
            <Icono2D nombre={it.icono} x={x} y={420} s={s} p={p} />
            <Ap p={ap(t, tiempos[i] + 0.2, 0.5)}>
              <T x={x} y={640} s={n > 3 ? 30 : 36} pe={700} c={esActivo ? P.azul : P.tinta}>
                {it.texto}
              </T>
            </Ap>
          </g>
        );
      })}
    </Papel>
  );
};

// ------------------------------------------------------------------ agenda numerada (genérica)
export const Agenda: React.FC<{items?: {texto: string; marca: string}[]}> = ({items = []}) => {
  const {t, M} = useEscena();
  return (
    <Papel>
      <Ap p={ap(t, 0, 0.4)}>
        <T x={400} y={230} s={34} pe={600} c={P.tinta2} a="start" ls={4}>
          EN ESTE VIDEO
        </T>
      </Ap>
      {items.map((it, i) => {
        const ti = M(it.marca, 1 + i * 3);
        const y = 350 + i * 150;
        const activo = t >= ti - 0.2 && (i === items.length - 1 || t < M(items[i + 1].marca, 99) - 0.2);
        return (
          <Ap key={i} p={ap(t, ti - 0.25, 0.5)}>
            <circle cx={440} cy={y} r={46} fill={activo ? P.azul : P.tinta} />
            <T x={440} y={y + 2} s={44} pe={800} c="#fff">
              {i + 1}
            </T>
            <T x={520} y={y} s={52} pe={activo ? 800 : 600} a="start" c={activo ? P.tinta : P.tinta2}>
              {it.texto}
            </T>
          </Ap>
        );
      })}
    </Papel>
  );
};

// ------------------------------------------------------------------ solo mientras cambia: fuerza vs voltaje
export const GraficaDinamica: React.FC = () => {
  const {t, M} = useEscena();
  const tA = M('aprieta', 6.3);
  const tE = M('escapa', 8.7);
  const tG = M('golpes', 13.1);
  const tR = M('arroz', 20.4);
  const x0 = 360;
  const w = 1100;
  const u0 = 0.15; // instante en que se aprieta (fracción del eje)
  const fuerza = (u: number) => (u < u0 ? 0 : u < u0 + 0.03 ? (u - u0) / 0.03 : 1);
  const volt = (u: number) => (u < u0 ? 0 : u < u0 + 0.03 ? (u - u0) / 0.03 : Math.exp(-(u - u0 - 0.03) / 0.09));
  const prog = ap(t, tA - 0.3, Math.max(1.5, tE + 2 - tA), (x) => x);
  return (
    <Papel>
      <Ejes x={x0} y={330} w={w} hArriba={150} p={ap(t, 0, 0.5)} etiquetaX="tiempo" />
      <Ejes x={x0} y={700} w={w} hArriba={200} p={ap(t, 0.2, 0.5)} etiquetaX="tiempo" />
      <Ap p={ap(t, 0.3, 0.4)}>
        <T x={x0 - 30} y={250} s={30} pe={700} a="end">
          presión
        </T>
        <T x={x0 - 30} y={600} s={30} pe={700} a="end" c={P.azul}>
          voltaje
        </T>
      </Ap>
      <D d={R.funcion(x0, 330, w, 130, fuerza, 400)} p={prog} w={6} c={P.tinta} />
      <D d={R.funcion(x0, 700, w, 180, volt, 400)} p={prog} w={7} c={P.azul} />
      <Ap p={ap(t, tA, 0.4)}>
        <Etiqueta x={x0 + w * u0 + 10} y={160} texto="aprietas y te quedas quieto" a="start" s={26} c={P.tinta} />
      </Ap>
      <Ap p={ap(t, tE, 0.4)}>
        <Etiqueta x={x0 + w * 0.45} y={560} texto="la carga se escapa: el voltaje desaparece" a="start" s={26} c={P.rojo} />
      </Ap>
      <Ap p={ap(t, tG, 0.5)}>
        <Check x={1560} y={300} />
        <T x={1590} y={300} s={30} pe={700} a="start">
          golpes
        </T>
        <Check x={1560} y={350} />
        <T x={1590} y={350} s={30} pe={700} a="start">
          vibraciones
        </T>
        <Check x={1560} y={400} />
        <T x={1590} y={400} s={30} pe={700} a="start">
          sonido
        </T>
      </Ap>
      <Ap p={ap(t, tR - 0.2, 0.5)}>
        <Cruz x={1560} y={470} s={0.6} w={5} />
        <T x={1590} y={470} s={30} pe={700} a="start" c={P.rojo}>
          pesar arroz
        </T>
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ línea de tiempo (genérica)
export const Linea: React.FC<{hitos?: {anio: string; texto: string; sub?: string; marca: string}[]}> = ({hitos = []}) => {
  const {t, M} = useEscena();
  const x0 = 260;
  const x1 = 1660;
  const y = 470;
  const n = hitos.length;
  const xs = hitos.map((_, i) => x0 + ((x1 - x0) * (i + 0.5)) / n);
  return (
    <Papel>
      <D d={R.linea(x0 - 60, y, x1 + 60, y)} p={ap(t, 0, 1.0, easeInOut)} w={4} c={P.grisClaro} />
      {hitos.map((h, i) => {
        const ti = M(h.marca, 1 + i * 4);
        const p = ap(t, ti - 0.25, 0.6);
        const arriba = i % 2 === 0;
        return (
          <g key={i}>
            <D d={R.linea(x0 - 60, y, xs[i], y)} p={p} w={5} c={P.tinta} />
            <Ap p={p} s={0.6} ox={xs[i]} oy={y}>
              <circle cx={xs[i]} cy={y} r={18} fill={P.azul} />
            </Ap>
            <Ap p={ap(t, ti, 0.5)}>
              <T x={xs[i]} y={arriba ? y - 150 : y + 110} s={64} pe={800} c={P.azul}>
                {h.anio}
              </T>
              <T x={xs[i]} y={arriba ? y - 85 : y + 175} s={34} pe={700}>
                {h.texto}
              </T>
              {h.sub && <Etiqueta x={xs[i]} y={arriba ? y - 45 : y + 215} texto={h.sub} s={24} />}
            </Ap>
          </g>
        );
      })}
    </Papel>
  );
};

// ------------------------------------------------------------------ sonar de Langevin
export const Sonar: React.FC = () => {
  const {t, M, dur} = useEscena();
  const tE = M('emisor', 3.2);
  const tS = M('sonar', 10.0);
  const yAgua = 330;
  const xBarco = 700;
  const sub = {x: 1250, y: 700};
  const ida = (k: number) => {
    const q = t - tE - k * 1.2;
    if (q < 0) return null;
    const r = q * 260;
    return <path key={`i${k}`} d={R.arco(xBarco, yAgua + 10, r, 35, 145)} stroke={P.azul} strokeWidth={5} fill="none" opacity={Math.max(0, 1 - r / 700)} />;
  };
  return (
    <Papel>
      <rect x={0} y={yAgua} width={1920} height={1080 - yAgua} fill={P.azulSuave} opacity={ap(t, 0, 0.6)} />
      <D d={R.funcion(0, yAgua, 1920, 6, (u) => Math.sin(u * 40 + t * 2), 200)} p={ap(t, 0, 0.8)} w={4} c={P.azul} />
      <D d={R.poli([[xBarco - 140, yAgua - 40], [xBarco + 160, yAgua - 40], [xBarco + 110, yAgua + 20], [xBarco - 110, yAgua + 20]], true)} p={ap(t, 0.2, 0.8)} w={6} fill="#fff" />
      <D d={R.rect(xBarco - 40, yAgua - 100, 90, 60, 6)} p={ap(t, 0.4, 0.6)} w={5} fill="#fff" />
      <D d={R.rect(sub.x - 160, sub.y - 40, 320, 80, 40)} p={ap(t, 0.6, 0.8)} w={6} c={P.tinta} fill={P.grisClaro} />
      <D d={R.rect(sub.x - 20, sub.y - 85, 70, 50, 10)} p={ap(t, 0.8, 0.5)} w={5} fill={P.grisClaro} />
      {[0, 1, 2, 3].map(ida)}
      {t > tE + 2.4 &&
        [0, 1].map((k) => {
          const q = t - tE - 2.4 - k * 1.2;
          if (q < 0) return null;
          const r = q * 220;
          return <path key={`v${k}`} d={R.arco(sub.x, sub.y - 40, r, 200, 300)} stroke={P.rojo} strokeWidth={5} fill="none" opacity={Math.max(0, 1 - r / 600)} />;
        })}
      <Ap p={ap(t, tE, 0.5)}>
        <Etiqueta x={xBarco} y={yAgua - 140} texto="emisor de ultrasonido con láminas de cuarzo" s={28} c={P.tinta} />
      </Ap>
      <Ap p={ap(t, tS - 0.2, 0.5) * sal(t, dur + 1, 0.3)}>
        <T x={1500} y={190} s={64} pe={800} c={P.azul}>
          el sonar
        </T>
        <Etiqueta x={1500} y={250} texto="Primera Guerra Mundial" s={26} />
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ polarizar la cerámica
export const Polarizar: React.FC = () => {
  const {t, M} = useEscena();
  const tC = M('campo', 10.4);
  const tN = M('nombre', 16.4);
  const alinea = ap(t, tC + 0.3, 2.2, easeInOut);
  const filas = 5;
  const cols = 9;
  const flechas = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < filas; j++) {
      const x = 620 + i * 85;
      const y = 300 + j * 85;
      const azarAng = ((i * 73 + j * 151) % 360) * (Math.PI / 180);
      const ang = mix(azarAng, -Math.PI / 2, alinea);
      const L = 30;
      flechas.push(
        <g key={`${i}-${j}`} opacity={ap(t, 0.2 + (i + j) * 0.04, 0.4)}>
          <circle cx={x} cy={y} r={38} fill="#fff" stroke={P.grisClaro} strokeWidth={2} />
          <Flecha x1={x - Math.cos(ang) * L} y1={y - Math.sin(ang) * L} x2={x + Math.cos(ang) * L} y2={y + Math.sin(ang) * L} c={alinea > 0.9 ? P.azul : P.tinta} w={5} cabeza={12} />
        </g>,
      );
    }
  return (
    <Papel>
      {flechas}
      <Ap p={ap(t, tC - 0.2, 0.5)}>
        <path d={R.rect(560, 220, 800, 22, 8)} fill={P.rojo} />
        <path d={R.rect(560, 718, 800, 22, 8)} fill={P.azul} />
        <T x={1400} y={231} s={40} pe={800} c={P.rojo} a="start">
          +
        </T>
        <T x={1400} y={729} s={40} pe={800} c={P.azul} a="start">
          −
        </T>
        <Etiqueta x={430} y={480} texto="calor + campo eléctrico fuerte" s={26} a="end" c={P.tinta} />
      </Ap>
      <Ap p={ap(t, 0.5, 0.5) * sal(t, tC, 0.4)}>
        <Etiqueta x={430} y={480} texto="regiones en todas las direcciones" s={26} a="end" c={P.tinta} />
      </Ap>
      <Ap p={ap(t, tN - 0.2, 0.5)}>
        <T x={960} y={830} s={56} pe={800} c={P.azul}>
          polarizada
        </T>
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ protección: resistencia en serie + zener
export const Proteccion: React.FC = () => {
  const {t, M} = useEscena();
  const tP = M('picos', 4.1);
  const tZ = M('zener', 8.7);
  const pz = ap(t, tZ - 0.2, 0.8);
  const pico = (u: number, rec: boolean) => {
    const q = u - 0.12;
    let v = q < 0 ? 0 : 1.9 * Math.exp(-q / 0.08) * Math.cos(2 * Math.PI * 7 * q);
    if (rec) v = Math.max(-0.2, Math.min(1, v));
    return v;
  };
  return (
    <Papel>
      {/* esquema */}
      <Ap p={ap(t, 0, 0.5)}>
        <circle cx={250} cy={360} r={56} fill="#fff" stroke={P.tinta} strokeWidth={5} />
        <T x={250} y={362} s={30} pe={800}>
          piezo
        </T>
      </Ap>
      <D d={R.linea(306, 360, 420, 360)} p={ap(t, 0.2, 0.5)} w={5} />
      <D d={R.zigzag(420, 360, 560, 5, 18, 10)} p={pz} w={5} c={P.azul} />
      <Etiqueta x={490} y={310} texto="resistencia en serie" s={22} c={P.azul} p={pz} />
      <D d={R.linea(560, 360, 760, 360)} p={ap(t, 0.4, 0.5)} w={5} />
      <circle cx={680} cy={360} r={8} fill={P.tinta} opacity={ap(t, 0.5, 0.3)} />
      <D d={R.linea(680, 360, 680, 420)} p={pz} w={5} />
      <D d={R.poli([[650, 480], [710, 480], [680, 425]], true)} p={pz} w={5} c={P.rojo} fill={P.rojoSuave} />
      <D d={R.poli([[645, 420], [715, 420], [722, 410]])} p={pz} w={5} c={P.rojo} />
      <D d={R.linea(680, 480, 680, 540)} p={pz} w={5} />
      <D d={R.linea(650, 540, 710, 540)} p={pz} w={5} />
      <Etiqueta x={735} y={455} texto="zener 3,3 V" a="start" s={22} c={P.rojo} p={pz} />
      <Ap p={ap(t, 0.5, 0.5)}>
        <path d={R.rect(760, 300, 200, 120, 14)} fill="#1C1F22" />
        <T x={860} y={345} s={26} pe={800} c="#fff">
          ESP32
        </T>
        <T x={860} y={385} s={20} pe={500} c="#bbb">
          máx 3,3 V
        </T>
      </Ap>
      {/* señales */}
      <Ejes x={1100} y={420} w={640} hArriba={230} hAbajo={80} p={ap(t, 0.3, 0.5)} />
      <path d={R.linea(1100, 420 - 3.3 * 52, 1740, 420 - 3.3 * 52)} stroke={P.rojo} strokeWidth={4} strokeDasharray="12 8" opacity={ap(t, tP - 0.2, 0.4)} />
      <Ap p={ap(t, tP - 0.2, 0.4)}>
        <Etiqueta x={1750} y={420 - 3.3 * 52} texto="3,3 V" a="start" s={24} c={P.rojo} />
      </Ap>
      <D d={R.funcion(1100, 420, 640, 3.3 * 52 / 1, (u) => pico(u, false) / 1, 400)} p={ap(t, tP, 1.0)} w={5} c={P.gris} op={pz > 0.5 ? 0.6 : 1} />
      <D d={R.funcion(1100, 420, 640, 3.3 * 52, (u) => pico(u, true), 400)} p={ap(t, tZ + 0.4, 1.0)} w={7} c={P.azul} />
      <Ap p={ap(t, tZ + 1.2, 0.5)}>
        <Etiqueta x={1420} y={560} texto="picos recortados a 3,3 V" s={26} c={P.azul} />
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ el programa
const CODIGO = [
  'const int PIEZO = 34;     // entrada analógica',
  'const int UMBRAL = 300;',
  '',
  'void loop() {',
  '  int v = analogRead(PIEZO);',
  '  if (v > UMBRAL) {        // ¡golpe!',
  '    Serial.println(v);     // qué tan fuerte',
  '  }',
  '}',
];
export const Codigo: React.FC = () => {
  const {t, M} = useEscena();
  const tL = M('lees', 2.2);
  const tU = M('umbral', 6.7);
  const tO = M('osc', 11.5);
  const tC = M('campana', 18.7);
  const tA = M('altura', 21.5);
  const linea = t >= tA ? 6 : t >= tU ? 5 : t >= tL ? 4 : -1;
  const q = (u: number) => {
    const z = u - 0.18;
    return z < 0 ? 0.02 * Math.sin(u * 300) : 0.95 * Math.exp(-z / 0.14) * Math.cos(2 * Math.PI * 9 * z);
  };
  return (
    <AbsoluteFill style={{background: P.papel}}>
      <div style={{position: 'absolute', left: 110, top: 170, width: 860, padding: '26px 30px', borderRadius: 22, background: '#16191D', boxShadow: '0 20px 50px rgba(0,0,0,0.18)', fontFamily: FUENTES.mono, fontSize: 27, lineHeight: 1.7, opacity: ap(t, 0, 0.5)}}>
        {CODIGO.map((l, i) => (
          <div key={i} style={{color: i === linea ? '#FFFFFF' : '#9BA5B1', background: i === linea ? 'rgba(76,141,255,0.25)' : 'transparent', borderRadius: 6, padding: '0 8px', whiteSpace: 'pre'}}>
            {l || ' '}
          </div>
        ))}
      </div>
      <Lienzo>
        <Ap p={ap(t, tO - 0.3, 0.5)}>
          <path d={R.rect(1040, 230, 780, 420, 22)} fill="#fff" stroke={P.grisClaro} strokeWidth={3} />
          <Ejes x={1080} y={440} w={700} hArriba={180} hAbajo={180} />
          <path d={R.linea(1080, 440 - 0.45 * 170, 1780, 440 - 0.45 * 170)} stroke={P.rojo} strokeWidth={3} strokeDasharray="10 8" />
          <T x={1775} y={440 - 0.45 * 170 - 22} s={22} pe={600} c={P.rojo} a="end">
            umbral
          </T>
        </Ap>
        <D d={R.funcion(1080, 440, 700, 170, q, 500)} p={ap(t, tO, 1.6)} w={5} c={P.azul} />
        <Ap p={ap(t, tC - 0.2, 0.5)}>
          <Etiqueta x={1430} y={700} texto="sube de golpe, oscila y se apaga: como una campana" s={26} c={P.tinta} />
        </Ap>
        <Ap p={ap(t, tA, 0.5)}>
          <Flecha x1={1240} y1={250} x2={1213} y2={278} c={P.rojo} w={5} />
          <Etiqueta x={1250} y={230} texto="altura del pico = fuerza del golpe" a="start" s={24} c={P.rojo} />
        </Ap>
      </Lienzo>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lista con íconos (genérica)
export const Lista: React.FC<{items?: ItemIcono[]}> = ({items = []}) => {
  const {t, M} = useEscena();
  return (
    <Papel>
      {items.map((it, i) => {
        const ti = M(it.marca, 1 + i * 4);
        const y = 220 + i * (560 / Math.max(1, items.length - 1 || 1));
        return (
          <Ap key={i} p={ap(t, ti - 0.25, 0.5)}>
            <circle cx={470} cy={y} r={70} fill="#fff" stroke={P.grisClaro} strokeWidth={3} />
            <Icono2D nombre={it.icono} x={470} y={y} s={0.45} p={ap(t, ti - 0.25, 0.8)} />
            <T x={590} y={y} s={44} pe={700} a="start">
              {it.texto}
            </T>
          </Ap>
        );
      })}
    </Papel>
  );
};

// ------------------------------------------------------------------ huesos piezoeléctricos
export const Hueso: React.FC = () => {
  const {t, M} = useEscena();
  const tC = M('colageno', 3.9);
  const peso = ap(t, tC + 1.2, 0.8);
  const hueso = `M560 420C500 360 540 300 600 330C620 280 690 300 680 360L1240 360C1230 300 1300 280 1320 330C1380 300 1420 360 1360 420C1420 480 1380 540 1320 510C1300 560 1230 540 1240 480L680 480C690 540 620 560 600 510C540 540 500 480 560 420Z`;
  return (
    <Papel>
      <D d={hueso} p={ap(t, 0, 1.2, easeInOut)} w={6} fill="#F6EFE2" />
      {Array.from({length: 7}, (_, i) => (
        <D key={i} d={R.funcion(700, 380 + i * 12, 520, 6, (u) => Math.sin(u * 30 + i), 120)} p={ap(t, tC + i * 0.1, 0.8)} w={3} c={P.tinta2} />
      ))}
      <Ap p={ap(t, tC, 0.5)}>
        <Etiqueta x={960} y={300} texto="fibras de colágeno" s={28} c={P.tinta} />
      </Ap>
      <Ap p={peso}>
        <Flecha x1={960} y1={160} x2={960} y2={330} w={8} c={P.tinta} />
        <T x={960} y={140} s={30} pe={700}>
          peso
        </T>
        {[760, 860, 1060, 1160].map((x, i) => (
          <T key={x} x={x} y={560 + (i % 2) * 20} s={44} pe={800} c={i % 2 ? P.azul : P.rojo}>
            {i % 2 ? '−' : '+'}
          </T>
        ))}
        <Etiqueta x={960} y={660} texto="pequeñas cargas eléctricas" s={28} c={P.azul} />
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ baldosas en una estación
export const Baldosas: React.FC = () => {
  const {t, M} = useEscena();
  const tF = M('funcionan', 8.4);
  const tC = M('ciudad', 16.2);
  const pasos = [0, 1, 2, 3, 4, 5].map((i) => 1.0 + i * 0.9);
  return (
    <Papel>
      {Array.from({length: 6}, (_, i) => {
        const x = 330 + i * 220;
        const pisada = t > pasos[i] && t < pasos[i] + 0.7;
        return (
          <g key={i} opacity={ap(t, i * 0.1, 0.4)}>
            <path d={R.poli([[x, 640], [x + 200, 640], [x + 230, 760], [x - 30, 760]], true)} fill={pisada ? P.azulSuave : '#fff'} stroke={P.tinta} strokeWidth={4} />
            {t > pasos[i] && <ellipse cx={x + 100} cy={700} rx={34} ry={18} fill={P.tinta2} opacity={Math.max(0, 1 - (t - pasos[i]) / 3)} />}
          </g>
        );
      })}
      {/* el LED que se enciende */}
      <Ap p={ap(t, 0.5, 0.5)}>
        <circle cx={960} cy={380} r={40 + 8 * (t > pasos[0] ? Math.abs(Math.sin(t * 3)) : 0)} fill={t > pasos[0] ? '#FFD34D' : '#fff'} stroke={P.tinta} strokeWidth={5} />
        <Etiqueta x={960} y={460} texto="luces y pantallas pequeñas" s={28} c={P.tinta} />
      </Ap>
      <Ap p={ap(t, tF - 0.2, 0.5)}>
        <T x={960} y={240} s={48} pe={800}>
          funciona... con poca energía
        </T>
      </Ap>
      <Ap p={ap(t, tC - 0.2, 0.5)}>
        {[1500, 1560, 1620, 1680, 1740].map((x, i) => (
          <path key={x} d={R.rect(x, 560 - (i % 3) * 60 - 80, 50, 220 + (i % 3) * 60, 4)} fill="#fff" stroke={P.tinta} strokeWidth={4} />
        ))}
        <Cruz x={1645} y={480} s={3} w={10} />
        <Etiqueta x={1645} y={260} texto="no alcanza para una ciudad" s={26} c={P.rojo} />
      </Ap>
    </Papel>
  );
};

// ------------------------------------------------------------------ próximo episodio (genérica)
export const Proximo: React.FC<{titulo?: string; items?: ItemIcono[]}> = ({titulo = '', items = []}) => {
  const {t, M} = useEscena();
  const n = items.length;
  return (
    <Papel>
      <Ap p={ap(t, 0, 0.5)}>
        <T x={960} y={180} s={28} pe={700} c={P.tinta2} ls={6}>
          PRÓXIMO EPISODIO
        </T>
        <T x={960} y={250} s={64} pe={800}>
          {titulo}
        </T>
      </Ap>
      {items.map((it, i) => {
        const ti = M(it.marca, 1 + i * 2);
        const x = 960 + (i - (n - 1) / 2) * 420;
        const marca = i === 0 ? 'si' : i === 1 ? 'no' : '?';
        return (
          <g key={i}>
            <Ap p={ap(t, ti - 0.25, 0.5)} s={0.8} ox={x} oy={520}>
              <circle cx={x} cy={520} r={140} fill="#fff" stroke={P.grisClaro} strokeWidth={4} />
            </Ap>
            <Icono2D nombre={it.icono} x={x} y={520} s={0.8} p={ap(t, ti - 0.2, 0.8)} />
            <Ap p={ap(t, ti + 0.2, 0.4)}>
              {marca === 'si' && <Check x={x + 110} y={420} s={1.6} />}
              {marca === 'no' && <Cruz x={x + 110} y={420} s={1.1} />}
              {marca === '?' && (
                <T x={x + 115} y={420} s={80} pe={800} c={P.azul}>
                  ?
                </T>
              )}
              <T x={x} y={720} s={36} pe={700}>
                {it.texto}
              </T>
            </Ap>
          </g>
        );
      })}
    </Papel>
  );
};

