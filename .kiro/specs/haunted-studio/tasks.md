# Implementation plan: Haunted studio

- [x] 1. Result portrait and materialise reveal
  - Portrait markup, `COSTUME_BY_ID`, palette frame, twist badge, print hide; replace `conjure` with `materialise`.
  - _Requirements: 2.1–2.4, 3.1, 3.2_

- [x] 2. Lights-out toggle
  - Token selectors, toggle markup and CSS, `setTheme`, media-query follow, print hide.
  - _Requirements: 1.1–1.3_

- [x] 3. Meaningful spookiness
  - `lvl-N` class from `dotsHTML`, glow and pulse, countdown candle, reduced-motion off-switches.
  - _Requirements: 1.4–1.6_

- [x] 4. Short announcements
  - Drop `aria-live` from `#result`; add `#res-announce` and `.sr-only`; fill it in `renderResult()`.
  - _Requirements: 4.1, 4.2_

- [x] 5. Verify
  - Full suite, syntax check, Playwright screenshots in both themes and on mobile.
  - _Requirements: 5.1, 5.2_

## Verification (27 Nov 2026)

- Playwright:
  - The toggle starts from the emulated colour scheme and flips `data-theme`. It is the first Tab stop after the skip link.
  - Level-5 dots in the dark theme compute `box-shadow: … 10px` with `haunt-pulse`, and the countdown runs `candle`. Under `reducedMotion: reduce` both animations compute to `none`.
  - `#result` has no `aria-live`, and `#res-announce` reads e.g. "Royal Vampire. Creation 37 of 1,728. Total $53–$130, Buy new."
  - Print hides `#lights`, `#finder`, `#res-figure` and the result actions.
  - No horizontal overflow at 390px.
- A fix found in the screenshots: the "☾" glyph rendered as a missing-glyph box under the fallback fonts, so the crescent is now drawn in CSS (`.moon`).
- Screenshots: `docs/screenshots/hero-light.png`, `hero-dark.png`, `mobile-hero.png`.
