// Sketchfab GLB -> web-ready GLB for the StG 44 site.
//
//   node scripts/convert-model.mjs <path/to/stg_-_44__sturmgewehr.glb>
//   npx gltf-transform optimize scripts/.tmp/stg44.raw.glb public/models/stg44.glb \
//     --compress meshopt --texture-compress webp --texture-size 2048 \
//     --join false --flatten false --simplify false --instance false --palette false
//
// What it does (guide step 02, "Get the model"):
//   - the source is posed at a cant; it is stood upright on its real axes:
//     muzzle +X, up +Y, the rifle's right side +Z, origin on the bore line
//   - real-world scale: 940 mm overall, in metres
//   - one named node per moving part, transforms applied. The source ships 13
//     meshes; the big ones are split along their loose pieces so the handguard,
//     the sights, the sling and the butt fittings can each move on their own
//   - UVs are kept as they are. The sling's textures and the butt's
//     roughness map are halved here; the optimize step turns everything to WebP,
//     which brings 128 MB down to under the guide's 5 MB desktop budget

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import { PARTS, partOf } from './parts-map.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src) { console.error('usage: node scripts/convert-model.mjs <model.glb>'); process.exit(1); }
const outDir = path.join(here, '.tmp');
fs.mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------- frame
// Measured from the file (scripts/axes.mjs): the bore runs along the long thin
// cylinders of the barrel, the lateral axis is the thin axis of stock,
// magazine and trigger alike.
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const X = norm([0.0249, 0.1223, -0.9922]); // towards the muzzle
let Z = [0.9756, -0.2195, -0.0018]; // the rifle's right side
Z = norm(Z.map((z, i) => z - dot(Z, X) * X[i]));
const Y = cross(Z, X); // up
const BORE = [3.2118, 18.3194, -16.2969]; // a point on the gas cylinder's axis
const LENGTH = 0.94; // metres, overall
const GAS_TO_BORE = 0.0235; // BORE above is the gas cylinder's axis; the barrel lies 23.5 mm under it

const io = new NodeIO();
const doc = await io.read(src);
const root = doc.getRoot();
const buffer = root.listBuffers()[0];

const mul = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];
const rot = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]];
const toFrame = (w) => { const d = [w[0] - BORE[0], w[1] - BORE[1], w[2] - BORE[2]]; return [dot(d, X), dot(d, Y), dot(d, Z)]; };
const dirFrame = (d) => norm([dot(d, X), dot(d, Y), dot(d, Z)]);

// ---------------------------------------------------------------- pass 1: world -> frame, find the extent along the bore
const sources = [];
let lo = 1e9, hi = -1e9;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const M = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const P = prim.getAttribute('POSITION'), N = prim.getAttribute('NORMAL'), T = prim.getAttribute('TANGENT'), UV = prim.getAttribute('TEXCOORD_0');
    const n = P.getCount();
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), tan = T ? new Float32Array(n * 4) : null, uv = new Float32Array(n * 2);
    const a = [0, 0, 0], t4 = [0, 0, 0, 0], u2 = [0, 0];
    for (let i = 0; i < n; i++) {
      const p = toFrame(mul(M, P.getElement(i, a)));
      pos.set(p, i * 3);
      nor.set(dirFrame(rot(M, N.getElement(i, a))), i * 3);
      if (T) { T.getElement(i, t4); const d = dirFrame(rot(M, t4)); tan.set([d[0], d[1], d[2], t4[3]], i * 4); }
      UV.getElement(i, u2); uv.set(u2, i * 2);
      // the sling hangs loose; it does not count towards the rifle's length
      if (!/Belt/.test(mesh.getName())) { lo = Math.min(lo, p[0]); hi = Math.max(hi, p[0]); }
    }
    sources.push({ name: mesh.getName().replace(/_(Stock|Body|Belt|Magazine|Barrel)_0$/, '').replace(/^Body_/, ''), material: prim.getMaterial(), pos, nor, tan, uv, idx: Uint32Array.from(prim.getIndices().getArray()), n });
  }
}
const SCALE = LENGTH / (hi - lo);
const MID = (hi + lo) / 2;
console.log('scale', SCALE.toFixed(6), 'm/unit · source length', (hi - lo).toFixed(2));
for (const s of sources) for (let i = 0; i < s.n; i++) {
  s.pos[i * 3] = (s.pos[i * 3] - MID) * SCALE;
  s.pos[i * 3 + 1] = s.pos[i * 3 + 1] * SCALE + GAS_TO_BORE;
  s.pos[i * 3 + 2] *= SCALE;
}

// ---------------------------------------------------------------- pass 2: loose pieces, each sent to a named part
const buckets = new Map(); // part -> Map(material -> { pos, nor, tan, uv, idx })
const meta = { scale: SCALE, sources: {}, parts: {} };
const mm = (v) => Math.round(v * 1000);

