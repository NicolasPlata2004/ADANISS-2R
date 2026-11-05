// Biblioteca de piezas 3D (unidades: cm). Modelos simples pero con materiales realistas.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {M} from '../materiales';
import {azar, texturaPCB, texturaProtoboard} from '../texturas';
import type {V3} from '../Estudio';

// ------------------------------------------------------------------ utilidades
export const Tubo: React.FC<{puntos: V3[]; radio?: number; material: THREE.Material; seg?: number; progreso?: number}> = ({puntos, radio = 0.06, material, seg = 120, progreso = 1}) => {
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    return new THREE.TubeGeometry(curva, seg, radio, 12, false);
  }, [JSON.stringify(puntos), radio, seg]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = geo.index ? geo.index.count : 0;
  useLayoutEffect(() => {
    const q = Math.max(0, Math.min(1, progreso));
    geo.setDrawRange(0, Math.floor((total / 6 / 12) * q) * 6 * 12);
  });
  if (progreso <= 0.001) return null;
  return <mesh geometry={geo} material={material} castShadow receiveShadow />;
};

export const Caja: React.FC<{tam: V3; pos?: V3; rot?: V3; material: THREE.Material; radio?: number}> = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], material, radio = 0}) => {
  const geo = useMemo(() => (radio > 0 ? new RoundedBoxGeometry(tam[0], tam[1], tam[2], 3, radio) : new THREE.BoxGeometry(...tam)), [tam[0], tam[1], tam[2], radio]); // eslint-disable-line react-hooks/exhaustive-deps
  return <mesh geometry={geo} position={pos} rotation={rot} material={material} castShadow receiveShadow />;
};

/** Resorte helicoidal a lo largo de X (se reconstruye con su largo actual). */
export const Resorte3D: React.FC<{x0: number; largo: number; radio?: number; vueltas?: number; grosor?: number}> = ({x0, largo, radio = 0.5, vueltas = 7, grosor = 0.06}) => {
  const geo = useMemo(() => {
    class Helice extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(u: number, out = new THREE.Vector3()) {
        const a = u * vueltas * Math.PI * 2;
        return out.set(x0 + u * largo, radio * Math.sin(a), radio * Math.cos(a));
      }
    }
    return new THREE.TubeGeometry(new Helice(), vueltas * 28, grosor, 8, false);
  }, [x0, Math.round(largo * 100), radio, vueltas, grosor]); // eslint-disable-line react-hooks/exhaustive-deps
  return <mesh geometry={geo} material={M.aceroMate()} castShadow />;
};

/** Chispa: rayo luminoso entre dos puntos (zigzag con brillo). */
export const Chispa: React.FC<{a: V3; b: V3; intensidad: number; semilla?: number}> = ({a, b, intensidad, semilla = 1}) => {
  const geo = useMemo(() => {
    const r = azar(semilla * 97 + Math.round(intensidad * 10));
    const pts: THREE.Vector3[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const p = new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u);
      if (i > 0 && i < n) p.add(new THREE.Vector3(0, (r() - 0.5) * 0.35, (r() - 0.5) * 0.35));
      pts.push(p);
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 6, false);
  }, [JSON.stringify(a), JSON.stringify(b), semilla, Math.round(intensidad * 10)]); // eslint-disable-line react-hooks/exhaustive-deps
  if (intensidad <= 0.02) return null;
  const centro: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={new THREE.Color('#DDF0FF').multiplyScalar(2.5 * intensidad)} toneMapped={false} />
      </mesh>
      <mesh position={centro}>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshBasicMaterial color="#9CC8FF" transparent opacity={0.22 * intensidad} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={centro} intensity={40 * intensidad} distance={12} color="#BFD9FF" />
    </group>
  );
};

// ------------------------------------------------------------------ encendedor (corte)
/** Mecanismo de un encendedor piezoeléctrico en corte. clic: 0..1 (botón presionado),
 *  golpe: 0..1 (martillo liberado), brillo: 0..1 (cristal emitiendo), chispa: 0..1. */
