import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { buildTimeline, blend } from './cues.js';
import { TREE, STRIP, MECH, CUT, LABELS, DIMS } from './parts.js';

const FOV = 26;
const D2R = Math.PI / 180;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };

// A photo studio built from bright panels, in the camera's frame of reference:
// camera looks down -Z, so -X is frame left. Baked once into an environment map.
// The rifle is dark steel, so the set is bright (the guide's contrast rule).
function buildStudio(renderer) {
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const add = (hex, gain, pos, size) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(gain) }));
    m.position.set(...pos);
    m.scale.set(...size);
    scene.add(m);
  };
  const shell = new THREE.Mesh(new THREE.BoxGeometry(60, 34, 60), new THREE.MeshBasicMaterial({ color: 0x70736b, side: THREE.BackSide }));
  shell.position.y = 10;
  scene.add(shell);
  add(0xcfd1c6, 1.5, [0, -6.6, 0], [60, 0.2, 60]); // pale floor bounce
  add(0xfff3e2, 15, [-12, 15, 9], [16, 0.3, 12]); // key softbox, upper left
  add(0xffffff, 4.2, [3, 20, -2], [24, 0.3, 18]); // overhead fill
  add(0xdce6ff, 10, [11, 7, -22], [16, 9, 0.3]); // cool rim, behind right
  add(0xdce6ff, 5, [-21, 5, -15], [0.3, 8, 12]); // rim wrap, behind left
  add(0xfff8ee, 2.6, [16, 3, 24], [14, 9, 0.3]); // soft front fill, camera right
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.03).texture;
  pmrem.dispose();
  scene.traverse((o) => o.material && o.material.dispose());
  box.dispose();
  return tex;
}

