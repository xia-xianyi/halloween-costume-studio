# Implementation plan: Lab budget estimate

- [x] 1. Add cost data to the lab tables
  - Add `cost: [min, max]` (whole USD) to every entry in `BASES`, `TWISTS`, `PROPS` and `PALETTES` using the values in design.md; `TWISTS.none` is `[0, 0]`.
  - Do not touch any existing field.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Add money formatting helpers
  - Add `fmtMoney` and `fmtRange` next to `fmtTime`.
  - `fmtRange` returns `$5` when min equals max and `$30–$60` otherwise.
  - _Requirements: 2.2, 2.3_

- [x] 3. Show the cost on each lab option button
  - Append a `<small class="opt-cost">` with `fmtRange(item.cost)` to each button in `renderLabControls`.
  - Add `.opt-cost` CSS with existing tokens, readable in the pressed state, light and dark.
  - Keep `aria-pressed`, click handling, height and group labels unchanged.
  - _Requirements: 2.1, 2.4, 2.5, 2.6_

- [x] 4. Compute the breakdown and total in `currentBuild()`
  - Return `costs` (four `{ part, label, cost }` items in order Character, Twist, Prop, Palette) and `costTotal` (sum of minimums, sum of maximums).
  - Leave all existing returned fields untouched.
  - _Requirements: 3.1, 3.2, 5.1_

- [x] 5. Render the budget section in the result panel
  - Add the "Estimated budget" `h4`, `<ul id="res-budget">` and the note paragraph between the palette note and "What you'll need".
  - Fill the list and the total row in `renderResult()`.
  - Add `.budget`, `.budget-total` and `.budget-note` CSS; rows use `break-inside: avoid` so the print layout stays intact.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 6. Add the budget block to `planText()`
  - Insert the "Estimated budget (USD, rough DIY estimate)" block with four part lines and a total line, before "What I need:".
  - Confirm copy, share and download all pick it up, with no other changes to those handlers.
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Update the README
  - Mention the per-part and total budget estimate in the Costume Lab bullet.
  - _Requirements: 5.5_

- [x] 8. Verify
  - Run a throwaway Node script over all 1,728 combinations: valid `cost` data, totals equal the sum of parts, `min <= max`, and existing fields (number, name, spook, time, budget label, materials) are the same as on `main`.
  - Browser check: no browser is installed in the sandbox, so the page script was run in Node with a stub DOM instead. Layout, dark mode and print preview still need a manual look.
  - Check no base64 lines changed (`git diff --stat` shows only small additions to `index.html`).
  - _Requirements: 1.x, 3.x, 4.x, 5.x_
