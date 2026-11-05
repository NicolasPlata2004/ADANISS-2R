// Muestra del formato "Neón 3D" sobre un tramo real de la narración del EP01
// (0:14 – 0:46: la red cambia de sentido, empuja más fuerte, la cajita y la ruta).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {useFuentes} from '../../config/fuentes';
import {ap, clamp01, easeInOut, mix, Plan, sal} from '../../motor/tiempo';
import {NEON} from './tema';
import {EtiquetaNeon, PildoraNeon, SubtitulosNeon} from './ui';

export type PropsNeon = {episodio: string; desde: number; hasta: number; plan?: Plan};

export const calcularNeon: CalculateMetadataFunction<PropsNeon> = async ({props}) => {
  const plan = (await (await fetch(staticFile(`episodios/${props.episodio}/plan.json`))).json()) as Plan;
  return {durationInFrames: Math.round((props.hasta - props.desde) * plan.fps), fps: plan.fps, width: 1920, height: 1080, props: {...props, plan}};
};

type V3 = [number, number, number];
const FOV = 38;

// ------------------------------------------------------------------ material de borde luminoso (Fresnel)
const VS = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FS = `uniform vec3 color; uniform float intensidad; uniform float potencia; uniform float base; uniform float opacidad;
varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), potencia);
  float a = f * intensidad + base; gl_FragColor = vec4(color * a, clamp(a, 0.0, 1.0) * opacidad); }`;

const Fresnel: React.FC<{color: string; intensidad?: number; potencia?: number; base?: number; opacidad?: number}> = ({
  color,
  intensidad = 1.1,
  potencia = 3.0,
  base = 0.0,
  opacidad = 1,
}) => {
  const u = useMemo(
    () => ({
      color: {value: new THREE.Color(color)},
      intensidad: {value: intensidad},
      potencia: {value: potencia},
      base: {value: base},
      opacidad: {value: opacidad},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  u.color.value.set(color);
  u.intensidad.value = intensidad;
  u.potencia.value = potencia;
  u.base.value = base;
  u.opacidad.value = opacidad;
  return (
    <shaderMaterial uniforms={u} vertexShader={VS} fragmentShader={FS} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
  );
};

// ------------------------------------------------------------------ cielo, suelo y bloom
const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const Ambiente: React.FC = () => {
  const {scene} = useThree();
  useLayoutEffect(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 576;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 0, 576);
    grad.addColorStop(0, NEON.cielo1);
    grad.addColorStop(0.55, '#0D1336');
    grad.addColorStop(0.64, '#2A1F55');
    grad.addColorStop(0.7, '#0B1029');
    grad.addColorStop(1, NEON.cielo2);
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 576);
    const r = rand(7);
    for (let k = 0; k < 140; k++) {
      g.fillStyle = `rgba(220,230,255,${0.15 + 0.5 * r()})`;
      const x = r() * 1024;
      const y = r() * 330;
      g.beginPath();
      g.arc(x, y, r() * 1.4 + 0.3, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.fog = new THREE.Fog('#080C22', 14, 34);
    return () => {
      tex.dispose();
    };
  }, [scene]);
  const suelo = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const g = c.getContext('2d')!;
    g.strokeStyle = 'rgba(110,140,255,0.55)';
    g.lineWidth = 2;
    for (let k = 0; k <= 1024; k += 48) {
      g.beginPath();
      g.moveTo(k, 0);
      g.lineTo(k, 1024);
      g.stroke();
      g.beginPath();
      g.moveTo(0, k);
      g.lineTo(1024, k);
      g.stroke();
    }
    const m = g.createRadialGradient(512, 512, 60, 512, 512, 512);
    m.addColorStop(0, 'rgba(0,0,0,0)');
    m.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = m;
    g.fillRect(0, 0, 1024, 1024);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
      <planeGeometry args={[44, 44]} />
      <meshBasicMaterial map={suelo} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
};

const Bloom: React.FC = () => {
  const {gl, scene, camera, size} = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.55, 0.35, 0.22));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, size.width, size.height]);
  useLayoutEffect(() => composer.setSize(size.width, size.height), [composer, size.width, size.height]);
  useFrame(() => composer.render(), 1);
  return null;
};

// ------------------------------------------------------------------ cámara
type Clave = {t: number; d: number; pos: V3; obj: V3};
const camaraEn = (claves: Clave[], t: number) => {
  let pos = claves[0].pos;
  let obj = claves[0].obj;
  for (const k of claves.slice(1)) {
    const q = easeInOut(clamp01((t - k.t) / k.d));
    if (q <= 0) break;
    pos = pos.map((v, i) => mix(v, k.pos[i], q)) as V3;
    obj = obj.map((v, i) => mix(v, k.obj[i], q)) as V3;
  }
  return {pos, obj};
};

