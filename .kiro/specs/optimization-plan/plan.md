# Kiroween 2026 optimization plan: Halloween Costume Studio

Status: draft for review. Written 27 November 2026 after reading `index.html` (all non-base64 lines), `README.md`, the three steering docs, both specs, the hook and its checker, `tests/`, the 15 commits on `main` and the 5 closed PRs.

## 0. What the judges will actually see today

- **Category brief.** The Costume Contest asks for a haunting, polished, unforgettable UI whose spooky design elements make the app work better ([HauntMap, a 2026 entry, restating the brief](https://devpost.com/software/hauntmap)). The 2026 rules page returned HTTP 403, so the submission checklist below comes from the 2025 rules pattern: working app, public repo with an OSI licence and a committed `.kiro/` folder, a demo video under 3 minutes ([Decoding Kiroween](https://dev.to/brian_mk/decoding-kiroween-4nm)), and a write-up of how Kiro was used. Content was rephrased for compliance with licensing restrictions.
- **Repo facts.** The repo is public and MIT-licensed, and `.kiro/` is committed. There is no live URL (`has_pages: false`, `homepage: null`), no video, no screenshots and no topics.
- **The app.** One 5.27 MB `index.html`. Ten base64 JPEG lines of 408 to 668 KB each make up about 5.2 MB of it. The features are a countdown, an 8-costume gallery with filters, sort and a detail dialog, a 4-part lab (1,728 combinations) with USD budget estimates and 3 purchase modes, a tips list and a "Built with Kiro" section.
- **Kiro artefacts.** Three steering docs (all `inclusion: always`), two specs (both for the lab budget), one `fileEdited` hook that runs `.kiro/hooks/check-inline-script.js`, and 3 Node tests, all budget-focused. They pass (`node --test tests/*.test.js`: 3 pass, 0 fail).
- **History.** All 15 commits are dated 27 Nov 2026. The core app (826 lines, commit `ba5c58c`) and the polish pass (`a8778e7`) were committed by hand with no spec. Kiro artefacts start at commit `b7d44b8`, after the product existed.

## 1. Potential Impact: 5/10

### Evidence
- Real audience and real content. Each of the 8 gallery costumes has 5 or 6 materials and a 4-step method. The lab gives a priced shopping list per part, and the plan can be copied, shared, downloaded or printed (`@media print` block).
- **The lab answers the wrong question.** Users pick 4 parts and the lab tells them the cost and time. The real question is the reverse: "I have $25, 30 minutes, and the party is tonight. What can I wear?" Nothing in the app answers it. The data can, though. Under *Buy new*, **0 of 1,728** creations have a top-end total of $25 or less. Under *Thrift*, **54** do, and 30 of those take 15 minutes or less. That is a useful, demoable insight the UI hides.
- **A creation can't be sent to anyone.** "Share my plan" shares plain text with no link back. A friend can't open the same costume, and the "Creation No." isn't addressable.
- **The countdown is hard-coded** to `new Date(2027, 9, 31)` and the static strings "Sunday 31 October 2027" (hero label, footer, `product.md`). It breaks on 1 Nov 2027. On Halloween itself, the one day last-minute users show up, it says "0 days" instead of helping.
- **Mobile flow.** Below 940px the result panel sits under 5 option groups (32 buttons). A phone user taps "Zombie" and sees no change on screen.
- **Screen-reader noise.** `#result` is `aria-live="polite"` on the whole article, so every option press announces name, description, meta, spook, palette, 5 budget rows and up to 15 materials.
- **Locale mismatch.** The copy uses British spelling and centimetres, but prices are USD. That's minor, but the copy should say "rough US prices" outright.
- 8 base costumes is thin next to free costume-idea sites. The lab's 1,728 is the scale argument, so it has to be usable.

### Improvements (ranked by impact ÷ effort; impact 1–5, effort S=1, M=2, L=3)

| # | Change | Impact | Effort | Ratio |
| --- | --- | --- | --- | --- |
| I1 | Costume finder ("Find one that fits") | 5 | M | 2.5 |
| I2 | Shareable creation links | 4 | S | 4.0 |
| I3 | Dynamic countdown + Halloween-day mode | 2 | S | 2.0 |
| I4 | Short live-region announcement | 2 | S | 2.0 |
| I5 | Mobile "peek" bar | 3 | M | 1.5 |
| I6 | Closet-first mode | 4 | L | 1.3 |

**I1. Costume finder.** New static block in `index.html` above `#lab-controls`. Wrap the left column as `<div class="lab-left"><form class="finder" id="finder">…</form><div id="lab-controls"></div></div>`.
- Controls (native `<select>`, labelled, 42px min height, `.sort-label` styling):
  - `#fit-budget` "Spend at most": Any, $25, $40, $60, $100, $150.
  - `#fit-time` "Ready in": Any, 15 min, 30 min, 45 min, 1 hr, 1 hr 30.
  - `#fit-spook` "Fright": Any, Gentle (1–2), Eerie (3), Terrifying (4–5).
- A creation fits when `costTotal[1] <= budget` (top end, so the user never overspends), `time <= limit` and spook is in range. All checks use the **currently selected purchase mode**.
- `#fit-count` (`role="status"`) reads "54 of 1,728 creations fit." When the count is 0 it reads "Nothing fits. Try Thrift mode or loosen one limit." and names the cheapest fitting mode if one exists.
- The existing `#summon` button draws only from fitting creations whenever a limit is set, and its label becomes "Summon one that fits". With 0 fits it is `disabled`.
- Refactor `currentBuild()` to `buildFor(state)`, with `currentBuild()` returning `buildFor(labState)`. Make `adjustCost(r, mode)` take the mode explicitly. Add `ALL_COMBOS` (precomputed key arrays, 1,728 entries) and `fittingCombos()`.
- Add `.finder` to the print hide list.
- Tests: `tests/finder.test.js` checks counts against an independent brute force for a grid of limits in all 3 modes (expected anchors: Thrift $25/30 min = 54; Buy new $25/any = 0; Buy new $60/30 min = 160), and checks that every combo `fittingCombos()` returns satisfies all three limits.

**I2. Shareable creation links.**
- Hash format `#lab=<1..1728>&mode=<thrift|new|premium>`, for example `#lab=137&mode=thrift`.
- Add `comboFromNumber(n)`, the inverse of the mixed-radix formula in `currentBuild()`: `n-1` gives the palette index from `% 6`, then prop, then twist, then base from `/ 6`. Add `labHash()` and `applyHash()`. `applyHash()` validates with `/^#lab=(\d{1,4})(?:&mode=(thrift|new|premium))?$/` and range 1–1,728, and ignores anything else.
- Call `applyHash()` on load and on `hashchange`. With a valid hash, scroll to `#lab` (respecting reduced motion).
- After every user change to the lab (option, mode, Summon, Remix), call `history.replaceState(null, "", labHash())` inside `try`, because of `file://`. Plain `href="#lab"` anchors keep working.
- `planText()` appends `""`, then `"Rebuild this costume: " + location.href.split("#")[0] + labHash()`, guarded with `typeof location`. This goes after the materials list, so the budget-block test format is untouched.
- `navigator.share` receives `url`. Add a button `#copy-link` labelled "Copy link to this costume".
- Tests: `tests/share-link.test.js` checks that `comboFromNumber(n)` followed by `buildFor().number` returns `n` for all 1,728, and that bad hashes (`#lab=0`, `#lab=1729`, `#lab=abc`, `#lab=5&mode=free`) leave `labState` unchanged.

**I3. Dynamic countdown.** `nextHalloween(now)` returns 31 Oct of the current year at local midnight, or of next year once 1 Nov has started. The hero label and footer get their date text from `fmtHalloween(date)` (for example "Sunday 31 October 2027"), with the weekday computed. On 31 October the hero shows "It's Halloween. Tonight's the night." and a button "Find a costume for tonight". That button sets `#fit-time` to 30 min, `#fit-budget` to $25 and the mode to Thrift, then scrolls to the lab. Update `product.md`, which currently documents the hard-coded date.

**I4. Live region.** Remove `aria-live` from `#result`. Add `<p class="sr-only" id="res-announce" role="status">` inside it. `renderResult()` sets it to "Royal Vampire. Creation 137 of 1,728. Total $53–$130, Buy new." Add a standard `.sr-only` class. Update the accessibility list in `structure.md`.

**I5. Mobile peek bar.** Below 940px, show `<a id="lab-peek" href="#result">` fixed to the bottom while `#lab-controls` is in view (IntersectionObserver, feature-checked). It shows "Royal Vampire · $53–$130 · See plan ↓". Hide it in print and when the result is visible.

**I6. Closet-first mode (not this session).** Add per-material costs so users can tick "I already own this" on the merged materials list. Owned items drop out of the total, and the finder ranks by "% already in your wardrobe". This needs a data-model change: `materials` becomes `[{ text, cost }]` in four tables, and the budget tests must be rewritten. It is a strong innovation story but too large to ship safely alongside I1–I4.

## 2. Technological Implementation (Kiro usage): 5/10

### Evidence (strengths)
- `structure.md` is unusually good. It documents the data model and the budget data flow step by step, and it states exactly which copy is hand-maintained. `tech.md` warns about base64 lines and gives safe read commands. These are steering docs that actually steer.
- Both specs use EARS-style acceptance criteria, design trade-off tables (rounding: "sum of rounded parts" against "round the raw total", with a worked example) and tasks traced to requirement ids, with verification results recorded.
- The hook's checker script is reused by the test suite (`tests/lab-budget.test.js` spawns it). That's a good, non-obvious link.
- `tests/load-page.js` runs the real page script in a `vm` with a stub DOM, which allows exhaustive checks with no dependencies.

### Gaps (brutal version)
- **The on-page claim is not backed by the repo.** The "Built with Kiro" card says the page "started as a written spec". No spec exists for the gallery, lab engine, dialog or countdown, and the core commit `ba5c58c` predates every `.kiro` file. A judge who opens `.kiro/specs/` finds two specs about pricing. This is the single biggest credibility risk in the entry.
- Feature breadth: specs only for one feature area. Steering only `inclusion: always`, with no `fileMatch` or `manual`. One hook, of one trigger type. **No MCP.** No agent-stop or manual hooks.
- Tests cover only the budget. The steering admits that the hero stats, "1,728", "Eight", "26 parts" and "nine illustrations" are typed by hand (5 × "1,728", 4 × "Eight" in `index.html`), and nothing enforces them.
- The hook only syntax-checks, although a full suite exists and runs in about 0.2 s.
- No visual verification at all. Every spec says "No browser is installed… layout, dark mode and print preview still need a manual look". This session has a Playwright MCP server available, so that excuse is gone.

### Improvements

| # | Change | Impact | Effort | Ratio |
| --- | --- | --- | --- | --- |
| K1 | Spec-first for every feature this session | 5 | S | 5.0 |
| K2 | Copy-consistency test | 4 | S | 4.0 |
| K3 | Upgrade the save hook to the full suite | 3 | S | 3.0 |
| K4 | Playwright MCP visual verification + committed config + manual hook | 4 | M | 2.0 |
| K5 | Scoped steering (`fileMatch`, `manual`) | 3 | S | 3.0 |
| K6 | Fix the on-page Kiro claims and link to real files | 5 | S | 5.0 |

- **K1.** Write `.kiro/specs/costume-finder/`, `.kiro/specs/shareable-creations/` and `.kiro/specs/lights-out-theme/` (requirements.md, design.md, tasks.md, same format as `lab-budget-modes`) **before** the code. Tick tasks as they land, and record test and screenshot results in each final "Verify" task.
- **K2.** `tests/copy-consistency.test.js` loads the page and the raw HTML and README, then asserts:
  - the product of the lab key counts equals the number in every "1,728" occurrence (also checked in README);
  - `COSTUMES.length` matches the hero stat `<strong>8</strong>` and every "Eight";
  - the sum of the option counts (8+6+6+6 = 26) matches "26 parts";
  - the minimum `timeMins` matches the "10 min" hero stat;
  - the maximum lab spook over all 1,728 matches "5 / 5";
  - `COSTUMES.length + 1` (hero) matches "nine illustrations".

  This turns the steering's "known exceptions" into an enforced rule.
- **K3.** Edit `.kiro/hooks/inline-script-syntax-check.kiro.hook`. Rename it "Studio checks on save". Patterns: `index.html`, `README.md`, `tests/*.js`. The prompt runs `node --test tests/*.test.js` and reports failing test names and assertion messages, never printing base64 lines. Keep `check-inline-script.js`, which the suite still calls.
- **K4.**
  - Commit `.kiro/settings/mcp.json` with the Playwright MCP server (`npx @playwright/mcp@latest`).
  - Add a manual hook `.kiro/hooks/capture-screenshots.kiro.hook` (`userTriggered`) that asks the agent to open `index.html` through Playwright and capture these screenshots into `docs/screenshots/`:
    - `hero-light.png` and `hero-dark.png` at 1280×800;
    - `lab-finder.png` with Thrift, $25 and 30 min set;
    - `mobile-lab.png` at 390×844;
    - `print-plan.png` with print media emulated.
  - Run it this session. Those images feed README, Devpost and the video.
- **K5.**
  - `.kiro/steering/testing.md` (`inclusion: fileMatch`, `fileMatchPattern: "tests/**"`) explains how to use `load-page.js`, the exhaustive-over-1,728 pattern, the "no dependencies" rule, and which plan-text formats tests rely on.
  - `.kiro/steering/pitch.md` (`inclusion: manual`) holds the one-line pitch, audience, problem statement and demo beats, so README, page copy, Devpost text and the video script stay consistent when regenerated with `#pitch`.
- **K6.** Rewrite the four `.kiro-step` cards in `#built` so they describe what is true and link each card to the file on GitHub:
  1. "Steering that knows the data model" links to `.kiro/steering/structure.md`.
  2. "Every feature after the first cut is a spec" links to `.kiro/specs/`, and names lab-budget-estimate, lab-budget-modes, costume-finder, shareable-creations and lights-out-theme.
  3. "A hook that runs the tests on every save" links to `.kiro/hooks/`.
  4. "Checked by the numbers" links to `tests/` and names the exhaustive 1,728 × 3 checks, the copy-consistency test and the Playwright screenshots.

  Drop "started as a written spec". Saying "the first cut was hand-built, and every change since went through Kiro" reads as honest and is checkable. Being caught overclaiming would cost more than the claim gains.

## 3. Design: 6/10

### Evidence
- Coherent and tasteful: a cream and pumpkin token palette, DM Serif Display with Public Sans, an arched hero image, consistent pill controls, a dark theme via `prefers-color-scheme`, a real print stylesheet, focus styles, 42–48px targets and reduced-motion handling.
- **It does not look haunted.** This entry is in the *Costume Contest*, judged on a haunting UI. In light mode, which is the default for most judges' OS settings, it reads as a cosy craft blog. The only spooky motion is `@keyframes conjure`, a ±1.2% scale and 0.5° wobble that nobody will notice. Dark mode only appears if the judge's OS is dark, with no in-page control.
- The lab result has no image. The 1,728 creations are text only, while 9 illustrations sit unused there. Each base costume's image is already in `COSTUMES[i].img`, joined by id, at no byte cost.
- Weight: 5.27 MB of HTML. `loading="lazy"` on cards does nothing, because the bytes are already inline in the script. The `og:image` is a data URI, which social crawlers and Devpost link previews ignore.
- Markup: card buttons contain `<h3>` and `<p>`, which is invalid inside `<button>`. Their `aria-label` also hides difficulty, time and budget from screen readers.

### Improvements

| # | Change | Impact | Effort | Ratio |
| --- | --- | --- | --- | --- |
| D1 | "Lights out" haunted theme toggle with spookiness tied to function | 5 | M | 2.5 |
| D2 | Result portrait from the base illustration | 4 | S | 4.0 |
| D3 | Visible "materialise" on Summon | 3 | S | 3.0 |
| D4 | Extract and compress images, absolute `og:image` | 3 | M | 1.5 |
| D5 | Card markup fix | 1 | S | 1.0 |

- **D1. "Lights out" toggle.**
  - Add `<button id="lights" class="lights-toggle" type="button" aria-pressed="…">` fixed at top right (44px). It reads "Lights out" in the light theme and "Lights on" in the dark theme, and sets `data-theme="dark|light"` on `<html>`.
  - The initial pressed state comes from `matchMedia("(prefers-color-scheme: dark)")`. Nothing is persisted (product rule).
  - CSS: move the dark tokens into `:root[data-theme="dark"]` and keep the media query only for `:root:not([data-theme])`.
  - Spooky elements that carry meaning:
    - Spook dots glow in proportion to the level (`.spook[data-level="5"] .dots i.on { box-shadow: 0 0 6px var(--accent) }`, scaled for 3–5), so fright is readable at a glance.
    - The countdown number gets a slow candle flicker (opacity 0.85 to 1, 3s) in the dark theme only.
    - The finder's zero-result line reads as a "the studio has gone quiet" ghost note.
  - No gradients (brief kept). Every animation is disabled under `prefers-reduced-motion`. Add the toggle to the print hide list.
  - Verify with Playwright screenshots in both themes.
- **D2. Result portrait.** Add `<img id="res-img" class="res-portrait" alt="">` at the top of `#result`, set from the `COSTUMES` entry whose `id === labState.base`, at 4:3 with `object-position: center 18%`. Frame it with a 6px border in palette colour 1 and a 2px inner ring in colour 2, so the palette choice visibly changes the portrait. Add a small `.twist-badge` pill over the image corner with the twist label (hidden for "Keep it classic"). Alt text: "Base illustration: <costume alt>". Reuses existing data, with no new bytes.
- **D3. Materialise on Summon.** Replace `conjure` with a 600ms reveal of `#res-name` and `#res-img`: `opacity 0` with `filter: blur(6px)` going to clear, plus the border flashing to `--accent`. It still restarts via the existing `offsetWidth` trick and stays off under reduced motion.
- **D4. Images (not this session; needs a decision).** Use a Node script to decode the 10 base64 strings into `img/*.jpg`, resized to 1200px wide at q75, and point `img` fields at the files. Expected page size is under 1 MB. This breaks the "one self-contained file" claim in README and `tech.md`, so it needs the owner's call. The `og:image` fix depends on a live URL (P1).
- **D5. Card markup (not this session).** Change the card to `<article class="card">` with `<h3>` text and one stretched `<button>` ("See materials & method") so the content is announced and the HTML is valid.

## 4. Innovation / Idea: 4/10

### Evidence
- Costume-idea galleries and "random costume generator" pages are common. Gallery plus random mash-up is the default concept for this theme, and other 2026 entries use the same costume and asset-mixing idea (for example [Kiroween Invitation](https://devpost.com/software/ascii-invite), which mixes costumes and assets).
- What's distinctive today: numbered creations ("Creation № 137 of 1,728"), the "Remix this in the lab" bridge from a finished build to the generator, and purchase modes. These are small twists on a familiar idea.
- Generated text is three concatenated sentences (`descParts.join(" ")`), so "Disco Ghost carrying a silver candelabra" doesn't feel designed.

### Improvements

| # | Change | Impact | Effort | Ratio |
| --- | --- | --- | --- | --- |
| N1 | Reverse-search costumes by constraints (= I1) | 5 | M | 2.5 |
| N2 | Creation numbers become addresses (= I2) | 3 | S | 3.0 |
| N3 | Purchase mode reshapes what is possible | 3 | S | 3.0 |
| N4 | Closet-first (= I6) | 4 | L | 1.3 |

- **N1.** I1 reframes the app from a costume idea generator into a costume solver, which is the pitch. The app finds a costume that fits your budget, your clock and your nerve, out of 1,728.
- **N2.** I2 makes "No. 137" a real, shareable code: "Mine's No. 137. What's yours?"
- **N3.** Surface the interplay between finder and mode. When the finder count is 0 in the current mode, compute the counts for the other modes and show a one-tap fix: "0 fit when buying new. **54 fit if you thrift.** [Switch to Thrift]". This needs no new data, just `fittingCombos()` run in each mode, and it is the most memorable 5 seconds of the demo.

## 5. Presentation: 3/10

### Evidence
- **No live URL.** Judges must clone the repo and open a 5 MB file. Pages is off and the repo homepage is empty.
- **No video, no screenshots, no Devpost write-up draft** in the repo.
- README is 28 lines. It has no problem statement, no audience, no images, no "how Kiro was used" section, and no test instructions (they are only in steering).
- The `og:image` data URI means a pasted link shows no preview image.
- The on-page Kiro section overclaims (see K6).

### Improvements

| # | Change | Impact | Effort | Ratio |
| --- | --- | --- | --- | --- |
| P1 | GitHub Pages deploy + repo homepage + topics | 5 | S | 5.0 |
| P2 | README rewrite | 5 | S | 5.0 |
| P3 | `docs/demo-script.md` (2:45 shot list) | 4 | S | 4.0 |
| P4 | `docs/devpost-writeup.md` | 4 | S | 4.0 |
| P5 | Screenshots (from K4) | 4 | S | 4.0 |

- **P1.**
  - Enable Pages from `main` / root (`gh api -X POST repos/xia-xianyi/halloween-costume-studio/pages -f "source[branch]=main" -f "source[path]=/"`).
  - Set `homepage` to `https://xia-xianyi.github.io/halloween-costume-studio/`.
  - Add topics `kiroween`, `kiro`, `halloween`, `costume`.
  - **This publishes the site, so it needs the owner's OK** (asked below).
- **P2. README structure:**
  1. One-line pitch: "Tell it your budget, your clock and your nerve. It finds the costume."
  2. Live link and a 3-image strip (P5).
  3. The problem (it's 5pm on 31 October, you have $25 and 30 minutes) and the audience (DIY and last-minute costume makers, parents, students).
  4. A 30-second tour: Finder, Lab, Share link, Lights out, Print.
  5. "How Kiro built this": a table mapping each Kiro feature to the file and what it did (steering, 5 specs, save hook, manual screenshot hook, Playwright MCP, tests). It also says plainly that the first cut was hand-built.
  6. How to run and test.
  7. Licence.

  The copy-consistency test (K2) covers README numbers.
- **P3. Demo script.** A 2:45 shot list with timestamps:
  - 0:00–0:15: the problem as a text card.
  - 0:15–0:45: Finder. Set $25, 30 min, Buy new, and get 0 fits. Tap "54 fit if you thrift".
  - 0:45–1:15: Summon, then the portrait materialises; open the plan.
  - 1:15–1:30: Copy link, open it in a second window, and the same costume No. appears.
  - 1:30–1:50: Lights out.
  - 1:50–2:30: Kiro. Show the steering, a spec's requirements to tasks, a save that triggers the test hook, and the screenshot hook through Playwright MCP.
  - 2:30–2:45: close on the live URL.

  Include the narration text, at 130 words per minute or less.
- **P4. Devpost write-up.** Draft the Devpost sections (Inspiration, What it does, How we built it with Kiro, Challenges, Accomplishments, What we learned, What's next = I6, D4), the category line ("Costume Contest: haunting UI where spookiness signals fright level, conjures results and flags dead ends"), and the list of Kiro features with file links. The owner pastes it into Devpost.

## 6. Stage One (pass/fail) risk check
- Theme fit: a Halloween costume app passes on topic. The *haunting UI* expectation of the Costume Contest is the soft spot, and D1–D3 address it.
- Genuine Kiro use: passes today (`.kiro/` is committed with steering, specs and a hook). K6 removes the one claim a reviewer could call false.

## 7. Decisions needed from the owner
1. **Enable GitHub Pages and set the repo homepage (P1)?** This publishes the site publicly. I will not do it without a yes.
2. **Image extraction (D4)?** It cuts the page to under 1 MB but ends the "single self-contained file" claim. It is deferred unless you want it.
3. **Kiro section wording (K6).** I plan to state that the first cut was hand-built. Say if you would rather phrase the history differently, but I recommend against keeping "started as a written spec".

## 8. Implementation list for this session (in order)

The order follows dependencies: specs before code, features before the tests and screenshots that describe them, and docs last so they describe what shipped. Each feature step ends with `node --test tests/*.test.js` green and the inline-script check OK.

1. **K1 specs:** write `costume-finder`, `shareable-creations` and `lights-out-theme` (requirements, design, tasks) from sections I1+N3, I2 and D1–D3 above.
2. **I1 + N3 Costume finder:** `buildFor(state)` refactor, `ALL_COMBOS`, `fittingCombos()`, finder form, count line, mode suggestion, Summon respects limits, print hide. Add `tests/finder.test.js`.
3. **I2 Shareable creation links:** `comboFromNumber`, `labHash`, `applyHash`, `replaceState`, `#copy-link`, URL in plan text and share. Add `tests/share-link.test.js`.
4. **D2 + D3 Result portrait and materialise reveal.**
5. **D1 Lights-out toggle** with level-scaled glow and countdown flicker, reduced-motion safe.
6. **I4 + I3 a11y and countdown:** `#res-announce` live region; `nextHalloween()` with computed date strings and Halloween-day mode.
7. **K2 + K3 + K5 Kiro plumbing:** `tests/copy-consistency.test.js`, hook upgraded to the full suite, `steering/testing.md` (fileMatch) and `steering/pitch.md` (manual). Update `structure.md`, `tech.md` and `product.md` for everything above.
8. **K4 + P5 visual verification:** commit `.kiro/settings/mcp.json` and the `capture-screenshots` manual hook, run it through Playwright MCP, commit `docs/screenshots/*.png`, and fix any layout issues found.
9. **K6 Built with Kiro section:** honest copy and GitHub links.
10. **P2 + P3 + P4 docs:** README rewrite, `docs/demo-script.md`, `docs/devpost-writeup.md`.
11. **P1 deploy:** only if the owner says yes. Then switch `og:image` to the absolute URL of a committed `docs/og.jpg`.

Deferred to a later session: I5 mobile peek bar, I6/N4 closet-first, D4 image extraction, D5 card markup.
