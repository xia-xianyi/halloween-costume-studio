# Requirements: Haunted studio

## Introduction

The Costume Contest is judged on a haunting, polished UI where spooky design makes the app work better. The studio is tasteful but reads as a cosy craft blog. The dark theme only appears when the operating system asks for it. The only motion on Summon is a barely visible wobble. Each lab creation is text only, while the costume illustrations go unused there. The whole result panel is also an `aria-live` region, so every option press reads the full plan aloud.

This feature adds:
- a "Lights out" theme toggle, with spooky effects that carry meaning;
- a portrait of the base costume in the lab result, framed in the chosen palette;
- a visible "materialise" reveal on Summon;
- a short screen-reader announcement in place of the oversized live region.

It covers plan items D1, D2, D3 and I4.

## Requirements

### Requirement 1: Lights out

1. THE page SHALL have a "Lights out" toggle: a native `<button type="button">` with `aria-pressed`, 44px tall, visible near the top of the page, hidden in print.
2. ON load, THE toggle state SHALL follow `prefers-color-scheme`. Pressing it SHALL switch between the light and dark token sets for the whole page. The choice SHALL NOT be saved between visits (the product has no persistence).
3. WITHOUT JavaScript, THE existing `prefers-color-scheme` behaviour SHALL be unchanged.
4. IN the dark theme, spook dots SHALL glow more strongly at higher levels: none at 1–2, rising at 3–4, and a slow pulse at 5. The fright level should be readable at a glance.
5. IN the dark theme, THE countdown number SHALL flicker gently, like a candle.
6. Every animation SHALL be disabled under `prefers-reduced-motion: reduce`. No gradients (visual brief).

### Requirement 2: Result portrait

1. THE lab result SHALL show the illustration of the selected base costume, reusing the existing gallery image (no new image data).
2. THE portrait frame SHALL use the selected palette: the first colour as the border, the second as an inner ring. Changing the palette changes the frame.
3. WHEN a twist other than "Keep it classic" is selected, a badge with the twist label SHALL sit on the portrait.
4. THE image SHALL have alt text naming it as the base illustration. THE portrait SHALL be hidden in print.

### Requirement 3: Materialise on Summon

1. WHEN the user summons a costume, THE portrait and the creation name SHALL fade in from a blur over about 0.6 s, and the panel border SHALL flash the accent colour.
2. Under reduced motion there SHALL be no animation.

### Requirement 4: Short announcements

1. THE result panel SHALL NOT be a live region as a whole.
2. A visually hidden `role="status"` element in the panel SHALL announce a one-line summary after each change, for example "Royal Vampire. Creation 137 of 1,728. Total $53–$130, Buy new."

### Requirement 5: No regressions

1. Names, numbers, spook, time, budgets, materials and plan text (apart from the shareable-creations addition) SHALL be unchanged for all 1,728 creations in all modes.
2. Keyboard use, focus return, dark mode via the OS, reduced motion and print SHALL keep working.
