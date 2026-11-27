---
inclusion: always
---

# Tech stack

## Architecture

- The whole app is one file, `index.html`, with an inline `<style>` block and one inline `<script>` block. Other files in the repo are `README.md` and `LICENSE` (MIT).
- No build step, bundler, package manager, framework, transpiler, tests or CI. To run it, open `index.html` in a browser.
- The file is about 5 MB because all images are embedded as `data:image/jpeg;base64,...` strings: the `og:image` meta tag (line 11), the hero image (line 320) and one `img` field per costume in `COSTUMES`. These lines are hundreds of KB long. Do not open the file whole. Use `grep -n`, `sed -n 'A,Bp' | cut -c1-200`, or editor line ranges, and never print or rewrite those lines.
- The only external requests are the Google Fonts stylesheet (DM Serif Display, Public Sans) with `preconnect`. System serif/sans fallbacks are declared. Do not add other network dependencies; the page should keep working offline apart from the fonts.

## Rough file layout (line numbers drift, so search for the markers)

1. `<head>`: meta, Open Graph, fonts, a small min-height rule for controls, then the main `<style>`.
2. CSS organised by banner comments (`/* ---------- Hero ---------- */`, Sections, Filters + gallery, Costume Lab, Built with Kiro, Tips, Dialog, Print).
3. `<body>`: skip link, `<main>` (hero, `#rail`, `#lab`, `#built`, `#tips`), footer, `<dialog id="detail">`.
4. `<script>` with banner comments: Gallery data, Lab data, Helpers, Countdown, Gallery, Detail dialog, Costume Lab, Go.

## JavaScript conventions

- ES5 style in a single global script under `"use strict"`: `var`, function declarations, `function () {}` callbacks, `forEach`/`map`/`filter`, string concatenation. No modules, classes, arrow functions, template literals or `let`/`const`. Match this style.
- Module-level state is plain variables: `activeFilter`, `activeSort`, `shownList`, `dialogCostume`, `dialogList`, `labState`.
- `el(id)` wraps `document.getElementById`. Elements are fetched by id; ids in the HTML and script must stay in sync.
- Rendering is "clear and rebuild": `renderFilters()`, `renderGrid()`, `renderLabControls()`, `renderResult()` set `innerHTML = ""` and recreate nodes, attaching listeners as they go. Startup is the "Go" block at the end of the script.
- Strings from the data tables are inserted with `innerHTML`. This is safe only because all data is hard-coded in the file. If user input is ever rendered, use `textContent` or escape it.
- Progressive enhancement is used for browser APIs: `dialog.showModal` is feature-checked, copy uses `navigator.clipboard` with a `textarea` + `execCommand` fallback, share uses `navigator.share` with a fallback to the copy button.
- Download builds a `Blob`, uses a temporary `<a download>` and revokes the object URL after 2 seconds. The file name is `costume-plan-<slug>.txt`.

## CSS conventions

- Theme tokens are CSS custom properties on `:root` (`--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--accent-strong`, `--accent-soft`, `--sage`, `--line`, `--shadow`). Dark mode overrides them in `@media (prefers-color-scheme: dark)`. Use the tokens rather than raw colours. The only raw colours are the lab palette swatches (data) and a few fixed foreground colours like `#fff8ee` on accent buttons.
- Mobile-first layout with `min-width` media queries (about 560, 600, 760, 880, 940, 980, 1080px) and CSS grid. Content width is the `.wrap` class (max 1120px).
- Component classes: `.btn` (`.btn-solid`, `.btn-ghost`, `.btn-small`), `.chip`, `.opt`, `.card`, `.meta`, `.spook`, `.dots`, `.swatches`, `.result`.
