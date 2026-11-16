// How each named part of the model moves, and where the callouts and the
// dimension lines are pinned. Coordinates are metres in model space:
// muzzle +X, up +Y, the rifle's right side +Z, origin on the bore line
// at the middle of the rifle's length.

// Parts that ride on another part.
export const TREE = {
  grip_l: 'trigger_group',
  grip_r: 'trigger_group',
  trigger: 'trigger_group',
  safety: 'trigger_group',
  selector: 'trigger_group',
  bolt: 'carrier',
  sight_slider: 'sight_leaf',
};

// The field strip, in the order a soldier did it.
// move: offset at strip = 1 · win: when in the sequence the part moves
// turn: a swing about a pivot, in degrees
export const STRIP = {
  sling: { move: [0, 0.3, 0], win: [0, 0.3] },
  magazine: { move: [0.03, -0.2, 0], win: [0.04, 0.38] },
  stock_pin: { move: [0, 0, -0.11], win: [0.16, 0.42] },
  stock: { move: [-0.2, 0, 0], win: [0.28, 0.64] },
  trigger_group: { move: [-0.035, -0.125, 0], turn: { axis: 'z', pivot: [-0.045, -0.03, 0], angle: -16 }, win: [0.4, 0.8] },
  grip_l: { move: [0, 0, -0.075], win: [0.62, 0.96] },
  grip_r: { move: [0, 0, 0.075], win: [0.62, 0.96] },
  carrier: { move: [-0.15, 0.15, 0], win: [0.5, 0.9] },
  bolt: { move: [0, -0.062, 0], win: [0.72, 1] },
  handguard: { move: [0.02, -0.095, 0], win: [0.32, 0.72] },
  gas_plug: { move: [0.085, 0, 0], win: [0.54, 0.9] },
  muzzle_nut: { move: [0.06, 0, 0], win: [0.6, 0.95] },
  sight_hood: { move: [0, 0.05, 0], win: [0.64, 1] },
};

// The working parts.
export const MECH = {
  travel: 0.105, // how far the bolt carrier runs back
  magDrop: [0.016, -0.15, 0], // the magazine, drawn out of its housing
  catchPress: 0.0025, // magazine catch, pressed in
  selector: 0.005, // the cross-bolt, pushed through to D
  cover: { axis: 'x', pivot: [0, 0.024, 0.0135], closed: 172 }, // ejection-port cover on its hinge rod
  safety: { axis: 'z', pivot: [-0.135, -0.049, 0], safe: -52 },
  trigger: { axis: 'z', pivot: [-0.1145, -0.053, 0], pull: -13 },
  leaf: { axis: 'z', pivot: [0.05, 0.0545, 0], up: -8.5, slide: 0.034 }, // rear sight at 800 m
  cutFrom: 0.05, // the cutaway plane starts clear of the rifle's right side
  cutTo: 0.0015, // ... and stops just right of the centreline
};

// Parts sliced by the cutaway plane.
export const CUT = ['receiver', 'dust_cover', 'handguard', 'gas_tube', 'mag_catch', 'sling'];

