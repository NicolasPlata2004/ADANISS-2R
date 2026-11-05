// S02 · Pantalla táctil capacitiva — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {azar} from '../texturas';
import {Caja, ESP32, Tubo} from '../modelos/Piezas';
import {Arcos, Cil, Esf, Salchicha} from '../modelos/Objetos';
import {BotonAluminio, Dedo, LamparaTactil} from '../modelos/ObjetosS02';
import {TextoPlano, useLienzo} from '../texto3d';
import {Pedestal} from '../modelos/Instrumentos';

const Q = {escala: 0.8} as const;
const CIAN = '#7CF0FF';

// ------------------------------------------------------------------ celular con rejilla visible
const FILAS = 12;
const COLS = 7;
/** Celular acostado (pantalla hacia +y). `rejilla` 0→1 vuelve transparente el vidrio y muestra las pistas. */
const CelularTactil: React.FC<{rejilla?: number; ondas?: {x: number; z: number; t0: number; color?: string}[]; t: number; mapa?: number[][]; filaActiva?: number}> = ({rejilla = 0, ondas = [], t, mapa, filaActiva = -1}) => {
  const tex = useLienzo(
    560,
    1160,
    (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#1C3D6E');
      gr.addColorStop(0.55, '#6B3FA0');
      gr.addColorStop(1, '#E0607E');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.textAlign = 'center';
      g.font = '700 150px Inter, Arial';
      g.fillText('10:24', w / 2, 330);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = 'rgba(255,255,255,0.22)';
        g.beginPath();
        g.roundRect(70 + (i % 4) * 115, 640 + Math.floor(i / 4) * 130, 84, 84, 22);
        g.fill();
      }
    },
    [],
  );
  const W = 2.8;
  const H = 5.98;
  const filasZ = Array.from({length: FILAS}, (_, i) => -H / 2 + (i + 0.5) * (H / FILAS));
  const colsX = Array.from({length: COLS}, (_, j) => -W / 2 + (j + 0.5) * (W / COLS));
  return (
    <group>
      <Caja tam={[3.0, 0.32, 6.2]} pos={[0, 0, 0]} material={M.color('#2A2D31', 0.3, 0.8)} radio={0.15} />
      <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.55 * (1 - 0.85 * rejilla)} roughness={0.08} transparent opacity={1 - 0.8 * rejilla} />
      </mesh>
      {rejilla > 0.01 && (
        <group>
          {filasZ.map((z, i) => (
            <mesh key={`f${i}`} position={[0, 0.2, z]}>
              <boxGeometry args={[W, 0.012, 0.11]} />
              <meshBasicMaterial color={i === filaActiva ? '#FFFFFF' : CIAN} transparent opacity={rejilla * (i === filaActiva ? 1 : 0.55)} toneMapped={false} />
            </mesh>
          ))}
          {colsX.map((x, j) => (
            <mesh key={`c${j}`} position={[x, 0.215, 0]}>
              <boxGeometry args={[0.11, 0.012, H]} />
              <meshBasicMaterial color="#C88BFF" transparent opacity={rejilla * 0.55} toneMapped={false} />
            </mesh>
          ))}
          {mapa &&
            filasZ.map((z, i) =>
              colsX.map((x, j) => {
                const v = mapa[i]?.[j] ?? 0;
                if (v < 0.03) return null;
                const c = new THREE.Color().setHSL(0.62 - 0.62 * v, 0.95, 0.55);
                return (
                  <mesh key={`m${i}-${j}`} position={[x, 0.23 + v * 0.6, z]}>
                    <boxGeometry args={[0.3, v * 1.2, 0.3]} />
                    <meshBasicMaterial color={c} toneMapped={false} />
                  </mesh>
                );
              }),
            )}
        </group>
      )}
      {ondas.map((o, k) => (
        <Arcos key={k} origen={[o.x, 0.2, o.z]} apertura={Math.PI * 2} t={t} t0={o.t0} vel={2.4} n={3} cada={0.18} vida={0.9} color={o.color ?? '#FFFFFF'} />
      ))}
    </group>
  );
};

/** Mapa de calor: para cada cruce, cuánto baja la señal por los dedos cercanos (0→1). */
const mapaDedos = (dedos: {x: number; z: number; f: number}[]) => {
  const W = 2.8;
  const H = 5.98;
  return Array.from({length: FILAS}, (_, i) => {
    const z = -H / 2 + (i + 0.5) * (H / FILAS);
    return Array.from({length: COLS}, (_, j) => {
      const x = -W / 2 + (j + 0.5) * (W / COLS);
      let v = 0;
      for (const d of dedos) v = Math.max(v, d.f * Math.exp(-((x - d.x) ** 2 + (z - d.z) ** 2) / 0.28));
      return v;
    });
  });
};

