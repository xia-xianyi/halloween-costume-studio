# Design: Shareable creations

## Functions (Costume Lab block of the script)

```js
function labHash(state)        // "#lab=" + creationNumber(s) + "&mode=" + s.mode
function parseLabHash(hash)    // -> { base, twist, prop, palette, mode|null } or null
function applyHash()           // reads location.hash; on success writes labState, returns true
function shareUrl()            // location.href without hash + labHash(); "" base when location is missing
function syncHash()            // history.replaceState(null, "", labHash()) in try/catch
```

- `parseLabHash` matches `/^#lab=(\d{1,4})(?:&mode=([a-z]+))?$/`. It then requires `1 <= n <= TOTAL_COMBOS`, and the mode, if present, must be an own key of `BUDGET_MODES`. The combo is `ALL_COMBOS[n - 1]`, from the costume-finder spec, which is in creation-number order. That makes the round trip exact by construction, and the test checks it for all 1,728.
- Plain anchors (`#lab`, `#rail`) don't match, so the hero links and the skip link behave as before.
- `refreshLab({ sync: true })` calls `syncHash()` after every user-initiated change. The startup path calls `applyHash()` and renders without syncing (requirement 2.2).
- `window.addEventListener("hashchange", …)` calls `applyHash()`, and on success calls `refreshLab()` without syncing, because the URL is already right. It is feature-checked.

## Plan text

Append after the materials list:

```
<blank>
Rebuild this costume: https://…/index.html#lab=137&mode=thrift
```

The budget block format that `tests/lab-budget.test.js` parses is untouched.

## Share and copy

- Extract the existing clipboard code into `copyText(text, okMsg, failMsg)`. The "Copy my costume plan" button calls it with the existing messages, word for word.
- The new `#copy-link` button ("Copy link to this costume") calls it with "Link copied. Anyone who opens it sees this exact costume.", and on failure with "Copy was blocked by the browser. The link is in your address bar."
- `navigator.share` keeps sharing `planText()` as text. The text now contains the link, so no separate `url` is passed; passing one makes several share targets paste the link twice.

## Tests (`tests/share-link.test.js`)

- All 1,728: `parseLabHash(labHash(state))` reproduces the state, and `creationNumber` of the parsed combo equals n.
- Invalid hashes are rejected.
- Loading the page with `#lab=137&mode=thrift` in the stub `location` sets `labState`.
- Plan text ends with the rebuild line.
- `syncHash` calls `history.replaceState` with the expected hash, and is skipped on first load.