for (const s of sources) {
  const parent = new Int32Array(s.n).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const uni = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  const key = new Map();
  for (let i = 0; i < s.n; i++) {
    const id = `${Math.round(s.pos[i * 3] * 5e4)},${Math.round(s.pos[i * 3 + 1] * 5e4)},${Math.round(s.pos[i * 3 + 2] * 5e4)}`;
    const j = key.get(id);
    if (j === undefined) key.set(id, i); else uni(i, j);
  }
  for (let t = 0; t < s.idx.length; t += 3) { uni(s.idx[t], s.idx[t + 1]); uni(s.idx[t], s.idx[t + 2]); }

  const islands = new Map();
  for (let t = 0; t < s.idx.length; t += 3) {
    const r = find(s.idx[t]);
    let isl = islands.get(r);
    if (!isl) islands.set(r, (isl = { tris: [], min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }));
    isl.tris.push(t);
    for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) {
      const v = s.pos[s.idx[t + c] * 3 + k];
      if (v < isl.min[k]) isl.min[k] = v;
      if (v > isl.max[k]) isl.max[k] = v;
    }
  }
  const list = [...islands.values()].sort((a, b) => a.min[0] - b.min[0] || b.tris.length - a.tris.length);
  meta.sources[s.name] = [];
  list.forEach((isl, k) => {
    isl.centre = isl.min.map((v, i) => (v + isl.max[i]) / 2);
    isl.size = isl.max.map((v, i) => v - isl.min[i]);
    const part = partOf(s.name, isl, k);
    meta.sources[s.name].push({ k, part, tris: isl.tris.length, min: isl.min.map(mm), max: isl.max.map(mm), size: isl.size.map(mm) });
    if (!buckets.has(part)) buckets.set(part, new Map());
    const byMat = buckets.get(part);
    if (!byMat.has(s.material)) byMat.set(s.material, { pos: [], nor: [], tan: [], uv: [], idx: [], remap: new Map(), src: s });
    const b = byMat.get(s.material);
    if (b.src !== s) { b.remap = new Map(); b.src = s; }
    for (const t of isl.tris) for (let c = 0; c < 3; c++) {
      const vi = s.idx[t + c];
      let o = b.remap.get(vi);
      if (o === undefined) {
        o = b.pos.length / 3; b.remap.set(vi, o);
        b.pos.push(s.pos[vi * 3], s.pos[vi * 3 + 1], s.pos[vi * 3 + 2]);
        b.nor.push(s.nor[vi * 3], s.nor[vi * 3 + 1], s.nor[vi * 3 + 2]);
        if (s.tan) b.tan.push(s.tan[vi * 4], s.tan[vi * 4 + 1], s.tan[vi * 4 + 2], s.tan[vi * 4 + 3]);
        b.uv.push(s.uv[vi * 2], s.uv[vi * 2 + 1]);
      }
      b.idx.push(o);
    }
  });
}

// ---------------------------------------------------------------- textures
// Name every texture after its material and slot, and halve the ones nobody
// will ever see up close.
const HALVE = /^(belt_.*|stock_orm)$/;
for (const material of root.listMaterials()) {
  const m = material.getName().toLowerCase();
  const slots = { color: material.getBaseColorTexture(), orm: material.getMetallicRoughnessTexture(), normal: material.getNormalTexture() };
  for (const [slot, tex] of Object.entries(slots)) {
    if (!tex) continue;
    tex.setName(`${m}_${slot}`);
    if (HALVE.test(tex.getName())) tex.setImage(new Uint8Array(await sharp(tex.getImage()).resize(1024, 1024, { kernel: 'lanczos3' }).png().toBuffer()));
  }
}

// ---------------------------------------------------------------- write
for (const scene of root.listScenes()) for (const child of scene.listChildren()) child.dispose();
for (const node of root.listNodes()) node.dispose();
for (const mesh of root.listMeshes()) mesh.dispose();
for (const acc of root.listAccessors()) acc.dispose();

const scene = root.listScenes()[0].setName('StG 44');
const top = doc.createNode('stg44');
scene.addChild(top);
let total = 0;
for (const name of [...buckets.keys()].sort()) {
  const mesh = doc.createMesh(name);
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  let tris = 0;
  for (const [material, b] of buckets.get(name)) {
    const prim = doc.createPrimitive()
      .setMaterial(material)
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(b.idx)).setBuffer(buffer))
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(b.pos)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(b.nor)).setBuffer(buffer))
      .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(b.uv)).setBuffer(buffer));
    if (b.tan.length) prim.setAttribute('TANGENT', doc.createAccessor().setType('VEC4').setArray(new Float32Array(b.tan)).setBuffer(buffer));
    mesh.addPrimitive(prim);
    tris += b.idx.length / 3;
    for (let i = 0; i < b.pos.length; i++) { const k = i % 3; if (b.pos[i] < min[k]) min[k] = b.pos[i]; if (b.pos[i] > max[k]) max[k] = b.pos[i]; }
  }
  top.addChild(doc.createNode(name).setMesh(mesh));
  meta.parts[name] = { tris, min: min.map(mm), max: max.map(mm), centre: min.map((v, i) => mm((v + max[i]) / 2)) };
  total += tris;
  console.log(name.padEnd(16), String(tris).padStart(6), 'tris  x', String(mm(min[0])).padStart(5), '..', String(mm(max[0])).padEnd(5), 'y', String(mm(min[1])).padStart(5), '..', String(mm(max[1])).padEnd(5), 'z', String(mm(min[2])).padStart(4), '..', String(mm(max[2])).padEnd(4), PARTS[name] ? '' : '  (unlisted)');
}
console.log('total', total, 'tris in', buckets.size, 'parts');

root.getAsset().generator = 'stg44 site converter';
await io.write(path.join(outDir, 'stg44.raw.glb'), doc);
fs.writeFileSync(path.join(outDir, 'model-meta.json'), JSON.stringify(meta, null, 1));
console.log('wrote', (fs.statSync(path.join(outDir, 'stg44.raw.glb')).size / 1e6).toFixed(1), 'MB raw');
