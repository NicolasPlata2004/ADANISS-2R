// EP01 · Capítulo 3: el control (regulación PWM y optoacoplador) 4:31 – 5:07
import React from 'react';
import {ap, easeInOut, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, Cruz, D, Etiqueta, Flecha, Lienzo, P, R, T} from '../kit';
import {Chip, Telefono} from '../iconos';

const pwm = (x0: number, yA: number, yB: number, w: number, n: number, ciclo: (k: number) => number) => {
  const per = w / n;
  let d = `M${x0} ${yB}`;
  for (let k = 0; k < n; k++) {
    const xa = x0 + k * per;
    const c = Math.max(0.08, Math.min(0.92, ciclo(k)));
    d += `H${xa}V${yA}H${xa + per * c}V${yB}`;
  }
  return d + `H${x0 + w}`;
};

export const Control: React.FC = () => {
  const {t, M} = useEscena();
  const tRed = M('red', 0.4);
  const tDem = M('demanda', 2.6);
  const tCtl = M('controlador', 4.5);
  const tAju = M('ajusta', 7.5);
  const tLar = M('largos', 9.7);
  const tCor = M('cortos', 11.3);
  // error de la salida (negativo = falta energía)
  const err = (tau: number) => {
    const ondas = 0.16 * Math.sin(6 * tau) * ap(tau, tRed, 0.6) * (1 - ap(tau, tAju, 1.6));
    const caida = -0.38 * ap(tau, tDem, 0.5) * Math.exp(-Math.max(0, tau - tLar + 0.6) * 1.6);
    const exceso = 0.3 * ap(tau, tCor - 0.5, 0.3) * Math.exp(-Math.max(0, tau - tCor - 0.2) * 2.2);
    return ondas + caida + exceso;
  };
  const x0 = 260;
  const w = 1040;
  const ventana = 4;
  const yObj = 330;
  const curva = R.funcion(x0, yObj, w, 130, (u) => -err(t - ventana + u * ventana) + 0, 200);
  const nPul = 12;
  const ciclo = (k: number) => {
    const tau = t - ventana + ((k + 0.5) / nPul) * ventana;
    return t > tAju - 0.5 ? 0.5 - 0.9 * err(tau) : 0.5;
  };
  return (
    <Lienzo>
      <Ap p={ap(t, 0, 0.6)}>
        <D d={R.linea(x0, yObj, x0 + w, yObj)} w={3} c={P.tinta} dash="12 10" />
        <Etiqueta x={x0 + w + 16} y={yObj} texto="objetivo" a="start" s={24} c={P.tinta} />
        <Etiqueta x={x0} y={170} texto="salida" a="start" s={24} />
      </Ap>
      <D d={curva} p={ap(t, 0, 0.8)} w={6} c={P.azul} />
      <Ap p={ap(t, tRed - 0.2, 0.5)}>
        <Etiqueta x={x0 + 300} y={470} texto="la red fluctúa" c={P.rojo} s={24} />
      </Ap>
      <Ap p={ap(t, tDem - 0.2, 0.6)}>
        <Telefono x={1560} y={300} s={0.42} nivel={0.5} cargando />
        <Etiqueta x={1560} y={430} texto="el teléfono pide más" s={22} />
      </Ap>
      <Ap p={ap(t, tCtl - 0.2, 0.6)}>
        <Chip x={1560} y={600} w={230} h={100} texto="controlador" />
        <Flecha x1={x0 + w + 20} y1={yObj + 40} x2={1480} y2={540} w={4} c={P.tinta2} />
        <Etiqueta x={1420} y={455} texto="compara" s={22} a="end" />
      </Ap>
      <Ap p={ap(t, tAju - 0.3, 0.6)}>
        <path d={pwm(x0, 640, 740, w, nPul, ciclo)} stroke={P.tinta} strokeWidth={5} fill="none" strokeLinejoin="round" />
        <Etiqueta x={x0 - 14} y={690} texto="pulsos" a="end" s={22} />
        <Flecha x1={1440} y1={640} x2={x0 + w + 20} y2={690} w={4} c={P.tinta2} />
      </Ap>
      <Ap p={ap(t, tLar - 0.1, 0.5) * sal(t, tCor - 0.2, 0.4)}>
        <T x={780} y={560} s={34} pe={800} c={P.azul}>
          falta energía: pulsos más largos
        </T>
      </Ap>
      <Ap p={ap(t, tCor - 0.1, 0.5)}>
        <T x={780} y={560} s={34} pe={800} c={P.rojo}>
          sobra: pulsos más cortos
        </T>
      </Ap>
    </Lienzo>
  );
};

