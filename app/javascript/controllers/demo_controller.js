import { Controller } from "@hotwired/stimulus"
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    this.element.appendChild( renderer.domElement );

    scene.add( cube );

    camera.position.z = 5;

    renderer.setAnimationLoop(this.animate);
  }

  animate() {
    console.log('this animate');
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.02;

    renderer.render(scene, camera);
  }
}
