// All the words on the page. Real HTML text, never baked into the 3D.

export const HERO = {
  eyebrow: 'MKb 42 · MP 43 · MP 44 · StG 44',
  title: 'The Sturmgewehr 44',
  lede: 'A rifle designed around a cartridge that did not exist before it: weaker than a rifle round, far stronger than a pistol round, thirty to a magazine. It gave the assault rifle its shape, and its name.',
  stats: [
    { value: '7.92', unit: '× 33 mm', label: 'Kurz cartridge' },
    { value: '30', unit: 'rounds', label: 'Magazine' },
    { value: '940', unit: 'mm', label: 'Overall length' },
    { value: '425,977', unit: '', label: 'Built, 1943–45' },
  ],
};

export const CHAPTERS = [
  {
    id: 'origins',
    no: '01',
    kicker: 'Origins',
    word: 'MP 43',
    side: 'l',
    title: 'A rifle for the three hundred metres that mattered',
    lede: 'German infantry went to war with a bolt-action rifle sighted to two kilometres and a submachine gun that was spent at one hundred metres. Most of their fighting happened in between.',
    body: [
      'The Karabiner 98k fired a full-power 7.92 × 57 mm cartridge, built to carry beyond a kilometre, one shot at a time from a five-round magazine. The MP 40 fired a pistol round automatically and was close to useless past a hundred metres. Studies of infantry combat going back to the First World War kept reaching the same conclusion: riflemen seldom saw, let alone hit, anything beyond about 400 metres. The rifle was carrying range nobody used; the submachine gun had none to spare.',
      'In 1938 the Heereswaffenamt, the Army Weapons Office, placed two contracts. Polte of Magdeburg was to develop a short cartridge. C. G. Haenel of Suhl, where Hugo Schmeisser led design, was to build a weapon to fire it, a Maschinenkarabiner or “machine carbine”. Walther joined later with a rival. By 1942 both existed as the MKb 42(H) and MKb 42(W), and nearly twelve thousand of Haenel’s went to the Eastern Front for trials.',
      'Hitler refused, more than once, to approve it. He did not want a third cartridge in the supply chain in the middle of a war, and he wanted more submachine guns. The Weapons Office kept the project alive by changing what it was called. Reworked to fire from a closed bolt with a hammer, as Walther’s design had, Haenel’s rifle went into production in 1943 as the Maschinenpistole 43: on paper, a submachine gun.',
      'Reports from the front did the rest. In April 1944 it became the MP 44, and before the year was out it had the name it is remembered by, Sturmgewehr 44, the “assault rifle”. Most accounts credit the name to Hitler himself, who had come round to the weapon he had tried to stop.',
    ],
    timeline: [
      ['1938', 'The Weapons Office orders a short cartridge from Polte and a machine carbine from Haenel.'],
      ['1942', 'MKb 42(H) and MKb 42(W) prototypes. Haenel’s goes east for troop trials.'],
      ['1943', 'Reworked to fire from a closed bolt, it enters production as the MP 43.'],
      ['Apr 1944', 'Redesignated MP 44.'],
      ['Late 1944', 'Renamed Sturmgewehr 44.'],
      ['May 1945', 'Production ends at about 426,000 rifles.'],
    ],
  },
  {
    id: 'cartridge',
    no: '02',
    kicker: 'Cartridge',
    word: 'KURZ',
    side: 'r',
    title: 'Kurz means short',
    lede: 'The rifle is the answer to a question the cartridge asked. The 7.92 × 33 mm Kurz sits deliberately between the pistol round of the submachine gun and the full-power round of the rifle.',
    body: [
      'It keeps the 7.92 mm bore of the standard rifle round, so barrels could be made on existing machinery, and the same width at the base. But the case is cut down from 57 mm to 33 and the bullet from 12.8 grams to 8.1. It leaves the 419 mm barrel at about 685 metres a second with roughly 1,900 joules: half the energy of the rifle round, and more than three times that of a 9 mm bullet from an MP 40.',
      'Half the power is what makes the rest possible. The recoil is light enough to hold short bursts on a target. The rounds are small and light enough to stack thirty in the curved magazine now hanging below the receiver, and to carry six of those magazines in two canvas pouches: 180 rounds, where a rifleman with a Kar 98k carried 60.',
      'The magazine curves because the cartridge tapers. In service it was often loaded a few rounds short of thirty to spare the spring, and the manual warned soldiers not to use it as a handle, since pressure on it could cause a stoppage. Many did anyway. The pressed-steel handguard ahead of it got too hot to hold.',
      'Most Kurz cases were lacquered steel, not brass. Germany was short of copper by 1943, and a round designed to be fired by the hundred had to be cheap.',
    ],
    cartridges: true,
    facts: [
      ['Designation', '7.92 × 33 mm Kurz · Pistolenpatrone 43'],
      ['Case', '33 mm, mostly lacquered steel'],
      ['Bullet', '8.1 g, mild-steel core'],
      ['Muzzle velocity', 'about 685 m/s'],
      ['Muzzle energy', 'about 1,900 J'],
      ['Carried', '6 magazines · 180 rounds'],
    ],
  },
  {
    id: 'action',
    no: '03',
    kicker: 'Action',
    word: 'GAS',
    side: 'l',
    title: 'Gas, piston, tilting bolt',
    lede: 'Cut the receiver open and the mechanism is short and plain: one moving assembly, driven by gas borrowed from the barrel. Keep scrolling and it cycles.',
    body: [
      'A little over halfway along the barrel, a port bleeds gas up into the cylinder that lies above it. The gas drives a piston, and the piston is one piece with the bolt carrier, so the whole mass moves together. This is the long-stroke arrangement, the same one the Kalashnikov would use.',
      'For the first few millimetres the carrier moves alone, which gives the bullet time to leave and the pressure time to fall. Then a ramp inside it lifts the rear of the bolt out of its seat in the receiver. Bolt and carrier run back together, drawing the empty case out of the chamber and throwing it through the port on the right side.',
      'Going back, they cock the hammer and compress the return spring. That spring lives in a tube inside the wooden butt, which is why the StG 44 could never be given a folding stock. The spring drives everything forward again, the bolt pushes the next round out of the magazine, and in the last moment of travel its rear drops back into the locking seat.',
      'Unlike the MKb 42(H) and nearly every submachine gun, it fires from a closed bolt. Nothing heavy moves before the shot, so a single aimed round goes where the sights were pointing. The rate of fire is 500 to 600 rounds a minute, slow by German standards. The MG 42 fired more than twice as fast.',
    ],
    facts: [
      ['Operation', 'Gas, long-stroke piston'],
      ['Locking', 'Tilting bolt'],
      ['Firing', 'Closed bolt, hammer'],
      ['Rate of fire', '500–600 rounds a minute'],
      ['Return spring', 'In the butt'],
    ],
  },
  {
    id: 'steel',
    no: '04',
    kicker: 'Manufacture',
    word: '70 RM',
    side: 'r',
    title: 'Pressed, not carved',
    lede: 'Run your eye along the ribs. Almost everything in view was stamped from sheet steel and welded together, much of it by firms that had never made a gun.',
    body: [
      'A Kar 98k receiver began as a forging and gave up most of its weight to milling machines, in hours of skilled work. By 1943 Germany was short of machine tools, of alloy steel and of machinists. Schmeisser’s first prototypes had milled receivers too. For production the rifle was redesigned with Merz-Werke of Frankfurt, a company whose trade was pressing and stamping sheet metal.',
      'The receiver, the magazine housing, the trigger housing and the handguard are all pressings, folded from thin sheet and stiffened by the ribs and grooves you can see. They are welded and riveted around a small number of machined parts where strength matters: the barrel, the bolt and carrier, and the block the bolt locks into.',
      'Pressings could be made anywhere there was a press. Parts came from a web of subcontractors and were put together by Haenel and Sauer & Sohn in Suhl, Erma in Erfurt and Steyr-Daimler-Puch in Austria. A finished rifle cost about 70 Reichsmarks, close to the price of the bolt-action it was meant to replace.',
      'The method had its costs. Thin sheet has to be braced, so the rifle is heavy for its size, more than five kilograms loaded. The receiver could be dented, and the steel handguard heated quickly in automatic fire. But it was the right answer, and nearly every military rifle since has been built the same way: pressings, welds, and a few machined parts where they count.',
    ],
    facts: [
      ['Receiver', 'Pressed and welded sheet steel'],
      ['Furniture', 'Wooden butt · wood or plastic grips'],
      ['Assembled by', 'Haenel · Erma · Sauer & Sohn · Steyr'],
      ['Unit cost', 'about 70 Reichsmarks'],
      ['Weight', '4.6 kg empty · about 5.1 kg loaded'],
    ],
  },
  {
    id: 'controls',
    no: '05',
    kicker: 'Controls',
    word: 'E · D',
    side: 'l',
    title: 'Everything under one hand',
    lede: 'The controls are the ones every later rifle would have, in close to the places they still are. These ones work. Try them.',
    body: [
      'The safety is a lever on the left, above the grip and under the right thumb: up for safe, down to fire. Just behind it the selector is a button that passes straight through the housing. Push it from the right and an “E” stands proud on the left, for Einzelfeuer, single shots. Push it back and a “D” shows on the right, for Dauerfeuer, continuous fire.',
      'The manual treated single shots as the normal way to shoot. Bursts of two or three rounds were for the assault itself and for fighting at close quarters. The cocking handle is on the left and travels with the bolt, so it can be worked with the left hand while the right stays on the grip.',
      'The butt lies in a straight line behind the barrel, which sends the recoil straight back into the shoulder and keeps the muzzle from climbing. The price is in the sights, which have to stand five centimetres above the bore to reach the eye: a hooded post at the front and a V-notch at the back, on a leaf graduated from 100 to 800 metres.',
    ],
    controls: true,
  },
  {
    id: 'strip',
    no: '06',
    kicker: 'Field strip',
    word: '1 PIN',
    side: 'r',
    title: 'Apart in a minute, without tools',
    lede: 'One pin holds the rifle together. Push it out and the rest comes apart in the order every soldier learned.',
    steps: [
      ['Magazine', 'Press the catch and draw the magazine out. Pull the bolt back and check the chamber is empty.'],
      ['Retaining pin', 'Push out the pin at the back of the receiver.'],
      ['Butt', 'Draw the butt straight off to the rear. The return spring comes away with it.'],
      ['Trigger housing', 'With the butt gone, the grip and trigger housing swing down on their hinge.'],
      ['Bolt carrier', 'Pull the cocking handle back and slide the carrier and piston out of the rear of the receiver.'],
      ['Bolt', 'Lift the bolt off the carrier.'],
    ],
    body: [
      'That is as far as daily cleaning went. For a thorough clean the handguard springs off downward, and the gas plug unscrews from the front of the cylinder so that the carbon can be scraped out.',
      'It goes back together in reverse, and the last thing in is the pin.',
    ],
  },
];

