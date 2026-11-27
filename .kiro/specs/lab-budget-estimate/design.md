# Design: Lab budget estimate

## Overview

Add a `cost: [min, max]` field to every lab option, compute a per-part breakdown and total inside `currentBuild()`, and render it in three places: the option buttons, the result panel and `planText()`. `planText()` already feeds copy, share and download, so one change covers all three outputs. No new files, libraries or network access.

## Data model

Add `cost` as a two-element array of whole USD, `[min, max]`, to each entry in `BASES`, `TWISTS`, `PROPS` and `PALETTES`. The array form matches the existing compact one-line entries.

| Group | Meaning of the figure |
| --- | --- |
| `BASES` | Core garments and accessories for the character. |
| `TWISTS` | Extras the twist adds on top (`none` is `[0, 0]`). |
| `PROPS` | The prop itself. |
| `PALETTES` | Paint, dye, trim or small items to carry the colour story. |

Values:

| Id | Cost (USD) | Existing `budget` |
| --- | --- | --- |
| `BASES.ghost` | 5–15 | 0 |
| `BASES.blackcat` | 10–25 | 0 |
| `BASES.scarecrow` | 15–35 | 0 |
| `BASES.skeleton` | 20–45 | 1 |
| `BASES.witch` | 25–55 | 1 |
| `BASES.vampire` | 30–65 | 1 |
| `BASES.scientist` | 30–60 | 1 |
| `BASES.pirate` | 55–110 | 2 |
| `TWISTS.none` | 0–0 | 0 |
| `TWISTS.zombie` | 5–15 | 0 |
| `TWISTS.disco` | 8–20 | 0 |
| `TWISTS.glow` | 8–20 | 0 |
| `TWISTS.royal` | 15–40 | 1 |
| `TWISTS.steampunk` | 15–40 | 1 |
| `PROPS.map` | 1–5 | n/a |
| `PROPS.flask` | 5–12 | n/a |
| `PROPS.plushbat` | 5–12 | n/a |
| `PROPS.spellbook` | 5–15 | n/a |
| `PROPS.lantern` | 5–15 | n/a |
| `PROPS.candelabra` | 10–25 | n/a |
| `PALETTES.midnight`, `pumpkin`, `bone`, `candycorn` | 3–10 | n/a |
| `PALETTES.toxic`, `teal` | 5–12 | n/a |

Check against requirement 1.4: the highest `budget: 0` base maximum is 35, and the lowest `budget: 2` base minimum is 55. The highest `budget: 0` twist maximum is 20, and the lowest `budget: 1` twist minimum is 15, which is allowed because the rule compares Low against Splurge only (no twist has `budget: 2`).

## Components and changes

All changes are in `index.html`.

### Helpers (near `fmtTime`)

```js
function fmtMoney(n) { return "$" + n; }
function fmtRange(r) {
  return r[0] === r[1] ? fmtMoney(r[0]) : fmtMoney(r[0]) + "–" + fmtMoney(r[1]);
}
```

`fmtRange` returns `$5` when min equals max, `$0` for the classic twist, and `$30–$60` otherwise (en dash, as the page already uses typographic dashes).

### Option buttons (`renderLabControls`)

Append `<small class="opt-cost">` + `fmtRange(item.cost)` + `</small>` inside the button, after the label span. Because it is inside the button, it is part of the accessible name, for example "Vampire $30–$65". The `aria-pressed` and click behaviour are unchanged.

CSS: `.opt-cost { font-size: 0.82rem; font-weight: 500; color: var(--muted); }` and `.opt[aria-pressed="true"] .opt-cost { color: inherit; }`. `.opt` is already `inline-flex` with `gap: 8px`, so the label, swatches and cost align without further changes.

### `currentBuild()`

Add a `costs` array and a `total`:

```js
var parts = [
  { part: "Character", label: base.label,  cost: base.cost },
  { part: "Twist",     label: twist.label, cost: twist.cost },
  { part: "Prop",      label: prop.label,  cost: prop.cost },
  { part: "Palette",   label: pal.label,   cost: pal.cost }
];
var total = parts.reduce(function (t, p) { return [t[0] + p.cost[0], t[1] + p.cost[1]]; }, [0, 0]);
```

Return `costs: parts, costTotal: total` alongside the existing fields. Existing returned fields are not changed. To avoid a second source of truth, the labels come from the same objects used for the name.

### Result panel

New markup in the result `article`, between the palette note and "What you'll need":

```html
<h4>Estimated budget</h4>
<ul class="budget" id="res-budget"></ul>
<p class="budget-note">Rough DIY estimates in US dollars. Prices vary by shop and what you already own.</p>
```

`renderResult()` fills `#res-budget` with one `<li>` per part:
`<li><span>Character: Vampire</span><span>$30–$65</span></li>`, then a total `<li class="budget-total"><span>Total estimate</span><span>$..–$..</span></li>`.

CSS (existing tokens only):

```css
.budget { list-style: none; margin: 0; padding: 0; }
.budget li { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px dashed var(--line); break-inside: avoid; }
.budget .budget-total { font-weight: 700; border-bottom: 0; border-top: 1px solid var(--line); }
.budget-note { margin: 8px 0 0; font-size: 0.85rem; color: var(--muted); }
```

Print: the section is not in the hide list, so it prints. `break-inside: avoid` on rows keeps lines whole, and the result already has `break-inside: avoid`. The `@media print` block needs no change, but the text colour is forced to black there and `var(--muted)` is acceptable on white.

Live region: `#result` is `aria-live="polite"`, so budget changes are announced with the rest. No extra live region.

### `planText()`

Insert, after the "Build time" line and its blank line, before "What I need:":

```
Estimated budget (USD, rough DIY estimate):
- Character (Vampire): $30–$65
- Twist (Royal): $15–$40
- Prop (Flickering lantern): $5–$15
- Palette (Midnight & Crimson): $3–$10
Total estimate: $53–$130
<blank>
```

Existing lines keep their order and text. Copy, share and download call `planText()`, so no other handler changes. The text file is already created as `text/plain;charset=utf-8`, so the en dash is safe.

## Error handling and edge cases

- Every option has a valid `cost` array, so there is no runtime fallback. A missing `cost` would throw in `reduce`, which makes a data mistake obvious during testing.
- `$0` options: shown as `$0`. Total is never below the sum, and `min <= max` holds for the total because it holds for each part.
- Escaping: labels and figures come from hard-coded tables, same trust model as the existing `innerHTML` usage.

## Testing

There is no automated suite in the repo. Verification is:

1. A Node script (not committed) that extracts the lab tables from `index.html` and asserts requirement 1 (every entry has valid `cost`, `none` is `[0,0]`, budget-level consistency) and exercises `fmtRange` and the total for all 1,728 combinations (total equals the sum of the parts, min <= max).
2. A headless browser check (if one is available in the sandbox) that loads the page, clicks options and Summon, reads `#res-budget`, runs `planText()` and checks the "Estimated budget" block and that copy, download and print CSS still work.
3. Manual checklist for the user: keyboard use, dark mode, print preview.

## Out of scope

Live prices, currencies other than USD, user-editable costs, adding costs to the gallery costumes, and changing the existing `budget` label logic.
