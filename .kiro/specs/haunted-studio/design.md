# Design: Haunted studio

## Theme tokens

The dark tokens move into two selectors that share one block:

```css
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { …dark tokens… } }
:root[data-theme="dark"] { …same dark tokens… }
```

The block is duplicated once, because CSS can't share a declaration block between a media query and a plain selector. A comment marks the two copies as twins. With no `data-theme` attribute (no JavaScript), behaviour is the same as today.

## Toggle

- Markup: `<button class="lights-toggle" id="lights" type="button" aria-pressed="false"><span aria-hidden="true">☾</span> Lights out</button>` is the first element in `<body>` after the skip link. It is absolutely positioned at top right (it doesn't follow the scroll, so it never covers content).
- On small screens the hero top padding grows so the toggle doesn't overlap the entry badge.
- `aria-pressed="true"` means the lights are out (dark). The label stays the same, which is the accessible pattern for a toggle button.
- JS: `setTheme(dark)` sets `data-theme` on `<html>` and `aria-pressed`. On startup, `setTheme(matchMedia("(prefers-color-scheme: dark)").matches)` sets the attribute so the effect CSS can key off `[data-theme="dark"]` alone. A `change` listener on the media query follows the OS until the user presses the toggle.

## Meaningful spookiness (dark theme only)

- `dotsHTML(n)` adds a level class: `<span class="dots lvl-N" aria-hidden="true">`.
  - `lvl-3`: `box-shadow: 0 0 4px` of the accent.
  - `lvl-4`: 7px.
  - `lvl-5`: 10px plus the `haunt-pulse` animation (opacity 0.7 to 1, 2.4 s).
- Countdown: `[data-theme="dark"] .countdown strong` gets an accent text-shadow and the `candle` animation (3.2 s, opacity 0.82 to 1 with a slight shadow change).
- Reduced motion turns both animations off. The glows stay, since they carry meaning and don't move.

## Portrait

```html
<figure class="res-portrait" id="res-figure">
  <img id="res-img" alt="" decoding="async" />
  <span class="twist-badge" id="res-twist" hidden></span>
</figure>
```

- It sits at the top of `#result`, before the kicker.
- `renderResult()` looks up the gallery costume through `COSTUME_BY_ID[labState.base]` and sets `src` only when the base changed, so the 500 KB data URI isn't reassigned on every press.
- Alt text: `"Base illustration: " + costume.alt`.
- Frame: `figure.style.borderColor = colors[0]`, `figure.style.background = colors[1]` (shown through 4px of padding as the inner ring).
- The badge shows `TWISTS[key].label`, hidden for `none`.
- CSS: 16:9 aspect ratio, `object-fit: cover`, `object-position: center 18%`, max height 230px, 6px border, 16px radius. The badge is a small accent pill in the top-left corner.
- `.res-portrait` joins the print hide list.

## Materialise

`@keyframes materialise { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: none; } }` is applied to `#res-name` and `.res-portrait img` while `.result.conjuring` is set (0.6 s). `.result.conjuring` keeps its accent border. The old `conjure` wobble is removed. The existing `animationend` listener clears the class. Both child animations have the same duration and bubble to `#result`, so the class is cleared once they finish. Reduced motion means no animation.

## Announcements

- Remove `aria-live="polite"` from `#result`.
- Add `<p class="sr-only" id="res-announce" role="status"></p>` inside it. `renderResult()` sets the text to `name + ". Creation " + n + " of " + fmtInt(TOTAL_COMBOS) + ". Total " + fmtRange(total) + ", " + mode.label + "."`.
- `.sr-only` is the standard visually hidden pattern.

## Verification

Run the full test suite, then take Playwright screenshots of the hero (light and dark), the lab result with its portrait (dark), and mobile at 390 px.
