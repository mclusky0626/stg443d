// Find the rifle's true axes in the source file (it is posed at a cant).
//   node scripts/axes.mjs <model.glb>
import { NodeIO } from '@gltf-transform/core';

const doc = await new NodeIO().read(process.argv[2]);
const mul = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

// eigenvectors of a symmetric 3x3 (Jacobi)
function eig(A) {
  const a = A.map((r) => r.slice());
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 60; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(a[p][q]) < 1e-14) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - s * y; a[k][q] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - s * y; a[q][k] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = v[k][p], y = v[k][q]; v[k][p] = c * x - s * y; v[k][q] = s * x + c * y; }
    }
  }
  return [0, 1, 2].map((i) => ({ val: a[i][i], vec: [v[0][i], v[1][i], v[2][i]] })).sort((x, y) => y.val - x.val);
}

// area-weighted PCA over triangles
function pca(tris) {
  let W = 0; const c = [0, 0, 0];
  for (const t of tris) { W += t.w; for (let k = 0; k < 3; k++) c[k] += t.c[k] * t.w; }
  for (let k = 0; k < 3; k++) c[k] /= W;
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const t of tris) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += t.w * (t.c[i] - c[i]) * (t.c[j] - c[j]) / W;
  return { c, axes: eig(C) };
}

const f = (a) => a.map((x) => x.toFixed(4).padStart(8)).join(' ');
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const M = node.getWorldMatrix();
  const prim = mesh.listPrimitives()[0];
  const P = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray();
  const tris = [];
  const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
  for (let t = 0; t < idx.length; t += 3) {
    const A = mul(M, P.getElement(idx[t], a)), B = mul(M, P.getElement(idx[t + 1], b)), Cc = mul(M, P.getElement(idx[t + 2], c));
    const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [Cc[0] - A[0], Cc[1] - A[1], Cc[2] - A[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    tris.push({ w: Math.hypot(...n) / 2, c: [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3, (A[2] + B[2] + Cc[2]) / 3] });
  }
  const r = pca(tris);
  console.log(mesh.getName().padEnd(30), 'centre', f(r.c));
  for (const ax of r.axes) console.log('   sd', Math.sqrt(ax.val).toFixed(3).padStart(7), 'axis', f(ax.vec));
  if (!/Barrel|Piston|Bolt|Sight_Body/.test(mesh.getName())) continue;
  // per island
  const n = P.getCount();
  const parent = new Int32Array(n).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const uni = (x, y) => { x = find(x); y = find(y); if (x !== y) parent[x] = y; };
  const key = new Map();
  for (let i = 0; i < n; i++) { const w = mul(M, P.getElement(i, a)); const id = w.map((q) => Math.round(q * 2e4)).join(','); const j = key.get(id); if (j === undefined) key.set(id, i); else uni(i, j); }
  for (let t = 0; t < idx.length; t += 3) { uni(idx[t], idx[t + 1]); uni(idx[t], idx[t + 2]); }
  const groups = new Map();
  for (let t = 0; t < idx.length; t += 3) { const g = find(idx[t]); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(tris[t / 3]); }
  for (const g of [...groups.values()].sort((x, y) => y.length - x.length).slice(0, 8)) {
    const q = pca(g);
    console.log('     island', String(g.length).padStart(5), 'centre', f(q.c), 'sd', q.axes.map((x) => Math.sqrt(x.val).toFixed(2)).join('/'), 'main', f(q.axes[0].vec));
  }
}
