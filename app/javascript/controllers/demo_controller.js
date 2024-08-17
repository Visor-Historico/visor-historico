import { Controller } from "@hotwired/stimulus"
import { Panorama } from "../src/panorama";

// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    const { scene, mesh, renderer, camera } = Panorama.panoramaInitialization();

    scene.add(mesh);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.element.appendChild(renderer.domElement);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
}
