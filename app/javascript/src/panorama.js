import * as THREE from 'three';

export function panoramaInitialization(panorama) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  const renderer = new THREE.WebGLRenderer({antialias: true});
  // Posicion inicial del view, esto tiene que venir como param segun la textura
  const geometry = new THREE.SphereGeometry( 500, 60, 40, 1.5 ); 
  geometry.scale(-1, 1, 1);
  const texture = new THREE.TextureLoader().load( panorama );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial( { map: texture } );
  const mesh = new THREE.Mesh( geometry, material );

  return { scene, mesh, renderer, camera, material, texture}
}

export function audioInitialization() {
  const listener = new THREE.AudioListener();
  const audioLoader = new THREE.AudioLoader();
  const sound = new THREE.Audio(listener);

  return { listener, audioLoader, sound }
}
