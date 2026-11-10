import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const mount = document.getElementById('hero3d');
if (mount) {
  try { init(); } catch (e) { mount.classList.add('no-webgl'); }
}

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(9, 7.5, 11);
  camera.lookAt(0, 1.6, 0);

  const key = new THREE.DirectionalLight(0xfff3dc, 2.2);
  key.position.set(6, 10, 4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.radius = 6;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xcff5e6, 0x0e3b2c, 0.9));
  const rim = new THREE.DirectionalLight(0x9fe3c6, 1.2); rim.position.set(-6, 4, -6); scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);

  // Ledger plinth
  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(9, 0.45, 6.2, 4, 0.12),
    new THREE.MeshPhysicalMaterial({ color: 0xf2f5f3, roughness: 0.55, clearcoat: 0.4 })
  );
  plinth.position.y = -0.225; plinth.receiveShadow = true;
  world.add(plinth);

  // Ledger ruling lines on the plinth
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xc9d6cf });
  for (let i = -2.6; i <= 2.6; i += 0.65) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.005, 0.025), lineMat);
    l.position.set(0, 0.003, i); world.add(l);
  }
  const margin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 5.8), new THREE.MeshBasicMaterial({ color: 0xc59a3d }));
  margin.position.set(-3.4, 0.004, 0); world.add(margin);

  // Ascending bars: glass with brass caps
  const heights = [1.2, 1.9, 1.6, 2.8, 3.9];
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x47b88e, roughness: 0.08, metalness: 0, transmission: 0.82, thickness: 1.2, ior: 1.45,
    clearcoat: 1, attenuationColor: new THREE.Color(0x0e6b4c), attenuationDistance: 2.2
  });
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xe0b860, metalness: 0.75, roughness: 0.3, clearcoat: 0.6, emissive: 0x3a2a08, emissiveIntensity: 0.35 });
  const bars = heights.map((h, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.95, 1, 0.95, 4, 0.08), i === heights.length - 1 ? brass : glass);
    body.castShadow = true;
    const cap = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.12, 1.0, 3, 0.04), brass);
    cap.castShadow = true;
    g.add(body, cap);
    g.position.set(-2.6 + i * 1.3, 0, -0.4 + i * 0.12);
    g.userData = { h, body, cap };
    world.add(g);
    return g;
  });

  // Coin stack
  const coinMat = new THREE.MeshPhysicalMaterial({ color: 0xe7c46e, metalness: 0.7, roughness: 0.28, clearcoat: 0.8, emissive: 0x3a2a08, emissiveIntensity: 0.35 });
  const coins = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 48), coinMat);
    c.position.y = 0.06 + i * 0.125; c.rotation.y = i * 0.4; c.castShadow = true;
    coins.add(c);
  }
  coins.position.set(-2.9, 0, 1.9);
  world.add(coins);

  // Floating coin
  const float = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.13, 64), coinMat);
  float.rotation.x = Math.PI / 2.3; float.castShadow = true;
  float.position.set(-0.6, 4.2, -1.4);
  world.add(float);

  // Trend line connecting the bar tops
  const pts = bars.map(b => new THREE.Vector3(b.position.x, b.userData.h + 0.55, b.position.z));
  const curve = new THREE.CatmullRomCurve3(pts);
  const trend = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.035, 8, false), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9fe3c6, emissiveIntensity: 0.6 }));
  world.add(trend);
  const dots = pts.map(p => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20), brass); d.position.copy(p); world.add(d); return d; });

  // Soft ground shadow catcher
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.25 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.45; ground.receiveShadow = true;
  scene.add(ground);

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.setLength(w < 560 ? 19 : 17);
    camera.lookAt(w < 560 ? 0.2 : 0.9, 1.3, 0.4);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(mount);
  resize();

  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.2;
  });

  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
  function setGrowth(t) {
    bars.forEach((b, i) => {
      const k = reduce ? 1 : ease((t - i * 0.14) / 0.9);
      const h = Math.max(0.001, b.userData.h * k);
      b.userData.body.scale.y = h; b.userData.body.position.y = h / 2;
      b.userData.cap.position.y = h + 0.06;
    });
    const k = reduce ? 1 : ease((t - 0.9) / 0.6);
    trend.scale.setScalar(Math.max(0.001, k)); trend.visible = k > 0.02;
    dots.forEach(d => d.scale.setScalar(Math.max(0.001, k)));
  }

  function frame(now) {
    const t = (now - start) / 1000;
    setGrowth(t);
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
    world.rotation.y = (reduce ? 0 : Math.sin(t * 0.25) * 0.18) + cx;
    world.rotation.x = cy * 0.3;
    if (!reduce) { float.position.y = 4.2 + Math.sin(t * 1.4) * 0.18; float.rotation.z = t * 0.8; }
    renderer.render(scene, camera);
    if (!reduce || t < 0.1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  mount.classList.add('ready');
}
