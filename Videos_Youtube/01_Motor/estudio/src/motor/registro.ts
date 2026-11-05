// Registro de formatos: cada formato aporta su fondo, sus escenas y su "marco"
// (subtítulos, rótulos y pantalla final). Para crear un formato nuevo, añádelo aquí.
import React from 'react';
import {PIZARRA} from '../config/marca';
import {Capitulo, Cierre, Falta, Rotulo, Subtitulos, TextoClave} from '../formatos/pizarra/marco';
import * as Gancho from '../formatos/pizarra/escenas/gancho';
import * as Sentido from '../formatos/pizarra/escenas/sentido';
import * as Presion from '../formatos/pizarra/escenas/presion';
import * as Control from '../formatos/pizarra/escenas/control';
import * as Potencia from '../formatos/pizarra/escenas/potencia';
import {CierreTaller, FaltaTaller, RotuloTaller, SubtitulosTaller} from '../formatos/taller/marco';
import * as Taller3D_S01 from '../formatos/taller/escenas/s01_3d';
import * as Taller2D from '../formatos/taller/escenas/s01_2d';
import * as Comunes3D from '../formatos/taller/escenas/comunes3d';
import * as S01Extra3D from '../formatos/taller/escenas/s01_3d_extra';
import * as S02_3D from '../formatos/taller/escenas/s02_3d';
import * as S03_3D from '../formatos/taller/escenas/s03_3d';
import * as S04_3D from '../formatos/taller/escenas/s04_3d';
import * as S05_3D from '../formatos/taller/escenas/s05_3d';
import * as S06_3D from '../formatos/taller/escenas/s06_3d';
import * as S07_3D from '../formatos/taller/escenas/s07_3d';
import type {EscenaPlan, Frase} from './tiempo';

export type Formato = {
  fondo: string;
  escenas: Record<string, React.FC<any>>;
  Falta: React.FC;
  Rotulo: React.FC<{escenas: EscenaPlan[]; hasta: number}>;
  Subtitulos: React.FC<{frases: Frase[]}>;
  Cierre: React.FC<{episodio?: string}>;
};

/** Objeto que gira en la pantalla final de cada episodio de la serie. */
const HEROE: Record<string, string> = {S01_Piezo: 'piezo', S02_Tactil: 'celular', S03_PIR: 'pir', S04_Hall: 'control', S05_Acelerometro: 'mems', S06_Giroscopio: 'giroscopio', S07_Ultrasonico: 'hcsr04', S08_LiDAR: 'celularLidar'};
const Cierre3DEpisodio: React.FC<{episodio?: string}> = ({episodio = ''}) => React.createElement(Comunes3D.Cierre3D, {modelo: HEROE[episodio] ?? 'piezo'});

export const FORMATOS: Record<string, Formato> = {
  pizarra: {
    fondo: PIZARRA.papel,
    escenas: {Capitulo, TextoClave, ...Gancho, ...Sentido, ...Presion, ...Control, ...Potencia},
    Falta,
    Rotulo,
    Subtitulos,
    Cierre,
  },
  // Formato mixto de la Serie Sensores: 3D realista (estilo reel del piezo) + insertos 2D.
  taller: {
    fondo: '#0B0F0D',
    escenas: {...Taller2D, ...Taller3D_S01},
    Falta: FaltaTaller,
    Rotulo: RotuloTaller,
    Subtitulos: SubtitulosTaller,
    Cierre: CierreTaller,
  },
  // Serie Sensores, versión solo-3D: todas las escenas son renders 3D.
  taller3d: {
    fondo: '#050607',
    escenas: {...Taller3D_S01, ...Comunes3D, ...S01Extra3D, ...S02_3D, ...S03_3D, ...S04_3D, ...S05_3D, ...S06_3D, ...S07_3D},
    Falta: FaltaTaller,
    Rotulo: RotuloTaller,
    Subtitulos: SubtitulosTaller,
    Cierre: Cierre3DEpisodio,
  },
};