const Camara: React.FC<{pos: V3; obj: V3}> = ({pos, obj}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...obj);
    (camera as THREE.PerspectiveCamera).fov = FOV;
    camera.updateProjectionMatrix();
  });
  return null;
};

const proyectar = (p: V3, cam: {pos: V3; obj: V3}) => {
  const c = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.1, 100);
  c.position.set(...cam.pos);
  c.lookAt(...cam.obj);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return {x: (v.x * 0.5 + 0.5) * 1920, y: (-v.y * 0.5 + 0.5) * 1080};
};

// ------------------------------------------------------------------ partículas (electrones)
const Electrones: React.FC<{n: number; pos: (k: number) => V3; color: string; r?: number; op?: number; semilla: number}> = ({n, pos, color, r = 0.045, op = 1}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    for (let k = 0; k < n; k++) {
      tmp.position.set(...pos(k));
      tmp.scale.setScalar(r);
      tmp.updateMatrix();
      ref.current.setMatrixAt(k, tmp.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} visible={op > 0.01}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(1.35)} toneMapped={false} transparent opacity={op * 0.9} />
    </instancedMesh>
  );
};

// ------------------------------------------------------------------ composición
const marcasDe = (plan: Plan | undefined, id: string) => {
  const e = plan?.escenas.find((x) => x.id === id);
  const out: Record<string, number> = {};
  if (!e) return {inicio: 0, m: out};
  for (const [k, v] of Object.entries(e.marcas)) out[k] = e.inicio + v;
  return {inicio: e.inicio, m: out};
};

