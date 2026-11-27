---
inclusion: always
---

# Structure, data model and conventions

## Data model

All content lives in plain JS objects near the top of the `<script>`. Gallery and lab are separate tables joined by the costume id.

### `COSTUMES` (array, order = "as hung on the rail")

Each entry:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Must equal a key in `BASES` (for example `vampire`, `witch`, `ghost`, `skeleton`, `scientist`, `scarecrow`, `pirate`, `blackcat`). The "Remix in the lab" button relies on this. |
| `name`, `tagline` | string | Display text. |
| `img` | string | Base64 data URI (JPEG). |
| `alt` | string | Descriptive illustration alt text, written for every costume. |
| `tags` | string[] | Subset of `classic`, `scary`, `funny`, `cute`, `last-minute`. Must match `FILTERS` ids. |
| `difficulty` | string | One of `Dead easy`, `Easy`, `Moderate`, `Involved`. Must be a key in `DIFF_RANK`, or the "easiest first" sort breaks. |
| `time` | string | Like `"~40 min"`. `timeMins()` parses the first integer for the "quickest first" sort, so keep a leading number in minutes. |
| `budget` | string | `Low`, `Moderate` or `Splurge`. Rendered as "<budget> budget". |
| `spook` | number | 1 to 5. Indexes `SPOOK_LABELS`. |
| `materials`, `steps` | string[] | Shown as a bulleted list and a numbered method. |

### Lab tables (objects keyed by id; key order defines button order and creation numbers)

- `BASES` (8 keys, same ids as `COSTUMES`): `label`, `cost`, `spook`, `time` (minutes, number), `budget` (0 to 2), `desc`, `materials`.
- `TWISTS` (6): `none` ("Keep it classic", empty name, zero modifiers, `cost: [0, 0]`), `royal`, `zombie`, `steampunk`, `disco`, `glow`. Fields: `label`, `cost`, `name` (prefix used in the generated name), `spook` (can be negative), `time`, `budget`, `desc`, `materials`.
- `PROPS` (6): `lantern`, `candelabra`, `flask`, `spellbook`, `map`, `plushbat`. Fields: `label`, `cost`, `phrase` (used in "...carrying <phrase>."), `spook`, `desc`, `materials`.
- `PALETTES` (6): `midnight`, `pumpkin`, `bone`, `toxic`, `teal`, `candycorn`. Fields: `label`, `cost`, `colors` (3 hex values), `note`.
- `SPOOK_LABELS` (index 0 empty, 1 to 5) and `BUDGET_LABELS` (index 0 to 2).
- `BUDGET_MODES` (3): `thrift` (0.5), `new` (1), `premium` (1.8). Fields: `label`, `multiplier`, `desc`. Selected via `labState.mode` (default `new`). It is not in `GROUPS`, so it does not affect the creation number, and Summon and Remix leave it alone.

### The `cost` field

Every entry in `BASES`, `TWISTS`, `PROPS` and `PALETTES` has `cost: [min, max]`: a rough DIY estimate in whole US dollars, with `0 <= min <= max`. It is the "Buy new" price. Never store mode-adjusted numbers in the tables.

- `BASES`: core garments and accessories. `TWISTS`: extras the twist adds (`none` is `[0, 0]`). `PROPS`: the prop itself. `PALETTES`: paint, dye or trim for the colour story.
- Keep it consistent with the coarse `budget` level: a `budget: 0` item must not cost more at its max than a `budget: 2` item at its min in the same group.
- A new lab option without `cost` breaks `adjustCost()` and the tests.

### Budget data flow

All costs pass through one path, so the buttons, result panel and plan text always agree:

1. `adjustCost(range)` multiplies both ends by `currentMode().multiplier` and rounds each with `Math.round` (whole USD, halves up). With `new` (×1) the stored figures come through unchanged.
2. `renderLabControls()` shows `fmtRange(adjustCost(item.cost))` in each part button's `.opt-cost`. The Purchase mode group, built by the same `renderOptGroup()` helper, shows `fmtMultiplier()` (×0.5, ×1.0, ×1.8).
3. `currentBuild()` returns `costs` (four `{ part, label, cost }` items, cost already adjusted, in the order Character, Twist, Prop, Palette), `costTotal` (the sum of the adjusted mins and the sum of the adjusted maxes, so the rows always add up to the total) and `mode` (the selected `BUDGET_MODES` entry).
4. `renderResult()` writes the mode line to `#res-budget-mode` and the rows and the `.budget-total` row to `#res-budget`.
5. `planText()` writes the `Estimated budget (USD, rough DIY estimate):` heading, then `Purchase mode: <label> (<×m>) — <desc>`, then one `- <Part> (<label>): <range>` line per part and `Total estimate: <range>`, all before `What I need:`. Copy, Share and Download all call `planText()`.
6. `fmtRange()` prints `$a–$b` (en dash), or a single `$a` when min equals max (including `$0`).

