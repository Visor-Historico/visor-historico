import { Controller } from "@hotwired/stimulus"
import { panoramaInitialization } from "../src/panorama";
import { VRButton } from "three/examples/jsm/Addons.js";

// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    const { scene, mesh, renderer, camera } = panoramaInitialization();

    scene.add(mesh);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    this.element.appendChild(renderer.domElement);
    this.element.appendChild(VRButton.createButton(renderer));

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
}