export function createStage({ canvas, lenis, reducedMotion = false, onChapter, onLoad, onReady, onFail }) {
  const params = new URLSearchParams(location.search);
  const lockedTier = params.has('q') ? Number(params.get('q')) : null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    onFail?.(err);
    return null;
  }
  renderer.setClearColor(0x000000, 0); // transparent: the page is the backdrop
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.localClippingEnabled = true; // the cutaway

  const scene = new THREE.Scene();
  scene.environment = buildStudio(renderer);
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.05, 40);

  // lights ride with the camera so every shot is lit from the upper left
  const rig = new THREE.Group();
  scene.add(rig);
  const key = new THREE.DirectionalLight(0xfff1dc, 3.4);
  key.position.set(-1.5, 1.9, 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -0.95; key.shadow.camera.right = 0.95;
  key.shadow.camera.top = 0.95; key.shadow.camera.bottom = -0.95;
  key.shadow.camera.near = 0.4; key.shadow.camera.far = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.002;
  key.shadow.radius = 9;
  key.shadow.blurSamples = 18;
  const rim = new THREE.DirectionalLight(0xd4e0ff, 1.9);
  rim.position.set(1.2, 0.9, -2);
  rig.add(key, key.target, rim, rim.target);

  // a pale floor a little under the magazine, only there to catch the shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.36;
  ground.receiveShadow = true;
  scene.add(ground);

  const rifle = new THREE.Group();
  scene.add(rifle);
  const parts = {};
  const disposables = [];

  // The cutaway: one plane that sweeps in from the rifle's right side.
  // Faces seen from behind are painted red oxide, as on an armourer's
  // sectioned instruction model.
  const cutBase = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1);
  const cutPlane = cutBase.clone();
  const cutClones = new Map();
  function cutMaterial(src) {
    let m = cutClones.get(src);
    if (m) return m;
    m = src.clone();
    m.side = THREE.DoubleSide;
    m.clippingPlanes = [cutPlane];
    m.clipShadows = true;
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n\tif ( ! gl_FrontFacing ) diffuseColor.rgb = vec3( 0.27, 0.03, 0.016 );')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n\tif ( ! gl_FrontFacing ) { metalnessFactor = 0.0; roughnessFactor = 0.82; }');
    };
    m.customProgramCacheKey = () => 'stg-cutaway';
    cutClones.set(src, m);
    disposables.push(m);
    return m;
  }

  // ---------------------------------------------------------------- quality
  // Slow device? Drop pixel ratio first, then shadows.
  let tier = lockedTier ?? 0;
  let width = 1, height = 1;
  let dirty = true;
  function applyTier() {
    const cap = [2, 1.4, 1][tier]; // 2x pixel ratio cap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = tier < 2;
    key.castShadow = tier < 2;
    ground.visible = tier < 2;
    dirty = true;
  }

  // ---------------------------------------------------------------- sizing
  let timeline = [];
  let sections = [];
  let maxScroll = 1;
  function measure() {
    const els = [...document.querySelectorAll('[data-cue]')];
    sections = els.map((el) => {
      const r = el.getBoundingClientRect();
      // where the words sit, so callouts keep to the other side
      const col = el.querySelector('.col');
      const cr = col ? col.getBoundingClientRect() : null;
      const W = window.innerWidth;
      const free = !cr ? [24, W - 24] : cr.left < W - cr.right ? [cr.right + 34, W - 24] : [24, cr.left - 34];
      return { cue: el.dataset.cue, id: el.id, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, free };
    });
    timeline = buildTimeline(sections, window.innerHeight);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    for (const L of labels) {
      const plate = L.el?.querySelector('.callout__plate');
      if (plate) { L.w = plate.offsetWidth; L.h = plate.offsetHeight; }
    }
  }
  const resizeObserver = new ResizeObserver(() => {
    // size the canvas from its own box
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    camera.aspect = width / height;
    applyTier();
    measure();
  });

  // ---------------------------------------------------------------- callouts
  // After the camera moves, each part's 3D point is projected to the screen
  // and its label placed there: a dot on the part, a leader, and a plate in a
  // band above or below the rifle. Plates in a band never overlap.
  const calloutEls = [...document.querySelectorAll('[data-callout]')];
  const labels = LABELS.map((def, i) => ({
    def,
    el: calloutEls[i],
    at: new THREE.Vector3(...def.at),
    n: def.n ? new THREE.Vector3(...def.n).normalize() : null,
    w: 160, h: 46, x: 0, y: 0, goal: 0, shown: 0, lift: 0, dx: 0, liftGoal: 0, dxGoal: 0, level: 0,
  }));
  const v = new THREE.Vector3(), w = new THREE.Vector3(), toCam = new THREE.Vector3();
  const BAND = 54, TOP = 112, BOTTOM = 70;

  function project(p) {
    p.project(camera);
    return [(p.x * 0.5 + 0.5) * width, (-p.y * 0.5 + 0.5) * height, p.z];
  }

  function placeLabels(shot, dt) {
    const sec = sections[shot.beat];
    const beatId = sec?.cue;
    const free = sec?.free || [24, width - 24];
    const live = [];
    for (const L of labels) {
      if (!L.el) continue;
      const part = parts[L.def.part];
      L.goal = 0;
      if (part && beatId === L.def.beat) {
        L.goal = clamp01((shot.weight - 0.5) / 0.35);
        part.localToWorld(v.copy(L.at));
        if (L.n) {
          w.copy(L.n).transformDirection(rifle.matrixWorld);
          const facing = w.dot(toCam.copy(camera.position).sub(v).normalize());
          L.goal *= clamp01((facing - 0.05) / 0.18);
        }
        const [sx, sy, sz] = project(v);
        L.x = sx; L.y = sy;
        if (sz > 1 || L.x < free[0] + 6 || L.x > free[1] - 6 || L.y < 76 || L.y > height - 30) L.goal = 0;
        if (L.goal > 0 || L.shown > 0.01) live.push(L);
      }
    }

    for (const row of ['top', 'bottom']) {
      const items = live.filter((L) => L.def.row === row).sort((a, b) => a.x - b.x);
      const right = [-1e9, -1e9, -1e9];
      for (const L of items) {
        const half = L.w / 2;
        let px = Math.min(free[1] - half, Math.max(free[0] + half, L.x));
        let lv = right.findIndex((r) => px - half > r + 10);
        if (lv < 0) {
          lv = right.indexOf(Math.min(...right));
          px = Math.min(free[1] - half, right[lv] + 10 + half);
        }
        right[lv] = px + half;
        const py = row === 'top' ? TOP + lv * BAND : height - BOTTOM - lv * BAND;
        L.liftGoal = py - L.y;
        L.dxGoal = px - L.x;
        L.level = lv;
      }
    }

    const ks = 1 - Math.exp(-9 * dt);
    for (const L of labels) {
      if (!L.el) continue;
      const k = L.goal > L.shown ? 7 : 12;
      const was = L.shown;
      L.shown += (L.goal - L.shown) * (1 - Math.exp(-k * dt));
      if (Math.abs(L.goal - L.shown) < 0.004) L.shown = L.goal;
      if (L.shown > 0.005) {
        if (was <= 0.005) { L.lift = L.liftGoal; L.dx = L.dxGoal; }
        L.lift += (L.liftGoal - L.lift) * ks;
        L.dx += (L.dxGoal - L.dx) * ks;
        const st = L.el.style;
        st.transform = `translate3d(${L.x.toFixed(1)}px, ${L.y.toFixed(1)}px, 0)`;
        st.setProperty('--lift', `${L.lift.toFixed(1)}px`);
        st.setProperty('--dx', `${L.dx.toFixed(1)}px`);
        st.zIndex = String(L.level + 1);
      }
      const o = L.shown.toFixed(3);
      if (L.el.style.opacity !== o) {
        L.el.style.opacity = o;
        L.el.style.visibility = L.shown < 0.01 ? 'hidden' : 'visible';
      }
    }
  }

  // ---------------------------------------------------------------- dimension lines
  // The same projection, used the way a drawing office would: extension lines
  // up from the two measured points and a dimension line between them.
  const dims = DIMS.map((def, i) => {
    const el = document.querySelectorAll('[data-dim]')[i];
    return el && {
      def, el, shown: 0,
      lines: [...el.querySelectorAll('i')],
      label: el.querySelector('.dim__label'),
      a: new THREE.Vector3(...def.a), b: new THREE.Vector3(...def.b),
    };
  }).filter(Boolean);
  function setLine(el, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    el.style.width = `${Math.hypot(dx, dy).toFixed(1)}px`;
    el.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`;
  }
  function placeDims(shot, dt) {
    const beatId = sections[shot.beat]?.cue;
    for (const D of dims) {
      const goal = beatId === D.def.beat ? clamp01((shot.weight - 0.55) / 0.35) : 0;
      D.shown += (goal - D.shown) * (1 - Math.exp(-(goal > D.shown ? 6 : 12) * dt));
      if (Math.abs(goal - D.shown) < 0.004) D.shown = goal;
      const o = D.shown.toFixed(3);
      if (D.el.style.opacity !== o) { D.el.style.opacity = o; D.el.style.visibility = D.shown < 0.01 ? 'hidden' : 'visible'; }
      if (D.shown < 0.01) continue;
      const [ax, ay] = project(rifle.localToWorld(v.copy(D.a)));
      const [bx, by] = project(rifle.localToWorld(v.copy(D.b)));
      if (D.def.axis) {
        setLine(D.lines[0], ax, ay, bx, by);
        D.label.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0) translate(0, -135%)`;
        continue;
      }
      const [cx, cy] = project(rifle.localToWorld(v.set(D.a.x, D.def.y, D.a.z)));
      const [dx, dy] = project(rifle.localToWorld(v.set(D.b.x, D.def.y, D.b.z)));
      const over = 9; // extension lines run a little past the dimension line
      const ext = (x1, y1, x2, y2, el) => { const l = Math.hypot(x2 - x1, y2 - y1) || 1; setLine(el, x1, y1, x2 + ((x2 - x1) / l) * over, y2 + ((y2 - y1) / l) * over); };
      ext(ax, ay, cx, cy, D.lines[0]);
      ext(bx, by, dx, dy, D.lines[1]);
      setLine(D.lines[2], cx, cy, dx, dy);
      const ang = Math.atan2(dy - cy, dx - cx) - Math.PI / 4, tx = Math.cos(ang) * 7, ty = Math.sin(ang) * 7;
      setLine(D.lines[3], cx - tx, cy - ty, cx + tx, cy + ty);
      setLine(D.lines[4], dx - tx, dy - ty, dx + tx, dy + ty);
      D.label.style.transform = `translate3d(${((cx + dx) / 2).toFixed(1)}px, ${((cy + dy) / 2).toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  }

  // ---------------------------------------------------------------- the working rifle
  // The guide's setExplode(), and the rest of the mechanism with it. Every
  // part is posed from scratch each frame: an offset, and for the parts that
  // hinge, a turn about their pivot.
  const off = new THREE.Vector3(), piv = new THREE.Vector3(), q = new THREE.Quaternion();
  function pose(name, x, y, z, turn, degrees) {
    const p = parts[name];
    if (!p) return;
    off.set(x, y, z);
    if (turn && degrees) {
      q.setFromAxisAngle(AXES[turn.axis], degrees * D2R);
      piv.fromArray(turn.pivot);
      p.quaternion.copy(q);
      p.position.copy(piv).sub(piv.clone().applyQuaternion(q)).add(off);
    } else {
      p.quaternion.identity();
      p.position.copy(off);
    }
  }
  const stripOf = (name, e) => {
    const m = STRIP[name];
    return m ? easeInOut(clamp01((e - m.win[0]) / (m.win[1] - m.win[0]))) : 0;
  };
  function setRifle(s) {
    for (const name in STRIP) {
      const m = STRIP[name], k = stripOf(name, s.strip);
      let x = m.move[0] * k, y = m.move[1] * k, z = m.move[2] * k;
      if (name === 'magazine') { x += MECH.magDrop[0] * s.mag; y += MECH.magDrop[1] * s.mag; }
      if (name === 'carrier') x -= MECH.travel * s.travel;
      pose(name, x, y, z, m.turn, m.turn ? m.turn.angle * k : 0);
    }
    pose('dust_cover', 0, 0, 0, MECH.cover, MECH.cover.closed * (1 - s.cover));
    pose('selector', 0, 0, MECH.selector * s.sel);
    pose('safety', 0, 0, 0, MECH.safety, MECH.safety.safe * s.safe);
    pose('trigger', 0, 0, 0, MECH.trigger, MECH.trigger.pull * s.trig);
    pose('sight_leaf', 0, 0, 0, MECH.leaf, MECH.leaf.up * s.sight);
    pose('sight_slider', MECH.leaf.slide * s.sight, 0, 0);
    pose('mag_catch', 0, 0, MECH.catchPress * s.press);
    // parked a metre away until a beat calls for it, so nothing that moves can cross it
    cutBase.constant = s.cut < 0.002 ? 1 : MECH.cutFrom + (MECH.cutTo - MECH.cutFrom) * easeInOut(clamp01(s.cut));
    ground.material.opacity = 0.2 * (1 - clamp01(Math.max(s.strip * 3, s.mag * 1.5)));
  }

  // ---------------------------------------------------------------- the touch
  // What the visitor sets by hand: targets here, eased values in `state`.
  const hand = { sel: 0, safe: 0, sight: 0, mag: 0, strip: 0 };
  const state = { strip: 0, mag: 0, cut: 0, travel: 0, cover: 0, sel: 0, safe: 0, sight: 0, trig: 0, press: 0 };
  const eased = { sel: 0, safe: 0, sight: 0, mag: 0, strip: 0, trig: 0, press: 0 };
  const run = { left: 0, t: 0, period: 0.9 }; // cycles of the action played by hand
  let trigHold = 0, pressHold = 0;

  // ---------------------------------------------------------------- pointer: drag to turn
  let dragging = false, lastX = 0, lastY = 0, dragYaw = 0, dragVel = 0, dragPitch = 0;
  const onDown = (e) => {
    if (e.button !== 0) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; dragVel = 0;
    canvas.setPointerCapture(e.pointerId);
    document.body.classList.add('is-dragging');
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    dragYaw += dx * 0.0056; dragVel = dx * 0.0056 * 60;
    dragPitch = Math.min(0.7, Math.max(-0.7, dragPitch + dy * 0.004));
  };
  const onUp = () => { dragging = false; document.body.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // ---------------------------------------------------------------- loop
  const shot = { az: 0, el: 0, dist: 2, shift: 0, rise: 0, strip: 0, mag: 0, cut: 0, cycle: 0, cover: 0, target: [0, 0, 0], beat: 0, weight: 1, next: 0 };
  const cur = { az: 0, el: 0, dist: 2, shift: 0, rise: 0, strip: 0, mag: 0, cut: 0, cycle: 0, cover: 0, target: new THREE.Vector3() };
  const look = new THREE.Vector3(), right = new THREE.Vector3(), qYaw = new THREE.Quaternion(), qPitch = new THREE.Quaternion();
  let primed = false, ready = false, running = true, raf = 0;
  let last = performance.now(), readyAt = 0, lastScroll = window.scrollY, chapter = -1;
  let slow = 0, signature = '';

  function update(dt, now) {
    const y = window.scrollY; // read inside the render loop, never in a scroll event
    blend(timeline, y, shot);
    document.documentElement.style.setProperty('--progress', (y / maxScroll).toFixed(4));

    // a wide window needs no help; a narrow one pulls the camera back
    const fit = Math.max(1, 1.6 / camera.aspect);
    const k = primed && !reducedMotion ? 1 - Math.exp(-5.5 * dt) : 1;
    for (const key of ['az', 'el', 'shift', 'rise', 'strip', 'mag', 'cut', 'cycle', 'cover']) cur[key] += (shot[key] - cur[key]) * k;
    cur.dist += (shot.dist * fit - cur.dist) * k;
    cur.target.lerp(look.fromArray(shot.target), k);
    primed = true;

    // the visitor's turn of the rifle fades as they scroll on
    const scrolled = Math.abs(y - lastScroll); lastScroll = y;
    if (!dragging) {
      dragYaw += dragVel * dt;
      dragVel *= Math.exp(-4 * dt);
      const fade = Math.exp(-scrolled / (window.innerHeight * 0.35));
      dragYaw *= fade; dragPitch *= fade;
      if (Math.abs(dragVel) < 0.002) dragVel = 0;
    }
    // hero: whole rifle, slow sway
    const cue = sections[shot.beat]?.cue;
    const idle = cue === 'hero' || cue === 'outro' ? shot.weight : 0;
    const sway = reducedMotion || !ready ? 0 : Math.sin((now - readyAt) * 0.00034) * 0.17 * idle;

    // stripped by hand in the outro, the parts need more room: step back
    const az = cur.az * D2R, el = cur.el * D2R, dist = cur.dist * (1 + 0.6 * eased.strip);
    camera.position.set(
      cur.target.x + dist * Math.sin(az) * Math.cos(el),
      cur.target.y + dist * Math.sin(el),
      cur.target.z + dist * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(cur.target);
    camera.setViewOffset(width, height, -cur.shift * width * 0.5, cur.rise * height * 0.5, width, height);
    rig.rotation.y = az;
    scene.environmentRotation.set(0, az, 0);

    // turn about the vertical, then tip towards or away from the camera
    qYaw.setFromAxisAngle(AXES.y, sway + dragYaw);
    qPitch.setFromAxisAngle(right.set(Math.cos(az), 0, -Math.sin(az)), dragPitch);
    rifle.quaternion.copy(qPitch).multiply(qYaw);

    // the visitor's own settings ease in
    const kh = reducedMotion ? 1 : 1 - Math.exp(-13 * dt);
    trigHold = Math.max(0, trigHold - dt); pressHold = Math.max(0, pressHold - dt);
    for (const key of ['sel', 'safe', 'sight', 'mag', 'strip']) eased[key] += (hand[key] - eased[key]) * kh;
    eased.trig += ((trigHold > 0 ? 1 : 0) - eased.trig) * (1 - Math.exp(-30 * dt));
    eased.press += ((pressHold > 0 ? 1 : 0) - eased.press) * (1 - Math.exp(-30 * dt));
    let byHand = 0;
    if (run.left > 0) {
      run.t += dt / run.period;
      if (run.t >= 1) { run.left--; run.t = run.left > 0 ? run.t - 1 : 0; }
      if (run.left > 0) byHand = Math.sin(Math.PI * run.t) ** 2;
    }
    const byScroll = Math.sin(Math.PI * clamp01(cur.cycle)) ** 2;

    state.strip = Math.max(cur.strip, eased.strip);
    state.mag = Math.max(cur.mag, eased.mag);
    state.cut = cur.cut;
    state.travel = Math.max(byScroll, byHand);
    state.cover = Math.max(cur.cover, clamp01(byScroll * 14));
    state.sel = eased.sel; state.safe = eased.safe; state.sight = eased.sight;
    state.trig = eased.trig; state.press = eased.press;
    setRifle(state);

    if (shot.beat !== chapter && shot.weight > 0.1) {
      chapter = shot.beat;
      onChapter?.(sections[chapter]?.id, chapter);
    }
    rifle.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    cutPlane.copy(cutBase).applyMatrix4(rifle.matrixWorld);
    placeLabels(shot, dt);
    placeDims(shot, dt);
  }

  function render() {
    renderer.render(scene, camera);
  }

  const f4 = (n) => n.toFixed(4);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    lenis?.raf(now);
    if (!ready) return;
    update(dt, now);

    // nothing moved: skip the draw
    const p = camera.position, r = rifle.quaternion;
    const sig = [p.x, p.y, p.z, cur.shift, cur.rise, r.x, r.y, r.z, state.strip, state.mag, state.cut, state.travel, state.cover, state.sel, state.safe, state.sight, state.trig, state.press].map(f4).join();
    if (sig === signature && !dirty) return;
    signature = sig; dirty = false;
    render();

    if (lockedTier === null && now - readyAt > 3000 && tier < 2 && dt < 0.09) {
      slow = dt > 1 / 40 ? slow + dt : Math.max(0, slow - dt);
      if (slow > 2) { tier++; slow = 0; applyTier(); }
    }
  }

  // stop drawing when the tab is hidden
  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(raf); running = false; }
    else if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  };
  document.addEventListener('visibilitychange', onVisibility);

  // ---------------------------------------------------------------- load
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    '/models/stg44.glb',
    async (gltf) => {
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const seen = new Set();
      const top = gltf.scene.getObjectByName('stg44') || gltf.scene;
      for (const node of [...top.children]) {
        // GLTFLoader de-duplicates names ("barrel_1"); the part id is the stem
        const name = node.name.replace(/_\d+$/, '');
        // the node keeps the file's de-quantisation transform; the wrapper is what moves
        const wrap = new THREE.Group();
        wrap.name = name;
        wrap.add(node);
        parts[name] = wrap;
        node.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true;
          o.receiveShadow = true;
          const m = o.material;
          if (!seen.has(m)) {
            seen.add(m);
            for (const map of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap]) if (map) map.anisotropy = Math.min(8, maxAniso);
            disposables.push(m, m.map, m.normalMap, m.roughnessMap, m.aoMap);
          }
          if (CUT.includes(name)) o.material = cutMaterial(m);
          disposables.push(o.geometry);
        });
      }
      for (const name in parts) (parts[TREE[name]] || rifle).add(parts[name]);

      resizeObserver.observe(canvas);
      width = Math.max(1, canvas.clientWidth); height = Math.max(1, canvas.clientHeight);
      camera.aspect = width / height;
      applyTier();
      measure();
      update(0, performance.now());
      // compile shaders while loading, not on the first scroll
      try { await renderer.compileAsync(scene, camera); } catch { /* falls back to lazy compile */ }
      render();
      ready = true;
      readyAt = performance.now();
      dirty = true;
      requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    },
    (e) => onLoad?.(e.total ? e.loaded / e.total : 0),
    (err) => onFail?.(err),
  );

  window.addEventListener('resize', measure);
  document.fonts?.ready.then(() => { measure(); dirty = true; });
  raf = requestAnimationFrame(frame);

  const api = {
    // the visitor's controls
    set(values) { Object.assign(hand, values); },
    cycle(times = 1, period = 0.9) { run.left = times; run.t = 0; run.period = period; },
    pull() { trigHold = 0.2; },
    press() { pressHold = 0.28; },
    remeasure() { measure(); dirty = true; },
    // Run the easing out and draw once (dev: checking a beat without waiting for it).
    settle(steps = 80) { for (let i = 0; i < steps; i++) update(0.1, performance.now()); render(); signature = ''; },
    // A still of the live canvas at a fixed size (dev: poster + share image).
    async still(w, h, type = 'image/webp', quality = 0.9, cueName = 'hero') {
      const keep = { width, height, q: rifle.quaternion.clone() };
      width = w; height = h;
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const s = sections.find((x) => x.cue === cueName) || sections[0];
      const y = cueName === 'hero' ? 0 : s.top + (s.bottom - s.top) * 0.5 - window.innerHeight * 0.5;
      blend(timeline, y, shot);
      const fit = Math.max(1, 1.6 / camera.aspect);
      const az = shot.az * D2R, el = shot.el * D2R;
      look.fromArray(shot.target);
      camera.position.set(look.x + shot.dist * fit * Math.sin(az) * Math.cos(el), look.y + shot.dist * fit * Math.sin(el), look.z + shot.dist * fit * Math.cos(az) * Math.cos(el));
      camera.lookAt(look);
      camera.setViewOffset(w, h, -shot.shift * w * 0.5, shot.rise * h * 0.5, w, h);
      rig.rotation.y = az; scene.environmentRotation.set(0, az, 0);
      rifle.quaternion.identity();
      setRifle({ ...state, strip: shot.strip, mag: shot.mag, cut: shot.cut, travel: Math.sin(Math.PI * shot.cycle) ** 2, cover: shot.cover });
      rifle.updateMatrixWorld(true);
      cutPlane.copy(cutBase).applyMatrix4(rifle.matrixWorld);
      render();
      const blob = await new Promise((res) => canvas.toBlob(res, type, quality));
      width = keep.width; height = keep.height; camera.aspect = width / height;
      rifle.quaternion.copy(keep.q);
      applyTier(); primed = false; dirty = true;
      return blob;
    },
    info: () => ({ tier, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, width, height, beat: sections[shot.beat]?.cue, parts: Object.keys(parts) }),
    dispose() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', measure);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      disposables.forEach((d) => d?.dispose?.());
      ground.geometry.dispose(); ground.material.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
  return api;
}
