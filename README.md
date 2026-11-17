# StG 44 — the Sturmgewehr, What an interactive website even I was suprised as f

A scroll-driven study of the Sturmgewehr 44, built on the method in
*The Interactive 3D Website Guide* (@designedby.russ): one hero object, the
scrollbar as a timeline, real HTML words over a transparent canvas.
개발자의 시대는끝

```bash
npm install
npm run dev      # http://localhost:5184
npm run build    # static site in dist/
```

## The beats

| Scroll | Camera | Object | Words |
| --- | --- | --- | --- |
| Hero | Wide three-quarter | Whole, slow sway | The name, one line |
| 01 Origins | Square on, right profile | Dimensioned like a drawing | Why it was built |
| 02 Cartridge | In under the receiver | The magazine drops out | The 7.92 mm Kurz round |
| 03 Action | Close on the receiver | Cut open; the bolt cycles with the scroll | Gas, piston, tilting bolt |
| 04 Manufacture | Along the handguard | One detail fills the frame | Pressed sheet steel |
| 05 Controls | Round to the left side | The visitor works safety, selector, sights, bolt | The controls |
| 06 Field strip | Back and up | Comes apart in the real order | The six moves |
| 07 Data | Slow swing past the side | Every part labelled | The numbers |
| 08 Legacy | Back to the start | Whole again | What came after |
| Outro | Same shot, centred | A slider strips it | Credits |

## Where things are

- `src/three/cues.js` — the beat sheet: one complete shot per scroll stop, and `blend()`
- `src/three/parts.js` — how each part moves, where every callout and dimension line is pinned
- `src/three/stage.js` — renderer, lighting, the cutaway, callout projection, the render loop
- `src/content.js` — every word on the page
- `scripts/convert-model.mjs` — source GLB to web GLB (see below)

## The model

"STG - 44 | Sturmgewehr" by ELIZION on Sketchfab, CC BY 4.0
(https://sketchfab.com/3d-models/stg-44-sturmgewehr-fa37bef729e141a6a29bb022a3e0be41).
The 128 MB download is not in this folder; the 4.7 MB web copy in
`public/models/stg44.glb` is. To rebuild it:

```bash
node scripts/convert-model.mjs path/to/stg_-_44__sturmgewehr.glb
npx gltf-transform optimize scripts/.tmp/stg44.raw.glb public/models/stg44.glb --compress meshopt --texture-compress webp --texture-size 2048 --join false --flatten false --simplify false --instance false --palette false
```

The converter stands the rifle upright on its measured bore axis, scales it to
940 mm, and splits the 13 source meshes into 23 named moving parts.

## Keys

`C` hides the interface for filming. `A` plays the whole page on rails.
`/debug.html?az=0&el=5&dist=1.6&only=receiver,bolt` (dev server only) looks at the model part by part.

## GitHub Pages

Live site: https://mclusky0626.github.io/stg443d/

Pushes to `main` build and deploy automatically with GitHub Actions.
The workflow sets Vite's base path from the Pages configuration so models,
images and bundled assets work under the repository subdirectory.
Local development continues to use `http://localhost:5184/`.

## Languages

Use the top-right **한국어 / EN** buttons to switch languages. The site translates
chapters, specifications, 3D callouts and control feedback while keeping the
current model and control state. It remembers the selected language locally;
first-time visitors use their browser language. A `?lang=ko` or `?lang=en` URL
opens that language directly, including on GitHub Pages.

Korean: https://mclusky0626.github.io/stg443d/?lang=ko
