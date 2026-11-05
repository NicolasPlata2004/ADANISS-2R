// Uso: node stills.mjs <composicion> <salida_dir> <frame1> <frame2> ...   (renderiza fotogramas sueltos)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [comp, out, ...frames] = process.argv.slice(2);
const raiz = '/home/user/ADANISS-2R/Videos_Youtube/01_Motor/estudio';
const serveUrl = await bundle({entryPoint: path.join(raiz, 'src/index.ts'), publicDir: path.join(raiz, 'public')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, output: path.join(out, `${comp}_${f}.png`), frame: Number(f), browserExecutable, scale: 0.5, chromiumOptions: {gl: 'swangle'}});
  console.log(`frame ${f} ok ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
