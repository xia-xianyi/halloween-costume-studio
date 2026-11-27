# Demo video script (2:45)

Target: under 3 minutes (judges need not watch past 3:00). About 330 words of narration at roughly 125 words a minute. Record at 1280×800 in Chrome. Open `index.html` from the repo (there's no hosted copy), and turn reduced motion **off** so the reveals show.

Prep:
- Open the page at the top, in the light theme.
- In a second window, have `index.html#lab=137&mode=thrift` ready.
- Have Kiro open on the repo, with `.kiro/specs/costume-finder/requirements.md` and `.kiro/hooks/studio-checks.json` in tabs.

| Time | On screen | Narration |
| --- | --- | --- |
| 0:00–0:15 | Black title card: "5pm, 31 October. $25. Half an hour. No costume." | "It's five o'clock on Halloween. You've got twenty-five dollars, half an hour, and nothing to wear. Costume sites show you pictures. You need a plan you can afford tonight." |
| 0:15–0:30 | Hero, slow scroll past the rail of 8 costumes. | "Halloween Costume Studio is a costume planner. Eight hand-written builds with materials and methods, and a lab that mixes them into 1,728 numbered creations, each with a priced shopping list." |
| 0:30–1:00 | Lab. Set **Spend at most $25**. The count turns orange: "Nothing fits in Buy new mode". The **Switch to Thrift: 54 fit** button appears. Click it. | "Tell it your budget. At twenty-five dollars, buying new, nothing fits, and the studio goes quiet. But it knows why. Shop second-hand and fifty-four creations fit. One tap, and every price on the page halves." |
| 1:00–1:20 | Set **Ready in 30 min**. Press **Summon one that fits**. The portrait and name materialise. | "Add your clock: thirty minutes. Summon only draws from costumes that fit. Here's one, with its illustration framed in its palette, its time, its spook level and its budget." |
| 1:20–1:35 | Scroll the result: budget rows adding up to the total, the merged materials list. | "Every part is priced, the rows add up to the total, and the shopping list is merged and de-duplicated." |
| 1:35–1:50 | Click **Copy link to this costume**. Switch to the second window with `#lab=137&mode=thrift`, showing "Creation № 137". | "Every creation has an address. Send a friend the link and they see the same costume. Mine's number one-three-seven. What's yours?" |
| 1:50–2:05 | Click **Lights out**. Point at spook dots glowing and pulsing on a level-5 creation, and the candle flicker on the countdown. | "Lights out turns the studio haunted, and the haunting means something. The scarier the build, the brighter its dots burn." |
| 2:05–2:35 | Kiro: the steering folder, then the `costume-finder` spec (requirements, then tasks ticked), then save `index.html` and the **Studio checks on save** hook runs the suite: 35 passing. Flash `docs/screenshots` taken through the Playwright MCP. | "The first cut was hand-built. Every change since went through Kiro. Steering holds the data model. Each feature has a spec. A save hook runs the whole suite: all 1,728 creations in all three modes against a baseline, seeded property tests, and a check that the numbers in the copy match the data. Playwright through MCP took the screenshots." |
| 2:35–2:45 | Back to the hero. Text overlay: "Halloween Costume Studio · github.com/xia-xianyi/halloween-costume-studio". | "Your budget, your clock, your nerve. The studio finds the costume." |

Before recording, run `node --test tests/*.test.js` and update the pass count in the 2:05 line if it changed.
