// EP01 · Capítulos 4 y 5: potencia, USB Power Delivery y el teléfono (5:07 – 6:18), y cierre
import React from 'react';
import {ap, clamp01, easeInOut, easeOutBack, mix, sal, useEscena} from '../../../motor/tiempo';
import {Ap, Check, D, Etiqueta, Flecha, Flujo, Lienzo, Mover, P, Pildora, R, T} from '../kit';
import {Alerta, Bateria, Burbuja, Cargador, Chip, Condensador, Diodo, Enchufe, Reloj, Resorte, Telefono} from '../iconos';

// ------------------------------------------------------------------ ¿1 hora o 3 horas?
export const Carrera: React.FC = () => {
  const {t, M} = useEscena();
  const tHor = M('hora', 3.4);
  const tTre = M('tres', 4.9);
  const a = mix(0.08, 1, ap(t, 1.0, 3.2, easeInOut));
  const b = mix(0.08, 0.4, ap(t, 1.0, 5.5, easeInOut));
  return (
    <Lienzo>
      <Telefono x={700} y={430} s={0.85} p={ap(t, 0, 0.9, easeInOut)} nivel={a} texto={`${Math.round(a * 100)}%`} colorNivel={P.azul} cargando />
      <Telefono x={1220} y={430} s={0.85} p={ap(t, 0.2, 0.9, easeInOut)} nivel={b} texto={`${Math.round(b * 100)}%`} colorNivel={P.tinta2} cargando />
      <Ap p={ap(t, tHor - 0.1, 0.5)}>
        <T x={700} y={680} s={50} pe={800} c={P.azul}>
          1 hora
        </T>
      </Ap>
      <Ap p={ap(t, tTre - 0.1, 0.5)}>
        <T x={1220} y={680} s={50} pe={800} c={P.tinta2}>
          3 horas
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ potencia = presión × caudal
export const Potencia: React.FC = () => {
  const {t, M} = useEscena();
  const tPre = M('presion', 4.3);
  const tCau = M('caudal', 5.4);
  const tPot = M('potencia', 7.4);
  const llenado = mix(0.15, 0.85, ap(t, 0.4, 8, (x) => x));
  return (
    <Lienzo>
      <Bateria x={1580} y={300} s={0.75} p={ap(t, 0, 0.8)} nivel={llenado} />
      <Ap p={ap(t, 0.3, 0.5)}>
        <Etiqueta x={1580} y={380} texto="lo que la llena: energía" s={24} />
      </Ap>
      <Ap p={ap(t, tPot - 0.1, 0.5)} s={0.8} ox={560} oy={470}>
        <T x={560} y={470} s={150} pe={800} c={P.azul} it>
          P
        </T>
        <T x={700} y={470} s={130} pe={500}>
          =
        </T>
        <Etiqueta x={560} y={600} texto="potencia" c={P.azul} s={30} />
      </Ap>
      <Ap p={ap(t, tPre - 0.1, 0.5)} s={0.8} ox={880} oy={470}>
        <T x={880} y={470} s={150} pe={800} it>
          V
        </T>
        <Etiqueta x={880} y={600} texto="presión" s={30} />
        <Etiqueta x={880} y={640} texto="(voltaje)" s={24} />
      </Ap>
      <Ap p={ap(t, tCau - 0.2, 0.5)}>
        <T x={1040} y={470} s={110} pe={500}>
          ×
        </T>
      </Ap>
      <Ap p={ap(t, tCau - 0.1, 0.5)} s={0.8} ox={1190} oy={470}>
        <T x={1190} y={470} s={150} pe={800} it>
          I
        </T>
        <Etiqueta x={1190} y={600} texto="caudal" s={30} />
        <Etiqueta x={1190} y={640} texto="(corriente)" s={24} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ antes: 5 V siempre
export const CincoVoltios: React.FC = () => {
  const {t, M} = useEscena();
  const tCin = M('cinco', 2.7);
  const tLen = M('lento', 4.9);
  return (
    <Lienzo>
      {[560, 960, 1360].map((x, k) => (
        <g key={x}>
          <Cargador x={x} y={440} s={1.05} p={ap(t, 0.2 + k * 0.25, 0.8, easeInOut)} relleno={P.grisClaro} />
          <Ap p={ap(t, tCin + k * 0.15, 0.4)} s={0.7} ox={x} oy={640}>
            <T x={x} y={640} s={64} pe={800} c={P.azul}>
              5 V
            </T>
          </Ap>
        </g>
      ))}
      <Ap p={ap(t, tLen, 0.5)}>
        <path d={R.rect(560, 740, 800, 30, 15)} fill="#fff" stroke={P.tinta} strokeWidth={3} />
        <path d={R.rect(564, 744, Math.max(10, 792 * mix(0.05, 0.3, ap(t, tLen, 3, (x) => x))), 22, 11)} fill={P.azul} />
        <Check x={500} y={755} />
        <Etiqueta x={1380} y={755} texto="seguro, pero lento" a="start" s={26} />
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ USB Power Delivery: primero conversan
const MENU = ['5 V', '9 V', '15 V', '20 V'];

export const Negociacion: React.FC = () => {
  const {t, M} = useEscena();
  const tPel = M('peligro', 4.5);
  const tCon = M('conversan', 7.5);
  const tMen = M('menu', 9.9);
  const tEli = M('elige', 12.3);
  const tCam = M('cambia', 14.8);
  const tPd = M('pd', 16.7);
  const peligro = ap(t, tPel - 0.1, 0.3) * sal(t, tCon - 0.5, 0.4);
  const v = t > tCam ? '9 V' : peligro > 0.5 ? '20 V' : '5 V';
  const colV = peligro > 0.5 ? P.rojo : P.azul;
  const salto = t > tCam ? easeOutBack(clamp01((t - tCam) / 0.5)) : 1;
  const escribiendo = t > tCon - 0.2 && t < tMen - 0.2;
  const puntos = (x: number, y: number) =>
    [0, 1, 2].map((k) => <circle key={k} cx={x - 24 + k * 24} cy={y} r={8} fill={P.tinta2} opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - k))} />);
  return (
    <Lienzo>
      <Cargador x={420} y={580} s={0.9} p={ap(t, 0, 0.8, easeInOut)} />
      <Telefono x={1500} y={560} s={0.6} p={ap(t, 0.2, 0.8, easeInOut)} nivel={0.4} cargando />
      <D d={R.linea(505, 580, 1430, 580)} p={ap(t, 0.4, 0.8)} w={6} />
      <Etiqueta x={700} y={620} texto="USB-C" s={22} p={ap(t, 0.8, 0.4)} />
      <Ap p={ap(t, 1.0, 0.5)}>
        <g transform={`translate(965 580) scale(${salto}) translate(-965 -580)`}>
          <Pildora x={965} y={580} texto={v} fondo={colV} s={34} w={150} />
        </g>
      </Ap>
      <Ap p={peligro}>
        <Alerta x={965} y={420} s={0.65} />
        <Etiqueta x={965} y={500} texto="subir sin acuerdo: peligroso" c={P.rojo} s={24} />
      </Ap>
      {/* conversación */}
      <Burbuja x={560} y={300} w={380} h={250} p={ap(t, tCon - 0.2, 0.5)} cola="izq">
        {escribiendo ? (
          puntos(560, 300)
        ) : (
          <g>
            <T x={560} y={210} s={24} pe={600} c={P.tinta2}>
              puedo darte:
            </T>
            {MENU.map((m, k) => {
              const elegido = t > tEli && m === '9 V';
              return (
                <Ap key={m} p={ap(t, tMen + k * 0.25, 0.3)}>
                  {elegido && <path d={R.rect(500, 233 + k * 44, 120, 38, 19)} fill={P.azul} />}
                  <T x={560} y={252 + k * 44} s={28} pe={700} c={elegido ? '#fff' : P.tinta} mono>
                    {m}
                  </T>
                </Ap>
              );
            })}
          </g>
        )}
      </Burbuja>
      <Burbuja x={1380} y={300} w={300} h={120} p={ap(t, tCon + 0.4, 0.5)} cola="der" relleno={t > tEli ? P.azulSuave : '#fff'}>
        {t < tEli ? puntos(1380, 300) : (
          <T x={1380} y={300} s={30} pe={700}>
            quiero 9 V
          </T>
        )}
      </Burbuja>
      <Ap p={ap(t, tPd - 0.1, 0.6)}>
        <T x={960} y={760} s={52} pe={800} c={P.azul}>
          USB Power Delivery
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ no todos hablan el mismo idioma
export const Idiomas: React.FC = () => {
  const {t, M} = useEscena();
  const tVue = M('vuela', 4.5);
  const tNor = M('normal', 6.9);
  const a = mix(0.15, 1, ap(t, tVue, 1.6, easeInOut));
  const b = mix(0.15, 0.4, ap(t, tNor, 4, easeInOut));
  return (
    <Lienzo>
      <Cargador x={520} y={470} s={0.9} p={ap(t, 0, 0.8, easeInOut)} />
      <D d="M610 450C800 450 900 300 1180 300" p={ap(t, 0.3, 0.7)} w={5} />
      <D d="M610 490C800 490 900 650 1180 650" p={ap(t, 0.3, 0.7)} w={5} />
      <Telefono x={1290} y={300} s={0.55} p={ap(t, 0.4, 0.7)} nivel={a} colorNivel={P.azul} cargando />
      <Telefono x={1290} y={650} s={0.55} p={ap(t, 0.5, 0.7)} nivel={b} colorNivel={P.tinta2} cargando />
      <Ap p={ap(t, 1.0, 0.5)}>
        <Pildora x={1520} y={260} texto="habla PD" fondo={P.azul} s={24} />
        <Pildora x={1520} y={610} texto="otro idioma" fondo={P.gris} s={24} />
      </Ap>
      <Ap p={ap(t, tVue, 0.5)}>
        <T x={1520} y={330} s={44} pe={800} c={P.azul}>
          vuela
        </T>
      </Ap>
      <Ap p={ap(t, tNor, 0.5)}>
        <T x={1520} y={680} s={44} pe={800} c={P.tinta2}>
          normal
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ el teléfono manda
export const TelefonoManda: React.FC = () => {
  const {t, M} = useEscena();
  const tMan = M('manda', 2.6);
  const tSis = M('sistema', 5.9);
  const tCel = M('celda', 8.9);
  const tDos = M('dosifica', 10.6);
  const tPro = M('propone', 13.0);
  const tAdm = M('administra', 15.0);
  const pD = ap(t, 0, 1.0, easeInOut);
  const goteo = [];
  if (t > tDos - 0.2) {
    for (let k = 0; k < 4; k++) {
      const q = ((t * 0.9 + k / 4) % 1);
      goteo.push(<circle key={k} cx={640} cy={mix(500, 420, q)} r={8} fill={P.azul} opacity={(1 - q) * ap(t, tDos - 0.2, 0.4)} />);
    }
  }
  return (
    <Lienzo>
      <Telefono x={640} y={470} s={1.32} p={pD} sinBateria />
      <Mover y={0}>
        <g transform="rotate(-90 640 320)">
          <Bateria x={640} y={320} s={0.9} w={180} h={90} p={ap(t, 0.4, 0.8)} nivel={mix(0.35, 0.8, ap(t, tDos, 6, (x) => x))} />
        </g>
      </Mover>
      <Chip x={640} y={560} w={190} h={80} s={1} texto="gestor" p={ap(t, 0.6, 0.8)} relleno={t > tMan ? P.azulSuave : '#fff'} />
      <D d={R.rect(610, 712, 60, 18, 9)} p={pD} w={4} />
      <Ap p={ap(t, tSis, 0.5)}>
        <Flecha x1={640} y1={705} x2={640} y2={620} w={5} c={P.azul} />
        <Flecha x1={640} y1={505} x2={640} y2={425} w={5} c={P.azul} />
      </Ap>
      {t > tSis && t < tDos && <Flujo pts={[[640, 700], [640, 610]]} t={t} vel={90} n={3} r={7} />}
      {goteo}
      <Ap p={ap(t, tMan - 0.1, 0.5)}>
        <Flecha x1={930} y1={560} x2={760} y2={560} w={5} />
        <T x={950} y={560} s={36} pe={800} a="start">
          quien manda
        </T>
      </Ap>
      <Ap p={ap(t, tCel - 0.1, 0.5)}>
        <Flecha x1={930} y1={320} x2={760} y2={320} w={5} />
        <T x={950} y={305} s={48} pe={800} a="start" c={P.azul} mono>
          ~4,2 V
        </T>
        <Etiqueta x={950} y={360} texto="la presión exacta de su celda" a="start" s={26} />
      </Ap>
      <Ap p={ap(t, tDos, 0.5)}>
        <Etiqueta x={950} y={430} texto="y dosifica cada entrega" a="start" s={26} c={P.azul} />
      </Ap>
      <Ap p={ap(t, tPro - 0.1, 0.5)}>
        <T x={1290} y={620} s={34} pe={600} a="start" c={P.tinta2}>
          el cargador propone,
        </T>
      </Ap>
      <Ap p={ap(t, tAdm - 0.1, 0.5)}>
        <T x={1290} y={680} s={34} pe={800} a="start" c={P.azul}>
          el teléfono administra.
        </T>
      </Ap>
    </Lienzo>
  );
};

// ------------------------------------------------------------------ resumen: lo que pasa dentro de la cajita
const RANURAS = [
  {x: 435, titulo: 'puertas', sub: 'ordenan la marea'},
  {x: 785, titulo: 'depósito', sub: 'la alisa'},
  {x: 1135, titulo: 'resorte invisible', sub: 'la cruza a salvo'},
  {x: 1485, titulo: 'acuerdo', sub: 'antes de entregarla'},
];

export const Recap: React.FC = () => {
  const {t, M} = useEscena();
  const tSab = M('sabes', 2.5);
  const marcas = [M('puertas', 5.1), M('deposito', 8.7), M('resorte', 10.9), M('negociaron', 13.8)];
  const abre = ap(t, tSab - 0.3, 0.9, easeInOut);
  const ultimo = marcas.filter((m) => t > m - 0.2).length;
  const viaje = ultimo === 0 ? -1 : mix(0, 1, ap(t, marcas[0], marcas[3] + 1.2 - marcas[0], (x) => x));
  return (
    <Lienzo>
      <Ap p={ap(t, 0, 0.6) * sal(t, tSab, 0.5)}>
        <Reloj x={960} y={330} s={0.6} />
        <T x={960} y={470} s={48} pe={700} mono>
          7:30
        </T>
      </Ap>
      <Mover op={1 - abre}>
        <Cargador x={960} y={640} s={0.7} p={ap(t, 0.3, 0.8)} />
      </Mover>
      <Ap p={abre}>
        <path d={R.rect(260, 260, 1400, 420, 34)} fill="#fff" stroke={P.tinta} strokeWidth={5} />
        <Etiqueta x={960} y={225} texto="dentro de la cajita" s={28} c={P.tinta} />
        {[610, 960, 1310].map((x) => (
          <path key={x} d={R.linea(x, 300, x, 640)} stroke={P.grisClaro} strokeWidth={3} strokeDasharray="8 8" />
        ))}
        <path d={R.linea(130, 470, 260, 470)} stroke={P.rojo} strokeWidth={6} strokeLinecap="round" />
        <path d={R.linea(1660, 470, 1790, 470)} stroke={P.azul} strokeWidth={6} strokeLinecap="round" />
      </Ap>
      {viaje >= 0 && <circle cx={mix(300, 1620, viaje)} cy={640} r={10} fill={P.azul} />}
      {RANURAS.map((r, k) => {
        const p = ap(t, marcas[k] - 0.2, 0.6);
        return (
          <Ap key={k} p={p}>
            {k === 0 && (
              <g>
                <Diodo x1={r.x - 90} y1={420} x2={r.x + 90} y2={420} tam={34} relleno={P.azulSuave} />
              </g>
            )}
            {k === 1 && <Condensador x={r.x} y={420} s={0.9} patas={40} />}
            {k === 2 && <Resorte x1={r.x - 100} x2={r.x + 100} y={420} n={7} amp={30} c={P.azul} />}
            {k === 3 && (
              <g>
                <path d={R.rect(r.x - 110, 365, 120, 60, 20)} fill="#fff" stroke={P.tinta} strokeWidth={4} />
                <path d={R.rect(r.x - 10, 405, 120, 60, 20)} fill={P.azulSuave} stroke={P.tinta} strokeWidth={4} />
              </g>
            )}
            <T x={r.x} y={540} s={32} pe={800}>
              {r.titulo}
            </T>
            <Etiqueta x={r.x} y={585} texto={r.sub} s={24} />
          </Ap>
        );
      })}
    </Lienzo>
  );
};

// ------------------------------------------------------------------ dos mundos incompatibles
export const DosMundos: React.FC = () => {
  const {t, M} = useEscena();
  const tMun = M('mundos', 5.3);
  const tTra = M('traducir', 8.0);
  const tNot = M('notes', 9.8);
  const mundos = ap(t, tMun - 0.2, 0.8, easeInOut);
  const calma = ap(t, tNot, 1.2, easeInOut);
  return (
    <Lienzo>
      <g opacity={1 - mundos}>
        <Enchufe x={330} y={470} s={0.9} p={ap(t, 0, 0.8)} />
        <D d={R.linea(400, 470, 1490, 470)} p={ap(t, 0.2, 0.8)} w={5} />
        <Bateria x={1590} y={470} p={ap(t, 0.3, 0.8)} nivel={0.5} />
        <Ap p={ap(t, 0.6, 0.5)}>
          <T x={945} y={380} s={70} pe={800}>
            ¿un simple cable?
          </T>
        </Ap>
      </g>
      <g opacity={mundos * mix(1, 0.35, calma)}>
        <circle cx={480} cy={470} r={250} fill={P.rojoSuave} stroke={P.rojo} strokeWidth={4} />
        <T x={480} y={330} s={36} pe={800} c={P.rojo}>
          la red
        </T>
        <path d={R.funcion(330, 470, 300, 70, (u) => Math.sin(u * Math.PI * 6 - t * 6))} stroke={P.rojo} strokeWidth={6} fill="none" />
        <Etiqueta x={480} y={600} texto="alta presión, va y viene" c={P.rojo} s={24} />
        <circle cx={1440} cy={470} r={250} fill={P.azulSuave} stroke={P.azul} strokeWidth={4} />
        <T x={1440} y={330} s={36} pe={800} c={P.azul}>
          la batería
        </T>
        <path d={R.linea(1290, 470, 1590, 470)} stroke={P.azul} strokeWidth={6} />
        <Etiqueta x={1440} y={600} texto="poca presión, un solo sentido" c={P.azul} s={24} />
      </g>
      <Ap p={ap(t, tTra - 0.2, 0.6)}>
        <Flecha x1={740} y1={470} x2={850} y2={470} c={P.rojo} w={6} op={mix(1, 0.4, calma)} />
        <Flecha x1={1070} y1={470} x2={1180} y2={470} c={P.azul} w={6} op={mix(1, 0.4, calma)} />
        <Cargador x={960} y={470} s={0.8} />
        <T x={960} y={300} s={40} pe={800} op={1 - calma}>
          alguien traduce
        </T>
      </Ap>
      <Ap p={calma}>
        <T x={960} y={640} s={40} pe={500} c={P.tinta2} it>
          sin que lo notes
        </T>
      </Ap>
    </Lienzo>
  );
};

export {TelefonoManda as Telefono};