`tests/lab-budget.test.js` relies on these plan-text line formats. If you change them, update the test too.

### Composition rules (`currentBuild()`)

- Name: `twist.name + " " + base.label` (no prefix for `none`).
- Spook: `clamp(base + twist + prop, 1, 5)`. Time: `max(5, base.time + twist.time)`. Budget index: `clamp(base + twist, 0, 2)`.
- Materials: base, then twist, then prop lists, de-duplicated by lower-cased text.
- Creation number: mixed-radix index `(((base * 6 + twist) * 6 + prop) * 6 + palette) + 1` using `Object.keys` order. The `6` multipliers and the "1,728" text assume 6 twists, 6 props and 6 palettes. Adding or removing options means updating the multipliers, the "of 1,728" strings (result meta and `planText()`), the hero stat, the meta description and the "26 parts" Kiro text. Reordering keys renumbers every creation.
- Adding a costume: add the `COSTUMES` entry, the matching `BASES` entry with the same id, and update the "Eight/8" copy. Adding a twist, prop or palette is one new object, plus the number updates above.
- Keep `COSTUMES` and `BASES` text consistent. They are separate copies today (the lab materials are shorter versions of the gallery ones).

## Naming conventions

- JS: `UPPER_SNAKE` for constant tables (`COSTUMES`, `BASES`, `FILTERS`), `camelCase` for functions and state, `renderX` for DOM rebuilds, `xHTML` for functions returning markup strings.
- Data ids are short lowercase words without separators, except the tag `last-minute`.
- HTML ids are kebab-case and are referenced via `el("...")`. Prefixes group them: `d-` for the detail dialog, `res-` for the lab result, `count-` for the countdown.
- CSS classes are lowercase kebab-case, grouped by section comments.
- Section markers use `/* ---------- Name ---------- */` in CSS and `/* ---------------- Name ---------------- */` in JS.

## Accessibility requirements already in the code

Keep these when changing the page:

- `lang="en"`, a `viewport` meta tag, and `color-scheme: light dark`.
- Skip link ("Skip to the costumes") that becomes visible on `:focus-visible`.
- Landmarks and headings: `<main>`, `<footer>`, `<section>` blocks with `h2`, cards with `h3`.
- Native controls everywhere: cards, chips and lab options are `<button type="button">`. Toggle state is exposed with `aria-pressed`. Groups use `role="group"` with `aria-label`.
- Visible focus style: `:focus-visible` with a dashed accent outline. Minimum control height of 2rem globally, and buttons, chips, options and the sort select are 42 to 48px tall. The dialog close button is 44px.
- Live regions: `role="status"` on the rail count, copy status and dialog position. `aria-live="polite"` on the lab result.
- Card buttons have an `aria-label` ("View the build for <name>"). Costume images have real alt text. Decorative elements (`.dots`, `.swatches`, countdown ticker) use `aria-hidden="true"`. The spook level is also given as text ("Spook level 4 of 5 - Genuinely chilling").
- Native `<dialog>` with `showModal()`, `aria-labelledby`, a labelled close button, Escape to close (native), click on the backdrop to close, and Left/Right arrows to step through costumes.
- `prefers-reduced-motion: reduce` disables smooth scrolling, card image zoom and the "conjure" animation. Note that `scrollIntoView({ behavior: "smooth" })` in the "Remix" handler does not check this setting. Prefer `auto` there if you touch it.
- Dark theme through `prefers-color-scheme` using the same tokens.
- Colour is never the only signal: palette swatches always sit beside a text label.

## Print requirements already in the code

The `@media print` block lets a plan go to the shops:

- White background, black text, 12pt body.
- Hidden: hero image, filter chips, toolbar (sort and surprise), skip link, hero buttons, lab result action buttons, copy status, the dialog and the footer.
- Cards and the lab result drop shadows and use `break-inside: avoid`. The lab and Kiro bands lose their tinted backgrounds. Links are black without underline.
- When adding interactive-only UI (buttons, toolbars, toasts), add it to the print hide list.

## Working in this repo

- Edit `index.html` in place. Never paste or regenerate the base64 lines. Use targeted line-range edits.
- Verify by opening the file in a browser: check filters and sort, dialog navigation, every lab option, Summon, Copy, Download, keyboard-only use, dark mode, reduced motion and print preview.
- Run `node --test tests/*.test.js` from the repo root (Node 18 or later, no install). It syntax-checks the inline script with `.kiro/hooks/check-inline-script.js` and checks the lab budget arithmetic in the plan text. It runs the page script against a stub DOM, so it does not cover layout, styling or print.
- Keep `README.md` in sync when features or counts change (it lists the 8 costumes, the vibes and the lab options).
