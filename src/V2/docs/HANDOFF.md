# V2 Game of Life: handoff

The goal is to turn this 2024 course assignment (3D Game of Life, WebGL2) into a portfolio piece.

## Run

Serve the repo root over HTTP, since ES modules don't load from `file://`:

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123/src/V2/index.html.

## Controls

- Starts paused. `space` / Play plays and pauses, `r` / Restart restarts. Restart and pattern changes keep the play/pause state.
- Camera auto-orbits (`orbit` in `camera.js`). Drag to orbit (with momentum), wheel or pinch to zoom, WASD to nudge, `c` resets. A press only becomes a drag past `TAP_SLOP`, so taps don't stop the orbit.
- Click/tap without dragging: on a live cell clears a 3×3×3 block, on empty space stamps the selected pattern, clipped to `seedRadius` cells from the click. The Manual pattern starts empty for seeding by hand.
- Left/right arrows cycle focus through the controls; up/down steps a focused select. On touch, dragging a number box up/down steps it.
- Patterns are offset lists in `patterns` (`game-logic.js`), shared by `initGrid` and clicks, each with default `rules` loaded into the Birth/Survival boxes when picked. How the rules were found: `docs/rule-search.md`.

## UX hints

- `#how-to-play` is always visible: the goal plus the main keys (touch gets its own text in `ui.js`). Keep it short; don't add every shortcut there (`c` is deliberately left out).
- `#hint` shows one contextual line at a time: the first entry in `hints` (`game-state.js`) whose `when` holds. It shares its slot with the overpopulation countdown. Add new interaction help here rather than new UI; `.controls` is already crowded.

## Files

| File | Role |
|---|---|
| `index.html` | Markup, styles and both GLSL shaders (inline `<script>` tags) |
| `main.js` | Init and the frame loop (sim steps at `game.fps`, rendering every frame) |
| `renderer.js` | `effects` toggles, `lighting` defaults, per-frame instance data, uniforms |
| `ui.js` | HTML controls, reset/restart |
| `gl-utils.js` | WebGL setup, buffer helpers; `glLoc` lists every attribute/uniform and `getAllGlLocations()` fills it |
| `geometry.js` | Cube and sphere meshes (positions, normals, UVs, indices) |
| `game-logic.js` | `patterns` table (offsets + default rules), update rule, `endReason()`, click picking (`poke`) |
| `game-state.js` | `game` state object (incl. per-shape `cellScaleCube`/`cellScaleSphere`), countdown and game-over UI |
| `event-handlers.js` | Keyboard and pointer input (mouse, pen, touch, pinch) |
| `camera.js` | Orbit camera, auto-orbit and drag momentum |
| `dev-tuning.js` | Collapsible "tune" panel (top right): effect toggles, colour pickers and sliders for `lighting`, grouped (incl. separate cube and sphere surface groups) |

## Rendering

- One instanced draw call per frame. Each cell sends a `vec4 aInstance`: xyz is its offset, w is the fraction of its 26 neighbours that are alive. It also sends `float aState` (1 born, -1 dying, 0 stable), compared against `game.nextGrid`, which holds the previous generation after `updateGrid`'s swap. `render()` rebuilds both in JS every frame.
- `effects` toggles four looks: `tween` (cells grow/shrink between generations), `densityColor` (crowded cells shift toward `hotColor`), `fog` (fades to transparent, so it works in either theme) and `jitter` (per-cell size/brightness/color from a position hash in the vertex shader, with no extra buffers).
- Surface detail (undecided whether to keep, nothing found worth keeping yet): `effects.surfaceCube`/`surfaceSphere`, both off by default. All procedural in the fragment shader, no textures: cubes darken toward face edges (UVs), spheres get Voronoi cell walls from 3D Worley noise on the object-space position (no UV seam). Plus a fresnel rim and derivative-based bump mapping (`bumpNormal`, Mikkelsen 2010) that turns edges/walls into grooves. Settings are per shape in `lighting` (`*Cube`/`*Sphere`, `bevelWidth`, `wallWidth`, `cellDensity`). When off, the shader skips the detail computation. At normal play distance `cellDensity` 6 reads as aliased grain, 2 reads as cells.
- Lighting is calculated relative to the camera: Blinn-Phong with a sky/ground two-colour ambient, softened diffuse, and gamma correction (`cellColor` is sRGB; sky and ground colours are linear).
- Ambient occlusion uses the neighbour fraction. Crowded cells get less ambient light, and less direct light scaled by `occlusionDirect`.
- Back-face culling is on. Both meshes are wound counter-clockwise from outside. If you change the geometry, re-check the winding.

## Lighting tuning

- All look parameters are in `lighting` in `renderer.js`. The shader reads them as uniforms every frame.
- `dev-tuning.js` adds a collapsed panel; the "Export lighting" group's readout is in JS object syntax, so you can paste it straight over `lighting` to save new defaults.
- The current defaults put the light slightly below the cells (`lightDirection.y = -0.5`) and use strong wrap (`diffuseWrap = 0.95`). That was chosen during tuning, not a bug.
- The panel ships for now (collapsed by default). Drop its script tag in `index.html` to remove it.

## Game over

- `endReason()` in `game-logic.js` is the one place that decides when a run ends: died out, `overpopGrace` consecutive generations above `maxPopulation`, or the grid repeating one of the last `stableWindow` grids. Tunables live in `game` (`game-state.js`).
- Score = `game.generation`; best is kept in `localStorage` (`gol-best`), along with speed, shape and pattern (`gol-fps`, `gol-shape`, `gol-pattern`) via `load`/`save` in `game-state.js`. A saved pattern's default rules are loaded on startup by `applyPattern` in `ui.js`.
- `node src/V2/check-game-over.mjs` runs every pattern headlessly (with `game.rules`, not each pattern's own rules) and asserts the end conditions and click behaviour.

## Known issues

- The JS loops over every cell every frame.
- The overpopulation check only counts consecutive generations, so a population that swings above and below the limit never ends the run (see `rule-search.md`).

## Next steps

1. **Player intervention:** click to seed/clear has no cost. An energy budget was tried and removed: it added little. Revisit if clicking becomes a core mechanic.
2. **Look:** tint cells by age.
