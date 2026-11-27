# Requirements: Lab budget modes

## Introduction

The Costume Lab already gives every option a cost range in USD (`cost: [min, max]` on `BASES`, `TWISTS`, `PROPS` and `PALETTES`) and shows a per-part breakdown and a total in the result panel and in the plan text (see `.kiro/specs/lab-budget-estimate/`). Those figures are a single estimate and do not reflect how the maker intends to shop.

This feature adds a purchase-mode selector with three modes. The selected mode scales every cost estimate the lab shows:

| Mode | Id | Multiplier | Meaning |
| --- | --- | --- | --- |
| Thrift | `thrift` | 0.5 | Second-hand hunting: charity shops, swaps, what's in the loft. |
| Buy new | `new` | 1.0 | Buying the parts new at ordinary shops. The existing figures. |
| Premium | `premium` | 1.8 | Better fabrics, sturdier props, specialist shops. |

## Glossary

- **Part**: one of the four lab choices: Character, Twist, Prop, Palette.
- **Base range**: the `cost: [min, max]` stored on an option today.
- **Mode**: one of Thrift, Buy new, Premium, with its multiplier.
- **Adjusted range**: `[round(min × multiplier), round(max × multiplier)]`, where `round` rounds to the nearest whole US dollar and halves round up.
- **Adjusted total**: the sum of the four parts' adjusted minimums and the sum of their adjusted maximums.

## Requirements

### Requirement 1: Mode data

**User story:** As a costume maker, I want the lab to know the three ways I might shop, so that the estimate matches my plan.

#### Acceptance criteria

1. THE lab data SHALL define exactly three modes in one object table, in the order Thrift, Buy new, Premium, each with a label, a multiplier and a short description.
2. THE multipliers SHALL be 0.5 for Thrift, 1.0 for Buy new and 1.8 for Premium.
3. THE existing `cost` values on lab options SHALL NOT change. Modes scale them at display time.

### Requirement 2: Mode selector

**User story:** As a costume maker, I want to pick a purchase mode in the lab, so that I can compare a thrifted build with a new or premium one.

#### Acceptance criteria

1. WHEN the lab controls render, THE lab SHALL show a "Purchase mode" group with one option button per mode, showing the mode label and its multiplier (for example "Thrift ×0.5").
2. THE selector SHALL use the existing option pattern: native `<button type="button">` with class `opt`, `aria-pressed` on the selected mode, a `role="group"` container with an `aria-label`, and the same 42px minimum height and styling.
3. WHEN the page loads, THE selected mode SHALL be Buy new, so the figures shown on load equal today's figures.
4. WHEN the user presses a mode button, THE mode SHALL become selected, all cost figures SHALL update, and keyboard focus SHALL return to the pressed button after the controls are rebuilt.
5. WHEN the user uses "Summon a random costume" or "Remix this in the costume lab", THE selected mode SHALL stay unchanged.
6. THE mode SHALL NOT be saved between visits (the page has no persistence).

### Requirement 3: Mode applied to every estimate

**User story:** As a costume maker, I want every price in the lab to follow the mode, so that the numbers agree with each other.

#### Acceptance criteria

1. EVERY per-part figure in the result panel and the plan text SHALL be the Adjusted range of that part for the selected mode.
2. THE total SHALL be the Adjusted total, so the shown rows always add up to the shown total.
3. EVERY figure SHALL be a whole number of US dollars and SHALL keep `0 <= min <= max`.
4. A `$0` part (the "Keep it classic" twist) SHALL stay `$0` in every mode.
5. THE cost shown on each Character, Twist, Prop and Palette option button SHALL also be the Adjusted range for the selected mode.
6. THE figures SHALL use the existing formatting: `$15–$33`, or a single amount such as `$3` when min equals max.

### Requirement 4: Mode in the result panel

**User story:** As a costume maker, I want the result to say which mode the budget assumes, so that I read the figures correctly.

#### Acceptance criteria

1. THE "Estimated budget" section SHALL state the selected mode's label, multiplier and description above the per-part rows.
2. WHEN the mode changes, THE mode line, rows and total SHALL update together inside the existing `aria-live="polite"` result region.
3. WHEN the page is printed, THE mode line SHALL print with the budget, using existing tokens and print rules.

### Requirement 5: Mode in copied, shared and downloaded plan text

**User story:** As a costume maker, I want my saved plan to say which mode it assumes, so that the shopping list makes sense later.

#### Acceptance criteria

1. THE plan text SHALL include a line stating the selected mode, its multiplier and description, directly under the "Estimated budget (USD, rough DIY estimate):" heading.
2. THE plan text's per-part lines and total line SHALL show the Adjusted figures, identical to the result panel.
3. THE copy, share and download actions SHALL all include the mode, because they all use `planText()`.
4. ALL other plan lines, the download file name and the status messages SHALL stay unchanged.

### Requirement 6: Existing behaviour is preserved

#### Acceptance criteria

1. WITH the Buy new mode selected, EVERY figure shown (buttons, rows, total) SHALL equal the figure shown before this feature, for all 1,728 combinations.
2. THE creation number, name, spook level, build time, budget label and materials list SHALL be unchanged for every combination and every mode.
3. THE page SHALL remain one `index.html` with no build step, no new dependency and no network request.
4. THE new code SHALL follow the existing style: ES5 `var` and function expressions, `UPPER_SNAKE` tables, `camelCase` functions, `res-` prefixed kebab-case ids.
5. THE README SHALL mention the purchase modes in its Costume Lab description.
