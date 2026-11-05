// Escenas 3D genéricas que se configuran desde plan.yaml (props): vitrina de objetos,
// línea de tiempo, lista numerada, agenda, código en un portátil y pantalla final.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, clamp01, easeInOut, easeOutBack, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, Estudio, orbita, V3} from '../Estudio';
import {FUENTES, CANAL} from '../../../config/marca';
import {proyectar, TituloGrande} from '../ui';
import {CATALOGO as OBJETOS} from '../modelos/catalogo';
import {Pedestal, Portatil, Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano} from '../texto3d';
import {PiezoDisco} from '../modelos/Piezo';
import {ESP32, Tubo} from '../modelos/Piezas';
import {M} from '../materiales';

const Q = {escala: 0.8} as const;

/** Rótulo centrado sobre un punto proyectado de la escena. */
export const EtiquetaFlotante: React.FC<{x: number; y: number; texto: string; sub?: string; p: number; color?: string; numero?: string; acento?: string; anio?: string; escala?: number}> = ({x, y, texto, sub, p, color = '#FFFFFF', numero, acento = '#7CF0FF', anio, escala = 1}) => {
  if (p <= 0.01) return null;
  const q = clamp01(p);
  y = Math.max(y, (anio ? 290 : 200) + (numero ? 60 : 0));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) translateY(${(1 - q) * 14}px) scale(${escala})`, transformOrigin: '50% 100%', opacity: q, textAlign: 'center', fontFamily: FUENTES.sans, color, textShadow: '0 3px 18px rgba(0,0,0,0.75)', whiteSpace: 'nowrap'}}>
      {numero && <div style={{display: 'inline-block', marginBottom: 8, width: 54, height: 54, lineHeight: '54px', borderRadius: 27, background: acento, color: '#061016', fontWeight: 800, fontSize: 32, textShadow: 'none'}}>{numero}</div>}
      {anio && <div style={{fontSize: 76, fontWeight: 800, color: acento, letterSpacing: '-0.02em', lineHeight: 1}}>{anio}</div>}
      <div style={{fontSize: 38, fontWeight: 800, letterSpacing: '-0.01em'}}>{texto}</div>
      {sub && <div style={{fontSize: 24, fontWeight: 600, opacity: 0.85, marginTop: 2}}>{sub}</div>}
    </div>
  );
};

export type ItemVitrina = {modelo: string; texto: string; sub?: string; marca?: string; anio?: string; numero?: string; escala?: number; props?: Record<string, unknown>};

/**
 * Vitrina: objetos sobre pedestales que aparecen cuando la narración los nombra; la cámara
 * pasa de uno a otro y al final se abre para verlos todos.
 * Con `linea` se vuelve una línea de tiempo (año grabado en el piso) y con `numerado`, una lista.
 */
export const Vitrina: React.FC<{items: ItemVitrina[]; titulo?: string; sub?: string; numerado?: boolean; linea?: boolean; separacion?: number; color?: string}> = ({
  items,
  titulo,
  sub,
  numerado = false,
  linea = false,
  separacion = 10,
  color = '#7CF0FF',
}) => {
  const {t, M: m, dur} = useEscena();
  const n = items.length;
  const xs = items.map((_, i) => (i - (n - 1) / 2) * separacion);
  const reparto = (i: number) => 0.3 + (i * Math.max(1, dur - 2.5)) / n;
  const ts = items.map((it, i) => (it.marca ? m(it.marca, reparto(i)) : reparto(i)));
  let foco = 0;
  for (let i = 1; i < n; i++) foco += ap(t, ts[i] - 0.55, 1.1, easeInOut);
  const xf = xs[0] + foco * separacion;
  const tAbre = ts[n - 1] + 2.8;
  const abre = n > 1 && dur - tAbre > 1.2 ? ap(t, tAbre, 1.6, easeInOut) : 0;
  const deriva = (t / Math.max(dur, 1)) * 1.2;
  const cerca: Camara = {pos: [xf + 2.2 - deriva, 5.6, 16.5], obj: [xf, 2.0, 0], fov: 30};
  const ancho = (n - 1) * separacion + 8;
  const distLejos = Math.max(22, (ancho / 2 / Math.tan((17 * Math.PI) / 180)) * 0.92);
  const lejos: Camara = {pos: [0, distLejos * 0.42, distLejos * 0.9], obj: [0, 1.2, 0], fov: 34};
  const distActual = mix(17, distLejos, abre);
  const cam: Camara = {pos: cerca.pos.map((v, i) => mix(v, lejos.pos[i], abre)) as V3, obj: cerca.obj.map((v, i) => mix(v, lejos.obj[i], abre)) as V3, fov: mix(30, 34, abre)};
  const enfocado = (i: number) => clamp01(1 - Math.abs(foco - i)) * (1 - abre) + abre;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[xf * (1 - abre), 1.5, 0]} niebla={[distActual + 2, distActual + 34]} {...Q}>
        {linea && (
          <mesh position={[0, 0.02, -4.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[xs[n - 1] - xs[0] + 8, 0.12]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
          </mesh>
        )}
        {items.map((it, i) => {
          const f = OBJETOS[it.modelo];
          const ap0 = ap(t, ts[i] - 0.35, 0.8, easeOutBack);
          const activo = ap(t, ts[i], 0.4) * enfocado(i);
          const C = f?.C;
          return (
            <group key={i}>
              <Pedestal pos={[xs[i], 0, 0]} luz={activo} color={color} />
              {C && ap0 > 0.01 && (
                <group position={[xs[i], 0.5, 0]} scale={(it.escala ?? f.escala ?? 1) * ap0}>
                  <C t={Math.max(0, t - ts[i])} a={activo} {...(it.props ?? {})} />
                </group>
              )}
            </group>
          );
        })}
      </Estudio>
      {items.map((it, i) => {
        const f = OBJETOS[it.modelo];
        const p0 = proyectar([xs[i], 0.5 + (f?.alto ?? 3) * (it.escala ?? f?.escala ?? 1) + 0.9, 0], cam);
        const p = {x: p0.x, y: p0.y - (i % 2) * 90 * abre};
        return (
          <EtiquetaFlotante
            key={i}
            x={p.x}
            y={p.y}
            texto={it.texto}
            sub={abre > 0.6 ? undefined : it.sub}
            escala={1 - 0.28 * abre}
            p={ap(t, ts[i] - 0.1, 0.5) * (0.15 + 0.85 * enfocado(i))}
            numero={it.numero !== undefined ? it.numero || undefined : numerado ? String(i + 1) : undefined}
            acento={color}
            anio={it.anio}
          />
        );
      })}
      {titulo && <TituloGrande texto={titulo} sub={sub} p={ap(t, 0.1, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

/** Agenda: el objeto principal gira en su pedestal mientras aparecen los temas del video. */
export const Agenda3D: React.FC<{modelo?: string; items: {texto: string; marca?: string}[]}> = ({modelo = 'piezo', items}) => {
  const {t, M: m, dur} = useEscena();
  const f = OBJETOS[modelo];
  const cam = orbita([2.2, 1.6, 0], 13, 4.2, -30 + t * 7, 30);
  const C = f?.C;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[3, 1, 0]} {...Q}>
        <Pedestal pos={[4.4, 0, 0]} luz={0.6} />
        {C && (
          <group position={[4.4, 0.5, 0]} rotation={[0, t * 0.5, 0]} scale={f.escala ?? 1}>
            <C t={t} a={1} />
          </group>
        )}
      </Estudio>
      <div style={{position: 'absolute', left: 110, top: 250, display: 'flex', flexDirection: 'column', gap: 26}}>
        {items.map((it, i) => {
          const ti = it.marca ? m(it.marca, 0.6 + i * 2.2) : 0.6 + i * 2.2;
          const q = ap(t, ti - 0.2, 0.5) * sal(t, dur, 0.3);
          if (q <= 0.01) return null;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: q, transform: `translateX(${(1 - q) * -30}px)`, fontFamily: FUENTES.sans}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: '#7CF0FF', color: '#061016', fontSize: 34, fontWeight: 800, lineHeight: '64px', textAlign: 'center'}}>{i + 1}</div>
              <div style={{fontSize: 40, fontWeight: 800, color: '#FFFFFF', textShadow: '0 3px 18px rgba(0,0,0,0.7)', maxWidth: 700}}>{it.texto}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Código en un portátil, con el ESP32 y el piezo al lado y un osciloscopio que muestra la señal. */
export const Codigo3D: React.FC<{lineas: string[]; resaltar?: {linea: number; marca: string}[]; osc?: string; campana?: string; altura?: string}> = ({lineas, resaltar = [], osc = 'osc', campana = 'campana', altura = 'altura'}) => {
  const {t, M: m, dur} = useEscena();
  let resaltada = -1;
  for (const r of resaltar) if (t >= m(r.marca, 1e9)) resaltada = r.linea;
  const tO = m(osc, dur * 0.45);
  const tC = m(campana, dur * 0.7);
  const tA = m(altura, dur * 0.8);
  const golpes = [tO + 0.6, tO + 3.0, tO + 5.4, tO + 7.8].filter((g) => g < dur);
  const ultimo = golpes.filter((g) => g <= t).pop() ?? -10;
  const muestras = Array.from({length: 260}, (_, i) => {
    const tt = t - 1.6 + (i / 259) * 1.6;
    const g = golpes.filter((x) => x <= tt).pop();
    if (g === undefined) return 0.015 * Math.sin(i * 1.3);
    const q = tt - g;
    return 0.92 * Math.exp(-q / 0.16) * Math.cos(2 * Math.PI * 7 * q) + 0.012 * Math.sin(i * 1.3);
  });
  const vista = ap(t, tO - 0.6, 1.6, easeInOut);
  const cam: Camara = {
    pos: [mix(-1.5, 6.5, vista), mix(9.5, 8.0, vista), mix(12, 17, vista)],
    obj: [mix(-2.5, 4.0, vista), mix(2.6, 2.2, vista), mix(-3.0, -1.0, vista)],
    fov: 30,
  };
  const golpe = Math.exp(-Math.max(0, t - ultimo) * 6) * (t >= ultimo ? 1 : 0);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[2, 1, -1]} {...Q}>
        <Portatil pos={[-3, 0, -1.5]} rotY={0.25} lineas={lineas} resaltada={resaltada} escritas={1 + ap(t, 0.2, 2.2, (x) => x) * lineas.length} />
        <ESP32 pos={[5.2, 0.35, 2.8]} rotY={Math.PI / 2} led={golpe} />
        <group position={[9.5, 0, 3.2]}>
          <PiezoDisco />
        </group>
        <Tubo puntos={[[9.0, 0.1, 3.0], [8.0, 0.3, 3.4], [6.8, 0.5, 3.6], [6.0, 0.55, 3.2]]} radio={0.05} material={M.color('#C62828', 0.4)} seg={30} />
        <Osciloscopio3D pos={[8.2, 0, -3.2]} rotY={-0.35} muestras={muestras} umbral={0.33} etiquetaUmbral="umbral" titulo="GPIO 34" />
      </Estudio>
      <TituloGrande texto="sube de golpe, oscila y se apaga" p={ap(t, tC - 0.2, 0.5) * sal(t, tA - 0.2, 0.3)} y={96} />
      <TituloGrande texto="altura del pico = fuerza del golpe" p={ap(t, tA, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

/** Pantalla final (10 s): el objeto del episodio gira y quedan los huecos para las tarjetas de YouTube. */
export const Cierre3D: React.FC<{modelo?: string}> = ({modelo = 'piezo'}) => {
  const {t} = useEscena();
  const f = OBJETOS[modelo] ?? OBJETOS.piezo;
  const cam = orbita([0, 1.4, 0], 14, 4.5, t * 9, 30);
  const C = f.C;
  const p = ap(t, 0.2, 0.6);
  return (
    <AbsoluteFill style={{background: '#050607'}}>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <Pedestal luz={0.7} />
        <group position={[0, 0.5, 0]} scale={f.escala ?? 1}>
          <C t={t} a={1} />
        </group>
      </Estudio>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,6,7,0.92) 0%, rgba(5,6,7,0.55) 45%, rgba(5,6,7,0) 70%)'}} />
      <div style={{position: 'absolute', left: 110, top: 150, opacity: p, fontFamily: FUENTES.sans, color: '#fff'}}>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.28em', color: '#7CF0FF'}}>SERIE SENSORES</div>
        <div style={{fontSize: 74, fontWeight: 800, lineHeight: 1.05, marginTop: 14, maxWidth: 820}}>{CANAL.nombre}</div>
        <div style={{fontSize: 30, fontWeight: 600, opacity: 0.8, marginTop: 14}}>{CANAL.lema}</div>
        <div style={{display: 'inline-block', marginTop: 40, padding: '16px 34px', borderRadius: 40, background: '#E5484D', fontSize: 34, fontWeight: 800}}>Suscríbete</div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: 110 + i * 470, top: 640, width: 430, height: 242, borderRadius: 18, border: '3px dashed rgba(255,255,255,0.35)', opacity: p, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FUENTES.sans, fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.55)'}}>
          {i === 0 ? 'siguiente video' : 'lista de la serie'}
        </div>
      ))}
    </AbsoluteFill>
  );
};
