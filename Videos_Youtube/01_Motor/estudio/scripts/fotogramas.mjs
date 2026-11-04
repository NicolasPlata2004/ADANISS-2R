// Renderiza fotogramas sueltos de una composición (vista previa rápida sin renderizar el video).
// Uso: node scripts/fotogramas.mjs EP01 carpeta_salida 1.5 4.2 7 ...   (tiempos en segundos)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [, , id, salida, ...tiempos] = process.argv;
if (!id || !salida || tiempos.length === 0) {
  console.log('Uso: node scripts/fotogramas.mjs <composicion> <carpeta> <seg1> <seg2> ...');
  process.exit(1);
}
fs.mkdirSync(salida, {recursive: true});
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const serveUrl = await bundle({entryPoint: path.join(raiz, 'src/index.ts'), publicDir: path.join(raiz, 'public')});
const browserExecutable = process.env.REMOTION_CHROME || null;
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'swangle'}});
const comp = await selectComposition({serveUrl, id, inputProps: {}, puppeteerInstance: browser, browserExecutable});
for (const s of tiempos) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(s) * comp.fps));
  const out = path.join(salida, `f_${String(frame).padStart(5, '0')}.png`);
  await renderStill({composition: comp, serveUrl, output: out, frame, inputProps: comp.props, puppeteerInstance: browser, browserExecutable, scale: 0.5});
  console.log(`${s}s -> ${out}`);
}
await browser.close({silent: true});
