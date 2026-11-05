// Composición de prueba del formato Taller (para medir calidad y velocidad de render).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Estudio, camaraEn} from './Estudio';
import {Bola, PiezoDisco, SombraContacto, caidaBola} from './modelos/Piezo';
import {useFuentes} from '../../config/fuentes';

export const PruebaTaller: React.FC<{dof?: boolean; escala?: number; aa?: boolean; sombraSuelo?: boolean}> = ({dof = false, escala = 1, aa = true, sombraSuelo = true}) => {
  useFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camaraEn(
    [
      {t: 0, pos: [5.5, 4.2, 6.5], obj: [0.2, 0.1, 0.2], fov: 26},
      {t: 0, d: 4, pos: [3.6, 2.6, 4.6], obj: [0.1, 0.1, 0.2], fov: 26},
    ],
    t,
  );
  const {y, flex} = caidaBola(t, 0.6, 6, 0.5);
  return (
    <AbsoluteFill style={{background: '#0F1A15'}}>
      <Estudio camara={cam} fondo="tapete" desenfoque={dof ? {foco: 6.5, apertura: 0.0025} : null} escala={escala} aa={aa} sombraSuelo={sombraSuelo}>
        <PiezoDisco flex={flex} />
        <Bola p={[0, y, 0]} />
        <SombraContacto r={0.5 + (y - 0.5) * 0.08} op={Math.max(0, 0.6 - (y - 0.5) * 0.1)} y={0.09} />
      </Estudio>
    </AbsoluteFill>
  );
};
