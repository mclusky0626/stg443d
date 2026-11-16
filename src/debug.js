// Dev only: look at the converted model from any side, or one part at a time.
//   /debug.html?az=0&el=5&dist=1.6&tx=0&ty=-0.06&only=receiver,bolt&hide=sling&x=1
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(num('fov', 28), 1, 0.01, 50);
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(`${import.meta.env.BASE_URL}models/stg44.glb`, (gltf) => {
  const only = q.get('only')?.split(','), hide = q.get('hide')?.split(',') || [];
  const names = [];
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const name = (o.parent.isGroup && o.parent.name !== 'stg44' ? o.parent.name : o.name).replace(/_\d+$/, '');
    names.push(name);
    if ((only && !only.includes(name)) || hide.includes(name)) o.visible = false;
    if (q.has('clip')) { o.material = o.material.clone(); o.material.side = THREE.DoubleSide; o.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), num('clip', 0))]; }
    if (q.has('flat')) o.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  });
  scene.add(gltf.scene);
  if (q.has('axes')) scene.add(new THREE.AxesHelper(0.2));
  const az = num('az', 0) * Math.PI / 180, el = num('el', 4) * Math.PI / 180, dist = num('dist', 1.9);
  const t = new THREE.Vector3(num('tx', 0), num('ty', -0.06), num('tz', 0));
  camera.position.set(t.x + dist * Math.sin(az) * Math.cos(el), t.y + dist * Math.sin(el), t.z + dist * Math.cos(az) * Math.cos(el));
  camera.lookAt(t);
  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  draw(); addEventListener('resize', draw);
  document.getElementById('hud').textContent = q.has('x') ? '' : [...new Set(names)].join('  ') + `\ncalls ${renderer.info.render.calls} tris ${renderer.info.render.triangles}`;
  window.__ok = true;
});
