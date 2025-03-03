import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PMREMGenerator,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  } from "three";
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getOrbitControls, loadModel, setBackground, setLight } from "./helpers/model.helper";
import { resizeRenderingArea } from "./helpers/common.helper";


const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
// renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = .8;
document.body.appendChild(renderer.domElement);

// Set up scene, camera, and renderer
const fov = (0.8 * 180) / Math.PI;
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(
  fov,
  aspect,
  0.01,
  1000
);

const pmremGenerator = new PMREMGenerator( renderer );
const scene = new Scene();
setLight(scene);
// scene.background = new Color( 0xbfe3dd );
// scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

setBackground('public/background/room.jpg', scene);
const controls = getOrbitControls(camera, renderer);
loadModel("public/models/como/como.glb", scene, controls, camera);
window.addEventListener('resize', (e) => { resizeRenderingArea(camera,renderer)}, false);
window.addEventListener('mousedown', (e) => { resizeRenderingArea(camera,renderer)}, false);
window.addEventListener('touchstart', (e) => { resizeRenderingArea(camera,renderer)}, false);


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();


