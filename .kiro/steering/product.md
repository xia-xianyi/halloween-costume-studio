---
inclusion: always
---

# Product overview

Halloween Costume Studio is a single web page for planning a Halloween costume. It was built as a Kiroween 2026 hackathon entry (Costume Contest category). The page tells visitors this in the hero badge, the "Built with Kiro" section and the footer.

## Audience

People who want a costume they can make or assemble themselves, from a ten-minute last-minute fix to an evening-long build. The tone is warm and playful (British spelling such as "colour", "centimetres", "jewellery"). Copy should stay in that voice.

## Features

- **Live countdown** to Sunday 31 October 2027. The target is hard-coded in the countdown IIFE (`new Date(2027, 9, 31)`, local midnight) and ticks every second. The same date also appears in static text in the hero and footer.
- **Costume rail (gallery)** of 8 builds: Midnight Vampire, Cottage Witch, Sheet Ghost, Bare Bones Skeleton, Mad Scientist, Pumpkin Patch Scarecrow, Ghost Pirate Captain, Black Cat.
  - Filter chips: All costumes, Scary, Funny, Cute, Classic, Last-minute.
  - Sort: as hung on the rail, spookiest first, quickest first, easiest first.
  - "Let the studio choose" opens a random costume from the currently filtered list.
  - Each card opens a detail dialog with difficulty, time, budget, spook level, materials, numbered method, previous/next navigation (buttons and arrow keys) and a "Remix this in the costume lab" button.
- **Costume Lab**: pick character (8), twist (6, including "Keep it classic"), prop (6) and palette (6). That gives 8 x 6 x 6 x 6 = 1,728 combinations, each with a "Creation No." from 1 to 1,728. The result panel shows a generated name, a "carrying" line, a description, time, budget, spook level, palette swatches and a merged, de-duplicated materials list.
  - Actions: Summon a random costume, Share my plan (Web Share API, falls back to copy), Copy my costume plan, Download plan (.txt).
- **Before the night**: four numbered wearability tips (dress rehearsal, visibility, hem, weather).
- **Built with Kiro** section describing the spec-first, steering and verification process.

## Product rules to preserve

- Every number shown (spook level, build time, budget, the 1,728 total) should be computed from the data tables, never typed twice. Two known exceptions are static copy: the hero stats ("8", "1,728", "10 min", "5 / 5") and the meta description/section text that repeat these figures. Update them by hand if the data changes.
- Visual brief from the page itself: cream and pumpkin palette, serif display type, no gradients, no stock-photo look. Illustrations are generated to that palette.
- There is no backend, account, tracking or persistence. Lab choices are not saved between visits.
