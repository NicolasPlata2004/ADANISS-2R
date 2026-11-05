// Fuentes locales (paquetes @fontsource, licencia OFL): no dependen de internet al renderizar.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/500-italic.css';
import '@fontsource/inter/600-italic.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const MUESTRA = 'Ááéíóúñ¿¡%×·—0123456789 Vabc';
const PESOS = [
  '400 40px Inter',
  '500 40px Inter',
  '600 40px Inter',
  '700 40px Inter',
  '800 40px Inter',
  'italic 500 40px Inter',
  'italic 600 40px Inter',
  '500 40px "JetBrains Mono"',
  '700 40px "JetBrains Mono"',
];

let promesa: Promise<unknown> | null = null;

/** Promesa compartida de carga de fuentes (la usan también las texturas de texto 3D). */
export const cargarFuentes = () => {
  promesa ??= Promise.all(PESOS.map((p) => document.fonts.load(p, MUESTRA))).then(() => document.fonts.ready);
  return promesa;
};

/** Detiene el render hasta que las fuentes estén cargadas (evita textos con la fuente equivocada). */
export const useFuentes = () => {
  useState(() => {
    const h = delayRender('Cargando fuentes');
    cargarFuentes().then(() => continueRender(h)).catch(() => continueRender(h));
    return h;
  });
};
