import * as THREE from 'three';


export class Panorama {
  static panoramaInitialization() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    const renderer = new THREE.WebGLRenderer({antialias: true});
    const geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.scale(-1, 1, 1);
    const texture = new THREE.TextureLoader().load( '/images/360_tour/cineCentroDia4K.png' );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const mesh = new THREE.Mesh( geometry, material );

    return { scene, mesh, renderer, camera }
  }
}
