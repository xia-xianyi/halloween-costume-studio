# Devpost write-up (draft)

Paste each section into the matching Devpost field. Keep the claims as they are; each one is backed by a file in the repo.

**Category:** Costume Contest. The haunting UI does a job: in Lights out mode the spook dots burn brighter the scarier a build is, a summoned costume materialises out of a blur, and a dead end in the finder reads as the studio going quiet, with the fix offered beside it.

**Tagline:** Tell it your budget, your clock and your nerve. It finds the costume.

## Inspiration

Every Halloween someone is standing in front of a wardrobe at 5pm with $25 and half an hour. Idea sites show pictures. Random generators give you a name. Neither tells you what you can actually make tonight for the money in your pocket.

## What it does

- **A gallery of 8 original costumes,** each with a materials list and a step-by-step method. You can filter them by vibe and sort them by spookiness, speed or difficulty.
- **A costume lab** that mixes character × twist × prop × palette into 1,728 numbered creations. Each has a generated name, spook level, build time, a merged shopping list, and per-part and total US-dollar estimates. These scale with a purchase mode: Thrift ×0.5, Buy new ×1.0 or Premium ×1.8.
- **A finder** that searches all 1,728 creations by budget, build time and fright level in your purchase mode, then summons only costumes that fit. When nothing fits, it tells you which purchase mode would work ("Switch to Thrift: 54 fit").
- **Shareable creations:** every costume has a link (`#lab=137&mode=thrift`).
- **Lights out,** a haunted theme where the effects carry meaning.
- **A countdown** that becomes "Find a costume for tonight" on 31 October.
- **A print stylesheet** for the trip to the shops.

It's one self-contained HTML file with no backend, accounts or tracking.

## How we built it (with Kiro)

The first cut was hand-built in the first four commits. Every change since went through Kiro, on a branch and merged by pull request:

- **Steering.** Three always-on docs (product, structure, tech) hold the product rules, the data model, the budget data flow, and the accessibility and print rules. They also explain how to edit a 5 MB file without touching its embedded images. A file-matched `testing.md` loads only when a test file is open. Manual `pitch.md` and `capture-screenshots.md` run as slash commands.
- **Specs, one per feature:** lab budget estimate, purchase modes, costume finder, shareable creations and haunted studio. Each has EARS-style requirements, a design with its trade-offs (for example, a total that sums the rounded rows so the figures always add up), and ticked tasks with the verification recorded. An optimisation plan, also a spec, scored the entry against the judging criteria and ordered the work.
- **A hook in the v1 schema** (`PostFileSave`) runs the whole suite whenever the page, the README or a test is saved.
- **MCP:** the Playwright server drove real-browser checks of both themes, mobile layout, deep links and print, and took the screenshots.
- **Tests on Node's built-in runner alone:**
  - all 1,728 creations × 3 modes against a baseline captured before the changes;
  - seeded property-based tests for the budget and finder rules;
  - an independent brute force for the finder;
  - share-link round trips;
  - a copy-consistency test that fails if any hand-typed number in the page or README drifts from the data.

## Challenges

- **Refactoring the lab's composer** so the finder could ask "what fits?" across 1,728 creations without changing a single existing result. The regression baseline made that safe to do.
- **Editing a 5 MB single-file page safely.** The steering doc's rule against rewriting base64 lines and the line-range edits it describes kept every image intact.
- **Making spooky effects functional rather than decorative,** within a visual brief that bans gradients.

## Accomplishments

- The finder's dead-end rescue. At $25, buying new, nothing fits, and the studio offers the purchase mode where 54 do.
- The lab can't drift from its copy: the tests pin every figure.
- Everything is keyboard-operable. Screen readers get a one-line summary instead of the whole plan, and all motion stops under reduced motion.

## What we learned

- Writing the spec before the code turned "make it haunted" into testable requirements, such as "spook dots glow more strongly at higher levels".
- A baseline fixture is the cheapest way to refactor with confidence.

## What's next

- Closet-first mode: tick what you already own, and the budget and finder rank costumes by how much is already in your wardrobe.
- A mobile summary bar so phone users see the result change as they tap.
- More base costumes.

## Built with

HTML, CSS, JavaScript, Node.js test runner, Kiro (specs, steering, hooks, MCP), Playwright MCP.

## Links

- Repository: https://github.com/xia-xianyi/halloween-costume-studio
- Run it: download the repo and open `index.html` (no hosted copy).
- Video: _add the URL after recording_ (`docs/demo-script.md`).
