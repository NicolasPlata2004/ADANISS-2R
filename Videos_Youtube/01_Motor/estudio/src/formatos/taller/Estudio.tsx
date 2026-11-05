// Estudio 3D con aspecto de render: luz de estudio, reflejos de entorno, sombras suaves
// y dos fondos: el tapete de corte verde (como el reel del piezo) o el estudio negro.
import React, {useLayoutEffect, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {texturaTapete} from './texturas';
import {clamp01, easeInOut, mix} from '../../motor/tiempo';

export type V3 = [number, number, number];
export type Camara = {pos: V3; obj: V3; fov?: number};
export type Fondo = 'tapete' | 'negro' | 'agua';

/** Recorrido de cámara: claves [t, duración, pos, objetivo, fov]. */
export type ClaveCam = {t: number; d?: number; pos: V3; obj: V3; fov?: number};
export const camaraEn = (claves: ClaveCam[], t: number): Camara => {
  let pos = claves[0].pos;
  let obj = claves[0].obj;
  let fov = claves[0].fov ?? 30;
  for (const k of claves.slice(1)) {
    const q = easeInOut(clamp01((t - k.t) / (k.d ?? 1.2)));
    if (q <= 0) break;
    pos = pos.map((v, i) => mix(v, k.pos[i], q)) as V3;
    obj = obj.map((v, i) => mix(v, k.obj[i], q)) as V3;
    fov = mix(fov, k.fov ?? fov, q);
  }
  return {pos, obj, fov};
};

/** Órbita suave alrededor de un punto (para planos "producto"). */
export const orbita = (centro: V3, radio: number, altura: number, angGrados: number, fov = 30): Camara => {
  const a = (angGrados * Math.PI) / 180;
  return {pos: [centro[0] + radio * Math.sin(a), centro[1] + altura, centro[2] + radio * Math.cos(a)], obj: centro, fov};
};

const Ajustes: React.FC<{fondo: Fondo; exposicion: number; entorno: number; niebla?: [number, number]}> = ({fondo, exposicion, entorno, niebla}) => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposicion;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    scene.environmentIntensity = entorno;
    scene.background = new THREE.Color(fondo === 'negro' ? '#050607' : fondo === 'agua' ? '#06304A' : '#0F1A15');
    scene.fog =
      fondo === 'negro' ? new THREE.Fog('#050607', 16, 46) : fondo === 'agua' ? new THREE.Fog('#06304A', 10, 75) : new THREE.Fog('#0F1A15', 45, 110);
    if (niebla && scene.fog instanceof THREE.Fog) {
      scene.fog.near = niebla[0];
      scene.fog.far = niebla[1];
    }
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, fondo, exposicion, entorno, niebla?.[0], niebla?.[1]]);
  return null;
};

const ControlCamara: React.FC<Camara> = ({pos, obj, fov = 30}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.lookAt(...obj);
    c.fov = fov;
    c.near = 0.05;
    c.far = 400;
    c.updateProjectionMatrix();
  });
  return null;
};

const Luces: React.FC<{fondo: Fondo; centro: V3}> = ({fondo, centro}) => {
  const clave = useMemo(() => {
    const l = new THREE.DirectionalLight('#FFF6EA', fondo === 'negro' ? 2.4 : 2.1);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const s = l.shadow.camera as THREE.OrthographicCamera;
    s.left = -10;
    s.right = 10;
    s.top = 10;
    s.bottom = -10;
    s.near = 1;
    s.far = 160;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.02;
    return l;
  }, [fondo]);
  useLayoutEffect(() => {
    clave.position.set(centro[0] - 22, centro[1] + 48, centro[2] + 26);
    clave.target.position.set(...centro);
    clave.target.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={clave} />
      <primitive object={clave.target} />
      <hemisphereLight args={['#E8F0FF', fondo === 'negro' ? '#050505' : '#24433A', fondo === 'negro' ? 0.12 : 0.22]} />
      <directionalLight position={[centro[0] + 24, centro[1] + 14, centro[2] - 30]} intensity={fondo === 'negro' ? 1.6 : 0.7} color="#FFD9B0" />
      {fondo === 'negro' && <directionalLight position={[centro[0] - 26, centro[1] + 6, centro[2] - 20]} intensity={1.0} color="#B9D4FF" />}
    </>
  );
};

const Suelo: React.FC<{fondo: Fondo; sombras: boolean}> = ({fondo, sombras}) => {
  if (fondo === 'agua') {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={sombras}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1E3337" roughness={1} metalness={0} />
      </mesh>
    );
  }
  if (fondo === 'negro') {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={sombras}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#060708" roughness={0.55} metalness={0} envMapIntensity={0.25} />
      </mesh>
    );
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={sombras}>
      <planeGeometry args={[90, 90]} />
      <meshStandardMaterial map={texturaTapete(90)} roughness={0.8} metalness={0} />
    </mesh>
  );
};

const Desenfoque: React.FC<{foco: number; apertura: number}> = ({foco, apertura}) => {
  const {gl, scene, camera, size} = useThree();
  const {composer, bokeh} = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const b = new BokehPass(scene, camera, {focus: foco, aperture: apertura, maxblur: 0.008});
    c.addPass(b);
    c.addPass(new OutputPass());
    return {composer: c, bokeh: b};
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => composer.setSize(size.width, size.height), [composer, size.width, size.height]);
  const u = bokeh.uniforms as unknown as Record<string, {value: number}>;
  u.focus.value = foco;
  u.aperture.value = apertura;
  useFrame(() => composer.render(), 1);
  return null;
};

export const Estudio: React.FC<{
  camara: Camara;
  fondo?: Fondo;
  exposicion?: number;
  entorno?: number;
  centroLuz?: V3;
  desenfoque?: {foco: number; apertura: number} | null;
  /** Niebla [cerca, lejos] en unidades de escena (por defecto según el fondo). */
  niebla?: [number, number];
  /** Calidad: escala de render (0.75 = 1440×810 reescalado), antialias y sombras proyectadas en el suelo. */
  escala?: number;
  aa?: boolean;
  sombraSuelo?: boolean;
  children: React.ReactNode;
}> = ({camara, fondo = 'tapete', exposicion = 1.0, entorno = 0.75, centroLuz = [0, 0, 0], desenfoque = null, niebla, escala = 1, aa = true, sombraSuelo = true, children}) => {
  const {width, height} = useVideoConfig();
  const w = Math.round(width * escala);
  const h = Math.round(height * escala);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{width: w, height: h, transform: `scale(${1 / escala})`, transformOrigin: '0 0'}}>
    <ThreeCanvas width={w} height={h} shadows gl={{antialias: aa}} camera={{fov: camara.fov ?? 30, position: camara.pos, near: 0.05, far: 400}}>
      <Ajustes fondo={fondo} exposicion={exposicion} entorno={entorno} niebla={niebla} />
      <ControlCamara {...camara} />
      <Luces fondo={fondo} centro={centroLuz} />
      <Suelo fondo={fondo} sombras={sombraSuelo} />
      {children}
      {desenfoque && <Desenfoque {...desenfoque} />}
    </ThreeCanvas>
    </div>
    </div>
  );
};