export const Encendedor3D: React.FC<{clic: number; golpe: number; brillo: number; chispa: number}> = ({clic, golpe, brillo, chispa}) => {
  const xBoton = -4.6 + clic * 1.4;
  const xMartillo = -0.9 + golpe * 1.05;
  const largoResorte = Math.max(0.6, xMartillo - 0.65 - (xBoton + 0.75));
  return (
    <group position={[0, 1.6, 0]}>
      {/* carcasa transparente */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={M.vidrio()}>
        <cylinderGeometry args={[1.25, 1.25, 9, 48, 1, true]} />
      </mesh>
      {/* botón */}
      <mesh position={[xBoton, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={M.color('#E2702B', 0.42)}>
        <cylinderGeometry args={[0.95, 0.95, 1.5, 40]} />
      </mesh>
      <Resorte3D x0={xBoton + 0.75} largo={largoResorte} radio={0.55} />
      {/* martillo */}
      <mesh position={[xMartillo, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={M.acero()}>
        <cylinderGeometry args={[0.66, 0.66, 1.3, 40]} />
      </mesh>
      {/* cristal piezoeléctrico */}
      <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 1.6, 40]} />
        <meshStandardMaterial color="#EFEAE0" roughness={0.55} emissive={new THREE.Color('#9CC8FF')} emissiveIntensity={brillo * 1.4} />
      </mesh>
      {/* soporte y contacto */}
      <mesh position={[2.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={M.laton()}>
        <cylinderGeometry args={[0.62, 0.62, 0.3, 40]} />
      </mesh>
      <Tubo puntos={[[2.2, 0, 0], [3.5, 0.1, 0], [4.6, 0.55, 0], [5.5, 0.6, 0]]} radio={0.07} material={M.cobre()} />
      <Tubo puntos={[[1.1, -0.48, 0], [2.4, -1.0, 0], [4.4, -1.0, 0], [5.5, -0.3, 0]]} radio={0.07} material={M.cobre()} />
      <mesh position={[5.55, 0.62, 0]} material={M.aceroMate()}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
      <mesh position={[5.55, -0.28, 0]} material={M.aceroMate()}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
      <Chispa a={[5.55, 0.52, 0]} b={[5.55, -0.18, 0]} intensidad={chispa} />
    </group>
  );
};

// ------------------------------------------------------------------ cristal de cuarzo
export const CristalCuarzo: React.FC<{pos?: V3; escalaY?: number; brillo?: number; s?: number}> = ({pos = [0, 0, 0], escalaY = 1, brillo = 0, s = 1}) => (
  <group position={pos} scale={[s, s * escalaY, s]}>
    <mesh position={[0, 1.4, 0]} castShadow>
      <cylinderGeometry args={[0.8, 0.8, 2.8, 6]} />
      <meshPhysicalMaterial color="#E9F2F7" roughness={0.06} metalness={0} transparent opacity={0.42} clearcoat={1} emissive={new THREE.Color('#7FB8FF')} emissiveIntensity={brillo} />
    </mesh>
    <mesh position={[0, 3.35, 0]} castShadow>
      <coneGeometry args={[0.8, 1.1, 6]} />
      <meshPhysicalMaterial color="#E9F2F7" roughness={0.06} transparent opacity={0.42} clearcoat={1} emissive={new THREE.Color('#7FB8FF')} emissiveIntensity={brillo} />
    </mesh>
  </group>
);

// ------------------------------------------------------------------ red de átomos (cuarzo esquemático)
export type EstadoRed = {
  aparicion: number; // 0..1 los átomos van apareciendo
  color: number; // 0 = neutros (gris), 1 = positivos rosados y negativos azules
  compresion: number; // 0..1 aplasta en Y
  corrimiento: number; // 0..1 positivos a +X, negativos a -X
  vibra?: number; // oscilación (efecto inverso)
  t: number;
};
const NX = 7;
const NY = 4;
const NZ = 4;
const PASO = 1.05;

export const RedAtomica: React.FC<EstadoRed & {pos?: V3}> = ({aparicion, color, compresion, corrimiento, vibra = 0, t, pos = [0, 0, 0]}) => {
  const refP = useRef<THREE.InstancedMesh>(null);
  const refN = useRef<THREE.InstancedMesh>(null);
  const refE = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const lista = useMemo(() => {
    const out: {p: V3; positivo: boolean; d: number}[] = [];
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NY; j++)
        for (let k = 0; k < NZ; k++) {
          const p: V3 = [(i - (NX - 1) / 2) * PASO, (j - (NY - 1) / 2) * PASO, (k - (NZ - 1) / 2) * PASO];
          out.push({p, positivo: (i + j + k) % 2 === 0, d: Math.hypot(...p)});
        }
    return out;
  }, []);
  const enlaces = useMemo(() => {
    const out: [number, number][] = [];
    lista.forEach((a, ia) =>
      lista.forEach((b, ib) => {
        if (ib <= ia) return;
        if (Math.abs(Math.hypot(a.p[0] - b.p[0], a.p[1] - b.p[1], a.p[2] - b.p[2]) - PASO) < 0.01) out.push([ia, ib]);
      }),
    );
    return out;
  }, [lista]);
  const dMax = Math.max(...lista.map((a) => a.d));
  const posActual = (a: {p: V3; positivo: boolean}): V3 => {
    const sy = 1 - 0.22 * compresion + vibra * 0.06 * Math.sin(t * 2 * Math.PI * 3);
    const sx = 1 + 0.1 * compresion - vibra * 0.03 * Math.sin(t * 2 * Math.PI * 3);
    const dx = (a.positivo ? 1 : -1) * 0.16 * corrimiento;
    return [a.p[0] * sx + dx, a.p[1] * sy, a.p[2]];
  };
  useLayoutEffect(() => {
    let ip = 0;
    let ineg = 0;
    lista.forEach((a) => {
      const vis = Math.max(0, Math.min(1, (aparicion * (dMax + 1.5) - a.d) / 1.5));
      tmp.position.set(...posActual(a));
      tmp.scale.setScalar(0.001 + 0.27 * vis);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      if (a.positivo) refP.current!.setMatrixAt(ip++, tmp.matrix);
      else refN.current!.setMatrixAt(ineg++, tmp.matrix);
    });
    refP.current!.instanceMatrix.needsUpdate = true;
    refN.current!.instanceMatrix.needsUpdate = true;
    const up = new THREE.Vector3(0, 1, 0);
    enlaces.forEach(([ia, ib], idx) => {
      const pa = new THREE.Vector3(...posActual(lista[ia]));
      const pb = new THREE.Vector3(...posActual(lista[ib]));
      const vis = Math.max(0, Math.min(1, (aparicion * (dMax + 1.5) - Math.max(lista[ia].d, lista[ib].d)) / 1.5));
      const dir = pb.clone().sub(pa);
      tmp.position.copy(pa.clone().add(pb).multiplyScalar(0.5));
      tmp.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      tmp.scale.set(vis, dir.length() * vis, vis);
      tmp.updateMatrix();
      refE.current!.setMatrixAt(idx, tmp.matrix);
    });
    refE.current!.instanceMatrix.needsUpdate = true;
  });
  const nP = lista.filter((a) => a.positivo).length;
  const colP = new THREE.Color('#D9D4CC').lerp(new THREE.Color('#FF5C8A'), color);
  const colN = new THREE.Color('#D9D4CC').lerp(new THREE.Color('#4F8DFF'), color);
  return (
    <group position={pos}>
      <instancedMesh ref={refP} args={[undefined, undefined, nP]} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color={colP} roughness={0.28} metalness={0.1} emissive={colP} emissiveIntensity={0.18 * color} />
      </instancedMesh>
      <instancedMesh ref={refN} args={[undefined, undefined, lista.length - nP]} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color={colN} roughness={0.28} metalness={0.1} emissive={colN} emissiveIntensity={0.18 * color} />
      </instancedMesh>
      <instancedMesh ref={refE} args={[undefined, undefined, enlaces.length]}>
        <cylinderGeometry args={[0.045, 0.045, 1, 8]} />
        <meshStandardMaterial color="#DDE6EE" roughness={0.2} metalness={0.2} transparent opacity={0.55} />
      </instancedMesh>
    </group>
  );
};
export const RED = {ancho: (NX - 1) * PASO, alto: (NY - 1) * PASO, fondo: (NZ - 1) * PASO};

/** Placas metálicas que aprietan (arriba/abajo de la red o del cristal). */
export const Placas: React.FC<{separacion: number; ancho?: number; fondo?: number; y0?: number; op?: number}> = ({separacion, ancho = 8.5, fondo = 5, y0 = 0, op = 1}) => (
  <group visible={op > 0.01}>
    <Caja tam={[ancho, 0.35, fondo]} pos={[0, y0 + separacion / 2 + 0.18, 0]} material={M.aceroMate()} radio={0.08} />
    <Caja tam={[ancho, 0.35, fondo]} pos={[0, y0 - separacion / 2 - 0.18, 0]} material={M.aceroMate()} radio={0.08} />
  </group>
);

/** Pila AA. */
export const Pila: React.FC<{pos?: V3; rot?: V3}> = ({pos = [0, 0, 0], rot = [0, 0, 0]}) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow material={M.color('#1C1C1E', 0.35, 0.2)}>
      <cylinderGeometry args={[0.7, 0.7, 4.2, 40]} />
    </mesh>
    <mesh position={[0, 1.4, 0]} castShadow material={M.cobre()}>
      <cylinderGeometry args={[0.71, 0.71, 1.3, 40]} />
    </mesh>
    <mesh position={[0, 2.2, 0]} castShadow material={M.aceroMate()}>
      <cylinderGeometry args={[0.25, 0.25, 0.22, 24]} />
    </mesh>
  </group>
);

/** Lápiz (para dar golpecitos). */
export const Lapiz: React.FC<{pos?: V3; rot?: V3}> = ({pos = [0, 0, 0], rot = [0, 0, 0]}) => (
  <group position={pos} rotation={rot}>
    <mesh position={[0, 4.6, 0]} castShadow material={M.color('#F2C230', 0.45)}>
      <cylinderGeometry args={[0.36, 0.36, 8.4, 6]} />
    </mesh>
    <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} castShadow material={M.color('#E2B98A', 0.7)}>
      <coneGeometry args={[0.36, 0.9, 6]} />
    </mesh>
    <mesh position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} castShadow material={M.color('#2A2A2A', 0.4, 0.4)}>
      <coneGeometry args={[0.1, 0.22, 12]} />
    </mesh>
    <mesh position={[0, 8.95, 0]} castShadow material={M.color('#E89AA8', 0.6)}>
      <cylinderGeometry args={[0.37, 0.37, 0.7, 20]} />
    </mesh>
  </group>
);

// ------------------------------------------------------------------ electrónica
export const ESP32: React.FC<{pos?: V3; rotY?: number; led?: number}> = ({pos = [0, 0, 0], rotY = 0, led = 0}) => {
  const pcb = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({map: texturaPCB('#15181B', 'esp32'), roughness: 0.5, metalness: 0.1});
    return m;
  }, []);
  const pines = [];
  for (let i = 0; i < 19; i++) {
    for (const lado of [-1, 1]) {
      pines.push(
        <mesh key={`${i}${lado}`} position={[lado * 1.27, 0.2, -2.3 + i * 0.254]} castShadow material={M.oro()}>
          <boxGeometry args={[0.07, 0.25, 0.07]} />
        </mesh>,
      );
    }
  }
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow material={pcb}>
        <boxGeometry args={[2.8, 0.16, 5.2]} />
      </mesh>
      {/* tiras de pines */}
      <Caja tam={[0.25, 0.25, 4.85]} pos={[-1.27, -0.2, 0]} material={M.plasticoNegro()} />
      <Caja tam={[0.25, 0.25, 4.85]} pos={[1.27, -0.2, 0]} material={M.plasticoNegro()} />
      {pines}
      {/* módulo con blindaje metálico */}
      <Caja tam={[1.8, 0.32, 1.7]} pos={[0, 0.24, -1.1]} material={M.aceroMate()} radio={0.03} />
      <Caja tam={[1.8, 0.04, 0.7]} pos={[0, 0.1, -2.3]} material={M.color('#1E2A24', 0.5)} />
      {/* USB y botones */}
      <Caja tam={[0.8, 0.28, 0.55]} pos={[0, 0.22, 2.35]} material={M.aceroMate()} radio={0.03} />
      <Caja tam={[0.4, 0.18, 0.3]} pos={[-0.95, 0.17, 1.9]} material={M.plasticoNegro()} />
      <Caja tam={[0.4, 0.18, 0.3]} pos={[0.95, 0.17, 1.9]} material={M.plasticoNegro()} />
      <mesh position={[0.55, 0.12, 1.35]}>
        <boxGeometry args={[0.16, 0.08, 0.1]} />
        <meshStandardMaterial color="#FF3B3B" emissive="#FF3B3B" emissiveIntensity={0.4 + led * 2.5} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Protoboard: React.FC<{pos?: V3}> = ({pos = [0, 0, 0]}) => {
  const top = useMemo(() => new THREE.MeshStandardMaterial({map: texturaProtoboard(), roughness: 0.55}), []);
  const lados = M.plasticoBlanco();
  return (
    <mesh position={[pos[0], pos[1] + 0.425, pos[2]]} castShadow receiveShadow material={[lados, lados, top, lados, lados, lados]}>
      <boxGeometry args={[16.5, 0.85, 5.6]} />
    </mesh>
  );
};

