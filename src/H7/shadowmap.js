import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GUI } from 'jsm/libs/dat.gui.module.js';

// Ná í striga
const canvas = document.querySelector('#c');

// Skilgreina sviðsnet
const scene = new THREE.Scene();
scene.background = new THREE.Color('darkgray');

// Skilgreina myndavél og staðsetja hana
const camera = new THREE.PerspectiveCamera(
  60,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 5);

// Bæta við músarstýringu
const controls = new OrbitControls(camera, canvas);

// Skilgreina birtingaraðferð með afbjögun (antialias)
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true; // kveikja á skuggakorti
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.

// Búa til tening með Phong áferð (Phong material) og bæta í sviðsnetið
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
// getur valdið skugga og fengið skugga
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.x += 1.5;
scene.add(cube);

// Búa til kúlu með Phong áferð og bæta í sviðsnetið
const ballGeometry = new THREE.SphereGeometry(0.5, 20, 20);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xaa8844 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
// getur valdið skugga og fengið skugga
ball.castShadow = true;
ball.receiveShadow = true;
ball.position.x += -1.5;
scene.add(ball);

// Búa til sléttu með Phong áferð
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true; // gólfið getur fengið á sig skugga
plane.rotation.x = -0.5 * Math.PI;
plane.position.set(0, -0.5, 0);
scene.add(plane);

// Skilgreina ljósgjafa og bæta honum í sviðsnetið
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(-4, 1, -1);
light.castShadow = true; // þessi ljósgjafi getur valdið skuggum

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;

scene.add(light);

const light_2 = new THREE.PointLight(0xffffff, 1);
light_2.position.set(4, 1, 1);
light_2.castShadow = true;

light_2.shadow.mapSize.width = 2048;
light_2.shadow.mapSize.height = 2048;

scene.add(light_2);

// Hlutur sem sýnir staðsetningu ljósgjafa
const helper = new THREE.PointLightHelper(light, 0.1);
scene.add(helper);

const helper_2 = new THREE.PointLightHelper(light_2, 0.1);
scene.add(helper_2);

function updateLight() {
  helper.update();
}

function updateLight_2() {
  helper_2.update();
}

// Hlutur til að setja og fá gildi í valmynd
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

// Fall sem getur breytt x, y, z hnitum á staðsetningu ljóss
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}

// Smíða valmynd (GUI) og setja inn einstaka möguleika og gildisbil
const gui = new GUI();

let folder = gui.addFolder('Ljós 1');
folder.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
folder.add(light, 'intensity', 0, 2, 0.01);
folder.add(light, 'distance', 0, 40).onChange(updateLight);
folder.open();

folder = gui.addFolder('Ljós 2');
folder.addColor(new ColorGUIHelper(light_2, 'color'), 'value').name('color');
folder.add(light_2, 'intensity', 0, 2, 0.01);
folder.add(light_2, 'distance', 0, 40).onChange(updateLight_2);
folder.open();

makeXYZGUI(gui, light.position, 'Light 1: position');
makeXYZGUI(gui, light_2.position, 'Light 2: position');

// Hreyfifall
const animate = function () {
  requestAnimationFrame(animate);

  let time = Date.now() * 0.0018;

  // Hreyfa tening og kúlu
  ball.position.y = Math.abs(Math.sin(time)) * 2;
  cube.position.z = Math.cos(time) * 1.5;
  cube.rotation.y = time * 0.5;

  controls.update();
  renderer.render(scene, camera);
};

animate();
