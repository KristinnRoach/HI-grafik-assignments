# V2 Game of Life: handoff

The goal is to turn this 2024 course assignment (3D Game of Life, WebGL2) into a portfolio piece. The plan is quick wins: make it look better, then add game mechanics.

## State

- Branch `gol-portfolio`, cut from `main`. All work so far is committed.
- `GOL-wip` is an older experiment branch. **Don't merge it.** It predates the shared styling on main, its texture code is half-wired, and it adds about 17 MB of PNGs. The useful parts (UVs, GL helpers) are already ported here.

## Run

Serve the repo root over HTTP, since ES modules don't load from `file://`:

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123/src/V2/index.html. Controls: `space` pauses and `r` restarts. To move the camera, drag the mouse, use the wheel to zoom, or press WASD; double-click resets it. Hidden extra: a click (without dragging) on a live cell clears a 3×3×3 block around it; a click on empty space stamps the selected pattern near the grid centre (the random pattern stamps a 3×3×3 block at `seedDensity`), clipped to `seedRadius` cells from the click. Patterns are offset lists in `patterns` (`game-logic.js`), shared by `initGrid` and clicks. The left/right arrow keys cycle focus through the input fields.

## Files

| File | Role |
|---|---|
| `index.html` | Markup, styles and both GLSL shaders (inline `<script>` tags) |
| `main.js` | Init and the frame loop (sim steps at `game.fps`, rendering every frame) |
| `renderer.js` | `effects` toggles, `lighting` defaults, per-frame instance data, uniforms |
| `ui.js` | HTML controls, reset/restart |
| `gl-utils.js` | WebGL setup, buffer helpers; `glLoc` lists every attribute/uniform and `getAllGlLocations()` fills it |
| `geometry.js` | Cube and sphere meshes (positions, normals, UVs, indices) |
| `game-logic.js` | `patterns` table, update rule, `endReason()`, click picking (`poke`) |
| `game-state.js` | `game` state object (incl. per-shape `cellScaleCube`/`cellScaleSphere`), countdown and game-over UI |
| `event-handlers.js` | Keyboard and mouse input |
| `camera.js` | Orbit camera |
| `dev-tuning.js` | Collapsible "tune" panel (top right): effect toggles, colour pickers and sliders for `lighting`, grouped |

## Rendering

- One instanced draw call per frame. Each cell sends a `vec4 aInstance`: xyz is its offset, w is the fraction of its 26 neighbours that are alive. It also sends `float aState` (1 born, -1 dying, 0 stable), compared against `game.nextGrid`, which holds the previous generation after `updateGrid`'s swap. `render()` rebuilds both in JS every frame.
- `effects` toggles four looks: `tween` (cells grow/shrink between generations), `densityColor` (crowded cells shift toward `hotColor`), `fog` (fades to transparent, so it works in either theme) and `jitter` (per-cell size/brightness/color from a position hash in the vertex shader, with no extra buffers).
- Lighting is calculated relative to the camera: Blinn-Phong with a sky/ground two-colour ambient, softened diffuse, and gamma correction (`cellColor` is sRGB; sky and ground colours are linear).
- Ambient occlusion uses the neighbour fraction. Crowded cells get less ambient light, and less direct light scaled by `occlusionDirect`.
- Back-face culling is on. Both meshes are wound counter-clockwise from outside. If you change the geometry, re-check the winding.
- Specular is effectively invisible on cubes (flat faces); it shows on spheres.

## Lighting tuning

- All look parameters are in `lighting` in `renderer.js`. The shader reads them as uniforms every frame.
- `dev-tuning.js` adds a collapsed panel; the "Export lighting" group's readout is in JS object syntax, so you can paste it straight over `lighting` to save new defaults.
- The current defaults put the light slightly below the cells (`lightDirection.y = -0.5`) and use strong wrap (`diffuseWrap = 0.95`). That was chosen during tuning, not a bug.
- The panel ships for now (collapsed by default). Drop its script tag in `index.html` to remove it.

## Game over

- `endReason()` in `game-logic.js` is the one place that decides when a run ends: died out, more than `overpopGrace` generations above `maxPopulation`, or the grid repeating one of the last `stableWindow` grids. Tunables live in `game` (`game-state.js`).
- Score = `game.generation`; best is kept in `localStorage` (`gol-best`).
- `node src/V2/check-game-over.mjs` runs every pattern headlessly and asserts each end condition.

## Known issues

- UVs are uploaded but nothing samples a texture yet.
- The JS loops over every cell every frame. Fine at 33³; at much larger grids (GOL-wip tried 75³) it will stutter.

## Next steps

1. **Gameplay loop:** game over when the colony dies out, overpopulates past recovery, or stabilises. Score = generations survived, best score kept in `localStorage`.
2. **Player intervention:** click to seed/clear exists as a hidden extra (no cost, not in the hint). An energy budget was tried and removed: it added little. Revisit if clicking becomes a core mechanic.
3. **Look:** tint cells by age, maybe a small procedural texture using the existing UVs. Don't use the big GOL-wip PNGs.
4. **Cleanup for deploy:** remove the dev panel and stray `console.log`s, and check the page under a subpath (GitHub Pages).
