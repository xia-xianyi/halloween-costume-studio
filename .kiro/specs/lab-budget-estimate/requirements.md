# Requirements: Lab budget estimate

## Introduction

The Costume Lab lets a user pick a character (`BASES`), a twist (`TWISTS`), a prop (`PROPS`) and a palette (`PALETTES`). The result panel shows a name, description, time, a coarse budget label (`Low budget`, `Moderate budget`, `Splurge`), and a materials list. It does not say what a build will cost.

This feature gives every selectable lab option an estimated DIY cost range in US dollars. The generated plan shows the per-part estimates and a total estimated budget range, in the result panel and in the copied, shared and downloaded plan text.

All figures are rough estimates for a home build that reuses things the maker already owns or buys cheaply (thrifted or budget retail). They are not live prices.

## Glossary

- **Part**: one of the four lab choices: Character, Twist, Prop, Palette.
- **Cost range**: a pair of whole US dollars `[min, max]` with `0 <= min <= max`.
- **Total range**: the sum of the four parts' minimums and the sum of their maximums.

## Requirements

### Requirement 1: Cost data for every option

**User story:** As a costume maker, I want each lab option to carry a cost estimate, so that I can compare options before I choose.

#### Acceptance criteria

1. THE lab data SHALL define a cost range in USD on every entry of `BASES`, `TWISTS`, `PROPS` and `PALETTES`, including the `none` ("Keep it classic") twist.
2. THE cost range of the `none` twist SHALL be `$0` to `$0`.
3. EVERY cost range SHALL satisfy `0 <= min <= max` and use whole dollars.
4. WHERE a character or twist already has a `budget` level, THE cost ranges SHALL be consistent with it: a `Low` (0) item SHALL NOT cost more at its maximum than a `Splurge` (2) item at its minimum within the same group.
5. THE data SHALL stay in the existing object tables, so the lab controls, result and plan text read the same source.

### Requirement 2: Cost visible on each option

**User story:** As a costume maker, I want to see the estimate on each option button, so that I do not need to select it to learn the price.

#### Acceptance criteria

1. WHEN the lab controls render, EACH option button SHALL show its cost range next to its label, formatted like `$30–$60`.
2. WHEN an option's range has equal min and max and the value is above zero, THE button SHALL show a single amount, such as `$5`.
3. WHEN an option costs `$0` to `$0`, THE button SHALL show `$0`.
4. THE cost text SHALL be part of the button's text, so it is announced by screen readers with the label.
5. THE option buttons SHALL remain native `<button type="button">` elements with `aria-pressed`, keep the minimum 42px height, and keep the existing group labels.
6. THE cost text SHALL use existing colour tokens and SHALL meet the same contrast as other muted text in both light and dark themes.

### Requirement 3: Per-part breakdown and total in the result panel

**User story:** As a costume maker, I want the result to itemise cost per part and give a total, so that I can plan a budget.

#### Acceptance criteria

1. WHEN the result renders, THE result panel SHALL show an "Estimated budget" section with one row per part in the order Character, Twist, Prop, Palette. Each row shows the part type, the chosen option's label and its cost range.
2. THE section SHALL show a total row whose range is the Total range (sum of minimums to sum of maximums).
3. WHEN the user changes any option, or uses "Summon a random costume", THE breakdown and total SHALL update together with the rest of the result.
4. THE breakdown SHALL be inside the existing `aria-live="polite"` result region, so changes are announced.
5. THE section SHALL state that the figures are rough estimates in USD and that prices vary.
6. THE breakdown SHALL be built with the existing pattern: `innerHTML` set from trusted hard-coded data, and a heading `h4` like "What you'll need".
7. WHEN the page is printed, THE breakdown SHALL appear in the printout and SHALL NOT split across pages.

### Requirement 4: Cost in copied, shared and downloaded plan text

**User story:** As a costume maker, I want the budget in the text I copy or save, so that it travels with my shopping list.

#### Acceptance criteria

1. THE function that builds the plan text SHALL include an "Estimated budget (USD)" block with one line per part and a total line, using the same figures and format as the result panel.
2. THE copy, share and download actions SHALL all emit this block, because they all use the plan text.
3. THE block SHALL appear before the "What I need:" list and SHALL NOT change the existing lines of the plan.
4. THE downloaded file name, the copy status messages and the fallback copy behaviour SHALL stay unchanged.

### Requirement 5: Existing behaviour is preserved

#### Acceptance criteria

1. THE creation number, the "of 1,728" text, name, spook level, build time, budget label and de-duplicated materials list SHALL be unchanged for every combination.
2. THE page SHALL remain one `index.html` with no build step, no new dependency and no network request.
3. THE new code SHALL follow the existing style: ES5-style `var` and function expressions, `UPPER_SNAKE` tables, `camelCase` functions, kebab-case ids prefixed `res-`.
4. THE gallery, filters, sort, detail dialog and countdown SHALL be unchanged.
5. THE README SHALL mention the budget estimate in its Costume Lab description.
