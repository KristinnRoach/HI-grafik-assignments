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

Then open http://localhost:8123/src/V2/index.html. Controls: `space` pauses and `r` restarts. To move the camera, drag the mouse, use the wheel to zoom, or press WASD; double-click resets it. The left/right arrow keys cycle focus through the input fields.

## Files

| File | Role |
|---|---|
| `index.html` | Markup, styles and both GLSL shaders (inline `<script>` tags) |
| `main.js` | Init, render loop, the `lighting` defaults, per-frame instance data |
| `gl-utils.js` | WebGL setup, buffer helpers; `glLoc` lists every attribute/uniform and `getAllGlLocations()` fills it |
| `geometry.js` | Cube and sphere meshes (positions, normals, UVs, indices) |
| `game-logic.js` | Grid init patterns and the update rule |
| `game-state.js` | `game` state object, reset/restart, countdown and game-over UI |
| `event-handlers.js` | Keyboard and mouse input |
| `camera.js` | Orbit camera |
| `dev-tuning.js` | **Dev only.** Slider panel for the `lighting` object |

## Rendering

- One instanced draw call per frame. Each cell sends a `vec4 aInstance`: xyz is its offset, w is the fraction of its 26 neighbours that are alive. `render()` rebuilds this in JS every frame.
- Lighting is calculated relative to the camera: Blinn-Phong with a sky/ground two-colour ambient, softened diffuse, and gamma correction (`cellColor` is sRGB; sky and ground colours are linear).
- Ambient occlusion uses the neighbour fraction. Crowded cells get less ambient light, and less direct light scaled by `occlusionDirect`.
- Back-face culling is on. Both meshes are wound counter-clockwise from outside. If you change the geometry, re-check the winding.
- Specular is effectively invisible on cubes (flat faces); it shows on spheres.

## Lighting tuning

- All look parameters are in `lighting` in `main.js`. The shader reads them as uniforms every frame.
- `dev-tuning.js` adds a slider panel. Its readout is in JS object syntax, so you can paste it straight over `lighting` to save new defaults.
- The current defaults put the light slightly below the cells (`lightDirection.y = -0.5`) and use strong wrap (`diffuseWrap = 0.95`). That was chosen during tuning, not a bug.
- **Before deploy:** delete the `dev-tuning.js` script tag in `index.html` and the file itself.

## Known issues

- `game-logic.js` logs `out of bounds cells` on every generation.
- Most game-over logic (overpopulation/stabilised) is commented out. See `for later.txt` and the comments in `game-logic.js` / `game-state.js`.
- UVs are uploaded but nothing samples a texture yet.
- The JS loops over every cell every frame. Fine at 33³; at much larger grids (GOL-wip tried 75³) it will stutter.

## Next steps

1. **Gameplay loop:** game over when the colony dies out, overpopulates past recovery, or stabilises. Score = generations survived, best score kept in `localStorage`.
2. **Player intervention:** click to seed or kill cells, limited by an energy budget that refills slowly.
3. **Look:** tint cells by age, add fog/depth fade, maybe a small procedural texture using the existing UVs. Don't use the big GOL-wip PNGs.
4. **Cleanup for deploy:** remove the dev panel and stray `console.log`s, and check the page under a subpath (GitHub Pages).
