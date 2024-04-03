import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import "./style.css";

let camera, scene, renderer;
let controls, water;
const loader = new GLTFLoader();


let cameraTarget = new THREE.Object3D();
cameraTarget.position.set(0, 60, 80);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

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
      gltf.scene.position.set(20, 30, 20);
      gltf.scene.rotation.y = 3;
      this.nave = gltf.scene;
      this.speed = {
        vel: 0,
        yVel: 0,
        rot: 0,
      };
    });
  }

  stop() {
    this.speed.vel = 0;
    this.speed.yVel = 0;
    this.speed.rot = 0;
  }

  update() {
    if (this.nave) {
      this.nave.rotation.y += this.speed.rot;
      this.nave.translateZ(this.speed.vel);
      this.nave.position.y += this.speed.yVel;
      cameraTarget.position.copy(this.nave.position);
      camera.lookAt(this.nave.position);
    }
  }
}
const nave = new navedbz();

class Nuvem {
  constructor(_scene) {
    scene.add(_scene);
    _scene.scale.set(20, 20, 20);
    if (Math.random() > 0.2) {
      _scene.position.set(random(-7500, 7500), 1000, random(-7500, 7500));
    } else {
      _scene.position.set(random(-1500, 1500), 250, random(-1500, 1500));
    }

    this.Nuvem = _scene;
  }
}
async function loadModel(url) {
  return new Promise((resolve) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene);
    });
  });
}

let nuvemModel = null;
async function createNuvem() {
  if (!nuvemModel) {
    nuvemModel = await loadModel("assets/cloud/scene.gltf");
  }
  return new Nuvem(nuvemModel.clone());
}

let nuvens = [];
const NUVEM_COUNT = 100;

init();
animate();

async function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    200000
  );
  camera.position.set(30, 30, 100);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.3;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 0, 0);
  controls.minDistance = 20.0;
  controls.maxDistance = 2000.0;
  controls.update();

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
    sunDirection: new THREE.Vector3(0, 10, 200),
    sunColor: 0x4e9b62,
    waterColor: 0x4e9b62,
    distortionScale: 7.0,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  let light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(3, 5, 8);
  scene.add(light, new THREE.AmbientLight(0xffffff, 1));

  for (let i = 0; i < NUVEM_COUNT; i++) {
    const nuvem = await createNuvem();
    nuvens.push(nuvem);
  }

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", function (e) {
    if (e.key == "w") {
      nave.speed.vel = 1;
    }
    if (e.key == "s") {
      nave.speed.vel = -1;
    }
    if (e.key == "a") {
      nave.speed.rot = 0.03;
    }
    if (e.key == "d") {
      nave.speed.rot = -0.03;
    }
    if (e.key == "ArrowUp") {
      nave.speed.yVel = 0.5;
    }
    if (e.key == "ArrowDown") {
      nave.speed.yVel = -0.5;
    }
  });
  window.addEventListener("keyup", function (e) {
    nave.stop();
  });
}

function onWindowResize() {}

function animate() {
  requestAnimationFrame(animate);
  render();
  nave.update();
}

function render() {
  water.material.uniforms["time"].value += 0.5 / 60.0;
  renderer.render(scene, camera);
}
