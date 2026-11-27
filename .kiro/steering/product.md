---
inclusion: always
---

# Product overview

Halloween Costume Studio is a single web page for planning a Halloween costume. It was built as a Kiroween 2026 hackathon entry (Costume Contest category). The page tells visitors this in the hero badge, the "Built with Kiro" section and the footer.

## Audience

People who want a costume they can make or assemble themselves, from a ten-minute last-minute fix to an evening-long build. The tone is warm and playful (British spelling such as "colour", "centimetres", "jewellery"). Copy should stay in that voice.

## Features

- **Live countdown** to the next 31 October, computed by `nextHalloween(now)`: this year's date at local midnight, or next year's from 1 November. It ticks every second. The hero label and the footer (`#footer-date`) show the computed date with its weekday via `fmtHalloween()`. The static "Sunday 31 October 2027" in the HTML is only the no-JavaScript fallback. On 31 October itself the hero says it is Halloween tonight and shows **Find a costume for tonight** (`#tonight`). That button presets the finder to $25 / 30 min and Thrift, then jumps to the lab.
- **Lights out** toggle (`#lights`, top right, `aria-pressed`). It switches the page to the dark tokens and starts in the OS preference. Nothing is saved. In the dark theme the spookiness carries meaning: spook dots glow more at levels 3–5 and pulse at 5, and the countdown number flickers like a candle. All motion stops under reduced motion.
- **Costume rail (gallery)** of 8 builds: Midnight Vampire, Cottage Witch, Sheet Ghost, Bare Bones Skeleton, Mad Scientist, Pumpkin Patch Scarecrow, Ghost Pirate Captain, Black Cat.
  - Filter chips: All costumes, Scary, Funny, Cute, Classic, Last-minute.
  - Sort: as hung on the rail, spookiest first, quickest first, easiest first.
  - "Let the studio choose" opens a random costume from the currently filtered list.
  - Each card opens a detail dialog with difficulty, time, budget, spook level, materials, numbered method, previous/next navigation (buttons and arrow keys) and a "Remix this in the costume lab" button.
- **Costume Lab**: pick character (8), twist (6, including "Keep it classic"), prop (6) and palette (6). That gives 8 x 6 x 6 x 6 = 1,728 combinations, each with a "Creation No." from 1 to 1,728. The result panel shows a generated name, a "carrying" line, a description, time, budget, spook level, palette swatches and a merged, de-duplicated materials list.
  - Estimated budget: every option has a USD cost range, and the result panel and plan text show per-part rows and a total. A "Purchase mode" selector (Thrift ×0.5, Buy new ×1.0, Premium ×1.8, default Buy new) scales every figure; each end is rounded to whole USD and the total is the sum of the rounded rows.
  - **Find one that fits** (finder): "Spend at most", "Ready in" and "Fright" selects filter all 1,728 creations in the selected purchase mode. A creation fits when the top end of its total is within budget. The panel states "N of 1,728 creations fit in <mode> mode", and Summon draws only from those ("Summon one that fits"). When nothing fits, the panel says the studio has gone quiet and offers one button per mode that would work ("Switch to Thrift: 54 fit"), or asks the user to loosen a limit.
  - The result panel opens with a **portrait** of the base costume, reusing the gallery illustration. Its frame takes the palette's first two colours, and a badge names the twist. Summon makes the portrait and name *materialise* from a blur.
  - **Shareable creations**: `#lab=<creation number>&mode=<thrift|new|premium>` opens that exact creation. The address bar follows every lab change (`replaceState`, no history entries). Ordinary anchors and bad hashes are ignored.
  - Actions: Summon, Share my plan (Web Share API, falls back to copy), Copy link to this costume, Copy my costume plan, Download plan (.txt). The plan text ends with `Rebuild this costume: <link>`.
- **Before the night**: four numbered wearability tips (dress rehearsal, visibility, hem, weather).
- **Built with Kiro** section. It states only what the repository shows: the first cut was hand-built in the first four commits, and every change since went through Kiro (steering, one spec per feature, the save hook, tests, Playwright through MCP). Each card links to the files on GitHub. Keep it that honest. The `pitch.md` steering doc lists what not to claim.

## Product rules to preserve

- Every number shown (spook level, build time, budget, the 1,728 total) should be computed from the data tables, never typed twice. Script output uses `fmtInt(TOTAL_COMBOS)`. Some figures are still static copy: the hero stats ("8", "1,728", "10 min", "5 / 5"), the meta description, section text and README. Update those by hand. `tests/copy-consistency.test.js` fails if any of them drifts from the data.
- Visual brief from the page itself: cream and pumpkin palette, serif display type, no gradients, no stock-photo look. Illustrations are generated to that palette. Spooky effects belong to the Lights out theme and must signal something (fright level, a summon, a dead end), never decorate for its own sake.
- There is no backend, account, tracking or persistence. Lab choices, finder limits and the theme are not saved between visits. A share link carries state in the URL only.