export const Opto: React.FC = () => {
  const {t, M} = useEscena();
  const tCru = M('cruzarla', 3.6);
  const tLuz = M('luz', 7.8);
  const tOpt = M('opto', 9.7);
  const tOtr = M('otros', 11.9);
  const tReg = M('regulada', 16.2);
  const pD = ap(t, 0, 1.0, easeInOut);
  const rayos = [];
  if (t > tLuz - 0.2) {
    for (let k = 0; k < 3; k++) {
      const q = ((t * 1.4 + k / 3) % 1);
      const x = 1000 - q * 80;
      rayos.push(
        <g key={k} opacity={(1 - Math.abs(q - 0.5) * 2) * ap(t, tLuz - 0.2, 0.4)}>
          <path d={`M${x + 18} ${470 + (k - 1) * 22}l-30 0`} stroke={P.azul} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${x - 4} ${462 + (k - 1) * 22}l-10 8l10 8`} stroke={P.azul} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>,
      );
    }
  }
  return (
    <Lienzo>
      <Ap p={pD}>
        <path d={R.rect(200, 220, 700, 520, 28)} fill={P.rojoSuave} />
        <path d={R.rect(1020, 220, 700, 520, 28)} fill={P.azulSuave} />
      </Ap>
      <D d={R.linea(960, 190, 960, 770)} p={ap(t, 0.2, 0.8)} w={5} c={P.rojo} dash="16 12" />
      <Chip x={480} y={470} w={220} h={100} texto="controlador" p={pD} />
      <Ap p={pD}>
        <T x={1440} y={420} s={34} pe={800} c={P.azul}>
          salida
        </T>
        <T x={1440} y={480} s={56} pe={800} c={P.azul} mono>
          5,0 V
        </T>
      </Ap>
      <Ap p={ap(t, 0.6, 0.5) * sal(t, tLuz - 0.4, 0.4)}>
        <T x={960} y={330} s={90} pe={800} c={P.tinta}>
          ?
        </T>
      </Ap>
      <Ap p={ap(t, tCru, 0.4) * sal(t, tLuz - 0.4, 0.4)}>
        <Flecha x1={1300} y1={600} x2={985} y2={600} w={6} c={P.tinta2} />
        <Cruz x={960} y={600} s={1} />
        <Etiqueta x={1140} y={650} texto="sin cruzar la barrera" s={24} c={P.rojo} />
      </Ap>
      <Ap p={ap(t, tLuz - 0.3, 0.6)}>
        <path d={R.rect(860, 395, 200, 150, 14)} fill="#fff" stroke={P.tinta} strokeWidth={5} />
        {[420, 520].map((y) => (
          <g key={y}>
            <path d={R.linea(840, y, 860, y)} stroke={P.tinta} strokeWidth={5} />
            <path d={R.linea(1060, y, 1080, y)} stroke={P.tinta} strokeWidth={5} />
          </g>
        ))}
        <path d={R.poli([[1010, 445], [1036, 470], [1010, 495]], true)} fill={P.azulSuave} stroke={P.tinta} strokeWidth={4} transform="rotate(180 1023 470)" />
        <path d={R.linea(1004, 445, 1004, 495)} stroke={P.tinta} strokeWidth={4} />
        <circle cx={900} cy={470} r={22} fill="#fff" stroke={P.tinta} strokeWidth={4} />
        {rayos}
        <D d={R.poli([[1080, 420], [1240, 420], [1240, 470], [1300, 470]])} w={4} />
        <D d={R.poli([[840, 420], [700, 420], [700, 470], [590, 470]])} w={4} />
      </Ap>
      <Ap p={ap(t, tLuz, 0.5)}>
        <Etiqueta x={960} y={360} texto="la información viaja como luz" c={P.azul} s={26} />
      </Ap>
      <Ap p={ap(t, tOpt - 0.1, 0.5)}>
        <T x={960} y={600} s={42} pe={800}>
          optoacoplador
        </T>
      </Ap>
      <Ap p={ap(t, tOtr, 0.5)}>
        <Etiqueta x={550} y={660} texto="otros diseños lo deducen desde aquí" s={22} />
      </Ap>
      <Ap p={ap(t, tReg - 0.1, 0.5)}>
        <Check x={1440} y={575} s={1.3} />
        <Etiqueta x={1440} y={640} texto="regulada, pulso a pulso" c={P.azul} s={26} />
      </Ap>
    </Lienzo>
  );
};
