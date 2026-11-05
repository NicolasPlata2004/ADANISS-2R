// Texturas procedurales (sin descargar nada): tapete de corte, ruido para rugosidad,
// protoboard y PCB. Se generan una sola vez y se reutilizan.
import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();
const memo = (clave: string, crear: () => THREE.Texture) => {
  if (!cache.has(clave)) cache.set(clave, crear());
  return cache.get(clave)!;
};

export const azar = (semilla: number) => {
  let s = semilla % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const lienzo = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return {c, g: c.getContext('2d')!};
};

const final = (c: HTMLCanvasElement, srgb = true, aniso = 8) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
};

/** Tapete de corte verde (como el del reel del piezo). lado = cm que cubre la textura. */
export const texturaTapete = (lado = 90) =>
  memo(`tapete${lado}`, () => {
    const px = 3072;
    const {c, g} = lienzo(px, px);
    const k = px / lado; // píxeles por cm
    g.fillStyle = '#1A5C43';
    g.fillRect(0, 0, px, px);
    // variación sutil del color (goma)
    const r = azar(5);
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.018 + r() * 0.03})`;
      g.fillRect(r() * px, r() * px, 1 + r() * 2.5, 1 + r() * 2.5);
    }
    // diagonales a 45° (guías de corte)
    g.strokeStyle = 'rgba(230,245,236,0.22)';
    g.lineWidth = 1.6;
    for (let d = -lado; d < lado * 2; d += 15) {
      g.beginPath();
      g.moveTo(d * k, 0);
      g.lineTo((d + lado) * k, px);
      g.stroke();
      g.beginPath();
      g.moveTo((d + lado) * k, 0);
      g.lineTo(d * k, px);
      g.stroke();
    }
    // cuadrícula de 1 cm y líneas gruesas cada 5 cm
    for (let i = 0; i <= lado; i++) {
      const gruesa = i % 5 === 0;
      g.strokeStyle = gruesa ? 'rgba(236,248,240,0.62)' : 'rgba(228,244,234,0.30)';
      g.lineWidth = gruesa ? 2.6 : 1.3;
      g.beginPath();
      g.moveTo(i * k, 0);
      g.lineTo(i * k, px);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i * k);
      g.lineTo(px, i * k);
      g.stroke();
    }
    // números de regla en dos bordes
    g.fillStyle = 'rgba(238,248,242,0.85)';
    g.font = `600 ${Math.round(k * 0.55)}px Inter, Arial, sans-serif`;
    g.textAlign = 'center';
    for (let i = 0; i <= lado; i += 1) {
      if (i % 2 === 0) g.fillText(String(i), i * k, k * 1.2);
      g.fillRect(i * k - 1, 0, 2, i % 5 === 0 ? k * 0.5 : k * 0.3);
    }
    return final(c, true, 16);
  });

/** Ruido gris para mapas de rugosidad (rompe el aspecto "plástico perfecto" de CG). */
export const texturaRuido = (semilla = 1, contraste = 0.35, base = 0.6) =>
  memo(`ruido${semilla}-${contraste}-${base}`, () => {
    const px = 512;
    const {c, g} = lienzo(px, px);
    const img = g.createImageData(px, px);
    const r = azar(semilla * 7919);
    for (let i = 0; i < px * px; i++) {
      const v = Math.max(0, Math.min(255, 255 * (base + (r() - 0.5) * contraste)));
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // vetas finas (lijado/cepillado)
    for (let i = 0; i < 900; i++) {
      g.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.05)`;
      g.beginPath();
      const y = r() * px;
      g.moveTo(0, y);
      g.lineTo(px, y + (r() - 0.5) * 20);
      g.stroke();
    }
    const t = final(c, false, 4);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Cara superior de una protoboard: agujeros, rieles rojo/azul y números. */
export const texturaProtoboard = () =>
  memo('protoboard', () => {
    const W = 2048;
    const H = 700;
    const {c, g} = lienzo(W, H);
    g.fillStyle = '#F1EFE8';
    g.fillRect(0, 0, W, H);
    const cols = 63;
    const paso = W / (cols + 3);
    const x0 = paso * 1.6;
    const hueco = (x: number, y: number) => {
      g.fillStyle = '#3A3A3A';
      g.fillRect(x - 6, y - 6, 12, 12);
      g.fillStyle = '#9A9A94';
      g.fillRect(x - 6, y - 6, 12, 3);
    };
    // rieles superior e inferior
    for (const [yRiel, color] of [
      [60, '#D64545'],
      [105, '#3D6FD6'],
      [H - 105, '#D64545'],
      [H - 60, '#3D6FD6'],
    ] as [number, string][]) {
      g.fillStyle = color;
      g.fillRect(x0, yRiel + (yRiel < H / 2 ? -26 : 20), W - x0 * 2, 4);
      for (let i = 0; i < cols; i++) if (i % 6 !== 5) hueco(x0 + i * paso, yRiel);
    }
    // dos bloques de 5 filas
    const filas = [190, 225, 260, 295, 330, 400, 435, 470, 505, 540];
    for (const y of filas) for (let i = 0; i < cols; i++) hueco(x0 + i * paso, y);
    // canal central
    g.fillStyle = '#E3E0D7';
    g.fillRect(0, 352, W, 30);
    g.fillStyle = '#8A877E';
    g.font = '600 18px Inter, Arial';
    g.textAlign = 'center';
    for (let i = 0; i < cols; i += 5) g.fillText(String(i + 1), x0 + i * paso, 165);
    return final(c, true, 8);
  });

/** PCB con máscara de soldadura, pistas y serigrafía simples. */
export const texturaPCB = (fondo = '#14171A', clave = 'negra') =>
  memo(`pcb-${clave}`, () => {
    const W = 512;
    const H = 1024;
    const {c, g} = lienzo(W, H);
    g.fillStyle = fondo;
    g.fillRect(0, 0, W, H);
    const r = azar(fondo.length * 31 + clave.length);
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.lineWidth = 6;
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      let x = r() * W;
      let y = r() * H;
      g.moveTo(x, y);
      for (let k = 0; k < 3; k++) {
        if (r() > 0.5) x += (r() - 0.5) * 300;
        else y += (r() - 0.5) * 300;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = 'rgba(235,235,235,0.75)';
    g.font = '700 22px Inter, Arial';
    g.fillText('ESP32-DEVKIT', 120, 980);
    return final(c, true, 8);
  });

/** Degradado radial negro→transparente para sombras de contacto. */
export const texturaSombra = () =>
  memo('sombra', () => {
    const px = 256;
    const {c, g} = lienzo(px, px);
    const grad = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, px, px);
    return final(c, false, 1);
  });
