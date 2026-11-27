# Design: Lab budget modes

## Overview

Add a `BUDGET_MODES` table and a `mode` key in `labState`. One helper, `adjustCost(range)`, scales a base `[min, max]` range by the selected mode's multiplier and rounds each end to whole USD. Every place that displays a cost (option buttons, result rows, total, plan text) goes through it, so the mode is applied once and consistently. `planText()` already feeds copy, share and download, so one change covers all three outputs. All changes are in `index.html`, plus README and steering notes.

## Data model

New table after `PALETTES`, in the existing compact one-line style:

```js
var BUDGET_MODES = {
  thrift:  { label: "Thrift",  multiplier: 0.5, desc: "second-hand hunting" },
  new:     { label: "Buy new", multiplier: 1,   desc: "buying the parts new" },
  premium: { label: "Premium", multiplier: 1.8, desc: "better fabrics and sturdier props" }
};
```

- Key order defines button order (Thrift, Buy new, Premium).
- `new` is a valid ES5 property name (reserved words are allowed as property names in ES5), and it is only ever read with bracket access (`BUDGET_MODES[labState.mode]`).
- The modes are **not** added to `GROUPS`. `GROUPS` drives the creation number and the four-part composition. Keeping modes out of it guarantees the creation number, the "of 1,728" text and Summon are unaffected.

`labState` gains `mode: "new"`. Summon only reassigns `base`, `twist`, `prop` and `palette`, and Remix only reassigns `base`, so the mode persists across both without code changes there.

## Rounding

```js
function currentMode() { return BUDGET_MODES[labState.mode]; }
function fmtMultiplier(m) { return "×" + m.toFixed(1); }   /* ×0.5, ×1.0, ×1.8 */
function adjustCost(r) {
  var m = currentMode().multiplier;
  return [Math.round(r[0] * m), Math.round(r[1] * m)];
}
```

- `Math.round` rounds halves up. With ×0.5 halves are exact in binary, so `$5` becomes `$3` deterministically. With ×1.8 a product `18x / 10` can never end in `.5` (since `18x` is even), so floating-point noise such as `9.000000000000002` rounds correctly.
- ×1 returns the original integers, so Buy new reproduces today's figures exactly (requirement 6.1).
- Rounding is monotonic, so `min <= max` is kept, and `0` maps to `0`.

### Total: sum of rounded parts

Decision: the total is the sum of the **adjusted** part figures, not `round(raw total × multiplier)`.

| Option | Pros | Cons |
| --- | --- | --- |
| Sum of rounded parts (chosen) | Rows always add up to the total, on screen and in the text. Same rule as the existing feature ("total = sum of parts"). | Can differ by a few dollars from `raw total × multiplier`. |
| Round the raw total | Closest to the exact scaled total. | Rows visibly fail to add up (for example $28 of rows vs a $27 total), which reads as a bug. |

Worked example, Vampire + Royal + Flickering lantern + Midnight & Crimson:

| Part | Base | Thrift ×0.5 | Buy new ×1.0 | Premium ×1.8 |
| --- | --- | --- | --- | --- |
| Character | $30–$65 | $15–$33 | $30–$65 | $54–$117 |
| Twist | $15–$40 | $8–$20 | $15–$40 | $27–$72 |
| Prop | $5–$15 | $3–$8 | $5–$15 | $9–$27 |
| Palette | $3–$10 | $2–$5 | $3–$10 | $5–$18 |
| Total | $53–$130 | $28–$66 | $53–$130 | $95–$234 |

## Components and changes

### `currentBuild()`

Each `costs` item keeps its fields but `cost` becomes `adjustCost(x.cost)`. `costTotal` keeps its existing `reduce` over `costs`, so it is now the sum of adjusted parts. Add `mode: currentMode()` to the returned object. No other returned field changes.

### Option buttons (`renderLabControls`)

- The existing `opt-cost` text becomes `fmtRange(adjustCost(item.cost))`.
- After the four `GROUPS`, render a fifth `opt-group` built the same way: `h3` "Purchase mode <small>— how you'll shop for it</small>", a `role="group"` row with `aria-label="Purchase mode"`, and one `button.opt` per mode with `data-group="mode"`, `data-key`, `aria-pressed`, `<span>label</span><small class="opt-cost">×0.5</small>`.
- Click: set `labState.mode`, `renderLabControls()`, `renderResult()`, then re-focus the pressed button using the same `querySelector` pattern as the other groups.
- To avoid duplicating the button-building code, extract the inner loop into `optGroupHTML`-style helper `renderOptGroup(box, key, title, hint, data, innerFn)` used by both the four parts and the mode group. `innerFn(item)` returns the button's inner HTML.

No new CSS for the buttons: they reuse `.opt-group`, `.opts`, `.opt` and `.opt-cost`.

### Result panel

New paragraph directly below the "Estimated budget" `h4`:

```html
<p class="budget-mode" id="res-budget-mode"></p>
```

`renderResult()` sets it to `<strong>Thrift mode (×0.5)</strong> — second-hand hunting.` The rows and total already read from `b.costs` / `b.costTotal`, which are now adjusted.

CSS (existing tokens only):

```css
.budget-mode { margin: 0 0 6px; font-size: 0.92rem; color: var(--muted); }
.budget-mode strong { color: var(--ink); }
```

It is inside `#result` (`aria-live="polite"`) and not in the print hide list, so it is announced and printed.

### `planText()`

Insert one line after the existing heading:

```
Estimated budget (USD, rough DIY estimate):
Purchase mode: Thrift (×0.5) — second-hand hunting
- Character (Vampire): $15–$33
- Twist (Royal): $8–$20
- Prop (Flickering lantern): $3–$8
- Palette (Midnight & Crimson): $2–$5
Total estimate: $28–$66
```

Existing lines are unchanged. The download Blob is already `text/plain;charset=utf-8`, so `×` and `—` are safe.

### Docs

- README: mention the Thrift / Buy new / Premium modes in the Costume Lab bullet.
- `.kiro/steering/structure.md` and `product.md`: list `BUDGET_MODES` and the selector so future work knows it exists and that it is outside the creation number.

## Error handling and edge cases

- `labState.mode` is only ever set from `BUDGET_MODES` keys, so `currentMode()` always resolves.
- `$0` parts stay `$0`; `fmtRange` prints `$0`.
- Single-amount ranges stay single amounts because both ends are scaled the same way.
- Labels and descriptions are hard-coded, same trust model as the existing `innerHTML` use.

## Testing

No automated suite exists in the repo. Verification (not committed):

1. Syntax check with `.kiro/hooks/check-inline-script.js`.
2. A Node script that runs the page's inline script against a stub DOM and, for all 1,728 combinations × 3 modes, checks: each row equals `round(base × multiplier)`, total equals the sum of rows, whole dollars, `min <= max`, Buy new equals the base figures, and non-cost fields equal the `main` version.
3. Hand-checked sample combinations in each mode (the table above plus a few others), comparing the result panel HTML and `planText()` output.
4. Manual checklist for the user: keyboard use, dark mode, print preview.

## Out of scope

Custom multipliers, per-part modes, saving the mode, currencies other than USD, and changes to the coarse `budget` label.