// ------------------------------------------------------------------ toques: dedo, guante, salchicha, gota
type Toque = {tipo: 'dedo' | 'guante' | 'salchicha' | 'gota'; marca: string; x?: number; z?: number};

const Tocador: React.FC<{tipo: Toque['tipo']; alto: number}> = ({tipo, alto}) => {
  if (tipo === 'dedo') return <Dedo alto={alto} />;
  if (tipo === 'guante') return <Dedo alto={alto + 0.22} guante />;
  if (tipo === 'salchicha')
    return (
      <group position={[0, alto + 0.6, 0]} rotation={[0, 0, Math.PI / 2]} scale={0.95}>
        <group position={[0, -0.62, -1.1]}>
          <Salchicha />
        </group>
      </group>
    );
  return null;
};

export const TocaPantalla3D: React.FC<{toques: Toque[]; rejilla?: string; titulo?: string}> = ({toques, rejilla, titulo}) => {
  const {t, M: m, dur} = useEscena();
  const tR = rejilla ? m(rejilla, 1e9) : 1e9;
  const rej = ap(t, tR, 1.4, easeInOut);
  const ondas: {x: number; z: number; t0: number; color?: string}[] = [];
  const nodos: React.ReactNode[] = [];
  const r = azar(9);
  toques.forEach((q, k) => {
    const t0 = m(q.marca, 1 + k * 3);
    const x = q.x ?? 0.3;
    const z = q.z ?? 0.6;
    if (q.tipo === 'gota') {
      const caida = clamp01((t - t0 + 0.6) / 0.6);
      const y = 6 * (1 - caida * caida);
      if (t > t0 - 0.6) {
        nodos.push(
          <Esf key={`g${k}`} r={0.32} pos={[x, 0.2 + Math.max(0, y), z]} esc={t >= t0 ? [1.6, 0.35, 1.6] : [1, 1.2, 1]} mat={M.vidrio()} seg={24} />,
        );
      }
      for (let i = 0; i < 4; i++) ondas.push({x: x + (r() - 0.5) * 1.6, z: z + (r() - 0.5) * 3, t0: t0 + 0.3 + i * 0.55, color: '#FFB547'});
      return;
    }
    const tNext = k + 1 < toques.length ? m(toques[k + 1].marca, t0 + 3) : dur + 1;
    // la salchicha se queda tocando la pantalla hasta el final (es el protagonista de esa escena)
    const tSube = q.tipo === 'salchicha' && k === toques.length - 1 ? dur + 1 : Math.min(t0 + 1.2, tNext - 1.1);
    const baja = ap(t, t0 - 0.9, 0.8, easeInOut) * (1 - ap(t, tSube, 0.8, easeInOut));
    if (baja > 0.01) {
      const hueco = q.tipo === 'guante' ? 0.0 : 0;
      nodos.push(
        <group key={`t${k}`} position={[x, 0.18, z]}>
          <Tocador tipo={q.tipo} alto={hueco + (1 - baja) * 7} />
        </group>,
      );
    }
    if (q.tipo !== 'guante') ondas.push({x, z, t0: t0, color: q.tipo === 'salchicha' ? '#FFB547' : '#FFFFFF'});
  });
  const cam = orbita([0, 3.4, 0], 16 - rej * 4, 4.2 + rej * 1.5, -24 + t * 1.2, 30);
  const guanteActivo = toques.find((q) => q.tipo === 'guante');
  const tG = guanteActivo ? m(guanteActivo.marca, 1e9) : 1e9;
  const pPant = proyectar([0, 3.6, 0], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Pedestal luz={0.4} />
        <Caja tam={[3.6, 0.5, 2.4]} pos={[0, 0.75, -0.6]} material={M.color('#1E2024', 0.4)} radio={0.1} />
        <Caja tam={[0.5, 4.2, 0.5]} pos={[0, 2.6, -1.6]} rot={[-0.35, 0, 0]} material={M.color('#1E2024', 0.4)} radio={0.1} />
        <group position={[0, 3.5, -0.4]} rotation={[1.05, 0, 0]}>
          <CelularTactil t={t} rejilla={rej} ondas={ondas} />
          {nodos}
        </group>
      </Estudio>
      {guanteActivo && <TituloGrande texto="✕" p={ap(t, tG, 0.3) * sal(t, tG + 1.6, 0.3)} y={pPant.y - 160} />}
      {titulo && <TituloGrande texto={titulo} p={ap(t, 0.2, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ capas de la pantalla (despiece)
export const CapasPantalla3D: React.FC<{heroe?: boolean}> = ({heroe = false}) => {
  const {t, M: m, dur} = useEscena();
  const tV = m('vidrio', 0.6);
  const tI = m('ito', 4.5);
  const tF = m('filas', 8.5);
  const tC = m('columnas', 10.0);
  const tA = m('aislante', 11.5);
  const tX = m('cruce', 13.5);
  const tN = m('cientos', 18.5);
  const abre = heroe ? 0.6 + 0.4 * Math.sin(t * 0.8) * 0.5 : ap(t, tV - 0.4, 2.2, easeInOut);
  const capas = [
    {nombre: 'vidrio', y: 4.2, color: '#DDEBF2'},
    {nombre: 'filas', y: 3.0, color: CIAN},
    {nombre: 'aislante', y: 2.0, color: '#F2F2F2'},
    {nombre: 'columnas', y: 1.0, color: '#C88BFF'},
    {nombre: 'pantalla', y: 0, color: '#6B3FA0'},
  ];
  const ys = capas.map((c) => 0.6 + mix(c.y * 0.08, c.y, abre));
  const cam = orbita([0, 2.4, 0], heroe ? 15 : 17, heroe ? 7 : 8.5, 30 - t * (heroe ? 6 : 2.2), 30);
  const W = 5.6;
  const H = 9.6;
  const nF = 12;
  const nC = 7;
  const cruce = ap(t, tX, 0.5);
  const todos = ap(t, tN, 1.0);
  const etiquetas = [
    {i: 0, texto: 'vidrio', sub: undefined as string | undefined, p: ap(t, tV, 0.5)},
    {i: 1, texto: 'filas', sub: 'óxido de indio y estaño', p: ap(t, Math.max(tI, tF - 0.2), 0.5)},
    {i: 2, texto: 'película aislante', sub: undefined, p: ap(t, tA, 0.5)},
    {i: 3, texto: 'columnas', sub: undefined, p: ap(t, tC, 0.5)},
    {i: 4, texto: 'pantalla', sub: undefined, p: ap(t, tV + 1.2, 0.5)},
  ];
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
        <Caja tam={[W, 0.25, H]} pos={[0, ys[4], 0]} material={M.color('#1A1030', 0.3)} radio={0.1} />
        <mesh position={[0, ys[4] + 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.3, H - 0.3]} />
          <meshBasicMaterial color="#5B3A9A" toneMapped={false} />
        </mesh>
        <group position={[0, ys[3], 0]}>
          <Caja tam={[W, 0.04, H]} material={M.vidrio()} />
          {Array.from({length: nC}, (_, j) => (
            <mesh key={j} position={[-W / 2 + (j + 0.5) * (W / nC), 0.03, 0]}>
              <boxGeometry args={[0.22, 0.02, H - 0.2]} />
              <meshBasicMaterial color="#C88BFF" toneMapped={false} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
        <group position={[0, ys[2], 0]}>
          <Caja tam={[W, 0.03, H]} material={M.vidrio()} />
        </group>
        <group position={[0, ys[1], 0]}>
          <Caja tam={[W, 0.04, H]} material={M.vidrio()} />
          {Array.from({length: nF}, (_, i) => (
            <mesh key={i} position={[0, 0.03, -H / 2 + (i + 0.5) * (H / nF)]}>
              <boxGeometry args={[W - 0.2, 0.02, 0.22]} />
              <meshBasicMaterial color={CIAN} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          ))}
          {(cruce > 0.01 || todos > 0.01) &&
            Array.from({length: nF}, (_, i) =>
              Array.from({length: nC}, (_, j) => {
                const esCruce = i === 5 && j === 3;
                const op = esCruce ? Math.max(cruce, todos) : todos * 0.8;
                if (op < 0.02) return null;
                return (
                  <mesh key={`${i}-${j}`} position={[-W / 2 + (j + 0.5) * (W / nC), -(ys[1] - ys[3]) / 2, -H / 2 + (i + 0.5) * (H / nF)]}>
                    <sphereGeometry args={[esCruce ? 0.2 : 0.12, 12, 8]} />
                    <meshBasicMaterial color="#FFFFFF" transparent opacity={op} toneMapped={false} />
                  </mesh>
                );
              }),
            )}
        </group>
        <Caja tam={[W + 0.1, 0.12, H + 0.1]} pos={[0, ys[0], 0]} material={M.vidrio()} radio={0.06} />
      </Estudio>
      {!heroe &&
        etiquetas.map((e) => {
          const p = proyectar([W / 2, ys[e.i], H / 2], cam);
          return <EtiquetaGuia key={e.i} desde={p} hacia={{x: p.x + 110, y: p.y - 20}} texto={e.texto} sub={e.sub} p={e.p * sal(t, dur, 0.3)} />;
        })}
      {!heroe && <TituloGrande texto="cientos de cruces = cientos de condensadores" p={todos * sal(t, dur, 0.3)} y={96} />}
      {heroe && <TituloGrande texto="Pantalla táctil capacitiva" sub="capa por capa" p={ap(t, 0.2, 0.5) * sal(t, dur + 0.2, 0.3)} y={80} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ pantalla resistiva (dos láminas que se tocan)
export const Resistiva3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tP = m('presion', 1.5);
  const tU = m('una', 4.0);
  const tPunto = m('punto', 7.0);
  const tC = m('cercania', 11.0);
  const geo = useMemo(() => new THREE.PlaneGeometry(9, 6, 60, 40), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const golpes = [{t0: tP, x: -1.2, z: 0.6}, {t0: tU, x: 1.5, z: -0.8}];
  let px = 0;
  let pz = 0;
  let prof = 0;
  for (const g of golpes) {
    const q = ap(t, g.t0 - 0.4, 0.4, easeInOut) * (1 - ap(t, g.t0 + 1.6, 0.4, easeInOut));
    if (q > prof) {
      prof = q;
      px = g.x;
      pz = g.z;
    }
  }
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const y = base[i * 3 + 1];
    const d2 = (x - px) ** 2 + (y + pz) ** 2;
    pos.setZ(i, -0.55 * prof * Math.exp(-d2 / 0.9));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const lamina = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#E9F1F5', roughness: 0.25, transparent: true, opacity: 0.55, side: THREE.DoubleSide}), []);
  const puntos = useMemo(() => {
    const out: V3[] = [];
    for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) out.push([i * 1.0, 0.85, j * 1.1]);
    return out;
  }, []);
  const contacto = prof > 0.9;
  const cam = orbita([0, 0.8, 0], 15, 7.5, -25 + t * 1.5, 30);
  const lapizY = 1.45 + (1 - prof) * 3.5;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[9.4, 0.35, 6.4]} pos={[0, 0.18, 0]} material={M.color('#20242A', 0.5)} radio={0.06} />
        <Caja tam={[9, 0.04, 6]} pos={[0, 0.4, 0]} material={M.color('#9DB8C7', 0.3, 0.2)} />
        {puntos.map((p, i) => (
          <Esf key={i} r={0.07} pos={[p[0], 0.5, p[2]]} mat={M.plasticoBlanco()} seg={10} />
        ))}
        <mesh geometry={geo} material={lamina} position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow />
        {contacto && <Esf r={0.22} pos={[px, 0.45, pz]} mat={M.emisivo(CIAN, 3)} seg={16} />}
        {prof > 0.01 && (
          <group position={[px, lapizY, pz]} rotation={[0, 0, 0.25]}>
            <Cil r={0.05} r2={0.22} h={0.6} pos={[0, 0.3, 0]} mat={M.plasticoNegro()} />
            <Cil r={0.22} h={5} pos={[0, 3.1, 0]} mat={M.color('#9AA0A6', 0.35, 0.8)} />
          </group>
        )}
      </Estudio>
      <TituloGrande texto="dos láminas que se tocan al apretar" p={ap(t, tP - 0.3, 0.5) * sal(t, tPunto - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un solo punto a la vez" p={ap(t, tPunto, 0.5) * sal(t, tC - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la capacitiva: sin fuerza, solo cercanía" p={ap(t, tC, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ condensador: dos placas, líneas de campo y el dedo que roba campo
type ModoCond = 'placas' | 'dedo' | 'comparar' | 'cerca';
export const Condensador3D: React.FC<{modo?: ModoCond}> = ({modo = 'placas'}) => {
  const {t, M: m, dur} = useEscena();
  const tPiezas = m('piezas', 1.0);
  const tV = m('voltaje', 4.0);
  const tCampo = m('campo', 8.0);
  const tCap = m('capacitancia', 12.0);
  const tDedo = m('roba', modo === 'dedo' ? 6.0 : 1.5);
  const tCambia = m('cambia', 12.0);
  const tGuante = m('guante', 4.0);
  const tSalchicha = m('salchicha', 12.0);
  const cargas = modo === 'placas' ? ap(t, tV, 0.8) : 1;
  const lineas = modo === 'placas' ? ap(t, tCampo - 0.4, 1.4, (x) => x) : 1;
  // altura y tipo del objeto que se acerca
  let yObj = 99;
  let fuerza = 1;
  let tipo: 'dedo' | 'guante' | 'salchicha' = 'dedo';
  if (modo === 'dedo') yObj = mix(8, 1.9, ap(t, tDedo - 2.2, 2.4, easeInOut));
  if (modo === 'cerca') yObj = mix(8, 2.6, ap(t, 0.6, 2.4, easeInOut));
  if (modo === 'comparar') {
    const g = ap(t, tGuante - 1.2, 1.4, easeInOut) * (1 - ap(t, tSalchicha - 2.2, 1.0, easeInOut));
    const s = ap(t, tSalchicha - 1.0, 1.4, easeInOut);
    if (s > 0.01) {
      tipo = 'salchicha';
      yObj = mix(8, 1.9, s);
    } else {
      tipo = 'guante';
      yObj = mix(8, 3.6, g);
      fuerza = 0.25;
    }
  }
  const N = 9;
  const A: V3 = [-0.4, 0.42, 0];
  const curvas = Array.from({length: N}, (_, k) => {
    const d = 0.25 + k * 0.32;
    const rr = 0.4 + d;
    const apex = 0.42 + rr * 0.95;
    const c = clamp01((apex + 1.2 - yObj) / 1.8) * fuerza * (modo === 'placas' ? 0 : 1);
    const pts: V3[] = [];
    const F: V3 = [0, yObj - 0.15, 0];
    const ini: V3 = [-rr, 0.42, 0];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const th = Math.PI * (1 - u);
      const semi: V3 = [rr * Math.cos(th), 0.42 + rr * Math.sin(th) * 0.95, 0];
      const cap: V3 = [mix(ini[0], F[0], u), mix(ini[1], F[1], u) + Math.sin(u * Math.PI) * 0.6, 0];
      pts.push([mix(semi[0], cap[0], c), mix(semi[1], cap[1], c), (k % 3 - 1) * 0.7]);
    }
    return {pts, c, k};
  });
  const capacidad = 1 - curvas.reduce((s, cv) => s + cv.c, 0) / N * 0.85;
  const cam = orbita([0, 2.2, 0], 15, 4.5, -18 + t * 1.6, 32);
  const vivas = curvas.filter((cv) => cv.k / N < lineas);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Caja tam={[8.4, 0.25, 3.2]} pos={[0, 0.12, 0]} material={M.color('#2B2E33', 0.5)} radio={0.06} />
        <Caja tam={[2.9, 0.15, 2.8]} pos={[-1.85, 0.33, 0]} material={M.cobre()} radio={0.04} />
        <Caja tam={[2.9, 0.15, 2.8]} pos={[1.85, 0.33, 0]} material={M.cobre()} radio={0.04} />
        {cargas > 0.01 &&
          [-3, -2.4, -1.8, -1.2, -0.6].map((x, i) => (
            <group key={i}>
              <Esf r={0.13} pos={[x, 0.5, (i % 2) * 0.8 - 0.4]} mat={M.emisivo('#FF5C8A', 2.5 * cargas)} seg={10} />
              <Esf r={0.13} pos={[-x, 0.5, (i % 2) * 0.8 - 0.4]} mat={M.emisivo('#4F8DFF', 2.5 * cargas)} seg={10} />
            </group>
          ))}
        {vivas.map((cv) => (
          <Tubo key={cv.k} puntos={cv.pts} radio={0.035} material={M.emisivo(cv.c > 0.5 ? '#FFB547' : CIAN, 2)} seg={40} />
        ))}
        {yObj < 20 && (
          <group position={[0, yObj - 0.15, 0]}>
            {tipo === 'salchicha' ? (
              <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.62, 0]}>
                <group position={[0, -0.62, -1.1]}>
                  <Salchicha />
                </group>
              </group>
            ) : (
              <Dedo guante={tipo === 'guante'} />
            )}
          </group>
        )}
        <group position={[5.6, 0, -0.5]}>
          <Caja tam={[0.9, 4.2, 0.9]} pos={[0, 2.1, 0]} material={M.vidrio()} radio={0.08} />
          <Caja tam={[0.7, 4.0 * capacidad, 0.7]} pos={[0, 0.1 + 2.0 * capacidad, 0]} material={M.emisivo(capacidad < 0.8 ? '#FFB547' : CIAN, 1.6)} radio={0.06} />
        </group>
      </Estudio>
      {(() => {
        // anclada a media altura del medidor y nunca más arriba de la franja del título
        const p = proyectar([5.6, 3.4, -0.5], cam);
        return <EtiquetaGuia desde={p} hacia={{x: p.x - 70, y: Math.max(270, p.y - 40)}} texto="capacitancia" p={modo === 'placas' ? ap(t, tCap, 0.5) : 1} lado="izq" />;
      })()}
      {modo === 'placas' && <TituloGrande texto="dos placas, un aislante: un condensador" p={ap(t, tPiezas, 0.5) * sal(t, tCampo - 0.3, 0.3)} y={96} />}
      {modo === 'placas' && <TituloGrande texto="hilos de campo eléctrico" p={ap(t, tCampo, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'dedo' && <TituloGrande texto="tu cuerpo es un conductor" sub="por dentro, agua con sal" p={ap(t, m('conductor', 1.0), 0.5) * sal(t, tDedo - 0.6, 0.3)} y={96} />}
      {modo === 'dedo' && <TituloGrande texto="tu dedo se roba campo" p={ap(t, tDedo, 0.5) * sal(t, tCambia - 0.3, 0.3)} y={96} />}
      {modo === 'dedo' && <TituloGrande texto="la capacitancia cambia" p={ap(t, tCambia, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'comparar' && <TituloGrande texto="lana: demasiado lejos" p={ap(t, tGuante, 0.5) * sal(t, tSalchicha - 1.2, 0.3)} y={96} />}
      {modo === 'comparar' && <TituloGrande texto="salchicha: agua con sal, ¡funciona!" p={ap(t, tSalchicha + 0.4, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'cerca' && <TituloGrande texto="te detecta antes de tocar" sub="el celular ignora la señal hasta que estás muy cerca" p={ap(t, 1.5, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ barrido de filas y mapa de calor
export const Barrido3D: React.FC<{modo?: 'barrido' | 'mapa'}> = ({modo = 'barrido'}) => {
  const {t, M: m, dur} = useEscena();
  const tB = m('barrido', 1.0);
  const tCien = m('cien', 8.0);
  const tMenos = m('menos', 1.0);
  const tMapa = m('mapa', 4.0);
  const tCentro = m('centro', 9.0);
  const tDedos = m('dedos', 14.0);
  const tZoom = m('zoom', 18.0);
  const velocidad = modo === 'barrido' ? (t < tCien ? 1.6 : 14) : 14;
  const filaActiva = modo === 'barrido' && t >= tB ? Math.floor((t - tB) * velocidad) % FILAS : -1;
  let dedos: {x: number; z: number; f: number}[] = [];
  if (modo === 'mapa') {
    const f1 = ap(t, tMenos - 0.5, 1.0);
    dedos = [{x: 0.35, z: 0.3, f: f1}];
    const n2 = ap(t, tDedos - 0.3, 0.8);
    if (n2 > 0) {
      const zoom = ap(t, tZoom, 2.4, easeInOut);
      dedos = [
        {x: 0.35 - 0.4 * zoom, z: 0.3 - 1.0 * zoom, f: 1},
        {x: -0.6 + 0.4 * zoom * 0, z: 1.6 + 0.9 * zoom, f: n2},
      ];
      if (t < tZoom) dedos.push({x: 0.9, z: -1.8, f: n2}, {x: -0.9, z: -0.6, f: n2}, {x: 0.2, z: 2.3, f: n2});
    }
  }
  const mapa = modo === 'mapa' ? mapaDedos(dedos).map((fila) => fila.map((v) => v * ap(t, tMapa - 0.3, 0.8))) : undefined;
  const cam = orbita([0, 1.0, 0.3], 9.6, 7.6, -15 + t * 1.2, 30);
  const centro = ap(t, tCentro, 0.5) * (t < tDedos ? 1 : 0);
  const pC = proyectar([0.35, 1.9, 0.3], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[0, 0.3, 0]}>
          <CelularTactil t={t} rejilla={1} mapa={mapa} filaActiva={filaActiva} />
          {centro > 0.01 && (
            <mesh position={[0.35, 1.1, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.28, 0.36, 40]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={centro} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
        {modo === 'barrido' &&
          Array.from({length: COLS}, (_, j) => {
            const x = -1.4 + (j + 0.5) * 0.4;
            const h = filaActiva >= 0 ? 0.6 + 0.15 * Math.sin(t * 20 + j) : 0.1;
            return <Caja key={j} tam={[0.28, h, 0.28]} pos={[x, 0.3 + h / 2, -3.6]} material={M.emisivo('#C88BFF', 1.5)} />;
          })}
      </Estudio>
      {modo === 'barrido' && <TituloGrande texto="fila por fila, escucha las columnas" p={ap(t, tB, 0.5) * sal(t, tCien - 0.3, 0.3)} y={96} />}
      {modo === 'barrido' && <TituloGrande texto="unas cien veces por segundo" p={ap(t, tCien, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'mapa' && <TituloGrande texto="un mapa de calor" p={ap(t, tMapa, 0.5) * sal(t, tCentro - 0.3, 0.3)} y={96} />}
      {modo === 'mapa' && <EtiquetaGuia desde={pC} hacia={{x: pC.x + 150, y: pC.y - 130}} texto="centro calculado" sub="fracciones de milímetro" p={centro} />}
      {modo === 'mapa' && <TituloGrande texto="dos, cinco, diez dedos" p={ap(t, tDedos, 0.5) * sal(t, tZoom - 0.3, 0.3)} y={96} />}
      {modo === 'mapa' && <TituloGrande texto="zoom con dos dedos" p={ap(t, tZoom, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ gota y agua
export const GotaAgua3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tG = m('gota', 1.5);
  const tD = m('descartan', 6.0);
  const tB = m('bajo', 10.0);
  const caida = clamp01((t - tG + 0.7) / 0.7);
  const yG = 6 * (1 - caida * caida);
  const blob = ap(t, tG, 0.4) * (1 - ap(t, tD + 1.2, 0.6));
  const agua = ap(t, tB - 0.6, 1.6, easeInOut);
  const dedos = [{x: -0.5, z: -1.2, f: blob}];
  const mapa = mapaDedos(dedos).map((fila) => fila.map((v) => Math.max(v, agua * (0.75 + 0.2 * Math.sin(t * 3 + v)))));
  const cam = orbita([0, 1.0, 0.3], 9.8, 7.4, -20 + t * 1.2, 30);
  const descarta = ap(t, tD, 0.4) * (1 - ap(t, tB - 0.8, 0.4));
  const pG = proyectar([-0.5, 1.6, -1.2], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[0, 0.3, 0]}>
          <CelularTactil t={t} rejilla={1} mapa={mapa} />
          {t > tG - 0.7 && t < tB && <Esf r={0.35} pos={[-0.5, 0.25 + Math.max(0, yG), -1.2]} esc={t >= tG ? [1.7, 0.3, 1.7] : [1, 1.25, 1]} mat={M.vidrio()} seg={24} />}
        </group>
        {agua > 0.01 && (
          <mesh position={[0, 0.3 + agua * 1.2, 0]}>
            <boxGeometry args={[5, agua * 2.4, 8.4]} />
            <meshPhysicalMaterial color="#4FA3C7" transparent opacity={0.35} roughness={0.05} depthWrite={false} />
          </mesh>
        )}
      </Estudio>
      <EtiquetaGuia desde={pG} hacia={{x: pG.x - 160, y: pG.y - 140}} texto="una gota también roba campo" p={ap(t, tG + 0.4, 0.5) * sal(t, tD - 0.3, 0.3)} lado="izq" />
      <TituloGrande texto="no se comporta como un dedo: descartada" p={descarta} y={96} />
      <TituloGrande texto="bajo el agua: casi ciega" p={ap(t, tB + 0.6, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ botón de papel aluminio con un ESP32
export const BotonAluminio3D: React.FC<{modo?: 'boton' | 'usos'}> = ({modo = 'boton'}) => {
  const {t, M: m, dur} = useEscena();
  const tAl = m('aluminio', 3.0);
  const tT = m('touch', 6.0);
  const tAlto = m('alto', 8.0);
  const tBaja = m('baja', 10.0);
  const tU = m('umbral', 0.8);
  const tP = m('papel', 4.0);
  const tL = m('lampara', 9.0);
  const tPiano = m('piano', 11.0);
  const tDes = m('deslizador', 14.0);
  const acerca =
    modo === 'boton'
      ? ap(t, tBaja - 1.0, 1.2, easeInOut)
      : Math.max(ap(t, tU, 0.8) * (1 - ap(t, tU + 2.0, 0.8)), ap(t, tP + 1.2, 0.8) * (1 - ap(t, tP + 3.6, 0.8)), ap(t, tL, 0.8) * (1 - ap(t, tL + 2.6, 0.8)));
  const lectura = 1 - 0.72 * acerca;
  const papel = modo === 'usos' ? ap(t, tP, 1.0, easeInOut) : 0;
  const lampara = modo === 'usos' ? ap(t, tL + 0.6, 0.3) * (t < tPiano - 0.5 ? 1 : 0) : 0;
  const piano = modo === 'usos' ? ap(t, tPiano - 0.5, 1.0, easeInOut) : 0;
  const cam: Camara = piano > 0.5 ? {pos: [0, 11, 13], obj: [0, 0.5, 0], fov: 30} : {pos: [-2, 10, 14.5], obj: [1.2, 1.2, 0], fov: 30};
  const tecla = Math.floor(Math.max(0, t - tPiano) * 2.2) % 5;
  const desliza = ap(t, tDes, 3.2, (x) => x);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {piano < 0.5 ? (
          <>
            <group position={[-2.2, 0, 0]}>
              <BotonAluminio papel={papel} />
              {modo === 'boton' && t < tAl - 0.2 ? null : (
                <group position={[0, 0.4, 0]}>
                  <Dedo alto={(1 - acerca) * 6 + 0.1} />
                </group>
              )}
            </group>
            <ESP32 pos={[4.6, 0.35, 2.4]} rotY={Math.PI / 2} led={lectura < 0.5 ? 1 : 0} />
            {/* lectura de touchRead (barra) y el umbral (línea roja) */}
            <group position={[4.2, 0, -2.4]}>
              <Caja tam={[0.9, 2.6, 0.9]} pos={[0, 1.3, 0]} material={M.vidrio()} radio={0.08} />
              <Caja tam={[0.7, 2.45 * lectura, 0.7]} pos={[0, 0.07 + 1.225 * lectura, 0]} material={M.emisivo(lectura < 0.5 ? '#FFB547' : CIAN, 1.6)} radio={0.06} />
              {(modo === 'usos' || t > tAlto) && <Caja tam={[1.3, 0.05, 1.3]} pos={[0, 1.2, 0]} material={M.emisivo('#FF5A5F', 2)} />}
              <TextoPlano lineas={[{t: 'touchRead', tam: 120, color: CIAN, mono: true}]} w={2.4} h={0.42} pos={[1.9, 1.78, 0]} estilo={{fondo: '#0B0F14', radio: 30}} op={ap(t, modo === 'usos' ? 0.2 : tT, 0.5)} />
              {(modo === 'usos' || t > tAlto) && <TextoPlano lineas={[{t: 'umbral', tam: 120, color: '#FF7B72'}]} w={1.7} h={0.42} pos={[1.6, 1.2, 0]} estilo={{fondo: '#0B0F14', radio: 30}} />}
            </group>
            {modo === 'usos' && (
              <group position={[8.5, 0, -1]} scale={0.8}>
                <LamparaTactil a={lampara} />
              </group>
            )}
          </>
        ) : (
          <>
            <Caja tam={[12, 0.3, 4.4]} pos={[0, 0.15, 0]} material={M.color('#B98B5A', 0.9)} />
            {Array.from({length: 5}, (_, i) => {
              const activa = t > tDes ? Math.abs(desliza * 4 - i) < 0.6 : i === tecla;
              return (
                <group key={i}>
                  <Caja tam={[1.9, 0.03, 3.4]} pos={[-4.4 + i * 2.2, 0.32, 0]} material={M.color('#D9DDE1', 0.35, 1)} />
                  {activa && (
                    <mesh position={[-4.4 + i * 2.2, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                      <planeGeometry args={[1.9, 3.4]} />
                      <meshBasicMaterial color={CIAN} transparent opacity={0.45} toneMapped={false} />
                    </mesh>
                  )}
                </group>
              );
            })}
            <group position={[t > tDes ? -4.4 + desliza * 8.8 : -4.4 + tecla * 2.2, 0.4, 0.4]}>
              <Dedo alto={t > tDes ? 0.1 : 0.1 + Math.abs(Math.sin((t - tPiano) * 2.2 * Math.PI)) * 1.2} />
            </group>
          </>
        )}
      </Estudio>
      {modo === 'boton' && <TituloGrande texto="touchRead()" sub="nada cerca: número alto · dedo cerca: baja" p={ap(t, tT, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {modo === 'usos' && <TituloGrande texto="si cae bajo el umbral: ¡toque!" p={ap(t, tU, 0.5) * sal(t, tP - 0.3, 0.3)} y={96} />}
      {modo === 'usos' && <TituloGrande texto="funciona a través del papel" p={ap(t, tP + 0.6, 0.5) * sal(t, tL - 0.3, 0.3)} y={96} />}
      {modo === 'usos' && <TituloGrande texto="piano y deslizador de cartón" p={ap(t, tPiano, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ resumen
export const RecapTactil: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tRej = m('rejilla', 0.8);
  const tChip = m('chip', 3.5);
  const tDedo = m('dedo', 6.5);
  const fila = t > tChip ? Math.floor((t - tChip) * 10) % FILAS : -1;
  const dedos = [{x: 0.4, z: 0.5, f: ap(t, tDedo, 0.6)}];
  const cam = orbita([0, 1.2, 0], 13, 8, 20 - t * 2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[0, 0.3, 0]}>
          <CelularTactil t={t} rejilla={ap(t, tRej, 1.0)} filaActiva={fila} mapa={mapaDedos(dedos)} />
          {t > tDedo - 1.2 && (
            <group position={[0.4, 0.2, 0.5]}>
              <Dedo alto={(1 - ap(t, tDedo - 1.2, 1.0, easeInOut)) * 6 + 0.6} />
            </group>
          )}
        </group>
      </Estudio>
      <TituloGrande texto="una rejilla de condensadores" p={ap(t, tRej, 0.5) * sal(t, tChip - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un chip que la barre cien veces por segundo" p={ap(t, tChip, 0.5) * sal(t, tDedo - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un dedo que se roba campo" p={ap(t, tDedo, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
