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
import type {EscenaPlan, Frase} from './tiempo';

export type Formato = {
  fondo: string;
  escenas: Record<string, React.FC<any>>;
  Falta: React.FC;
  Rotulo: React.FC<{escenas: EscenaPlan[]; hasta: number}>;
  Subtitulos: React.FC<{frases: Frase[]}>;
  Cierre: React.FC;
};

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
};
