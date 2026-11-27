---
inclusion: fileMatch
fileMatchPattern: "tests/**"
---

# Testing the studio

Run everything from the repo root with `node --test tests/*.test.js` (Node 18 or later). There is no `package.json` and there must not be one. Use only `node:test`, `node:assert` and Node built-ins.

## How the page is tested

- `tests/load-page.js` runs the inline `<script>` of `index.html` in a `vm` context with a stub DOM and returns the context, so tests call the page's own globals (`labState`, `buildFor`, `fittingCombos`, `planText`, ...).
  - `loadPage({ hash })` sets `location.hash` at load, which is how share links are tested.
  - `loadPage({ now })` freezes `new Date()`, which is how the countdown and Halloween day are tested.
  - `loadPage({ random })` replaces `Math.random`.
  - `ctx.__replaced` records `history.replaceState` URLs, and `ctx.__listeners` records window listeners.
- Stub elements record `listeners`, `attrs` and `children`. Click a control with `node.listeners.click.forEach(fn => fn())`. For a select, set `.value` and fire its `change` listeners.
- Objects returned by the page come from another realm. Before `deepStrictEqual`, pass them through `JSON.parse(JSON.stringify(x))`.
- The stub doesn't cover layout, CSS, print or real focus. Check those in a browser (see the `capture-screenshots` steering doc).

## The suites

| File | What it pins |
| --- | --- |
| `lab-budget.test.js` | Syntax check via `.kiro/hooks/check-inline-script.js`; budget modes; plan-text budget block (rows add up to the total). |
| `lab-regression.test.js` | All 1,728 creations × 3 modes against `tests/fixtures/lab-baseline.json`: number, name, spook, time, budget label, every cost row, plus a digest of description, carrying line, materials and palette. |
| `lab-properties.test.js` | Seeded property tests (mulberry32). Reproduce with `PROPERTY_SEED=<n>`, scale with `PROPERTY_RUNS=<n>`. |
| `finder.test.js` | Fit counts against an independent brute force, Summon draws, dead-end rescue, Halloween date and Halloween-day button. |
| `share-link.test.js` | `#lab=<n>&mode=<key>` round trip for all 1,728, rejection of bad hashes, load and hashchange, rebuild line in the plan. |
| `copy-consistency.test.js` | Static numbers in `index.html` and `README.md` match the data; the README names every steering doc, spec and hook. |

## Rules

- **The baseline is a contract.** If `lab-regression` fails, a creation changed. Fix the code, or, if the change is intended (for example a new costume), regenerate the fixture deliberately, say so in the commit message and update the spec that asked for it. Never regenerate it just to make the test pass.
- Prefer exhaustive checks over samples when the space is small (1,728 × 3 runs in well under a second). Use property tests for rules that hold for any state, and keep heavy properties (each `fittingCombos` call scans 1,728) to tens of cases.
- When a property fails, the message starts with `[seed …, case …]` and the generated case. Add the case as a plain example test once fixed.
- Plan-text line formats are relied on by `lab-budget.test.js` and `share-link.test.js`. Change them together.
