import { Controller } from "@hotwired/stimulus"
import { audioInitialization, panoramaInitialization } from "../src/panorama";
import { VRButton } from "three/examples/jsm/Addons.js";

// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    const { scene, mesh, renderer, camera } = panoramaInitialization();
    const { listener, audioLoader, sound } = audioInitialization();

    scene.add(mesh);
    camera.add(listener);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    this.element.appendChild(renderer.domElement);
    this.element.appendChild(VRButton.createButton(renderer));

    audioLoader.load('/sounds/theater_ambiance.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true); // Puedes configurarlo en false si no quieres que se repita
      sound.setVolume(0.5); // Ajusta el volumen como desees
    });

    renderer.xr.addEventListener('sessionstart', () => {
      if (!sound.isPlaying) {
        sound.play();
      }
    });

    // Evento para detener el sonido al salir de VR
    renderer.xr.addEventListener('sessionend', () => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });

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
