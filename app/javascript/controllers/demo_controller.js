import { Controller } from "@hotwired/stimulus"
import { audioInitialization, panoramaInitialization } from "../src/panorama";
import { VRButton } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';


// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    const { scene, renderer, camera, texture, mesh } = panoramaInitialization('/images/360_tour/cine/Fachada360.png');
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
    
    // Este listener debe comportarse de acuerdo a la currentTexture
    renderer.xr.addEventListener('sessionstart', () => {
      if (!sound.isPlaying) {
        // sound.play();
      }
    });
    
    // Evento para detener el sonido al salir de VR
    renderer.xr.addEventListener('sessionend', () => {
      if (sound.isPlaying) {
        // sound.stop();
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
    
    
    // Transiciones
    const raycaster = new THREE.Raycaster(); // Selector segun la vista VR emulada por mouse
    const mouse = new THREE.Vector2(); // Instancia mouse
    
    // Lista de texturas
    const textures = {
      fachada: texture, // Textura OG creada con panorama.js
      lobby: new THREE.TextureLoader().load('/images/360_tour/cine/Lobby4K.png'), // Segunda textura de loby
      screen: new THREE.TextureLoader().load('/images/360_tour/cine/Pantalla4K.png'), // textura pantalla
      seats: new THREE.TextureLoader().load('/images/360_tour/cine/cineCentroDia4K.png')
    };
    
    // Se mapean las texturas con sus spots
    const hotspotsMap = new Map();
    hotspotsMap.set(textures.fachada, [
      { position: new THREE.Vector3(-30, 0, -400), texture: textures.lobby }
    ]);
    
    hotspotsMap.set(textures.lobby, [
      { position: new THREE.Vector3(-30, -40, -400), texture: textures.seats },
      { position: new THREE.Vector3(30, -30, 400), texture: textures.fachada }
    ]);
    
    hotspotsMap.set(textures.screen, [
      { position: new THREE.Vector3(30, 0, 400), texture: textures.seats }
    ]);
    
    hotspotsMap.set(textures.seats, [
      { position: new THREE.Vector3(-30, -40, -400), texture: textures.screen },
      { position: new THREE.Vector3(30, 0, 400), texture: textures.lobby }
    ]);
    
    
    function transitionTextures(mesh, texture1, texture2, duration) {
      const material = new THREE.ShaderMaterial({
          transparent: true,
          uniforms: {
              texture1: { value: texture1 },
              texture2: { value: texture2 },
              brightness: { value: 1.6 },
              mixRatio: { value: 0.0 },
          },
          vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `, // El shader de vértices
          fragmentShader: `
          uniform sampler2D texture1;
          uniform sampler2D texture2;
          uniform float mixRatio;
          uniform float brightness;

          varying vec2 vUv;

          void main() {
              vec4 color1 = texture2D(texture1, vUv);
              vec4 color2 = texture2D(texture2, vUv);
              color1.rgb *= brightness; // Aumenta el brillo multiplicando el color
              color2.rgb *= brightness; // Aumenta el brillo multiplicando el color
              gl_FragColor = mix(color1, color2, mixRatio);
          }
        `, // El shader de fragmentos
      });
  
      mesh.material = material;
      console.log('fog del trans:', mesh.material)
      
      let startTime = null;
  
      function animate(time) {
          if (!startTime) startTime = time;
          const elapsed = (time - startTime) / 1000; // Convertir a segundos
          const ratio = Math.min(elapsed / duration, 1);
          material.uniforms.mixRatio.value = ratio;
  
          if (ratio < 1) {
              requestAnimationFrame(animate);
          } else {
              // Una vez completada la transición, puedes actualizar la textura
              // mesh.material = new THREE.MeshBasicMaterial({ map: texture2 });
              console.log('fog del def:', mesh.material)
          }
      }
  
      requestAnimationFrame(animate);
  }
  
  // Ejemplo de uso:
  // Suponiendo que tienes dos texturas y un objeto me
        
        
    
    // Initializers currentSpots en blanco y constructores de los circulos
    let currentHotspots = [];
    let currentTexture = texture;
    const circleGeometry = new THREE.CircleGeometry(30, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    createHotspots(texture); // Crea los spots de la primer textura
    
    // Funcion que hace transicion de una textura a otra
    function changeTexture(newTexture) {
      // Cambiar la textura de la esfera
      // material.map = newTexture;
      // material.needsUpdate = true;
      transitionTextures(mesh, currentTexture, newTexture, 1)
      currentTexture = newTexture;
      // Crear los nuevos hotspots para la textura actual
      createHotspots(newTexture);
    }
    
    // Funcion que limpia los spots anteriores y crea unos nuevos segun lo mapeado
    function createHotspots(texture) {
      // Eliminar hotspots anteriores
      currentHotspots.forEach(hotspot => scene.remove(hotspot));
      currentHotspots = [];
      // Crear nuevos hotspots
      const hotspotsData = hotspotsMap.get(texture);
      hotspotsData.forEach(hotspotData => {
          const circle = new THREE.Mesh(circleGeometry, circleMaterial);
          circle.position.copy(hotspotData.position.normalize().multiplyScalar(490)); // Ajustar a la esfera
          scene.add(circle);
          currentHotspots.push(circle);
  
          // Asocia la nueva textura a este hotspot
          circle.userData.texture = hotspotData.texture;
      });
    }

    // trigger de la tarnsicion
    function onSelectStart() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(currentHotspots);
      if (intersects.length > 0) {
        const selectedHotspot = intersects[0].object;
        const newTexture = selectedHotspot.userData.texture;

        if (newTexture) {
            changeTexture(newTexture);
        }
      }
    }
    // Le dice al mouse como comportarse
    function onDocumentMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onSelectStart, false);
  }
}