/** Resistencia axial (bandas de color) con patas dobladas hacia la protoboard. */
export const ResistenciaAxial: React.FC<{pos?: V3; rotY?: number; bandas?: string[]; cuerpo?: string}> = ({pos = [0, 0, 0], rotY = 0, bandas = ['#7A4A21', '#151515', '#2E9C48', '#D4AF37'], cuerpo = '#D8C29A'}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.55, 0]} castShadow material={M.color(cuerpo, 0.5)}>
      <capsuleGeometry args={[0.13, 0.5, 8, 16]} />
    </mesh>
    {bandas.map((c, i) => (
      <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[-0.22 + i * 0.13 + (i === 3 ? 0.06 : 0), 0.55, 0]} material={M.color(c, 0.45)}>
        <cylinderGeometry args={[0.137, 0.137, 0.05, 20]} />
      </mesh>
    ))}
    <Tubo puntos={[[-0.4, 0.55, 0], [-0.62, 0.55, 0], [-0.76, 0.35, 0], [-0.76, -0.1, 0]]} radio={0.025} material={M.estano()} seg={30} />
    <Tubo puntos={[[0.4, 0.55, 0], [0.62, 0.55, 0], [0.76, 0.35, 0], [0.76, -0.1, 0]]} radio={0.025} material={M.estano()} seg={30} />
  </group>
);

