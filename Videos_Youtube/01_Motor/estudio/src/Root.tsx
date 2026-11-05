import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {calcularEpisodio, Episodio} from './motor/Episodio';
import {calcularNeon, MuestraNeon} from './formatos/neon/MuestraNeon';
import {Miniatura} from './formatos/pizarra/Miniatura';
import {PruebaTaller} from './formatos/taller/Prueba';

const SERIE = ['S01_Piezo', 'S02_Tactil', 'S03_PIR', 'S04_Hall', 'S05_Acelerometro', 'S06_Giroscopio', 'S07_Ultrasonico', 'S08_LiDAR', 'S09_Temperatura', 'S10_Galga'];

export const Root: React.FC = () => (
  <>
    <Folder name="Episodios">
      {/* Genérica: npx remotion render src/index.ts Episodio salida.mp4 --props='{"episodio":"EP02"}' */}
      <Composition
        id="Episodio"
        component={Episodio}
        defaultProps={{episodio: 'EP01', conAudio: true}}
        calculateMetadata={calcularEpisodio}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EP01"
        component={Episodio}
        defaultProps={{episodio: 'EP01', conAudio: true}}
        calculateMetadata={calcularEpisodio}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
    <Folder name="Serie-Sensores">
      {/* Versión solo-3D (la definitiva): plan.yaml de cada episodio */}
      {SERIE.map((ep) => (
        <Composition key={ep} id={`${ep.slice(0, 3)}-3D`} component={Episodio} defaultProps={{episodio: ep, conAudio: true}} calculateMetadata={calcularEpisodio} durationInFrames={300} fps={24} width={1920} height={1080} />
      ))}
      {/* Versión anterior del S01 (3D + insertos 2D), se conserva */}
      <Composition id="S01-Piezo-Mixto" component={Episodio} defaultProps={{episodio: 'S01_Piezo', variante: 'plan_mixto', conAudio: true}} calculateMetadata={calcularEpisodio} durationInFrames={300} fps={24} width={1920} height={1080} />
    </Folder>
    <Folder name="Miniaturas">
      <Still id="Miniatura-EP01" component={Miniatura} width={1280} height={720} defaultProps={{linea1: '¿QUÉ HAY', linea2: 'DENTRO?', dato: '230 V a 5 V'}} />
    </Folder>
    <Folder name="Pruebas">
      <Composition id="Prueba-Taller" component={PruebaTaller} defaultProps={{dof: false}} durationInFrames={120} fps={30} width={1920} height={1080} />
      <Composition id="Prueba-Taller-DOF" component={PruebaTaller} defaultProps={{dof: true}} durationInFrames={120} fps={30} width={1920} height={1080} />
    </Folder>
    <Folder name="Muestras-de-formato">
      {/* Neón 3D sobre el tramo 0:14 – 0:46 de la narración */}
      <Composition
        id="Muestra-Neon-EP01"
        component={MuestraNeon}
        defaultProps={{episodio: 'EP01', desde: 14.4, hasta: 45.8}}
        calculateMetadata={calcularNeon}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  </>
);
