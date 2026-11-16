// Measure the source model: world-space boxes per part, texture sizes,
// and the loose pieces ("islands") inside every mesh.
//   node scripts/analyze.mjs <model.glb>
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';

const io = new NodeIO();
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();

for (const tex of root.listTextures()) {
  const meta = await sharp(tex.getImage()).metadata();
  const users = doc.getGraph().listParents(tex).map((p) => p.getName?.()).filter(Boolean);
  console.log('TEX', tex.getName() || '-', meta.width + 'x' + meta.height, meta.channels + 'ch', (tex.getImage().byteLength / 1e6).toFixed(1) + 'MB', users.join(','));
}

const mul = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];
const f = (a) => a.map((x) => x.toFixed(3).padStart(8)).join(' ');

const all = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const M = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const P = prim.getAttribute('POSITION');
    const I = prim.getIndices();
    const n = P.getCount();
    const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
    const wp = new Float32Array(n * 3);
    const p = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      P.getElement(i, p);
      const w = mul(M, p);
      wp.set(w, i * 3);
      for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], w[k]); max[k] = Math.max(max[k], w[k]); all.min[k] = Math.min(all.min[k], w[k]); all.max[k] = Math.max(all.max[k], w[k]); }
    }
    console.log('\nPART', mesh.getName(), 'verts', n, 'tris', I.getCount() / 3);
    console.log('  min', f(min), '\n  max', f(max), '\n  size', f(max.map((x, k) => x - min[k])));

    // islands: union vertices that share a position, then triangles
    const parent = new Int32Array(n).map((_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const uni = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
    const key = new Map();
    for (let i = 0; i < n; i++) {
      const id = `${Math.round(wp[i * 3] * 2e4)},${Math.round(wp[i * 3 + 1] * 2e4)},${Math.round(wp[i * 3 + 2] * 2e4)}`;
      const j = key.get(id);
      if (j === undefined) key.set(id, i); else uni(i, j);
    }
    const idx = I.getArray();
    for (let t = 0; t < idx.length; t += 3) { uni(idx[t], idx[t + 1]); uni(idx[t], idx[t + 2]); }
    const isl = new Map();
    for (let t = 0; t < idx.length; t += 3) {
      const r = find(idx[t]);
      let s = isl.get(r);
      if (!s) isl.set(r, (s = { tris: 0, min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }));
      s.tris++;
      for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) {
        const val = wp[idx[t + c] * 3 + k];
        s.min[k] = Math.min(s.min[k], val); s.max[k] = Math.max(s.max[k], val);
      }
    }
    const list = [...isl.values()].sort((a, b) => b.tris - a.tris);
    console.log('  islands', list.length);
    for (const s of list.slice(0, 60)) console.log('   ', String(s.tris).padStart(6), 'min', f(s.min), 'max', f(s.max));
    if (list.length > 60) console.log('    ... and', list.length - 60, 'smaller');
  }
}
console.log('\nALL min', f(all.min), 'max', f(all.max), 'size', f(all.max.map((x, k) => x - all.min[k])));