/** Diodo zener (vidrio naranja con banda negra). */
export const Zener: React.FC<{pos?: V3; rotY?: number}> = ({pos = [0, 0, 0], rotY = 0}) => (
  <ResistenciaAxial pos={pos} rotY={rotY} bandas={['#151515', '#E5732E', '#E5732E', '#E5732E']} cuerpo="#E5732E" />
);

// ------------------------------------------------------------------ mesa de madera
export const Mesa: React.FC<{ancho?: number; fondo?: number}> = ({ancho = 46, fondo = 28}) => {
  const mat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const g = c.getContext('2d')!;
    g.fillStyle = '#8A5A33';
    g.fillRect(0, 0, 2048, 1024);
    const r = azar(17);
    for (let i = 0; i < 260; i++) {
      g.strokeStyle = `rgba(${r() > 0.5 ? '60,32,14' : '170,120,74'},${0.1 + r() * 0.18})`;
      g.lineWidth = 1 + r() * 4;
      g.beginPath();
      const y = r() * 1024;
      g.moveTo(0, y);
      for (let x = 0; x <= 2048; x += 64) g.lineTo(x, y + Math.sin(x / 210 + i) * 10 + (r() - 0.5) * 3);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshStandardMaterial({map: tex, roughness: 0.55, metalness: 0});
  }, []);
  return (
    <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={mat}>
      <boxGeometry args={[ancho, 1.6, fondo]} />
    </mesh>
  );
};

