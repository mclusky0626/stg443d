// The beat sheet. One row per scroll stop, one motion per beat,
// and the last row is the first row again so the loop feels finished.
//
//  beat       camera                     object                     words
//  hero       wide three-quarter         whole, slow sway           the name, one line
//  origins    square on, right profile   whole, dimensioned         why it was built
//  cartridge  push in under the receiver the magazine drops out     the 7.92 mm Kurz round
//  action     close on the receiver      cut open; the bolt cycles  gas, piston, tilting bolt
//  steel      along the handguard        one detail fills the frame pressed sheet steel
//  controls   round to the left side     the visitor works it       safety, selector, sights
//  strip      pull back and up           field-strips in order      the six moves
//  specs      slow swing past the side   every part labelled        the numbers
//  legacy     back to the start          whole again                what came after
//  outro      same shot, centred         whole                      the ask
//
// az: degrees round the rifle from its right side (+ is towards the muzzle)
// el: degrees above the horizon, dist: metres, target: point looked at
// shift: where the object sits on screen (-1 left edge .. +1 right edge)
// rise: the same, vertically (+ is up)
// strip: field strip 0..1 · mag: magazine out 0..1 · cut: cutaway 0..1
// cycle: one turn of the action 0..1 · cover: ejection-port cover open 0..1

const STILL = { strip: 0, mag: 0, cut: 0, cycle: 0, cover: 0 };
const HOME = { az: 30, el: 9, dist: 2.02, target: [0.0, -0.075, 0], rise: 0, ...STILL };
const ORBIT = { el: 13, dist: 2.42, target: [0, -0.07, 0], shift: 0.37, rise: 0.02, ...STILL, cover: 1 };

export const CUES = {
  hero: { in: { ...HOME, shift: 0.2, rise: 0.2 } },
  origins: { in: { az: 0, el: 2, dist: 2.62, target: [0, -0.06, 0], shift: 0.4, rise: -0.06, ...STILL } },
  cartridge: { in: { az: 26, el: -3, dist: 1.46, target: [0.03, -0.2, 0], shift: -0.4, rise: 0, ...STILL, mag: 1 } },
  action: {
    in: { az: -9, el: 8, dist: 1.12, target: [0.11, -0.01, 0], shift: 0.44, rise: 0, ...STILL, cut: 1 },
    out: { az: -9, el: 8, dist: 1.12, target: [0.11, -0.01, 0], shift: 0.44, rise: 0, ...STILL, cut: 1, cycle: 1, cover: 1 },
  },
  steel: { in: { az: 124, el: 13, dist: 0.8, target: [0.2, 0.0, 0], shift: -0.42, rise: 0, ...STILL, cover: 1 } },
  controls: { in: { az: 194, el: 9, dist: 0.78, target: [-0.1, -0.02, 0], shift: 0.46, rise: 0, ...STILL, cover: 1 } },
  strip: { in: { az: 154, el: 17, dist: 2.85, target: [-0.07, -0.075, 0], shift: -0.42, rise: -0.02, ...STILL, strip: 1, cover: 1 } },
  specs: { in: { ...ORBIT, az: 40 }, out: { ...ORBIT, az: -36 } },
  legacy: { in: { ...HOME, dist: 2.3, shift: -0.38 } },
  outro: { in: { ...HOME, dist: 2.1, shift: 0, rise: 0.36 } },
};

export const KEYS = ['az', 'el', 'dist', 'shift', 'rise', 'strip', 'mag', 'cut', 'cycle', 'cover'];

const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);

// Build the timeline from where the sections actually sit on the page, so the
// camera holds while a chapter is being read and moves across the gap between.
export function buildTimeline(sections, viewportH) {
  const keys = [];
  sections.forEach((s, i) => {
    const cue = CUES[s.cue];
    if (!cue) return;
    let yIn = s.top - viewportH * 0.3;
    let yOut = s.bottom - viewportH * 0.7;
    if (i === 0) yIn = 0;
    if (yOut < yIn + 1) yOut = yIn + 1;
    keys.push({ y: yIn, shot: cue.in, section: i, edge: 'in' });
    keys.push({ y: yOut, shot: cue.out || cue.in, section: i, edge: 'out' });
  });
  return keys;
}

// The guide's blend(): the complete shot for a scroll position, on a smooth curve.
// Also reports which beat owns the screen and how firmly (0..1), for the labels.
export function blend(keys, y, out) {
  let k = 0;
  while (k < keys.length - 2 && y > keys[k + 1].y) k++;
  const a = keys[k], b = keys[Math.min(k + 1, keys.length - 1)];
  const span = Math.max(1e-6, b.y - a.y);
  const raw = Math.min(1, Math.max(0, (y - a.y) / span));
  const sameBeat = a.section === b.section;
  // inside a beat the motion follows the scroll evenly; between beats it eases
  const t = sameBeat ? raw : smoother(raw);
  for (const key of KEYS) out[key] = a.shot[key] + (b.shot[key] - a.shot[key]) * t;
  for (let i = 0; i < 3; i++) out.target[i] = a.shot.target[i] + (b.shot.target[i] - a.shot.target[i]) * t;
  if (sameBeat) {
    out.beat = a.section; out.weight = 1; out.next = a.section;
  } else {
    out.beat = t < 0.5 ? a.section : b.section;
    out.weight = Math.abs(1 - 2 * t);
    out.next = b.section;
  }
  return out;
}
