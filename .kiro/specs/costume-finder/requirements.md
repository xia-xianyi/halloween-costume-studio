# Requirements: Costume finder

## Introduction

The Costume Lab works forwards: the user picks a character, twist, prop and palette, and the lab reports cost, time and spook. Real users usually start from the other end: "I have $25, half an hour, and I don't want to scare the kids. What can I wear?" The lab's data can answer that. Under *Buy new*, none of the 1,728 creations has a top-end total of $25 or less; under *Thrift*, 54 do. Today the UI hides it.

This feature adds a "Find one that fits" panel. It filters all creations by budget, build time and fright level in the selected purchase mode, says how many fit, makes "Summon" draw only from those, and offers a one-tap mode switch when nothing fits. It also replaces the hard-coded Halloween countdown date with a computed one and adds a Halloween-day shortcut into the finder (plan items I1, N3, I3).

Source: `.kiro/specs/optimization-plan/plan.md`.

## Glossary

- **Creation**: one of the 1,728 combinations of base × twist × prop × palette.
- **Limits**: the three finder settings: maximum budget (USD), maximum build time (minutes), fright band.
- **Fits**: a creation fits the limits in a mode when the top end of its adjusted total ≤ the budget limit, its build time ≤ the time limit, and its spook level is inside the fright band. An unset limit always passes.
- **Fright bands**: Gentle = spook 1–2, Eerie = 3, Terrifying = 4–5.

## Requirements

### Requirement 1: Finder controls

**User story:** As someone short on money or time, I want to state my limits, so that I only see costumes I can actually make.

1. THE lab SHALL show a "Find one that fits" panel above the option groups with three labelled native `<select>` controls: "Spend at most" (Any, $25, $40, $60, $100, $150), "Ready in" (Any, 15 min, 30 min, 45 min, 1 hr, 1 hr 30) and "Fright" (Any, Gentle (1–2), Eerie (3), Terrifying (4–5)).
2. THE default for every control SHALL be "Any", so the page behaves exactly as before until the user sets a limit.
3. THE controls SHALL meet the existing control rules (42px minimum height, visible focus, existing tokens) and SHALL be hidden in print.

### Requirement 2: Fit count

1. WHEN no limit is set, THE panel SHALL say that all 1,728 creations are in play.
2. WHEN any limit is set, THE panel SHALL state how many of the 1,728 creations fit in the selected purchase mode, for example "54 of 1,728 creations fit in Thrift mode."
3. THE count SHALL be in a `role="status"` region and SHALL update when a limit or the purchase mode changes.
4. THE count SHALL be computed from the same composition and cost code as the result panel, so the finder and the result never disagree.

### Requirement 3: Summon respects the limits

1. WHEN any limit is set and at least one creation fits, THE "Summon" button SHALL read "Summon one that fits" and SHALL only pick creations that fit.
2. WHEN any limit is set and no creation fits, THE "Summon" button SHALL be disabled.
3. WHEN no limit is set, THE button SHALL read "Summon a random costume" and pick from all creations, as today.
4. Summon SHALL keep the purchase mode unchanged.

### Requirement 4: Dead-end rescue

1. WHEN no creation fits in the selected mode but some fit in another mode, THE panel SHALL say so and offer one button per such mode, for example "Switch to Thrift: 54 fit".
2. WHEN the user presses that button, THE purchase mode SHALL change, the lab and count SHALL update, and focus SHALL move to the Summon button.
3. WHEN nothing fits in any mode, THE panel SHALL suggest loosening a limit.

### Requirement 5: Computed Halloween date

1. THE countdown target SHALL be 31 October of the current year at local midnight, or of the next year from 1 November onwards.
2. THE hero label and the footer SHALL show the computed date with its weekday (for example "Sunday 31 October 2027"). The static HTML text stays as the no-JavaScript fallback.
3. ON 31 October (local time), THE hero SHALL say it is Halloween tonight and show a "Find a costume for tonight" button. Pressing it SHALL set the limits to $25 and 30 min, select Thrift mode, update the finder, and move to the lab.

### Requirement 6: No regressions

1. FOR every creation and every mode, name, creation number, spook level, build time, budget label, materials and cost figures SHALL equal the values on `main` before this feature (checked against `tests/fixtures/lab-baseline.json`).
2. THE page SHALL stay one self-contained `index.html` in the existing ES5 style, with no new dependency or network request.
