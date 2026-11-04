// Miniatura de YouTube (1280×720) en el mismo estilo Pizarra del episodio.
// Pocas palabras, mucho contraste y un objeto protagonista.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFuentes} from '../../config/fuentes';
import {D, Lienzo, ondaSeno, P, R, T} from './kit';
import {Cargador, Telefono} from './iconos';

export type PropsMiniatura = {linea1: string; linea2: string; dato: string};

export const Miniatura: React.FC<PropsMiniatura> = ({linea1, linea2, dato}) => {
  useFuentes();
  return (
    <AbsoluteFill style={{background: P.papel}}>
      <Lienzo>
        <T x={110} y={200} s={150} pe={800} a="start" ls={-4}>
          {linea1}
        </T>
        <T x={110} y={360} s={150} pe={800} a="start" ls={-4} c={P.rojo}>
          {linea2}
        </T>
        <path d={R.rect(110, 450, 120, 14, 7)} fill={P.rojo} />
        {/* el cargador traduce: marea roja que entra, línea azul que sale */}
        <D d={ondaSeno(140, 760, 700, 90, 3.2, 0)} w={14} c={P.rojo} />
        <D d={R.linea(1260, 760, 1590, 760)} w={14} c={P.azul} />
        <Cargador x={1060} y={760} s={2.0} />
        <circle cx={1060} cy={760} r={250} fill="none" stroke={P.rojo} strokeWidth={8} opacity={0.9} />
        <Telefono x={1720} y={700} s={0.95} nivel={1} texto="100%" />
        <path d={R.rect(1120, 150, 700, 120, 60)} fill={P.tinta} />
        <T x={1470} y={212} s={66} pe={800} c="#fff">
          {dato}
        </T>
      </Lienzo>
    </AbsoluteFill>
  );
};
