# Requirements: Shareable creations

## Introduction

Every lab creation already has a "Creation No." from 1 to 1,728, but nobody can send one to a friend. "Share my plan" shares plain text with no way back to the costume. This feature makes the creation number an address: the URL hash `#lab=137&mode=thrift` opens creation 137 in Thrift mode. A "Copy link to this costume" button and the plan text carry the link (plan item I2).

## Glossary

- **Lab hash**: `#lab=<n>` or `#lab=<n>&mode=<key>`, where `n` is a creation number from 1 to 1,728 and `key` is a `BUDGET_MODES` key.
- **Share URL**: the page URL without its hash, followed by the lab hash of the current state.

## Requirements

### Requirement 1: Opening a link

1. WHEN the page loads with a valid lab hash, THE lab SHALL show that creation (and that mode, if given) and SHALL scroll to the lab, smoothly unless the user prefers reduced motion.
2. WHEN the hash changes to a valid lab hash while the page is open, THE lab SHALL update the same way.
3. WHEN the hash is missing or invalid (`#lab=0`, `#lab=1729`, `#lab=abc`, an unknown mode, or ordinary anchors such as `#lab` and `#rail`), THE lab state SHALL be left unchanged.
4. A link without `&mode=` SHALL keep the current mode.

### Requirement 2: Keeping the address bar in sync

1. AFTER the user changes the lab (option, purchase mode, Summon, Remix, finder rescue), THE address bar SHALL show the current lab hash, without adding a history entry.
2. ON first load without a lab hash, THE URL SHALL NOT be changed.
3. Failure of the History API (for example on some `file://` pages) SHALL NOT break the lab.

### Requirement 3: Sharing the link

1. THE result panel SHALL have a "Copy link to this costume" button that copies the share URL and confirms in the existing `#copy-status` region.
2. THE plan text (copy, share, download) SHALL end with a blank line and `Rebuild this costume: <share URL>`. All earlier plan lines SHALL stay unchanged.
3. THE existing copy, share and download status messages and the download file name SHALL stay unchanged.
4. THE new button SHALL be hidden in print, like the other result actions.

### Requirement 4: Correctness

1. FOR every n from 1 to 1,728, opening `#lab=n` SHALL show the creation whose displayed number is n.
2. FOR every state, reading the lab hash back SHALL reproduce the same base, twist, prop, palette and mode.
