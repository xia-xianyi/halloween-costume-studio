---
inclusion: manual
---

# Capture studio screenshots

Run with `/capture-screenshots`. This replaces a manual-trigger hook, because the v1 hook schema has no manual trigger.

Use the Playwright MCP server (`.kiro/settings/mcp.json`). Open `file://<repo>/index.html` directly. No server is needed. The only network request is Google Fonts, and a failure there is expected in offline sandboxes; the system fonts take over.

Capture at CSS scale and save into `docs/screenshots/` (overwrite):

| File | Viewport | Setup |
| --- | --- | --- |
| `hero-light.png` | 1280×800 | `emulateMedia({ colorScheme: "light" })`, top of page. |
| `hero-dark.png` | 1280×800 | Press `#lights` (Lights out), top of page. |
| `lab-finder-light.png` | 1280×800 | Light. Set `#fit-budget` to 25 and `#fit-time` to 30, press the Thrift rescue button in `#fit-fix`, then `#summon`. Scroll to the top of `#lab` + 120px. |
| `lab-deadend-dark.png` | 1280×800 | Dark. Set `#fit-budget` to 25 in Buy new mode, and scroll to `#lab`. Shows "Switch to Thrift: 54 fit". |
| `mobile-hero.png` | 390×844 | Top of page. Check that the Lights out toggle does not overlap the entry badge. |

Before saving, also check and report:

- the console has no errors other than the Google Fonts request;
- `document.documentElement.scrollWidth <= innerWidth` at 390px (no sideways scroll);
- opening `index.html#lab=137&mode=thrift` shows "Creation № 137" in Thrift mode and scrolls to the lab (allow about 2 s for the smooth scroll);
- under `emulateMedia({ media: "print" })`, `#lights`, `#finder` and `#res-figure` compute to `display: none`.

Set `document.documentElement.style.scrollBehavior = "auto"` before scrolling for a capture, so screenshots aren't taken mid-scroll. Use the screenshot tool's `filename` with an absolute path under the allowed artifacts directory, then copy the files into `docs/screenshots/`.
