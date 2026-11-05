// Materiales físicos (PBR) con un poco de imperfección para que no se vean "de plástico".
import * as THREE from 'three';
import {texturaRuido} from './texturas';

const cache = new Map<string, THREE.Material>();
const memo = <T extends THREE.Material>(clave: string, crear: () => T): T => {
  if (!cache.has(clave)) cache.set(clave, crear());
  return cache.get(clave) as T;
};

export const M = {
  laton: () =>
    memo('laton', () => new THREE.MeshStandardMaterial({color: '#C99A45', metalness: 1, roughness: 0.3, roughnessMap: texturaRuido(1, 0.5, 0.55)})),
  plata: () =>
    memo('plata', () => new THREE.MeshStandardMaterial({color: '#D6D9DC', metalness: 0.85, roughness: 0.48, roughnessMap: texturaRuido(2, 0.6, 0.6)})),
  ceramica: () => memo('ceramica', () => new THREE.MeshStandardMaterial({color: '#EDE8DD', metalness: 0, roughness: 0.62})),
  acero: () => memo('acero', () => new THREE.MeshStandardMaterial({color: '#E4E7EA', metalness: 1, roughness: 0.12})),
  aceroMate: () => memo('aceroMate', () => new THREE.MeshStandardMaterial({color: '#B9BEC4', metalness: 1, roughness: 0.4, roughnessMap: texturaRuido(3)})),
  estano: () => memo('estano', () => new THREE.MeshStandardMaterial({color: '#CDD1D4', metalness: 1, roughness: 0.22})),
  cobre: () => memo('cobre', () => new THREE.MeshStandardMaterial({color: '#C9733E', metalness: 1, roughness: 0.32})),
  oro: () => memo('oro', () => new THREE.MeshStandardMaterial({color: '#E6B85C', metalness: 1, roughness: 0.25})),
  plasticoNegro: () => memo('pnegro', () => new THREE.MeshStandardMaterial({color: '#18191B', metalness: 0, roughness: 0.42, roughnessMap: texturaRuido(4, 0.3, 0.5)})),
  plasticoBlanco: () => memo('pblanco', () => new THREE.MeshStandardMaterial({color: '#EEECE6', metalness: 0, roughness: 0.48})),
  plasticoGris: () => memo('pgris', () => new THREE.MeshStandardMaterial({color: '#7C8085', metalness: 0, roughness: 0.45})),
  goma: (color: string) =>
    memo(`goma${color}`, () => new THREE.MeshPhysicalMaterial({color, metalness: 0, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25})),
  vidrio: () =>
    memo('vidrio', () => new THREE.MeshPhysicalMaterial({color: '#DDEBF2', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false})),
  emisivo: (color: string, intensidad = 2) =>
    memo(`emi${color}${intensidad}`, () => new THREE.MeshStandardMaterial({color: '#000000', emissive: new THREE.Color(color), emissiveIntensity: intensidad, toneMapped: false})),
  color: (color: string, rough = 0.5, metal = 0) =>
    memo(`c${color}${rough}${metal}`, () => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal})),
};
