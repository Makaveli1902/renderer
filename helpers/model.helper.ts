import {
  AmbientLight,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearFilter,
  LoadingManager,
  MeshStandardMaterial,
  NearestFilter,
  Object3DEventMap,
  PerspectiveCamera,
  PointLight,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { CubeTextureLoader } from "three";
import { Box3 } from "three";
import { Object3D } from "three";
import { GLTF, GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

const MANAGER = new LoadingManager();
let selectedGroup: string | null = null;
let groups = new Map<string, Object3D[]>();
let materials: { [key: string]: MeshStandardMaterial } = {};

export function setLight(scene: Scene) {
  const ambientLight = new AmbientLight(0xffffff, 0.5); // Further reduced intensity
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1); // Further reduced intensity
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  const hemiLight = new HemisphereLight(0xffffff, 0x444444, 1); // Further reduced intensity
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const pointLight = new PointLight(0xffffff, 1); // Further reduced intensity
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
}

export function centerCameraOnModel(
  model: Object3D,
  controls: OrbitControls,
  camera: PerspectiveCamera
) {
  const box = new Box3().setFromObject(model);
  const center = new Vector3();
  box.getCenter(center);
  controls.target.copy(center);
  camera.position.copy(center);
  camera.position.z += box.getSize(new Vector3()).length(); // Adjust the camera distance as needed
  camera.position.x -= 0.1;
  camera.position.y += 0.1;
  controls.update();
}

export function getOrbitControls(
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.screenSpacePanning = true;
  return controls;
}

export function setBackground(imagePath: string, scene: Scene) {
  const textureLoader = new TextureLoader();
  textureLoader.load(imagePath, (texture) => {
    scene.background = texture;
  });
}

export function loadModel(
  src: string | ArrayBuffer,
  scene: Scene,
  controls: OrbitControls,
  camera: PerspectiveCamera,
  isUpload = false
) {
  // Remove previous model
  if (scene.children.length) {
    const previousModel = scene.children.find(x => x.type === 'Group');
    if (previousModel) {
      scene.remove(previousModel);
    }
  }
  const loader = new GLTFLoader(MANAGER);
  if (isUpload) {
    loader.parse(src, "", (gltf) => {
      setModel(gltf, scene, controls, camera);
    });
  } else {
    loader.load(
      src as string, // Replace with the path to your 3D model file
      (gltf) => {
        setModel(gltf, scene, controls, camera);
      },
      undefined, // onProgress callback
      (error) => {
        console.error(error);
      }
    );
  }
}

function setModel(
  gltf: GLTF,
  scene: Scene,
  controls: OrbitControls,
  camera: PerspectiveCamera
) {
  const model = gltf.scene;
  scene.add(model);
  model.scale.set(1, 1, 1); // Scale model if needed
  model.position.set(0, 0, 0); // Position model if needed

  centerCameraOnModel(model, controls, camera);
  // setMinDistanceBasedOnModel(model);
  checkMaterials(model); // Check and modify materials
}

export function loadTexture(dataURL: string, name: string) {
  const material = loadMaterial(dataURL);
  materials[name] = material;
  renderMaterialsDropdown();
}

function loadMaterials() {
  materials = {
    misterio03: loadMaterial("textures/misterio/Misterio_03_base-d7350.jpg"),
    misterio14: loadMaterial("textures/misterio/Misterio_14_base-c5e10.jpg"),
    misterio70: loadMaterial("textures/misterio/Misterio_70_base-571f9.jpg"),
    misterio80: loadMaterial("textures/misterio/Misterio_80_base-9a472.jpg"),
    misterio90: loadMaterial("textures/misterio/Misterio_90_base-6a7f8.jpg"),
  };

  renderMaterialsDropdown();
  // materials.newFabric.map!.repeat.set(5, 5);
  // materials.newFabric.map!.wrapS = RepeatWrapping;
  // materials.newFabric.map!.wrapT = RepeatWrapping;
  // materials.newFabric.map!.colorSpace = "srgb";
}

function renderMaterialsDropdown() {
  Object.keys(materials).forEach((material) => {
    const option = document.createElement("option");
    option.value = material;
    option.textContent = material;
    document.getElementById("material")?.appendChild(option);
  });
}

function checkMaterials(model: Group<Object3DEventMap>) {
  loadMaterials();
  // Traverse the model to find materials and modify them
  groups.clear();
  model.traverse((child: any) => {
    if (
      child.isObject3D &&
      child.children.length > 0 &&
      child.children.every((child: any) => child.isMesh)
    ) {
      groups.set(child.name, child.children);
    }
    if (child.isMesh) {
      const material = child.material;
      if (material) {
        material.map = material.map || materials.misterio03.map;

        // Update material properties based on user input
        document
          .getElementById("material")
          ?.addEventListener("change", (event: any) => {
            const selectedMaterial = event.target!.value;
            // child.material = materials[selectedMaterial];
            const child = groups.get(selectedGroup!);
            child?.forEach((child: any) => {
              child.material = materials[selectedMaterial];
            });
          });
      }
    }
  });

  const groupSelect = document.getElementById("group");
  // remove all from group select
  if (groupSelect) {
    while (groupSelect.firstChild) {
      groupSelect.removeChild(groupSelect.firstChild);
    }
  }

  if (groupSelect) {
    groups.forEach((group, name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      groupSelect.appendChild(opt);
    });
    groupSelect.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      selectedGroup = target.value;
    });
  }

  //   uniqueMaterials = model.traverse(())
}

function loadMaterial(src: string): MeshStandardMaterial {
  const textureLoader = new TextureLoader();
  return new MeshStandardMaterial({
    map: textureLoader.load(src, (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.colorSpace = "srgb";
      texture.minFilter = LinearFilter;
      texture.magFilter = NearestFilter;
      texture.anisotropy = 16; // Increase anisotropy for better quality
      texture.needsUpdate = true;
    })
  });
}
