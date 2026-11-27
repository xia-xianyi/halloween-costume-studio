# Implementation plan: Lab budget modes

- [x] 1. Add the mode data and state
  - Add `BUDGET_MODES` (`thrift` 0.5, `new` 1, `premium` 1.8, each with `label` and `desc`) after `PALETTES`.
  - Add `mode: "new"` to `labState`. Do not add modes to `GROUPS`.
  - _Requirements: 1.1, 1.2, 1.3, 2.3, 2.5, 2.6_

- [x] 2. Add the mode helpers
  - Add `currentMode`, `fmtMultiplier` and `adjustCost` (Math.round per end).
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 3. Apply the mode in `currentBuild()`
  - Scale each part's `cost` with `adjustCost`; keep `costTotal` as the sum of the adjusted parts; return `mode`.
  - Leave every other returned field untouched.
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [x] 4. Add the Purchase mode selector and adjust option costs
  - Extract a shared group builder in `renderLabControls`, show adjusted costs on part buttons, and render the "Purchase mode" group with `aria-pressed`, `role="group"`, `aria-label` and focus return.
  - _Requirements: 2.1, 2.2, 2.4, 3.5, 3.6_

- [x] 5. Show the mode in the result panel
  - Add `<p class="budget-mode" id="res-budget-mode">` under the "Estimated budget" heading, fill it in `renderResult()`, add `.budget-mode` CSS with existing tokens.
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Show the mode in the plan text
  - Add the "Purchase mode: …" line under the budget heading in `planText()`; rows and total use the adjusted figures.
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Update the README and steering notes
  - _Requirements: 6.5_

- [x] 8. Verify
  - Syntax-check the inline script with the repo hook script.
  - Run a throwaway Node script with a stub DOM over all 1,728 combinations × 3 modes, and compare non-cost fields and Buy new figures with `main`.
  - Hand-check a sample of combinations in every mode against the result panel and `planText()`.
  - Check `git diff --stat` shows no base64 lines changed.
  - Result: syntax check OK; all 5,184 cases (1,728 × 3 modes) passed; Buy new output and every non-cost field match `main`. No browser is installed in the sandbox, so layout, dark mode and print preview still need a manual look.
  - _Requirements: 3.x, 4.x, 5.x, 6.x_
