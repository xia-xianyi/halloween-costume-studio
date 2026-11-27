# Design: Costume finder

## Overview

Refactor the lab composer into a pure function of a state object, enumerate all creations once, and filter them. Everything else (count line, Summon, rescue buttons, Halloween-day shortcut) reads that filter. All code is in `index.html`.

## Composer refactor (no behaviour change)

- `buildFor(state)` contains the old body of `currentBuild()`, reading `state.base/twist/prop/palette/mode` instead of `labState`. `currentBuild()` becomes `return buildFor(labState);`.
- `adjustCost(range, mode)` takes an optional `BUDGET_MODES` entry and falls back to `currentMode()`. Old callers keep working.
- `creationNumber(state)` computes the mixed-radix index from the table lengths (`Object.keys(...).length`) rather than literal `6`s. For today's tables this is the same formula, so the numbers are unchanged. The regression test checks all 1,728.
- `ALL_COMBOS` is built once in creation-number order, so `ALL_COMBOS[n - 1]` is creation `n`. `TOTAL_COMBOS = ALL_COMBOS.length`.
- `fmtInt(n)` formats with thousands commas. The "of 1,728" strings in the result meta and `planText()` use `fmtInt(TOTAL_COMBOS)`, so the output text is identical but no longer typed by hand.

## Finder data and logic

```js
var FIT_SPOOK = { gentle: { label: "Gentle", range: [1, 2] }, eerie: { label: "Eerie", range: [3, 3] }, terrifying: { label: "Terrifying", range: [4, 5] } };
var fitLimits = { budget: null, time: null, spook: "" };   // null / "" = no limit

function limitsSet(l)          // any limit present
function fits(build, l)        // build.costTotal[1] <= l.budget, build.time <= l.time, spook in band
function fittingCombos(modeKey, l)  // ALL_COMBOS filtered via buildFor({...combo, mode: modeKey})
```

`fits` uses the **top end** of the adjusted total. It is conservative, so a user who sets $25 never sees a plan that could cost $26. Defaults: `modeKey = labState.mode`, `l = fitLimits`.

Cost: 1,728 `buildFor` calls take a few milliseconds. The rescue check runs up to two more modes, and only when the count is 0.

## UI

Static markup in the lab's left column (outside `#lab-controls`, which is cleared and rebuilt on every press):

```html
<div class="lab-left">
  <form class="finder" id="finder" aria-labelledby="finder-title">
    <h3 id="finder-title">Find one that fits <small>— your budget, your clock, your nerve</small></h3>
    <div class="finder-fields">
      <label class="sort-label" for="fit-budget">Spend at most <select id="fit-budget">…</select></label>
      <label class="sort-label" for="fit-time">Ready in <select id="fit-time">…</select></label>
      <label class="sort-label" for="fit-spook">Fright <select id="fit-spook">…</select></label>
    </div>
    <p class="fit-count" id="fit-count" role="status"></p>
    <div class="fit-fix" id="fit-fix"></div>
  </form>
  <div id="lab-controls"></div>
</div>
```

- `renderFinder()` writes `#fit-count` and rebuilds `#fit-fix`. It also sets the Summon label and `disabled` state.
- Rescue: for each other mode in `BUDGET_MODES` order with at least 1 fit, render `<button class="btn btn-ghost btn-small" data-mode="…">Switch to <label>: <n> fit</button>`. Time and fright don't depend on mode, so a time-only dead end shows no buttons and the "loosen a limit" text instead.
- `change` on any select updates `fitLimits` and calls `renderFinder()`. `submit` on the form calls `preventDefault()`.
- Every lab change (option, mode, Summon, Remix, rescue) calls `renderFinder()` through a shared `refreshLab()` helper.

CSS: `.finder` is a surface card (`--surface`, `--line`, 16px radius) with `.finder-fields` as a wrapping flex row. `.fit-count` is bold `--ink`. Zero fits uses `--accent-strong`. `.finder` joins the print hide list.

## Countdown

```js
function nextHalloween(now)   // Date at local midnight 31 Oct of this year, or next year once Nov 1 has started
function isHalloween(now)     // month 9, day 31
function fmtHalloween(d)      // "Sunday 31 October 2027"
```

The countdown IIFE uses these. On Halloween, `#count-num` shows "Tonight", the label says it is Halloween tonight, the ticker is cleared, and `#tonight` (a static `<button hidden>` in `.hero-actions`) is shown. `#footer-date` gets the computed date. `#tonight` sets the selects to 25 and 30, sets `fitLimits`, selects Thrift, calls `refreshLab()` and scrolls to `#lab` (smooth unless reduced motion).

## Testing

- `tests/finder.test.js`:
  - fit counts against an independent brute force over a grid of limits in all three modes, with anchors Thrift $25/30 min = 54, Buy new $25 = 0, Buy new $60/30 min = 160;
  - every combo returned by `fittingCombos()` fits;
  - Summon draws only fitting combos (with `Math.random` stubbed);
  - the rescue buttons;
  - `nextHalloween` across year boundaries.
- `tests/lab-regression.test.js`: all 1,728 × 3 against the baseline fixture.
- `tests/lab-properties.test.js`: seeded property tests, including "loosening a limit never lowers the count".