// Drawn to scale in the cartridge chapter. Lengths in millimetres.
export const ROUNDS = [
  {
    id: 'p08', name: '9 × 19 mm', use: 'MP 40 submachine gun', mass: '8.0 g', speed: '380 m/s', energy: 580,
    case: 19.15, total: 29.7, base: 9.9, shoulder: null, neck: 9.6, bullet: 9.0, nose: 'round', steel: false,
  },
  {
    id: 'kurz', name: '7.92 × 33 mm Kurz', use: 'Sturmgewehr 44', mass: '8.1 g', speed: '685 m/s', energy: 1900,
    case: 33, total: 48, base: 11.9, shoulder: [24.6, 11.2, 27.6], neck: 9.1, bullet: 8.2, nose: 'point', steel: true, hero: true,
  },
  {
    id: 'mauser', name: '7.92 × 57 mm', use: 'Karabiner 98k · MG 42', mass: '12.8 g', speed: '760 m/s', energy: 3700,
    case: 57, total: 80.6, base: 11.95, shoulder: [46.2, 10.95, 50], neck: 9.1, bullet: 8.2, nose: 'point', steel: false,
  },
];

export const SPECS = {
  id: 'specs',
  no: '07',
  kicker: 'Data',
  word: '940 MM',
  title: 'The numbers',
  lede: 'Figures are the commonly published ones for the series-production MP 44 and StG 44.',
  groups: [
    {
      name: 'Dimensions',
      rows: [
        ['Overall length', '940 mm'],
        ['Barrel', '419 mm · 4 grooves, right-hand twist'],
        ['Weight', '4.6 kg with empty magazine'],
        ['Weight, loaded', 'about 5.1 kg'],
      ],
    },
    {
      name: 'Ammunition',
      rows: [
        ['Cartridge', '7.92 × 33 mm Kurz'],
        ['Feed', '30-round detachable box magazine'],
        ['Muzzle velocity', 'about 685 m/s'],
        ['Rate of fire', '500–600 rounds a minute'],
      ],
    },
    {
      name: 'Mechanism',
      rows: [
        ['Operation', 'Gas, long-stroke piston'],
        ['Locking', 'Tilting bolt'],
        ['Fire', 'Single shots or automatic, from a closed bolt'],
        ['Sights', 'Hooded post · tangent V-notch, 100–800 m'],
        ['Effective range', 'about 300 m in bursts · 600 m in single shots'],
      ],
    },
    {
      name: 'Production',
      rows: [
        ['Designed by', 'Hugo Schmeisser, C. G. Haenel, Suhl'],
        ['In production', '1943 to May 1945'],
        ['Number built', '425,977'],
      ],
    },
  ],
};