export const MuestraNeon: React.FC<PropsNeon> = ({plan, desde, hasta}) => {
  useFuentes();
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps + desde; // tiempo absoluto de la narración
  const ma = marcasDe(plan, 'marea').m;
  const cj = marcasDe(plan, 'cajita');
  const mc = cj.m;
  const tSen = ma.sentido ?? 18.6;
  const tCien = ma.cien ?? 19.9;
  const tFue = ma.fuerza ?? 22.3;
  const tBat = ma.bateria ?? 25.5;
  const tCaj0 = cj.inicio || 27.6;
  const tCaj = mc.cajita ?? 31.1;
  const tDes = mc.destruiria ?? 35.1;
  const tDom = mc.domestico ?? 37.0;
  const tMed = mc.medida ?? 38.8;
  const tRuta = mc.ruta ?? 40.8;
  const tEnc = mc.enchufe ?? 43.1;
  const tFin = hasta;

  const claves: Clave[] = [
    {t: 0, d: 1, pos: [-8.2, 2.6, 10], obj: [-5, 0, 0]},
    {t: desde, d: tSen - desde, pos: [-6.6, 1.5, 6.6], obj: [-5, 0, 0]},
    {t: tSen - 0.4, d: 1.4, pos: [-3.6, 1.1, 5.4], obj: [-5.0, 0, 0]},
    {t: tFue - 0.3, d: 1.5, pos: [-6.3, 1.3, 9.8], obj: [-6.3, 0.6, 2.4]},
    {t: tCaj0 - 0.2, d: 1.8, pos: [-0.2, 3.4, 16.5], obj: [-0.2, 0.1, 0]},
    {t: tDes - 0.4, d: 1.4, pos: [1.1, 1.6, 6.6], obj: [0.2, 0, 0]},
    {t: tRuta - 0.2, d: 1.2, pos: [-7.2, 1.7, 7.2], obj: [-7.2, 0, 0]},
    {t: tEnc, d: Math.max(1, tFin - tEnc - 0.6), pos: [5.6, 1.7, 7.2], obj: [6.2, 0, 0]},
  ];
  const cam = camaraEn(claves, t);

  // estados
  const ac = ap(t, tSen - 0.2, 0.8);
  const caos = ap(t, tDes, 0.5) * sal(t, tDom, 0.6);
  const sistema = ap(t, tCaj0 - 0.2, 1.2); // cajita, salida y teléfono
  const salidaOn = ap(t, tCaj + 0.4, 0.8);
  const calma = ap(t, tDom, 0.8);
  const barras = ap(t, tFue - 0.1, 1.6, easeInOut) * sal(t, tCaj0 + 0.4, 0.8);
  const nivel = mix(0.3, 0.9, ap(t, tDom, 6, (x) => x));
  const viaje = t > tEnc - 0.3 ? ap(t, tEnc - 0.3, Math.max(1, tFin - tEnc - 0.4), easeInOut) : -1;

  const rIn = rand(11);
  const baseIn = useMemo(() => Array.from({length: 190}, () => [rIn() * 8.8 - 9.9, Math.sqrt(rIn()) * 0.22, rIn() * Math.PI * 2]), []); // eslint-disable-line react-hooks/exhaustive-deps
  const rOut = rand(23);
  const baseOut = useMemo(() => Array.from({length: 120}, () => [rOut() * 5.5 + 1.15, Math.sqrt(rOut()) * 0.2, rOut() * Math.PI * 2]), []); // eslint-disable-line react-hooks/exhaustive-deps

  const posIn = (k: number): V3 => {
    const [x0, rr, a] = baseIn[k];
    const deriva = (x0 + 9.9 + 0.12 * (t - desde)) % 8.8;
    const amp = 0.45 * ac + 0.8 * caos;
    const x = deriva - 9.9 + amp * Math.sin(2 * Math.PI * 0.85 * t + (caos > 0.1 ? k * 0.7 : 0));
    return [Math.min(-1.05, Math.max(-9.95, x)), rr * Math.cos(a), rr * Math.sin(a)];
  };
  const posOut = (k: number): V3 => {
    const [x0, rr, a] = baseOut[k];
    const x = ((x0 - 1.15 + 0.9 * (t - tCaj)) % 5.5 + 5.5) % 5.5 + 1.15;
    return [x, rr * Math.cos(a), rr * Math.sin(a)];
  };

  const xPulso = viaje >= 0 ? mix(-9.6, 7.4, viaje) : -99;
  const pBar1 = proyectar([-7.6, 1.95, 2.4], cam);
  const pBar2 = proyectar([-5.0, -0.6, 2.4], cam);
  const pIn = proyectar([-2.3, 0.95, 0], cam);
  const pOut = proyectar([2.5, 0.95, 0], cam);
  const pTel = proyectar([7.6, -1.45, 0], cam);
  const pEnc = proyectar([-9.4, 0.8, 0], cam);

  return (
    <AbsoluteFill style={{background: NEON.cielo2}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: FOV, position: [-8, 2.5, 10], near: 0.1, far: 100}}>
        <Camara pos={cam.pos} obj={cam.obj} />
        <Ambiente />
        <Bloom />
        {/* cable de entrada */}
        <mesh position={[-5.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 9, 48, 1, true]} />
          <Fresnel color={caos > 0.3 ? NEON.magenta : NEON.cian} intensidad={1.0 + 0.5 * caos} />
        </mesh>
        <mesh position={[-5.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.31, 0.31, 9, 32, 1, true]} />
          <meshBasicMaterial color={caos > 0.3 ? NEON.magenta : NEON.cianFuerte} transparent opacity={0.07} depthWrite={false} />
        </mesh>
        <Electrones n={190} pos={posIn} color={ac > 0.2 ? NEON.magenta : NEON.cian} semilla={11} r={0.05} />
        {/* barras: enchufe vs batería */}
        <group visible={barras > 0.01}>
          <mesh position={[-7.6, -1.3 + 1.5 * barras, 2.4]}>
            <cylinderGeometry args={[0.55, 0.55, 3.0 * barras + 0.001, 40, 1, true]} />
            <Fresnel color={NEON.magenta} intensidad={1.1} opacidad={barras} />
          </mesh>
          <mesh position={[-7.6, -1.3 + 1.5 * barras, 2.4]}>
            <cylinderGeometry args={[0.53, 0.53, 3.0 * barras + 0.001, 32, 1, false]} />
            <meshBasicMaterial color={NEON.magenta} transparent opacity={0.16 * barras} depthWrite={false} />
          </mesh>
          <mesh position={[-5.0, -1.3 + 0.05 * barras, 2.4]}>
            <cylinderGeometry args={[0.55, 0.55, 0.1 * barras + 0.001, 40, 1, true]} />
            <Fresnel color={NEON.cian} intensidad={1.4} opacidad={barras} />
          </mesh>
          <mesh position={[-5.0, -1.12, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.66, 0.025, 8, 48]} />
            <meshBasicMaterial color={new THREE.Color(NEON.magenta).multiplyScalar(2)} toneMapped={false} transparent opacity={ap(t, tBat, 0.5) * barras} />
          </mesh>
        </group>
        {/* la cajita */}
        <group scale={0.001 + ap(t, tCaj - 0.3, 0.9, easeInOut)} visible={sistema > 0.01}>
          <mesh>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <Fresnel color={caos > 0.3 ? NEON.magenta : NEON.cian} intensidad={0.45} potencia={2.5} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.5, 1.5, 1.5)]} />
            <lineBasicMaterial color={new THREE.Color(caos > 0.3 ? NEON.magenta : NEON.cian).multiplyScalar(1.5)} toneMapped={false} />
          </lineSegments>
          <mesh>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshBasicMaterial color={new THREE.Color(caos > 0.3 ? NEON.magenta : NEON.cian).multiplyScalar(1.1 + 0.3 * Math.sin(t * 6))} toneMapped={false} />
          </mesh>
        </group>
        {/* cable de salida */}
        <mesh position={[3.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={sistema > 0.01}>
          <cylinderGeometry args={[0.3, 0.3, 5.6, 48, 1, true]} />
          <Fresnel color={NEON.cian} intensidad={1.0 * sistema} />
        </mesh>
        <Electrones n={120} pos={posOut} color={NEON.cian} semilla={23} r={0.045} op={salidaOn * mix(0.4, 1, calma)} />
        {/* teléfono */}
        <group position={[7.6, 0.15, 0]} rotation={[0, -0.35, 0]} visible={sistema > 0.01} scale={0.001 + sistema}>
          <mesh>
            <boxGeometry args={[1.05, 2.05, 0.14]} />
            <Fresnel color={caos > 0.4 ? NEON.magenta : NEON.cian} intensidad={0.9} potencia={2.2} />
          </mesh>
          <mesh position={[0, 0.25, 0.08]}>
            <planeGeometry args={[0.46, 0.24]} />
            <meshBasicMaterial color="#0B1230" />
          </mesh>
          <mesh position={[-0.21 + 0.21 * nivel, 0.25, 0.09]}>
            <planeGeometry args={[0.42 * nivel, 0.18]} />
            <meshBasicMaterial color={new THREE.Color(NEON.cian).multiplyScalar(1.3)} toneMapped={false} />
          </mesh>
        </group>
        {/* pulso de energía que recorre la ruta */}
        {viaje >= 0 && (
          <group>
            {[0, 1, 2, 3, 4].map((k) => (
              <mesh key={k} position={[xPulso - k * 0.22, 0, 0]}>
                <sphereGeometry args={[0.16 * (1 - k * 0.17), 20, 20]} />
                <meshBasicMaterial color={new THREE.Color(NEON.cian).multiplyScalar(1.8 - k * 0.3)} toneMapped={false} transparent opacity={1 - k * 0.18} />
              </mesh>
            ))}
          </group>
        )}
      </ThreeCanvas>

      {/* capa 2D */}
      <PildoraNeon x={1440} y={880} valor="100" unidad="veces/s" sub="a cámara lenta" p={ap(t, tCien - 0.1, 0.4) * sal(t, tFue - 0.2, 0.4)} />
      <EtiquetaNeon x={pBar1.x} y={pBar1.y - 40} texto="enchufe · 120–230 V" p={ap(t, tFue + 0.6, 0.5) * barras} color={NEON.magenta} />
      <EtiquetaNeon x={pBar2.x} y={pBar2.y - 30} texto="batería · ~4 V" p={ap(t, tFue + 1.0, 0.5) * barras} color={NEON.cian} />
      <PildoraNeon x={1500} y={880} valor="×30 a ×60" sub="más fuerte" p={ap(t, tFue + 1.4, 0.4) * sal(t, tCaj0 - 0.2, 0.4)} />
      <EtiquetaNeon x={pIn.x} y={pIn.y - 30} texto="alterna · alta tensión" p={ap(t, tDom, 0.5) * sal(t, tRuta - 0.2, 0.4)} color={NEON.magenta} tam={26} />
      <EtiquetaNeon x={pOut.x} y={pOut.y - 30} texto="continua · a la medida" p={ap(t, tMed - 0.4, 0.5) * sal(t, tRuta - 0.2, 0.4)} color={NEON.cian} tam={26} />
      <EtiquetaNeon x={pEnc.x} y={pEnc.y - 40} texto="enchufe" p={ap(t, tRuta + 0.3, 0.5) * sal(t, tEnc + 2.2, 0.5)} />
      <EtiquetaNeon x={pTel.x} y={pTel.y + 20} texto="batería" p={ap(t, tFin - 1.6, 0.5)} color={NEON.cian} />
      {plan && (
        <SubtitulosNeon
          frases={plan.subtitulos.frases}
          desfase={desde}
          resaltar={['sentido', '100', 'decenas', 'cajita', 'mano.', 'destruiría', 'domesticado,', 'medida?', 'energía,', 'enchufe', 'batería.']}
        />
      )}
      {plan && plan.audio && <Audio src={staticFile(plan.audio)} trimBefore={Math.round(desde * fps)} trimAfter={Math.round(hasta * fps)} />}
    </AbsoluteFill>
  );
};
