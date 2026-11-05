// S05 · Acelerómetro MEMS — escenas 3D.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {ap, clamp01, easeInOut, mix, sal, useEscena} from '../../../motor/tiempo';
import {Camara, camaraEn, Estudio, orbita, V3} from '../Estudio';
import {Dato, EtiquetaGuia, proyectar, TituloGrande} from '../ui';
import {M} from '../materiales';
import {Caja, ESP32, Resorte3D, Tubo} from '../modelos/Piezas';
import {Cil, Esf, pintura} from '../modelos/Objetos';
import {Persona} from '../modelos/ObjetosS03';
import {MPU6050, NivelBurbuja, Volante} from '../modelos/ObjetosS05';
import {Osciloscopio3D} from '../modelos/Instrumentos';
import {TextoPlano, useLienzo} from '../texto3d';

const Q = {escala: 0.8} as const;
const CIAN = '#7CF0FF';

// ------------------------------------------------------------------ estructura MEMS: masa con resortes y dedos de peine
export const MEMSEstructura: React.FC<{desp: number; brillo?: number}> = ({desp, brillo = 1}) => {
  const si = M.color('#9AA3AD', 0.28, 0.85);
  const fijo = M.color('#6B7480', 0.35, 0.85);
  const dedos = Array.from({length: 11}, (_, i) => -3.0 + i * 0.6);
  const gapI = clamp01(0.5 - desp * 1.8);
  const gapD = clamp01(0.5 + desp * 1.8);
  return (
    <group>
      <Caja tam={[16, 0.3, 11]} pos={[0, 0.15, 0]} material={M.color('#2A2F36', 0.6, 0.3)} />
      {[-6.6, 6.6].map((x) => [-3.2, 3.2].map((z) => <Caja key={`${x}${z}`} tam={[1.0, 0.9, 1.0]} pos={[x, 0.75, z]} material={fijo} />))}
      <group position={[desp, 1.0, 0]}>
        <Caja tam={[7.0, 0.35, 3.4]} material={si} />
        {Array.from({length: 24}, (_, i) => (
          <Caja key={i} tam={[0.3, 0.37, 0.3]} pos={[-3.0 + (i % 8) * 0.86, 0, -1.1 + Math.floor(i / 8) * 1.1]} material={M.color('#1E2329', 0.6)} />
        ))}
        {dedos.map((x) => (
          <group key={x}>
            <Caja tam={[0.16, 0.3, 1.6]} pos={[x, 0, 2.5]} material={si} />
            <Caja tam={[0.16, 0.3, 1.6]} pos={[x, 0, -2.5]} material={si} />
          </group>
        ))}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 3.5, 0, 0]}>
            {Array.from({length: 5}, (_, i) => (
              <Caja key={i} tam={[0.12, 0.25, 6.4]} pos={[s * (0.4 + i * 0.5 - desp * s * 0.08 * i), 0, 0]} material={si} />
            ))}
          </group>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Caja tam={[8.0, 0.35, 0.5]} pos={[0, 1.0, s * 4.2]} material={fijo} />
          {dedos.map((x, i) => (
            <group key={i}>
              <Caja tam={[0.16, 0.3, 1.5]} pos={[x + 0.3, 1.0, s * 3.2]} material={fijo} />
              <mesh position={[x + 0.15 + desp / 2, 1.2, s * 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.12, 1.0]} />
                <meshBasicMaterial color={CIAN} transparent opacity={brillo * (s > 0 ? gapI : gapD) * 0.9} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ gancho: gira el celular y la pantalla gira
export const GiraPantalla3D: React.FC<{final?: boolean}> = ({final = false}) => {
  const {t, M: m, dur} = useEscena();
  const tG = m('gira', 0.3);
  const tS = m('suelo', 3.5);
  const tR = m('resortes', 10.0);
  const tV = m('virus', 15.0);
  const giro = ap(t, tG + 0.4, 1.0, easeInOut) * (1 - ap(t, tS + 2.0, 1.0, easeInOut));
  const rot = (giro * Math.PI) / 2;
  const pant = ap(t, tG + 1.2, 0.4);
  const chip = ap(t, tR - 1.0, 1.4, easeInOut);
  const tex = useLienzo(
    560,
    1160,
    (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#0F766E');
      gr.addColorStop(1, '#22D3EE');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(-pant * (Math.PI / 2) * (giro > 0.5 ? 1 : 0));
      g.fillStyle = 'rgba(255,255,255,0.92)';
      g.beginPath();
      g.roundRect(-210, -150, 420, 300, 30);
      g.fill();
      g.fillStyle = '#F59E0B';
      g.beginPath();
      g.arc(-90, -40, 50, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#16A34A';
      g.beginPath();
      g.moveTo(-210, 150);
      g.lineTo(-40, -10);
      g.lineTo(80, 90);
      g.lineTo(150, 20);
      g.lineTo(210, 150);
      g.fill();
      g.restore();
    },
    [giro > 0.5, Math.round(pant * 10)],
  );
  const cam = camaraEn(
    [
      {t: 0, pos: [0, 4.6, 16], obj: [0, 4.2, 0], fov: 30},
      {t: tR - 1.0, d: 1.6, pos: [9, 13, 15], obj: [0, 1.0, 0], fov: 30},
    ],
    t,
  );
  const desp = chip > 0.5 ? 0.25 * Math.sin(t * 2.2) : 0;
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, 0]} {...Q}>
        {chip < 0.98 && (
          <group position={[0, 4.2 - chip * 4, 0]} scale={1 - chip * 0.6}>
            <group rotation={[0, 0, -rot]}>
              <Caja tam={[3.1, 6.3, 0.34]} material={M.color('#2A2D31', 0.3, 0.8)} radio={0.15} />
              <mesh position={[0, 0, 0.18]}>
                <planeGeometry args={[2.85, 6.0]} />
                <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.6} />
              </mesh>
            </group>
          </group>
        )}
        {chip > 0.02 && (
          <group scale={0.5 + 0.5 * chip}>
            <MEMSEstructura desp={desp} />
          </group>
        )}
      </Estudio>
      {!final && <TituloGrande texto="¿cómo sabe dónde está el suelo?" p={ap(t, tS, 0.5) * sal(t, tR - 1.2, 0.3)} y={96} />}
      {!final && <TituloGrande texto="silicio colgando de resortes" sub="más delgados que un cabello" p={ap(t, tR, 0.5) * sal(t, tV - 0.3, 0.3)} y={96} />}
      {!final && <TituloGrande texto="se mueve menos que un virus" p={ap(t, tV, 0.5) * sal(t, dur, 0.3)} y={96} />}
      {final && <TituloGrande texto="una máquina diminuta colgando de resortes" p={ap(t, tR, 0.5) * sal(t, dur, 0.3)} y={96} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ física: la pesa con resorte dentro de una caja
const CajaPesa: React.FC<{y: number; estira: number; espacio?: boolean}> = ({y, estira, espacio = false}) => {
  const L = 2.4 + estira;
  return (
    <group position={[0, y, 0]}>
      <Caja tam={[3.0, 6.0, 3.0]} pos={[0, 3.0, 0]} material={M.vidrio()} radio={0.12} />
      <Caja tam={[3.0, 0.2, 3.0]} pos={[0, 6.0, 0]} material={M.aceroMate()} />
      <group position={[0, 5.9, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Resorte3D x0={0} largo={L} radio={0.35} vueltas={9} grosor={0.05} />
      </group>
      <Caja tam={[1.3, 1.0, 1.3]} pos={[0, 5.9 - L - 0.5, 0]} material={espacio ? pintura('#2D5BE3', 0.3) : pintura('#E5484D', 0.3)} radio={0.1} />
    </group>
  );
};
export const CajaResorte3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tCaja = m('caja', 1.0);
  const tAc = m('aceleras', 4.0);
  const tFr = m('frenas', 8.5);
  const tQ = m('quieta', 15.0);
  const tE = m('einstein', 22.0);
  const tG = m('gravedad', 26.0);
  // fase 1: caja que sube (acelera y luego frena) — fase 2: quieta en la mesa y otra igual acelerando en el espacio
  const fase2 = t > tQ - 0.5;
  const subir = ap(t, tAc, 3.0, easeInOut);
  const yCaja = fase2 ? 0 : subir * 5;
  const acel = fase2 ? 0 : t > tAc && t < tAc + 1.5 ? 1 : t > tFr && t < tFr + 1.5 ? -1 : 0;
  // en reposo (con gravedad) el resorte ya está estirado 1.0; acelerar hacia arriba lo estira más y frenar, menos
  const estira = fase2 ? 1.0 : 1.0 + 0.7 * clamp01(acel) - 0.5 * clamp01(-acel);
  const espacio = ap(t, tE - 0.8, 1.2);
  const cam: Camara = fase2 ? {pos: [mix(0, 4.5, espacio), 6, 22], obj: [mix(0, 4.5, espacio), 3.5, 0], fov: 32} : {pos: [0, 5 + yCaja * 0.6, 20], obj: [0, 3.5 + yCaja, 0], fov: 32};
  const estrellas = useMemo(() => Array.from({length: 60}, (_, i) => [9 + ((i * 7.3) % 14) - 7, 1 + ((i * 3.7) % 12), -6 - (i % 5)] as V3), []);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, 0]} {...Q}>
        <CajaPesa y={yCaja} estira={estira} />
        {fase2 && <Caja tam={[8, 0.4, 5]} pos={[0, -0.2, 0]} material={M.color('#3A2A1E', 0.6)} />}
        {fase2 && espacio > 0.01 && (
          <group position={[9, 0.5 + Math.sin(t * 0.5) * 0.3, 0]}>
            <CajaPesa y={0} estira={1.0} espacio />
            <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.8, 1.6, 24]} />
              <meshBasicMaterial color="#FFB547" transparent opacity={0.6 + 0.3 * Math.sin(t * 30)} toneMapped={false} />
            </mesh>
            {estrellas.map((p, i) => (
              <Esf key={i} r={0.04} pos={[p[0] - 9, p[1], p[2]]} mat={M.emisivo('#FFFFFF', 2)} seg={4} />
            ))}
          </group>
        )}
      </Estudio>
      <TituloGrande texto="aceleras: la pesa se queda atrás" p={ap(t, tAc, 0.5) * sal(t, tFr - 0.3, 0.3)} y={96} />
      <TituloGrande texto="frenas: la pesa sigue de largo" p={ap(t, tFr, 0.5) * sal(t, tQ - 0.6, 0.3)} y={96} />
      <TituloGrande texto="quieta en la Tierra: el resorte también se estira" p={ap(t, tQ, 0.5) * sal(t, tE - 0.3, 0.3)} y={96} />
      <TituloGrande texto="para el sensor, es lo mismo" sub="principio de equivalencia (Einstein)" p={ap(t, tE, 0.5) * sal(t, tG - 0.3, 0.3)} y={96} />
      <TituloGrande texto="en reposo mide la gravedad: unos 9,8 m/s²" p={ap(t, tG, 0.5) * sal(t, dur, 0.3)} y={96} />
      <Dato x={360} y={300} valor="tu caja" sub="en la Tierra, quieta" p={fase2 ? ap(t, tE, 0.5) * sal(t, dur, 0.3) : 0} />
      <Dato x={1560} y={300} valor="en el espacio" sub="acelerando a 1 g" p={fase2 ? ap(t, tE + 0.4, 0.5) * sal(t, dur, 0.3) : 0} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ejes: cuánto de la gravedad cae en X, Y y Z
export const Ejes3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tEj = m('ejes', 4.0);
  const tPan = m('pantalla', 9.0);
  const tPas = m('pasos', 12.0);
  const inc = t < tPas ? 0.55 * Math.sin(t * 0.7) : 0;
  const lado = t < tPas ? 0.4 * Math.sin(t * 0.45 + 1) : 0;
  const R = new THREE.Euler(inc, 0, lado);
  const g = new THREE.Vector3(0, 1, 0).applyQuaternion(new THREE.Quaternion().setFromEuler(R).invert());
  const comps = [Math.abs(g.x), Math.abs(g.y), Math.abs(g.z)];
  const pasos = t > tPas ? Math.floor((t - tPas) * 1.8) : 0;
  const rebote = t > tPas ? Math.abs(Math.sin((t - tPas) * Math.PI * 1.8)) * 0.6 : 0;
  const cam = orbita([1.5, 3.0, 0], 15, 5, -20 + t * 1.5, 32);
  const barras = [
    {c: '#E5484D', n: 'X'},
    {c: '#34D399', n: 'Y'},
    {c: '#3B82F6', n: 'Z'},
  ];
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[1, 2, 0]} {...Q}>
        <group position={[-2.5, 3.2 + rebote, 0]} rotation={R}>
          <Caja tam={[3.0, 0.32, 6.2]} material={M.color('#2A2D31', 0.3, 0.8)} radio={0.15} />
          <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.8, 5.95]} />
            <meshBasicMaterial color="#1C3D6E" toneMapped={false} />
          </mesh>
          <Tubo puntos={[[0, 0.3, 0], [2.6, 0.3, 0]]} radio={0.07} material={M.emisivo('#E5484D', 1.6)} seg={4} />
          <Tubo puntos={[[0, 0.3, 0], [0, 2.9, 0]]} radio={0.07} material={M.emisivo('#34D399', 1.6)} seg={4} />
          <Tubo puntos={[[0, 0.3, 0], [0, 0.3, -3.4]]} radio={0.07} material={M.emisivo('#3B82F6', 1.6)} seg={4} />
        </group>
        <Tubo puntos={[[-2.5, 3.2 + rebote, 0], [-2.5, 0.6 + rebote, 0]]} radio={0.09} material={M.emisivo('#FFFFFF', 1.4)} seg={4} />
        {t > tEj - 0.3 &&
          barras.map((b, i) => (
            <group key={i} position={[3.5 + i * 1.6, 0, 0]}>
              <Caja tam={[0.9, 4.2, 0.9]} pos={[0, 2.1, 0]} material={M.vidrio()} radio={0.06} />
              <Caja tam={[0.7, Math.max(0.05, comps[i] * 4.0), 0.7]} pos={[0, 0.1 + (comps[i] * 4.0) / 2, 0]} material={M.emisivo(b.c, 1.5)} radio={0.05} />
              <TextoPlano lineas={[{t: b.n, tam: 200, color: b.c}]} w={0.8} h={0.8} pos={[0, 4.8, 0]} />
            </group>
          ))}
        {t > tPas && <TextoPlano lineas={[{t: `pasos: ${pasos}`, tam: 120, color: '#7CFFB2', mono: true}]} w={3.4} h={0.8} pos={[-2.5, 7.2, 0]} estilo={{fondo: '#0B0F14', radio: 30}} />}
      </Estudio>
      <TituloGrande texto="la gravedad repartida en tres ejes" sub="así sabe cómo está inclinado" p={ap(t, tEj, 0.5) * sal(t, tPas - 0.3, 0.3)} y={96} />
      <TituloGrande texto="cada paso: un golpecito que sube y baja" p={ap(t, tPas, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ por dentro: MEMS y oblea
export const MEMS3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tMems = m('mems', 4.0);
  const tPesa = m('pesa', 8.0);
  const tVigas = m('vigas', 11.0);
  const tDedos = m('dedos', 16.0);
  const tCond = m('condensador', 20.0);
  const tCirc = m('circuito', 26.0);
  const tTres = m('tres', 32.0);
  const tObl = m('oblea', 40.0);
  const oblea = ap(t, tObl - 1.0, 1.6, easeInOut);
  const desp = t > tCond - 1 ? 0.35 * Math.sin(t * 1.8) : 0;
  const cam = oblea > 0.5 ? orbita([0, 0, 0], 26, 18, t * 4, 30) : orbita([0, 1.0, 0], 17, 11, -20 + t * 1.5, 30);
  const pMasa = proyectar([0, 1.4, 0], cam);
  const pViga = proyectar([4.4, 1.2, 1.8], cam);
  const pDedo = proyectar([1.2, 1.2, 3.1], cam);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        {oblea < 0.5 ? (
          <MEMSEstructura desp={desp} brillo={ap(t, tCond, 0.6)} />
        ) : (
          <group>
            <Cil r={11} h={0.5} pos={[0, 0.25, 0]} mat={M.color('#8E96A3', 0.12, 0.95)} seg={96} />
            {Array.from({length: 196}, (_, i) => {
              const x = -9.1 + (i % 14) * 1.4;
              const z = -9.1 + Math.floor(i / 14) * 1.4;
              if (x * x + z * z > 95) return null;
              return <Caja key={i} tam={[1.25, 0.04, 1.25]} pos={[x, 0.52, z]} material={M.color(i % 3 ? '#6F7A87' : '#7E8A99', 0.2, 0.9)} />;
            })}
          </group>
        )}
      </Estudio>
      {oblea < 0.5 && <EtiquetaGuia desde={pMasa} hacia={{x: pMasa.x - 120, y: pMasa.y - 200}} texto="la pesa" sub="una placa de silicio" p={ap(t, tPesa, 0.5) * sal(t, tObl - 1.2, 0.3)} lado="izq" />}
      {oblea < 0.5 && <EtiquetaGuia desde={pViga} hacia={{x: pViga.x + 120, y: pViga.y - 180}} texto="resortes" sub="unas pocas micras de ancho" p={ap(t, tVigas, 0.5) * sal(t, tObl - 1.2, 0.3)} />}
      {oblea < 0.5 && <EtiquetaGuia desde={pDedo} hacia={{x: pDedo.x + 160, y: pDedo.y + 90}} texto="dedos: condensadores" sub="se acercan o se alejan" p={ap(t, tDedos, 0.5) * sal(t, tObl - 1.2, 0.3)} />}
      <TituloGrande texto="MEMS" sub="sistemas microelectromecánicos" p={ap(t, tMems, 0.5) * sal(t, tPesa - 0.3, 0.3)} y={96} />
      <TituloGrande texto="la capacitancia cambia" p={ap(t, tCond, 0.5) * sal(t, tCirc - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un circuito en el mismo chip lo mide" p={ap(t, tCirc, 0.5) * sal(t, tTres - 0.3, 0.3)} y={96} />
      <TituloGrande texto="tres ejes en unos pocos milímetros" p={ap(t, tTres, 0.5) * sal(t, tObl - 0.3, 0.3)} y={96} />
      <TituloGrande texto="miles por oblea" p={ap(t, tObl, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ el airbag: choque, señal y bolsa en cámara lenta
const Carro: React.FC<{aplasta?: number}> = ({aplasta = 0}) => {
  const pint = pintura('#2D5BE3', 0.3);
  return (
    <group>
      <Caja tam={[8.0 - aplasta * 1.4, 1.6, 3.6]} pos={[-aplasta * 0.7, 1.4, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.2, 1.4, 3.2]} pos={[-1.2, 2.8, 0]} material={pint} radio={0.4} />
      <Caja tam={[4.0, 1.1, 3.25]} pos={[-1.2, 2.85, 0]} material={M.color('#0E1A2B', 0.05, 0.4)} radio={0.3} />
      {[[-2.6, 1.8], [-2.6, -1.8], [2.4 - aplasta * 1.2, 1.8], [2.4 - aplasta * 1.2, -1.8]].map(([x, z], i) => (
        <Cil key={i} r={0.75} h={0.5} pos={[x, 0.75, z]} rot={[Math.PI / 2, 0, 0]} mat={M.goma('#151617')} seg={28} />
      ))}
    </group>
  );
};
export const Airbag3D: React.FC<{modo?: 'choque' | 'bolsa'}> = ({modo = 'choque'}) => {
  const {t, M: m, dur} = useEscena();
  const tCh = m('choque', 3.0);
  const tDec = m('decenas', 9.0);
  const tBa = m('bache', 13.0);
  const tFo = m('forma', 1.0);
  const tInf = m('inflar', 6.0);
  const tVol = m('volante', 11.0);
  if (modo === 'choque') {
    const xCar = t < tCh ? mix(-26, -4.2, clamp01((t - (tCh - 3)) / 3)) : -4.2;
    const aplasta = ap(t, tCh, 0.12);
    const muestras = Array.from({length: 220}, (_, i) => {
      const tt = t - 2 + (i / 219) * 2;
      let v = 0.01 * Math.sin(i * 2.1);
      if (tt > tCh) v += -0.9 * Math.exp(-(((tt - tCh - 0.06) / 0.05) ** 2));
      if (tt > tBa) v += -0.35 * Math.exp(-(((tt - tBa - 0.02) / 0.008) ** 2));
      return v;
    });
    const cam = orbita([-3, 2.2, 0], 19, 4.5, -38 + t * 1.0, 32);
    return (
      <AbsoluteFill>
        <Estudio camara={cam} fondo="negro" centroLuz={[0, 2, 0]} {...Q}>
          <group position={[xCar, 0, 0]}>
            <Carro aplasta={aplasta} />
          </group>
          <Caja tam={[1.2, 4.2, 9]} pos={[1.2, 2.1, 0]} material={M.color('#8D8A84', 0.9)} />
          <Osciloscopio3D pos={[-12, 0, -4]} rotY={0.6} escala={0.9} muestras={muestras} titulo="desaceleración" color="#FF8A3D" />
        </Estudio>
        <TituloGrande texto="de velocidad de ciudad a cero en ~0,1 s" p={ap(t, tCh, 0.5) * sal(t, tDec - 0.3, 0.3)} y={96} />
        <TituloGrande texto="decenas de veces la gravedad" p={ap(t, tDec, 0.5) * sal(t, tBa - 0.3, 0.3)} y={96} />
        <TituloGrande texto="un bache: un golpe corto, no un choque" p={ap(t, tBa, 0.5) * sal(t, dur, 0.3)} y={96} />
      </AbsoluteFill>
    );
  }
  const infla = ap(t, tInf, 1.6, easeInOut);
  const cuerpo = ap(t, tInf - 1.0, 4.0, (x) => x) * 0.9;
  const ms = Math.round(infla * 30);
  const cam = orbita([0, 3.6, 0], 13, 2.0, 70 + t * 0.6, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 3, 0]} {...Q}>
        <group position={[0, 0, 2.6]} rotation={[0, Math.PI, 0]}>
          <Volante inflado={infla} />
        </group>
        <group position={[0, -2.3, -3.2 + cuerpo]} rotation={[0.15 + cuerpo * 0.25, 0, 0]}>
          <Persona termico={0} />
        </group>
        <Caja tam={[3.4, 0.9, 3.4]} pos={[0, 0.45, -3.6]} material={M.color('#2B2E33', 0.6)} radio={0.2} />
        <Caja tam={[3.4, 4.2, 0.8]} pos={[0, 2.5, -5.4]} material={M.color('#2B2E33', 0.6)} radio={0.3} />
      </Estudio>
      <TituloGrande texto="mira la forma de la señal, no un solo pico" p={ap(t, tFo, 0.5) * sal(t, tInf - 0.3, 0.3)} y={96} />
      <Dato x={1500} y={330} valor={`${ms} ms`} sub="cámara lenta" p={ap(t, tInf, 0.3) * sal(t, dur, 0.3)} />
      <TituloGrande texto="la bolsa se llena antes de que llegues al volante" p={ap(t, tVol, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ con un ESP32: nivel electrónico con el MPU-6050
export const NivelESP32: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tMpu = m('mpu', 1.0);
  const tCab = m('cables', 4.0);
  const tPla = m('plano', 11.0);
  const tInc = m('inclinas', 15.0);
  const tArc = m('arcotangente', 19.0);
  const inclina = t > tInc ? 0.32 * Math.sin((t - tInc) * 0.8) : 0;
  const lado = t > tInc ? 0.2 * Math.sin((t - tInc) * 0.55 + 0.6) : 0;
  const grados = (r: number) => Math.round((r * 180) / Math.PI);
  const cam = orbita([0, 1.6, 0], 13.5, 7, -20 + t * 1.2, 30);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <group position={[0, 1.2, 0]} rotation={[inclina, 0, lado]}>
          <Caja tam={[9, 0.3, 5]} material={M.color('#B98B5A', 0.8)} />
          <group position={[-2.2, 0.15, 0.5]} scale={1.0}>
            <MPU6050 />
          </group>
          <ESP32 pos={[2.4, 0.35, 0.3]} rotY={Math.PI / 2} led={t > tCab ? 1 : 0} />
          {[
            ['#C62828', 0.2],
            ['#1A1A1A', 0.45],
            ['#F2C230', 0.7],
            ['#2563EB', 0.95],
          ].map(([c, z], i) => (
            <Tubo key={i} puntos={[[-1.4, 0.35, 1.1 - (z as number)], [-0.2, 0.8, 1.3 - (z as number)], [1.3, 0.6, 1.0 - (z as number)]]} radio={0.05} material={M.color(c as string, 0.4)} seg={16} />
          ))}
          <group position={[0, 0.2, -1.6]} scale={0.7}>
            <NivelBurbuja inclina={lado} />
          </group>
        </group>
        <TextoPlano
          lineas={[
            {t: `adelante: ${grados(inclina)}°`, tam: 100, color: '#7CFFB2', mono: true},
            {t: `al lado:  ${grados(lado)}°`, tam: 100, color: '#7CFFB2', mono: true},
          ]}
          w={4.6}
          h={1.6}
          pos={[0, 4.0, -3.2]}
          estilo={{fondo: '#0B0F14', radio: 40}}
          op={ap(t, tArc, 0.5)}
        />
      </Estudio>
      <TituloGrande texto="MPU-6050: acelerómetro + giroscopio" sub="cuatro cables: alimentación, tierra, SDA y SCL" p={ap(t, tMpu, 0.5) * sal(t, tPla - 0.3, 0.3)} y={96} />
      <TituloGrande texto="plano: casi toda la gravedad en Z" p={ap(t, tPla, 0.5) * sal(t, tInc - 0.3, 0.3)} y={96} />
      <TituloGrande texto="arcotangente: tres números → dos ángulos" p={ap(t, tArc, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ límites: integrar dos veces acumula errores
export const Integracion3D: React.FC = () => {
  const {t, M: m, dur} = useEscena();
  const tD = m('debilidad', 0.5);
  const tGi = m('giroscopio', 6.0);
  const tInt = m('integrando', 9.0);
  const tAc = m('acumula', 14.0);
  const tGps = m('gps', 19.0);
  const prog = ap(t, tInt, Math.max(2, tGps - tInt), (x) => x);
  const real: V3[] = Array.from({length: 20}, (_, i) => [-8 + (16 * i * prog) / 19, 0.3, 0]);
  const estim: V3[] = Array.from({length: 20}, (_, i) => {
    const u = (i * prog) / 19;
    return [-8 + 16 * u, 0.3, -6 * u * u * 1.4];
  });
  const cam = orbita([0, 0, -2], 20, 16, -10 + t * 1.0, 32);
  return (
    <AbsoluteFill>
      <Estudio camara={cam} fondo="negro" centroLuz={[0, 1, 0]} {...Q}>
        <gridHelper args={[30, 30, '#2A2F36', '#1B1F24']} position={[0, 0.02, 0]} />
        {prog > 0.02 && <Tubo puntos={real} radio={0.12} material={M.emisivo(CIAN, 1.5)} seg={40} />}
        {prog > 0.02 && <Tubo puntos={estim} radio={0.12} material={M.emisivo('#FF8A3D', 1.5)} seg={40} />}
        {t > tGps && (
          <group position={[real[19][0], 0, 0]}>
            <mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.5, 1.6, 24]} />
              <meshStandardMaterial color="#E5484D" />
            </mesh>
            <Esf r={0.62} pos={[0, 2.2, 0]} mat={pintura('#E5484D', 0.3)} />
          </group>
        )}
      </Estudio>
      <TituloGrande texto="no distingue gravedad de aceleración" sub="por eso trabaja junto a un giroscopio" p={ap(t, tD, 0.5) * sal(t, tInt - 0.3, 0.3)} y={96} />
      <TituloGrande texto="integrar dos veces: el error crece rápido" p={ap(t, tAc, 0.5) * sal(t, tGps - 0.3, 0.3)} y={96} />
      <TituloGrande texto="un acelerómetro solo no reemplaza al GPS" p={ap(t, tGps, 0.5) * sal(t, dur, 0.3)} y={96} />
    </AbsoluteFill>
  );
};
