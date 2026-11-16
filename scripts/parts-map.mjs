// Which named part every loose piece of the source model belongs to.
//
// The source ships 13 meshes. Each is split into its loose pieces ("islands"),
// sorted from butt to muzzle, and every piece is sent to one of the parts
// below by its index in that order (scripts/.tmp/model-meta.json lists them
// with their boxes, which is how this table was written).

export const PARTS = {
  stock: 'Wooden butt with its steel fittings',
  stock_pin: 'The cross pin that holds the butt on',
  receiver: 'Pressed-steel receiver, magazine housing and rear sight base',
  trigger_group: 'Trigger housing and pistol grip frame',
  grip_l: 'Left grip panel',
  grip_r: 'Right grip panel',
  mag_catch: 'Magazine catch',
  dust_cover: 'Ejection port cover',
  selector: 'Fire selector cross-bolt (E / D)',
  safety: 'Safety lever',
  trigger: 'Trigger',
  bolt: 'Bolt',
  carrier: 'Bolt carrier, gas piston and cocking handle',
  sight_leaf: 'Rear sight leaf',
  sight_slider: 'Rear sight slider',
  magazine: '30-round magazine',
  handguard: 'Pressed-steel handguard',
  gas_tube: 'Gas cylinder',
  gas_plug: 'Gas cylinder plug',
  barrel: 'Barrel, gas block and front sight base',
  sight_hood: 'Front sight hood',
  muzzle_nut: 'Muzzle nut',
  sling: 'Sling',
};

const pick = (table, k, fallback) => {
  for (const [part, list] of Object.entries(table)) if (list.includes(k)) return part;
  return fallback;
};

const RECEIVER = {
  trigger_group: [1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  grip_l: [2, 4],
  grip_r: [3, 5, 6],
  mag_catch: [30, 31, 33, 34],
  dust_cover: [38, 43, 44],
};

const BARREL = {
  handguard: [0],
  gas_tube: [1],
  gas_plug: [11],
  sight_hood: [18],
  muzzle_nut: [21, 22],
};

export function partOf(source, island, k) {
  switch (source) {
    case 'Stock': return k >= 4 ? 'stock_pin' : 'stock';
    case 'FiremodeButton_E':
    case 'FiremodeButton_D': return 'selector';
    case 'Safety': return 'safety';
    case 'Trigger': return 'trigger';
    case 'Bolt': return 'bolt';
    case 'Piston': return 'carrier';
    case 'Belt': return 'sling';
    // the two ribbed side plates share the magazine's texture but are the walls of its housing
    case 'Magazine': return k === 1 || k === 2 ? 'receiver' : 'magazine';
    case 'Sight': return 'sight_leaf';
    case 'Sight_Distance': return 'sight_slider';
    case 'Recievers': return pick(RECEIVER, k, 'receiver');
    case 'Barrel': return pick(BARREL, k, 'barrel');
    default: throw new Error('unknown source mesh ' + source);
  }
}
