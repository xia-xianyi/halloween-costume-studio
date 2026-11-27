# Implementation plan: Costume finder

- [x] 1. Capture the regression baseline
  - Generate `tests/fixtures/lab-baseline.json` from `main` (2e9c8c4) before any code change; add `tests/lab-regression.test.js`.
  - _Requirements: 6.1_

- [x] 2. Refactor the composer
  - `buildFor(state)`, `currentBuild()` wrapper, `adjustCost(range, mode)`, `creationNumber(state)` from table lengths, `ALL_COMBOS`, `TOTAL_COMBOS`, `fmtInt`; "of 1,728" strings from `fmtInt(TOTAL_COMBOS)`.
  - _Requirements: 2.4, 6.1, 6.2_

- [x] 3. Finder logic
  - `FIT_SPOOK`, `fitLimits`, `limitsSet`, `fits`, `fittingCombos`.
  - _Requirements: 2.2, 2.4_

- [x] 4. Finder UI
  - Static form markup, CSS, print hide, `renderFinder()`, select listeners, Summon label/disabled/draw, rescue buttons, shared `refreshLab()`.
  - _Requirements: 1.1–1.3, 2.1–2.3, 3.1–3.4, 4.1–4.3_

- [x] 5. Computed Halloween date and Halloween-day shortcut
  - `nextHalloween`, `isHalloween`, `fmtHalloween`, `#footer-date`, `#tonight`.
  - _Requirements: 5.1–5.3_

- [x] 6. Tests and verify
  - `tests/finder.test.js`; full suite and syntax check; Playwright screenshot of the finder with Thrift / $25 / 30 min.
  - _Requirements: all_

## Verification (27 Nov 2026)

- `node --test tests/*.test.js`: 35 pass, 0 fail. `lab-regression` confirms all 1,728 × 3 match the `main` baseline after the `buildFor` refactor. `finder.test.js` checks 432 limit combinations against an independent brute force.
- Playwright (Chromium, `file://`):
  - $25 in Buy new shows "Nothing fits in Buy new mode…" with a single "Switch to Thrift: 54 fit" button, and Summon is disabled.
  - After switching, "54 of 1,728 creations fit in Thrift mode." appears and focus moves to Summon.
  - Summoned creations fit the limits.
  - Screenshots: `docs/screenshots/lab-deadend-dark.png`, `lab-finder-light.png`.
- Only one selectable limit set fails in every mode ($25 + 15 min + Terrifying). The "loosen a limit" text is reachable and tested.