// beat: which chapter shows the label
// part: the label rides with this part when it moves
// row:  the label plate sits in a band above ('top') or below ('bottom') the rifle
// n:    outward direction of the surface; the label hides when it faces away
const R = [0, 0, 1], L = [0, 0, -1];
export const LABELS = [
  // ---- cartridge: the magazine, out of its housing
  { beat: 'cartridge', part: 'receiver', at: [0.03, -0.045, 0.02], n: R, row: 'top', title: 'Magazine housing', note: 'Pressed into the receiver' },
  { beat: 'cartridge', part: 'magazine', at: [0.012, -0.012, 0.0], n: null, row: 'top', title: 'Feed lips', note: 'Rounds leave from alternate sides' },
  { beat: 'cartridge', part: 'magazine', at: [0.035, -0.13, 0.012], n: R, row: 'bottom', title: '30 rounds', note: 'Two staggered columns' },
  { beat: 'cartridge', part: 'magazine', at: [0.058, -0.272, 0.008], n: null, row: 'bottom', title: 'Floor plate', note: 'Slides off for cleaning' },

  // ---- action: the receiver cut open
  { beat: 'action', part: 'barrel', at: [0.298, 0.012, 0.012], n: null, row: 'top', title: 'Gas block', note: 'Taps the barrel 25 cm from the breech' },
  { beat: 'action', part: 'carrier', at: [0.082, 0.0235, 0.004], n: null, row: 'top', title: 'Gas piston', note: 'One piece with the carrier' },
  { beat: 'action', part: 'carrier', at: [-0.02, 0.03, 0.006], n: null, row: 'top', title: 'Bolt carrier', note: 'Runs back about 10 cm' },
  { beat: 'action', part: 'bolt', at: [0.012, -0.002, 0.008], n: null, row: 'bottom', title: 'Bolt', note: 'Tilts to lock in the receiver' },
  { beat: 'action', part: 'barrel', at: [0.2, 0.0, 0.008], n: null, row: 'bottom', title: 'Barrel', note: '419 mm, four grooves' },
  { beat: 'action', part: 'stock', at: [-0.26, 0.0, 0.016], n: R, row: 'bottom', title: 'Return spring', note: 'Housed inside the butt' },

  // ---- steel: the pressings, from the front left
  { beat: 'steel', part: 'gas_plug', at: [0.35, 0.0235, -0.009], n: null, row: 'top', title: 'Gas plug', note: 'Unscrews to clean the cylinder' },
  { beat: 'steel', part: 'handguard', at: [0.17, 0.018, -0.019], n: L, row: 'top', title: 'Handguard', note: 'One folded steel pressing' },
  { beat: 'steel', part: 'receiver', at: [0.0, 0.02, -0.02], n: L, row: 'top', title: 'Receiver', note: 'Two pressings, welded' },
  { beat: 'steel', part: 'barrel', at: [0.39, 0.0, -0.0075], n: null, row: 'bottom', title: 'Barrel', note: 'Machined, as it has to be' },
  { beat: 'steel', part: 'handguard', at: [0.2, -0.021, -0.006], n: null, row: 'bottom', title: 'Vent slots', note: 'It still ran hot on automatic' },
  { beat: 'steel', part: 'receiver', at: [0.03, -0.035, -0.02], n: L, row: 'bottom', title: 'Stiffening ribs', note: 'Pressed in, not machined' },

  // ---- controls: the left side
  { beat: 'controls', part: 'sight_slider', at: [0.006, 0.058, -0.012], n: null, row: 'top', title: 'Rear sight', note: '100 to 800 m' },
  { beat: 'controls', part: 'carrier', at: [-0.0145, 0.023, -0.028], n: null, row: 'top', title: 'Cocking handle', note: 'Moves with the bolt' },
  { beat: 'controls', part: 'selector', at: [-0.157, -0.0285, -0.019], n: L, row: 'top', title: 'Selector', note: 'E single shots · D automatic' },
  { beat: 'controls', part: 'receiver', at: [-0.035, -0.046, -0.02], n: L, row: 'bottom', title: 'Magazine catch', note: 'Press to release' },
  { beat: 'controls', part: 'trigger', at: [-0.116, -0.078, -0.002], n: null, row: 'bottom', title: 'Trigger', note: '' },
  { beat: 'controls', part: 'safety', at: [-0.14, -0.066, -0.017], n: L, row: 'bottom', title: 'Safety', note: 'Up safe · down fire' },

  // ---- strip: the six moves
  { beat: 'strip', part: 'sling', at: [0.12, -0.045, 0.02], n: null, row: 'top', title: 'Sling', note: '' },
  { beat: 'strip', part: 'carrier', at: [0.04, 0.0235, 0], n: null, row: 'top', title: '5 · Bolt carrier', note: 'Out through the rear' },
  { beat: 'strip', part: 'bolt', at: [0, 0.0, -0.012], n: null, row: 'top', title: '6 · Bolt', note: 'Lifts off the carrier' },
  { beat: 'strip', part: 'stock', at: [-0.36, 0.01, -0.016], n: null, row: 'top', title: '3 · Butt', note: 'With the return spring' },
  { beat: 'strip', part: 'stock_pin', at: [-0.212, -0.021, -0.017], n: null, row: 'top', title: '2 · Retaining pin', note: 'Holds the rifle together' },
  { beat: 'strip', part: 'handguard', at: [0.2, -0.02, -0.015], n: null, row: 'bottom', title: 'Handguard', note: 'Springs off downward' },
  { beat: 'strip', part: 'magazine', at: [0.05, -0.2, -0.012], n: null, row: 'bottom', title: '1 · Magazine', note: 'Out first, chamber checked' },
  { beat: 'strip', part: 'trigger_group', at: [-0.17, -0.1, -0.016], n: null, row: 'bottom', title: '4 · Trigger housing', note: 'Swings down on its hinge' },
  { beat: 'strip', part: 'gas_plug', at: [0.36, 0.0235, -0.008], n: null, row: 'bottom', title: 'Gas plug', note: '' },

  // ---- specs: the labelled swing past the right side
  { beat: 'specs', part: 'sight_hood', at: [0.443, 0.066, 0], n: null, row: 'top', title: 'Front sight', note: 'Hooded post' },
  { beat: 'specs', part: 'gas_plug', at: [0.35, 0.03, 0], n: null, row: 'top', title: 'Gas cylinder', note: 'Above the barrel' },
  { beat: 'specs', part: 'sight_leaf', at: [0.02, 0.058, 0], n: null, row: 'top', title: 'Rear sight', note: 'Tangent, V-notch' },
  { beat: 'specs', part: 'dust_cover', at: [0.005, 0.04, 0.016], n: null, row: 'top', title: 'Port cover', note: 'Springs open as the bolt moves' },
  { beat: 'specs', part: 'stock', at: [-0.36, 0.02, 0.01], n: null, row: 'top', title: 'Butt', note: 'In line with the bore' },
  { beat: 'specs', part: 'muzzle_nut', at: [0.462, -0.009, 0.006], n: null, row: 'bottom', title: 'Muzzle', note: '7.92 mm' },
  { beat: 'specs', part: 'handguard', at: [0.19, -0.02, 0.01], n: null, row: 'bottom', title: 'Handguard', note: 'Pressed steel' },
  { beat: 'specs', part: 'magazine', at: [0.055, -0.24, 0.01], n: null, row: 'bottom', title: 'Magazine', note: '30 rounds' },
  { beat: 'specs', part: 'trigger_group', at: [-0.19, -0.13, 0.014], n: null, row: 'bottom', title: 'Pistol grip', note: 'Wood or plastic panels' },
  { beat: 'specs', part: 'sling', at: [-0.3, -0.085, 0.02], n: null, row: 'bottom', title: 'Sling', note: 'Leather' },
];

// Dimension lines, drawn like a drawing office would: two extension lines up
// from the object and a measured line between them.
// a, b: the points measured between · y: height of the dimension line
export const DIMS = [
  { beat: 'origins', a: [-0.47, 0.05, 0], b: [0.47, 0.03, 0], y: 0.225, value: '940 mm', note: 'Overall length' },
  { beat: 'origins', a: [0.051, 0.075, 0], b: [0.47, 0.03, 0], y: 0.148, value: '419 mm', note: 'Barrel' },
  { beat: 'origins', axis: true, a: [-0.56, 0, 0], b: [0.56, 0, 0], value: '', note: 'Bore axis' },
];
