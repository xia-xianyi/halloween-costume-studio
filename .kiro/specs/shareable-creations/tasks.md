# Implementation plan: Shareable creations

- [x] 1. Hash helpers
  - `labHash`, `parseLabHash`, `applyHash`, `shareUrl`, `syncHash`.
  - _Requirements: 1.1–1.4, 2.3, 4.1, 4.2_

- [x] 2. Wire into the lab
  - `refreshLab({ sync })` used by options, mode, Summon, Remix and finder rescue; `applyHash()` at startup with scroll; `hashchange` listener.
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 3. Copy link button and plan text
  - `copyText` helper (existing messages unchanged), `#copy-link` button, rebuild line in `planText()`.
  - _Requirements: 3.1–3.4_

- [x] 4. Tests and verify
  - Extend the stub page loader with `location`, `history` and `window.addEventListener`; add `tests/share-link.test.js`; run the full suite; open a `#lab=` URL in Playwright.
  - _Requirements: all_

## Verification (27 Nov 2026)

- `share-link.test.js` and the share-hash property in `lab-properties.test.js` pass. All 1,728 links round-trip, and 17 malformed or unrelated hashes are rejected (including `#lab=5&mode=constructor`).
- Playwright:
  - At 390×844, `index.html#lab=137&mode=thrift` shows "Creation № 137 of 1,728" in Thrift mode and lands on `#lab` once the smooth scroll ends.
  - A first attempt scrolled during parse and landed short. The scroll now waits for `load`.
  - Summon rewrote the address bar to `#lab=464&mode=thrift` with no new history entry.