/** Ondas que se expanden desde un punto (vibración en una superficie). */
export const Ondas: React.FC<{centro: V3; t: number; t0: number; color?: string; velocidad?: number; n?: number}> = ({centro, t, t0, color = '#8FD3FF', velocidad = 9, n = 4}) => {
  if (t < t0) return null;
  return (
    <group position={centro}>
      {Array.from({length: n}, (_, k) => {
        const q = t - t0 - k * 0.35;
        if (q < 0) return null;
        const r = 0.3 + q * velocidad;
        const op = Math.max(0, 1 - q / 2.4);
        return (
          <mesh key={k} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.14, 96]} />
            <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------ diapasón de cuarzo (reloj)
export const Diapason: React.FC<{vib: number; t: number; abierto?: number; lata?: number}> = ({vib, t, abierto = 1, lata = 1}) => {
  const d = vib * 0.12 * Math.sin(t * 2 * Math.PI * 4.5);
  const cuarzo = useMemo(
    () => new THREE.MeshPhysicalMaterial({color: '#EAF3F8', roughness: 0.08, transparent: true, opacity: 0.55, clearcoat: 1}),
    [],
  );
  return (
    <group>
      {/* lata metálica (abierta por un lado) */}
      {lata > 0.01 && (
        <mesh position={[0, 2.6 + (1 - lata) * 7, 0]} castShadow material={M.aceroMate()}>
          <cylinderGeometry args={[1.25, 1.25, 5.6, 48, 1, false, 0, Math.PI * 2 - abierto * 2.2]} />
        </mesh>
      )}
      {/* base y patas */}
      <Caja tam={[2.6, 0.5, 2.6]} pos={[0, 0.25, 0]} material={M.color('#2B2D30', 0.45)} radio={0.1} />
      {/* diapasón */}
      <Caja tam={[1.1, 0.8, 0.25]} pos={[0, 1.0, 0]} material={cuarzo} />
      <group position={[-0.32 - d, 1.4, 0]}>
        <Caja tam={[0.3, 3.4, 0.25]} pos={[0, 1.7, 0]} material={cuarzo} />
      </group>
      <group position={[0.32 + d, 1.4, 0]}>
        <Caja tam={[0.3, 3.4, 0.25]} pos={[0, 1.7, 0]} material={cuarzo} />
      </group>
      <Caja tam={[0.34, 2.2, 0.03]} pos={[-0.32 - d, 3.0, 0.14]} material={M.plata()} />
      <Caja tam={[0.34, 2.2, 0.03]} pos={[0.32 + d, 3.0, 0.14]} material={M.plata()} />
    </group>
  );
};
