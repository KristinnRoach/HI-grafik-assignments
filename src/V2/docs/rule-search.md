# Default rules per pattern

Each pattern in `patterns` (`game-logic.js`) has a `rules` field. Picking a pattern loads its rules into the Birth/Survival boxes and restarts. The goal: the game shouldn't end in under ~20 generations with the default rules, and it should stay sparse rather than turn into noise.

All numbers below come from headless runs on the 18³ grid with the default end conditions (`maxPopulation` = 1/5 of cells, `overpopGrace` 10, `stableWindow` 4). "Density" is population as a fraction of `maxPopulation`, the same number the HUD shows.

## Current defaults: lowest density that lasts 25 generations

The search tried every combination with 2 birth values from 1–8 and 3 distinct survival values from 0–9 (3,360 combinations per pattern). A rule set passed if the run lasted 25 generations without ending and still had at least 3% density at the end. Each pattern's rule set is the passing one with the lowest average density over the 25 generations. For `random`, both of two runs had to pass, and the higher average counts.

The first candidate in each row is the current default. Notation: `B57/S246` = birth 5, 7, survival 2, 4, 6.

| Pattern | Rule sets that passed | Candidates, lowest average density first |
|---|---|---|
| random | 997 | **B57/S246** 10% · B56/S023 10% · B57/S056 10% · B58/S257 11% |
| cross | 1172 | **B48/S789** 7% · B57/S348 9% · B58/S235 13% · B58/S348 14% |
| line | 1045 | **B17/S018** 43% · B17/S013 44% · B17/S019 45% · B17/S137 45% |
| dotted-line | 1010 | **B15/S012** 23% · B15/S014 23% · B15/S016 23% · B15/S019 23% |
| block | 1498 | **B56/S267** 5% · B48/S249 6% · B56/S046 6% · B56/S146 6% |
| glider | 1510 | **B48/S168** 2% · B48/S056 3% · B56/S257 3% · B48/S023 4% |
| spaceship | 1386 | **B56/S138** 2% · B56/S248 3% · B48/S278 3% · B56/S258 3% |
| pulsar | 1560 | **B48/S268** 5% · B36/S367 10% · B36/S467 10% · B37/S478 14% |

Caveats:

- Nothing was checked past generation 25. Glider and spaceship at 2% only had to clear the 3% floor and may die out soon after.
- Low density was the only stand-in for "not noise". Nobody checked whether the shapes actually hold.

## Findings

- **Birth 1 turns everything into noise.** In the long-run search below, almost every sparse pattern ended up with birth 1. Those runs filled the grid with chaotic cells sitting near the population limit. Leaving birth 1 out (birth ≥ 3–5) is what keeps the sparse patterns sparse.
- **Line and dotted-line need birth 1.** Cells next to a line have at most 3 live neighbours (2 for the dotted line). No rule set with a lowest birth value of 2 or more passed for these two. They will always run denser than the rest.
- **Long runs end up at the limit.** In the first pass, every rule set that survived 100–300 generations had its population hovering around 100% of the limit. Line sat around 180% and flickered just under the limit often enough that `overLimitFor` never reached the grace count. This exposes a loophole in the overpopulation check.
- **Most rule sets survive 25 generations.** About 1,000–1,500 of the 3,360 combinations pass for each pattern, so picking for density on top of survival costs nothing.

## Earlier candidates: long survival, ignoring density

These come from a random-sampling search (15 s per pattern, about 300–450 rule sets each, a cap of 150 generations). It scored on surviving the full 150, minus how far the population was from 50% of the limit over the last 50 generations. The column shows that distance: 0.17 ≈ 33% or 67%. All of these lasted 150 generations. They were checked into git as `0cb9e77`.

| Pattern | Rules | Distance from 50% |
|---|---|---|
| random | B58/S358 | 0.17 |
| cross | B58/S258 | 0.17 |
| line | B18/S249 | 0.35 |
| dotted-line | B18/S379 | 0.33 |
| block | B18/S057 | 0.34 |
| glider | B18/S089 | 0.30 |
| spaceship | B18/S089 | 0.29 |
| pulsar | B17/S089 | 0.21 |

Single first-pass hits that lasted 100 generations (scoring on survival only). Over 300 generations, every one survived except dotted-line, which overpopulated at generation 159:

random B28/S679 · cross B16/S015 · line B12/S346 · dotted-line B12/S057 · block B28/S359 · glider B17/S167 · spaceship B38/S012 · pulsar B37/S149

## Re-running

The search scripts weren't kept. To recreate one, write a Node script in the style of `check-game-over.mjs`:

1. Import `game` and `initGrid`/`updateGrid`/`endReason`, and set `game.isPaused = false`.
2. Loop over the rule combinations. For each, set `game.rules`, call `initGrid(pattern)`, and step until `endReason()` returns a reason or the cap is reached.
3. Score the run and sort.

At 25 generations a full sweep takes about 35–85 s per pattern on one core. Run the patterns one after another. Running all of them in parallel at higher caps pins every core.
