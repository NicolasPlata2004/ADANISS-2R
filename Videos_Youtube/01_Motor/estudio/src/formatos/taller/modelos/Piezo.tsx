// Disco piezoeléctrico (zumbador/sensor de 27 mm): latón + cerámica PZT + electrodo de plata,
// con cables soldados. Se puede doblar (flex), separar en capas (despiece) y ver en corte.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {M} from '../materiales';
import {texturaSombra} from '../texturas';
import type {V3} from '../Estudio';

export const PIEZO = {rLaton: 1.35, rCeram: 1.0, rPlata: 0.92, eLaton: 0.03, eCeram: 0.045, ePlata: 0.01};

/** Disco (tapa superior e inferior con anillos concéntricos + pared) para poder doblarlo
 *  con buenas normales. abierto = radianes que se quitan para ver el corte. */
const discoLathe = (r: number, h: number, segs = 96, abierto = 0) => {
  const theta = Math.PI * 2 - abierto;
  const t0 = abierto > 0 ? abierto / 2 : 0;
  const arriba = new THREE.RingGeometry(0.0001, r, segs, 22, t0, theta);
  arriba.rotateX(-Math.PI / 2);
  arriba.translate(0, h, 0);
  const abajo = new THREE.RingGeometry(0.0001, r, segs, 22, t0, theta);
  abajo.rotateX(Math.PI / 2);
  const pared = new THREE.CylinderGeometry(r, r, h, segs, 1, true, t0 + Math.PI / 2, theta);
  pared.translate(0, h / 2, 0);
  const partes = [arriba, abajo, pared].map((g) => g.toNonIndexed());
  for (const g of partes) g.deleteAttribute('uv');
  return mergeGeometries(partes, false);
};

/** Aplica la curvatura: el borde sube respecto al centro (como un parche que se hunde). */
const doblar = (geo: THREE.BufferGeometry, base: Float32Array, y0: number, flex: number, R: number) => {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const y = base[i * 3 + 1];
    const z = base[i * 3 + 2];
    const r = Math.min(1, Math.hypot(x, z) / R);
    pos.setXYZ(i, x, y + y0 + flex * 0.35 * r * r, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
};

const Capa: React.FC<{r: number; h: number; y0: number; flex: number; material: THREE.Material; corte?: number}> = ({r, h, y0, flex, material, corte = 0}) => {
  const geo = useMemo(() => discoLathe(r, h, 120, corte), [r, h, corte]);
  const base = useMemo(() => new Float32Array((geo.attributes.position as THREE.BufferAttribute).array), [geo]);
  useLayoutEffect(() => doblar(geo, base, y0, flex, PIEZO.rLaton));
  return <mesh geometry={geo} material={material} castShadow receiveShadow />;
};

const Cable: React.FC<{puntos: V3[]; color: string; radio?: number}> = ({puntos, color, radio = 0.065}) => {
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    return new THREE.TubeGeometry(curva, 160, radio, 14, false);
  }, [JSON.stringify(puntos), radio]); // eslint-disable-line react-hooks/exhaustive-deps
  return <mesh geometry={geo} material={M.goma(color)} castShadow receiveShadow />;
};

const Soldadura: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <mesh position={p} scale={[0.16 * s, 0.07 * s, 0.14 * s]} material={M.estano()} castShadow>
    <sphereGeometry args={[1, 20, 14]} />
  </mesh>
);

export const PiezoDisco: React.FC<{
  posicion?: V3;
  flex?: number; // 0 = plano, >0 = doblado
  despiece?: number; // 0..1 separa las capas
  cables?: boolean;
  corte?: number; // radianes abiertos para ver el corte (0 = entero)
  rotY?: number;
}> = ({posicion = [0, 0, 0], flex = 0, despiece = 0, cables = true, corte = 0, rotY = 0}) => {
  const P = PIEZO;
  const yL = 0;
  const yC = P.eLaton + despiece * 0.9;
  const yP = P.eLaton + P.eCeram + despiece * 1.7;
  const topP = yP + P.ePlata;
  const rojoSold: V3 = [0.5, topP + 0.03 + flex * 0.35 * (0.5 / P.rLaton) ** 2, 0.42];
  const negroSold: V3 = [1.12, P.eLaton + 0.03 + flex * 0.35 * (1.18 / P.rLaton) ** 2, 0.62];
  return (
    <group position={posicion} rotation={[0, rotY, 0]}>
      <SombraContacto r={P.rLaton * 1.25} op={0.55} />
      <Capa r={P.rLaton} h={P.eLaton} y0={yL} flex={flex} material={M.laton()} corte={corte} />
      <Capa r={P.rCeram} h={P.eCeram} y0={yC} flex={flex} material={M.ceramica()} corte={corte} />
      <Capa r={P.rPlata} h={P.ePlata} y0={yP} flex={flex} material={M.plata()} corte={corte} />
      {cables && (
        <>
          <Soldadura p={rojoSold} />
          <Soldadura p={negroSold} />
          <Cable color="#B5121B" puntos={[rojoSold, [0.9, rojoSold[1] + 0.14, 1.05], [2.6, 0.2, 2.6], [6, 0.08, 5.2], [14, 0.08, 9]]} />
          <Cable color="#141414" puntos={[negroSold, [1.6, negroSold[1] + 0.12, 1.2], [3.2, 0.12, 2.3], [7, 0.08, 4.4], [15, 0.08, 7.6]]} />
        </>
      )}
    </group>
  );
};

/** Sombra de contacto (oclusión ambiental falsa): oscurece el suelo bajo los objetos. */
export const SombraContacto: React.FC<{r: number; op?: number; y?: number; x?: number; z?: number; escalaZ?: number}> = ({r, op = 0.5, y = 0.004, x = 0, z = 0, escalaZ = 1}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]} scale={[1, escalaZ, 1]} renderOrder={1}>
    <circleGeometry args={[r, 48]} />
    <meshBasicMaterial map={texturaSombra()} transparent opacity={op} depthWrite={false} />
  </mesh>
);

/** Bola de acero. */
export const Bola: React.FC<{p: V3; r?: number}> = ({p, r = 0.42}) => (
  <mesh position={p} material={M.acero()} castShadow>
    <sphereGeometry args={[r, 48, 32]} />
  </mesh>
);

/** Rebote amortiguado: devuelve [altura de la bola, flexión del disco] para el tiempo t. */
export const caidaBola = (t: number, t0: number, alto = 7, apoyo = 0.5) => {
  const g = 980 * 0.06; // gravedad "de cámara lenta"
  const tc = Math.sqrt((2 * (alto - apoyo)) / g);
  const ti = t0 + tc; // impacto
  if (t < t0) return {y: alto, flex: 0, impacto: ti};
  if (t < ti) return {y: alto - 0.5 * g * (t - t0) ** 2, flex: 0, impacto: ti};
  const q = t - ti;
  const v0 = g * tc * 0.35;
  const tv = (2 * v0) / g;
  const y = q < tv ? apoyo + v0 * q - 0.5 * g * q * q : apoyo;
  const flex = Math.exp(-q / 0.22) * Math.cos(2 * Math.PI * 7 * q) * 0.9;
  return {y, flex, impacto: ti};
};
