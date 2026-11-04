// Composición maestra: lee el plan resuelto (plan.json) y monta escenas, audio,
// subtítulos y rótulos, todo sincronizado con la narración.
import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useVideoConfig} from 'remotion';
import {useFuentes} from '../config/fuentes';
import {EscenaCtx, Fundido, Plan} from './tiempo';
import {FORMATOS} from './registro';

export type PropsEpisodio = {episodio: string; plan?: Plan; conAudio?: boolean};

export const calcularEpisodio: CalculateMetadataFunction<PropsEpisodio> = async ({props}) => {
  const res = await fetch(staticFile(`episodios/${props.episodio}/plan.json`));
  if (!res.ok) throw new Error(`No encuentro episodios/${props.episodio}/plan.json. Ejecuta resolver_plan.py ${props.episodio}`);
  const plan = (await res.json()) as Plan;
  return {
    durationInFrames: Math.ceil((plan.duracionAudio + plan.cola) * plan.fps),
    fps: plan.fps,
    width: plan.ancho,
    height: plan.alto,
    props: {...props, plan},
  };
};

const SOLAPE = 0.35; // segundos de fundido cruzado entre escenas

export const Episodio: React.FC<PropsEpisodio> = ({plan, conAudio = true}) => {
  useFuentes();
  const {fps} = useVideoConfig();
  if (!plan) return null;
  const fmt = FORMATOS[plan.formato] ?? FORMATOS.pizarra;
  const finAudio = Math.round(plan.duracionAudio * fps);
  return (
    <AbsoluteFill style={{background: fmt.fondo}}>
      {plan.escenas.map((e, k) => {
        const Comp = fmt.escenas[e.escena] ?? fmt.Falta;
        const ultima = k === plan.escenas.length - 1;
        const dur = e.fin - e.inicio;
        return (
          <Sequence key={e.id} name={e.id} from={Math.round(e.inicio * fps)} durationInFrames={Math.max(1, Math.round((dur + (ultima ? 0.6 : SOLAPE)) * fps))} layout="none">
            <EscenaCtx.Provider value={{dur, m: e.marcas, props: e.props}}>
              <Fundido dur={dur} entrada={k === 0 ? 0 : SOLAPE} salida={ultima ? 0.6 : SOLAPE}>
                <Comp {...(e.props ?? {})} />
              </Fundido>
            </EscenaCtx.Provider>
          </Sequence>
        );
      })}
      <fmt.Rotulo escenas={plan.escenas} hasta={plan.duracionAudio} />
      {plan.subtitulos.activo && <fmt.Subtitulos frases={plan.subtitulos.frases} />}
      <Sequence from={finAudio} name="pantalla final">
        <fmt.Cierre />
      </Sequence>
      {conAudio && <Audio src={staticFile(plan.audio)} />}
    </AbsoluteFill>
  );
};
