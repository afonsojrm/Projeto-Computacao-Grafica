import "./style.css";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let camera, scene, renderer;
let controls, water;
const loader = new GLTFLoader();

loader.load("./assets/cloud/scene.gltf", function (gltf) {
  const model = gltf.scene;
  scene.add(model);
  gltf.scene.scale.set(1000, 1000, 1000);
  gltf.scene.position.set(1500, 10000, -100000);
});

loader.load("./assets/namek/scene.gltf", function (gltf) {
  const model = gltf.scene;
  scene.add(model);
  gltf.scene.scale.set(50, 50, 50);
  gltf.scene.position.set(500, 1.2, -1900);
});

class navedbz {
  constructor() {
    loader.load("./assets/navedbz/scene.gltf", (gltf) => {
      scene.add(gltf.scene);

      gltf.scene.scale.set(6, 6, 6);
      gltf.scene.position.set(40, 20, -50);
      gltf.scene.rotation.y = 1.5;
      this.nave = gltf.scene;
    });
  }
  update() {
    if (this.nave) {
      this.nave.rotation.y += 0.01;
    }
  }
}

const nave = new navedbz();
init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, -100);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.3;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    200000
  );
  camera.position.set(30, 30, 100);

  // Water

  const waterGeometry = new THREE.PlaneGeometry(100000, 100000);

  water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals: new THREE.TextureLoader().load(
      "assets/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(0, 10, 500),
    sunColor: 0x389363,
    waterColor: 0x389363,
    distortionScale: 6.0,
    reflectivity: 0.8,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  let light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(3, 5, 8);
  scene.add(light, new THREE.AmbientLight(0xffffff, 1));

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  nave.update();
}

function render() {
  water.material.uniforms["time"].value += 0.5 / 60.0;

  renderer.render(scene, camera);
}