export const LEGACY = {
  id: 'legacy',
  no: '08',
  kicker: 'Legacy',
  word: 'STURM',
  title: 'The pattern for everything after',
  lede: 'The StG 44 came too late and in numbers too small to change the war. What it changed was the idea of what an infantry rifle is.',
  body: [
    'It went first to the Eastern Front, and by late 1944 the new Volksgrenadier divisions were being organised around it, with whole platoons carrying nothing else. There were never enough. Fewer than half a million were made, against more than fourteen million Kar 98k, and the ammunition factories never caught up with the rifles.',
    'It collected some strange attachments on the way. The Zielgerät 1229 “Vampir” was an infrared lamp and image converter for shooting at night, issued in small numbers in 1945. The Krummlauf was a curved barrel with a periscope sight, made in 30° and 90° versions for firing round corners and out of armoured vehicles. It wore out in a few hundred rounds.',
    'The Soviet Union captured the rifle in quantity, already had an intermediate cartridge of its own from 1943, and adopted the Kalashnikov in 1949. Inside, the AK is a different rifle, with a rotating bolt. Hugo Schmeisser spent 1946 to 1952 working in Izhevsk, and what he contributed there is still argued over. But the idea is the same: an intermediate cartridge, a choice of single shots or automatic fire, a pistol grip, a thirty-round curved magazine and, from the AKM onward, a pressed-steel receiver.',
    'In Germany the line ran through Mauser’s unfinished StG 45(M) to the Spanish CETME and the G3. The rifle itself served on for decades, with East German police, in Czechoslovakia, and with Yugoslav paratroopers into the 1980s. In 2012 a store of several thousand turned up in Syria.',
  ],
  feature: {
    label: 'The word',
    title: 'Sturm · Gewehr',
    text: 'Sturm is the storming of a position, the last rush of an attack. Gewehr is a rifle. English translated the pair literally, and “assault rifle” has been the name of the whole class of weapon ever since.',
  },
};

export const OUTRO = {
  title: 'Yours to take apart',
  text: 'Drag the rifle to turn it. Move the slider to strip it.',
};

export const NAV = [
  ...CHAPTERS.map((c) => ({ id: c.id, no: c.no, label: c.kicker })),
  { id: 'specs', no: SPECS.no, label: SPECS.kicker },
  { id: 'legacy', no: LEGACY.no, label: LEGACY.kicker },
];

// the big word behind the rifle, per chapter
export const WORDS = {
  hero: 'StG 44',
  ...Object.fromEntries(CHAPTERS.map((c) => [c.id, c.word])),
  specs: SPECS.word,
  legacy: LEGACY.word,
  outro: 'StG 44',
};

// which side the words sit on, so the scrim can follow
export const SIDES = {
  hero: 'l',
  ...Object.fromEntries(CHAPTERS.map((c) => [c.id, c.side])),
  specs: 'l',
  legacy: 'r',
  outro: 'none',
};

export const CREDIT = {
  title: 'STG - 44 | Sturmgewehr',
  author: 'ELIZION',
  source: 'https://sketchfab.com/3d-models/stg-44-sturmgewehr-fa37bef729e141a6a29bb022a3e0be41',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};
